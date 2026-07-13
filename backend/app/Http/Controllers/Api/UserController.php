<?php

namespace App\Http\Controllers\Api;

use App\Actions\User\CreateUserAction;
use App\Actions\User\ListUsersAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;

class UserController extends Controller
{
    use ApiResponse;

    public function index(ListUsersAction $action)
    {
        return $this->success(UserResource::collection($action->execute()));
    }

    public function store(StoreUserRequest $request, CreateUserAction $action)
    {
        $user = $action->execute($request->validated());

        return $this->created(new UserResource($user), 'User created');
    }
}
