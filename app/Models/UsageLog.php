<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'unit_id',
        'actual_start_time',
        'actual_end_time',
        'duration_minutes',
        'overtime_minutes',
    ];

    protected $casts = [
        'actual_start_time' => 'datetime',
        'actual_end_time' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
