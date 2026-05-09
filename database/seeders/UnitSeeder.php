<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Unit;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            Unit::create([
                'name' => 'PlayStation 5 - 0' . $i,
                'status' => 'available',
                'hourly_rate' => 15000,
                'description' => 'PS5 dengan 2 DualSense dan TV 4K 43 Inch',
            ]);
        }

        for ($i = 1; $i <= 5; $i++) {
            Unit::create([
                'name' => 'PlayStation 4 Pro - 0' . $i,
                'status' => 'available',
                'hourly_rate' => 10000,
                'description' => 'PS4 Pro dengan 2 DualShock 4 dan TV FHD 43 Inch',
            ]);
        }
    }
}
