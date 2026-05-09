<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class BookingService
{
    /**
     * Create a booking with anti double booking (locking).
     */
    public function createBooking(int $userId, int $unitId, string $startTime, string $endTime)
    {
        return DB::transaction(function () use ($userId, $unitId, $startTime, $endTime) {
            $start = Carbon::parse($startTime);
            $end   = Carbon::parse($endTime);

            if ($start->isPast()) {
                throw new Exception("Waktu mulai tidak boleh di masa lalu.");
            }

            if ($end->lessThanOrEqualTo($start)) {
                throw new Exception("Waktu selesai harus setelah waktu mulai.");
            }

            // Lock unit for concurrent update prevention
            $unit = Unit::where('id', $unitId)->lockForUpdate()->first();

            if (!$unit || $unit->status === 'maintenance') {
                throw new Exception("Unit tidak tersedia atau sedang dalam perawatan.");
            }

            // Check for overlapping bookings
            $overlapping = Booking::where('unit_id', $unitId)
                ->whereIn('status', ['pending', 'paid', 'scheduled', 'active'])
                ->where(function ($query) use ($start, $end) {
                    $query->whereBetween('start_time', [$start, $end])
                          ->orWhereBetween('end_time', [$start, $end])
                          ->orWhere(function ($q) use ($start, $end) {
                              $q->where('start_time', '<=', $start)
                                ->where('end_time', '>=', $end);
                          });
                })->lockForUpdate()->exists();

            if ($overlapping) {
                throw new Exception("Slot waktu ini sudah dipesan atau dikunci oleh user lain.");
            }

            // Calculate price
            $hours      = max(1, $start->diffInHours($end));
            $totalPrice = $hours * $unit->hourly_rate;

            $booking = Booking::create([
                'user_id'     => $userId,
                'unit_id'     => $unit->id,
                'start_time'  => $start,
                'end_time'    => $end,
                'status'      => 'pending',
                'total_price' => $totalPrice,
            ]);

            // Mark unit as booked
            $unit->update(['status' => 'booked']);

            // Create locked slot
            BookingSlot::create([
                'booking_id' => $booking->id,
                'unit_id'    => $unit->id,
                'start_time' => $start,
                'end_time'   => $end,
                'status'     => 'locked',
            ]);

            // Dispatch auto cancel job after 10 minutes if unpaid
            \App\Jobs\AutoCancelUnpaidBooking::dispatch($booking->id)->delay(now()->addMinutes(10));

            // Dispatch event
            \App\Events\BookingCreated::dispatch($booking);

            return $booking;
        });
    }

    /**
     * Restore unit status if no other active bookings exist for that unit.
     */
    public function restoreUnitStatus(int $unitId, int $excludeBookingId): void
    {
        $hasOther = Booking::where('unit_id', $unitId)
            ->whereIn('status', ['pending', 'scheduled', 'active'])
            ->where('id', '!=', $excludeBookingId)
            ->exists();

        if (!$hasOther) {
            Unit::where('id', $unitId)->update(['status' => 'available']);
        }
    }

    /**
     * Check-in: Start billing timer.
     */
    public function checkIn(int $bookingId)
    {
        return DB::transaction(function () use ($bookingId) {
            $booking = Booking::lockForUpdate()->findOrFail($bookingId);

            if ($booking->status !== 'paid') {
                throw new Exception("Booking harus sudah dibayar sebelum check-in.");
            }

            $booking->update(['status' => 'active']);
            $booking->unit()->update(['status' => 'booked']);

            $booking->usageLog()->create([
                'unit_id'           => $booking->unit_id,
                'actual_start_time' => now(),
            ]);

            return $booking;
        });
    }

    /**
     * Check-out: End billing timer.
     */
    public function checkOut(int $bookingId)
    {
        return DB::transaction(function () use ($bookingId) {
            $booking = Booking::lockForUpdate()->findOrFail($bookingId);

            if ($booking->status !== 'active') {
                throw new Exception("Booking tidak dalam status aktif.");
            }

            $usageLog        = $booking->usageLog;
            $now             = now();
            $durationMinutes = $usageLog->actual_start_time->diffInMinutes($now);
            $expectedEnd     = Carbon::parse($booking->end_time);
            
            $overtimeMinutes = $now->greaterThan($expectedEnd)
                ? $expectedEnd->diffInMinutes($now)
                : 0;

            // Hitung Denda (Fines)
            $totalFines = 0;
            if ($overtimeMinutes > 5) { // 5 menit grace period
                $unit = $booking->unit;
                $hourlyRate = $unit->hourly_rate;
                // Hitung proporsional per menit
                $totalFines = ($overtimeMinutes / 60) * $hourlyRate;
                // Bulatkan denda
                $totalFines = round($totalFines, 2);
            }

            $usageLog->update([
                'actual_end_time'  => $now,
                'duration_minutes' => $durationMinutes,
                'overtime_minutes' => $overtimeMinutes,
            ]);

            $booking->update([
                'status' => 'completed',
                'total_fines' => $totalFines,
                'fine_status' => $totalFines > 0 ? 'unpaid' : 'paid',
            ]);
            BookingSlot::where('booking_id', $bookingId)->update(['status' => 'booked']);

            // Restore unit availability
            $this->restoreUnitStatus($booking->unit_id, $bookingId);

            return $booking;
        });
    }
}
