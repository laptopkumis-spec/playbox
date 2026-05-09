<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Exception;
use Illuminate\Support\Str;

class PaymentService
{
    /**
     * Integration with Xendit QRIS
     */
    public function createPayment(Booking $booking, $paymentMethod = 'qris')
    {
        $externalId = 'BK-' . $booking->id . '-' . Str::random(5);
        $amount = (int) $booking->total_price;

        // Xendit QRIS Expiry (30 minutes from now)
        $expiresAt = now()->addMinutes(30)->toIso8601String();

        /* 
        Mocking Xendit API Call:
        $response = Http::withBasicAuth(env('XENDIT_SECRET_KEY'), '')->post('https://api.xendit.co/qr_codes', [
            'external_id' => $externalId,
            'type'        => 'DYNAMIC',
            'callback_url'=> route('api.payments.webhook'),
            'amount'      => $amount,
            'expires_at'  => $expiresAt,
        ]);
        */

        $checkoutUrl = $paymentMethod === 'qris' 
            ? 'https://checkout.xendit.co/v2/qr-codes/' . Str::random(15) 
            : null;

        $payment = Payment::create([
            'booking_id'    => $booking->id,
            'amount'        => $amount,
            'status'        => 'pending',
            'payment_method'=> $paymentMethod,
            'external_id'   => $externalId,
            'checkout_url'  => $checkoutUrl,
            'expires_at'    => $expiresAt,
        ]);

        return $payment;
    }

    /**
     * Handle Webhook from Xendit
     */
    public function handleWebhook(array $payload)
    {
        // Xendit payload usually has 'external_id' and 'status'
        $externalId = $payload['external_id'] ?? ($payload['data']['external_id'] ?? null);
        $status = $payload['status'] ?? ($payload['data']['status'] ?? null);

        if (!$externalId) {
            throw new Exception("Invalid Xendit payload");
        }

        $payment = Payment::where('external_id', $externalId)->firstOrFail();
        
        $payment->logs()->create([
            'raw_response' => $payload,
            'status' => $status,
        ]);

        // Status 'COMPLETED' means payment success in Xendit QRIS
        if ($status === 'COMPLETED' || $status === 'SUCCEEDED') {
            $payment->update(['status' => 'paid']);
            
            // Per permintaan user: status booking tetap pending (atau scheduled) 
            // sampai admin mengubahnya menjadi aktif.
            $payment->booking->update(['status' => 'scheduled']); 
            $payment->booking->slots()->update(['status' => 'booked']);
        } elseif ($status === 'EXPIRED' || $status === 'FAILED') {
            $payment->update(['status' => 'failed']);
            $payment->booking->update(['status' => 'cancelled']);
        }

        return $payment;
    }
}
