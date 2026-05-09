<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'unit_id',
        'start_time',
        'end_time',
        'status',
        'total_price',
        'is_hidden_by_user',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function slots()
    {
        return $this->hasMany(BookingSlot::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function usageLog()
    {
        return $this->hasOne(UsageLog::class);
    }
}
