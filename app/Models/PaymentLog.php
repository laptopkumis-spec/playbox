<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'raw_response',
        'status',
    ];

    protected $casts = [
        'raw_response' => 'array',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
