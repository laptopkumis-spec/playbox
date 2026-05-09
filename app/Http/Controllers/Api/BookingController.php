<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\PaymentService;
use App\Http\Resources\UnitResource;
use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $bookingService;
    protected $paymentService;

    public function __construct(BookingService $bookingService, PaymentService $paymentService)
    {
        $this->bookingService = $bookingService;
        $this->paymentService = $paymentService;
    }

    /**
     * List all units with real-time availability status.
     */
    public function units()
    {
        $units = Unit::all()->map(function ($unit) {
            // Dynamically check for active/pending bookings
            $hasActiveBooking = Booking::where('unit_id', $unit->id)
                ->whereIn('status', ['pending', 'scheduled', 'active'])
                ->exists();

            if ($hasActiveBooking && $unit->status !== 'maintenance') {
                $unit->status = 'booked';
            } elseif (!$hasActiveBooking && $unit->status === 'booked') {
                $unit->status = 'available';
                $unit->save(); // Sync DB state
            }

            return $unit;
        });

        return UnitResource::collection($units);
    }

    /**
     * User's booking list with auto-complete expired sessions.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Auto finish expired active bookings for this user
        Booking::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_time', '<', now())
            ->each(function ($booking) {
                $booking->update(['status' => 'completed']);
                if ($booking->usageLog) {
                    $booking->usageLog->update(['actual_end_time' => $booking->end_time]);
                }
                // Restore unit status
                $this->bookingService->restoreUnitStatus($booking->unit_id, $booking->id);
            });

        $bookings = $user->bookings()
            ->where('is_hidden_by_user', false)
            ->with(['unit', 'payment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return BookingResource::collection($bookings);
    }

    /**
     * Create a new booking.
     */
    public function store(Request $request)
    {
        $request->validate([
            'unit_id'        => 'required|exists:units,id',
            'start_time'     => 'required|date',
            'end_time'       => 'required|date',
            'payment_method' => 'nullable|string',
        ]);

        try {
            $booking = $this->bookingService->createBooking(
                $request->user()->id,
                $request->unit_id,
                $request->start_time,
                $request->end_time
            );

            $paymentMethod = $request->payment_method ?? 'qris';
            $payment = $this->paymentService->createPayment($booking, $paymentMethod);

            // Cash: auto active immediately
            // Cash: set to paid and determine if it should be active or scheduled
            if ($paymentMethod === 'cash') {
                $payment->update(['status' => 'paid']);
                
                $startTime = \Carbon\Carbon::parse($booking->start_time);
                // Jika waktu mulai adalah sekarang atau dalam 5 menit ke depan, langsung aktifkan
                if ($startTime->lessThanOrEqualTo(now()->addMinutes(5))) {
                    $booking->update(['status' => 'active']);
                } else {
                    $booking->update(['status' => 'scheduled']);
                }
            }

            return response()->json([
                'message' => 'Booking berhasil dibuat.',
                'booking' => new BookingResource($booking->load(['payment', 'unit'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Cancel booking and restore unit status.
     */
    public function cancel($id, Request $request)
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (in_array($booking->status, ['pending', 'scheduled'])) {
            $booking->update(['status' => 'cancelled']);

            if ($booking->payment && $booking->payment->status === 'pending') {
                $booking->payment->update(['status' => 'failed']);
            }

            // Restore unit availability
            $this->bookingService->restoreUnitStatus($booking->unit_id, $booking->id);

            return response()->json(['message' => 'Booking berhasil dibatalkan.']);
        }

        return response()->json(['message' => 'Booking tidak dapat dibatalkan.'], 400);
    }

    /**
     * Hide booking from user's history view.
     */
    public function destroy($id, Request $request)
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (in_array($booking->status, ['completed', 'cancelled'])) {
            $booking->update(['is_hidden_by_user' => true]);
            return response()->json(['message' => 'Riwayat booking dihapus dari tampilan Anda.']);
        }

        return response()->json(['message' => 'Hanya booking selesai/batal yang bisa dihapus.'], 400);
    }

    /**
     * Show single booking detail.
     */
    public function show($id, Request $request)
    {
        $booking = Booking::with(['payment', 'slots', 'unit'])
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return new BookingResource($booking);
    }

    /**
     * Get booking schedule for a specific unit (for public calendar).
     */
    public function unitSchedule($id)
    {
        $bookings = Booking::where('unit_id', $id)
            ->whereIn('status', ['scheduled', 'active'])
            ->select('start_time', 'end_time', 'status')
            ->get();

        return response()->json($bookings);
    }

    public function checkIn($id, Request $request)
    {
        try {
            $booking = $this->bookingService->checkIn($id);
            return response()->json(['message' => 'Check-in berhasil', 'booking' => $booking]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function checkOut($id, Request $request)
    {
        try {
            $booking = $this->bookingService->checkOut($id);
            return response()->json(['message' => 'Check-out berhasil', 'booking' => $booking->load('usageLog')]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
