<?php

namespace App\Listeners;

use App\Events\BookingCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendBookingNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(BookingCreated $event): void
    {
        // Mock sending email / WhatsApp notification
        Log::info("Sending booking confirmation to user: " . $event->booking->user->email . " for booking ID: " . $event->booking->id);
    }
}
