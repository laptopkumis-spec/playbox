<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\UnitController;
use App\Http\Controllers\Api\Admin\BookingAdminController;
use App\Http\Controllers\Api\Admin\ReportsController;
use App\Http\Controllers\Api\BookingController;

Route::middleware(['auth:sanctum', 'can:admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/reports', [ReportsController::class, 'index']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // Units
    Route::get('/units', [UnitController::class, 'index']);
    Route::post('/units', [UnitController::class, 'store']);
    Route::put('/units/{unit}', [UnitController::class, 'update']);
    Route::delete('/units/{unit}', [UnitController::class, 'destroy']);

    // Bookings
    Route::get('/bookings', [BookingAdminController::class, 'index']);
    Route::put('/bookings/{id}/status', [BookingAdminController::class, 'updateStatus']);
    Route::put('/bookings/{id}/fine-status', [BookingAdminController::class, 'updateFineStatus']);
    Route::post('/bookings/{id}/check-in', [BookingController::class, 'checkIn']);
    Route::post('/bookings/{id}/check-out', [BookingController::class, 'checkOut']);
});
