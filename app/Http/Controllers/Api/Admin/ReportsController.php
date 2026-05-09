<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function index()
    {
        // 1. Revenue last 7 days
        $revenueLast7Days = Payment::where('status', 'paid')
            ->where('created_at', '>=', now()->subDays(7))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount) as total'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 2. Most Popular Units
        $popularUnits = Unit::withCount(['bookings' => function($query) {
                $query->whereIn('status', ['completed', 'active']);
            }])
            ->orderBy('bookings_count', 'desc')
            ->limit(5)
            ->get();

        // 3. Peak Booking Hours
        $peakHours = Booking::select(DB::raw('HOUR(start_time) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        // 4. Financial Summary
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        $totalFines = Booking::where('fine_status', 'paid')->sum('total_fines');

        return response()->json([
            'revenue_chart' => $revenueLast7Days,
            'popular_units' => $popularUnits,
            'peak_hours' => $peakHours,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_fines' => $totalFines,
                'grand_total' => $totalRevenue + $totalFines
            ]
        ]);
    }
}
