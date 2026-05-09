<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function webhook(Request $request)
    {
        try {
            $payload = $request->all();
            Log::info("Payment Webhook received", $payload);
            
            $this->paymentService->handleWebhook($payload);

            return response()->json(['message' => 'Webhook processed successfully']);
        } catch (\Exception $e) {
            Log::error("Payment Webhook error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
