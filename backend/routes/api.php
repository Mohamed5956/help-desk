<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReplyController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Everything below requires a valid Sanctum bearer token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('tickets', TicketController::class)
        ->only(['index', 'store', 'show', 'update']);

    Route::post('/tickets/{ticket}/replies', [ReplyController::class, 'store']);
});
Route::middleware('admin')->group(function () {
    Route::apiResource('users', UserController::class)
        ->only(['index', 'store']);
});
