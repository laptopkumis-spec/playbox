<?php

use Illuminate\Support\Facades\Route;

// routes/web.php
Route::get('/', function () {
    return response()->json(['message' => 'Playbox API Backend is running']);
});