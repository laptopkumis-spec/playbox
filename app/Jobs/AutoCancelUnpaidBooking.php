<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AutoCancelUnpaidBooking implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $bookingId;

    public function __construct(int $bookingId)
    {
        $this->bookingId = $bookingId;
    }

    public function handle(): void
    {
        $booking = Booking::find($this->bookingId);

        if ($booking && $booking->status === 'pending') {
            $booking->update(['status' => 'cancelled']);
            
            // Release the slots
            BookingSlot::where('booking_id', $this->bookingId)->delete();
            
            // Fail the payment
            Payment::where('booking_id', $this->bookingId)
                   ->where('status', 'pending')
                   ->update(['status' => 'failed']);
        }
    }
}
