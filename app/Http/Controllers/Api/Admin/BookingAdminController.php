<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;

class BookingAdminController extends Controller
{
    public function index()
    {
        // Auto finish expired active bookings
        Booking::where('status', 'active')
            ->where('end_time', '<', now())
            ->each(function ($booking) {
                $booking->update(['status' => 'completed']);
                // Restore unit availability if no other active bookings
                $hasOther = Booking::where('unit_id', $booking->unit_id)
                    ->whereIn('status', ['pending', 'scheduled', 'active'])
                    ->where('id', '!=', $booking->id)
                    ->exists();
                if (!$hasOther) {
                    $booking->unit()->update(['status' => 'available']);
                }
            });

        $bookings = Booking::with(['user', 'unit', 'payment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return BookingResource::collection($bookings);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,completed,cancelled,scheduled,pending',
        ]);

        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $booking->update(['status' => $request->status]);

        // Restore unit status if booking is completed or cancelled
        if (in_array($request->status, ['completed', 'cancelled'])) {
            $hasOther = Booking::where('unit_id', $booking->unit_id)
                ->whereIn('status', ['pending', 'scheduled', 'active'])
                ->where('id', '!=', $booking->id)
                ->exists();
            if (!$hasOther) {
                $booking->unit()->update(['status' => 'available']);
            }
        }

        // Mark unit as booked if status is active
        if ($request->status === 'active') {
            $booking->unit()->update(['status' => 'booked']);
        }

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => new BookingResource($booking->load(['user', 'unit', 'payment'])),
        ]);
    }

    public function updateFineStatus($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update(['fine_status' => 'paid']);

        return response()->json([
            'message' => 'Fine marked as paid',
            'booking' => new BookingResource($booking->load(['user', 'unit', 'payment']))
        ]);
    }
}
