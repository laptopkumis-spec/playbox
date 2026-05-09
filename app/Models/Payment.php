<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'amount',
        'status',
        'payment_method',
        'external_id',
        'checkout_url',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function logs()
    {
        return $this->hasMany(PaymentLog::class);
    }
}
