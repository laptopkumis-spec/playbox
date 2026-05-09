<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'checkout_url' => $this->checkout_url,
            'expires_at' => $this->expires_at,
        ];
    }
}
