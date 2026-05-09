<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Unit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'status',
        'hourly_rate',
        'description',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
