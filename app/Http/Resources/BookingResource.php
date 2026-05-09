<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
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
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
            'total_price' => (float) $this->total_price,
            'total_fines' => (float) $this->total_fines,
            'fine_status' => $this->fine_status,
            'is_hidden_by_user' => (bool) $this->is_hidden_by_user,
            'created_at' => $this->created_at,
            
            // Relationships
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'user' => [
                'id' => $this->user_id,
                'name' => $this->user ? $this->user->name : 'Deleted User',
            ],
        ];
    }
}
