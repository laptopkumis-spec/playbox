<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Unit;

class DashboardController extends Controller
{
    public function index()
    {
        // Auto finish expired active bookings (global)
        Booking::where('status', 'active')
            ->where('end_time', '<', now())
            ->each(function ($booking) {
                $booking->update(['status' => 'completed']);
                $booking->unit()->update(['status' => 'available']);
            });

        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        $monthlyRevenue = Payment::where('status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');
        $activeBookings = Booking::where('status', 'active')->count();
        $totalBookings = Booking::count();
        $totalUnits = Unit::count();

        return response()->json([
            'total_revenue'    => $totalRevenue,
            'monthly_revenue'  => $monthlyRevenue,
            'active_bookings'  => $activeBookings,
            'total_bookings'   => $totalBookings,
            'total_units'      => $totalUnits,
            'recent_bookings'  => Booking::with('user', 'unit')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ]);
    }
}
