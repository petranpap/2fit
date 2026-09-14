<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
        //
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'data' => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        ['user' => $user, 'token' => $token] = $this->authService->login($request->validated());

        return response()->json([
            'data' => [
                'token' => $token->plainTextToken,
                'user' => new UserResource($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out.']);
    }

    public function refresh(Request $request): JsonResponse
    {
        $token = $this->authService->refresh($request->user());

        return response()->json([
            'data' => [
                'token' => $token->plainTextToken,
            ],
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendResetLink($request->validated('email'));

        return response()->json([
            'message' => 'If that email address is registered, a reset code has been sent.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->validated());

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
