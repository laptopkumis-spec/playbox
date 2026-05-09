<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;

// Public
Route::get('/units', [BookingController::class, 'units']);
Route::get('/units/{id}/schedule', [BookingController::class, 'unitSchedule']);
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
});
