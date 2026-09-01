<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\GymController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });
});

Route::get('/user', function (Request $request) {
    return new UserResource($request->user());
})->middleware('auth:sanctum');

Route::get('/search', SearchController::class);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});

Route::get('/gyms/{gym}', [GymController::class, 'show']);
Route::get('/trainers/{trainer}', [TrainerController::class, 'show']);
Route::get('/shops/{shop}', [ShopController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/gyms/{gym}/logo', [GymController::class, 'uploadLogo']);
    Route::post('/gyms/{gym}/cover', [GymController::class, 'uploadCover']);
    Route::post('/trainers/{trainer}/photo', [TrainerController::class, 'uploadPhoto']);
    Route::post('/shops/{shop}/logo', [ShopController::class, 'uploadLogo']);
    Route::post('/shops/{shop}/cover', [ShopController::class, 'uploadCover']);
});
