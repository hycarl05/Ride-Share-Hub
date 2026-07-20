<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\FareController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\StudentController;

// Public Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/fare/estimate', [FareController::class, 'estimate']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Students
    Route::get('/student/dashboard', [StudentController::class, 'dashboard']);

    // Drivers
    Route::get('/driver/dashboard', [DriverController::class, 'dashboard']);
    Route::post('/driver/toggle-status', [DriverController::class, 'toggleStatus']);
    Route::post('/drivers/apply', [DriverController::class, 'apply']);
    Route::get('/drivers/status', [DriverController::class, 'status']);
    Route::post('/drivers/{id}/approve', [DriverController::class, 'approve']); // Typically admin-only middleware here

    // Bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/student', [BookingController::class, 'studentBookings']);
    Route::get('/bookings/driver', [BookingController::class, 'driverBookings']);
    Route::post('/bookings/{id}/accept', [BookingController::class, 'accept']);
    Route::post('/bookings/{id}/reject', [BookingController::class, 'reject']);
    Route::post('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);

    // Ratings
    Route::post('/bookings/{id}/rate', [RatingController::class, 'store']);
});
