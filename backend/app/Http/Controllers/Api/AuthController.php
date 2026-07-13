<?php

namespace App\Http\Controllers\Api;

use App\Actions\Auth\LoginUserAction;
use App\Actions\Auth\LogoutUserAction;
use App\Actions\Auth\RegisterUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request, RegisterUserAction $action)
    {
        $result = $action->execute($request->validated());

        return $this->created($result, 'Registered successfully');
    }

    public function login(LoginRequest $request, LoginUserAction $action)
    {
        $result = $action->execute($request->validated());

        return $this->success($result, 'Logged in successfully');
    }

    public function logout(Request $request, LogoutUserAction $action)
    {
        $action->execute($request->user());

        return $this->success(null, 'Logged out successfully');
    }

    public function me(Request $request)
    {
        return $this->success($request->user());
    }
}
