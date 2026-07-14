<?php

namespace App\Http\Controllers\Api;

use App\Actions\User\CreateUserAction;
use App\Actions\User\DeleteUserAction;
use App\Actions\User\ListUsersAction;
use App\Actions\User\UpdateUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
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

    public function update(
        UpdateUserRequest $request,
        User $user,
        UpdateUserAction $action
    ) {
        $user = $action->execute(
            $user,
            $request->validated('role')
        );

        return $this->success(
            new UserResource($user),
            'User role updated successfully.'
        );
    }

    public function destroy(User $user, DeleteUserAction $action)
    {
        $action->execute($user);

        return $this->success(null, 'User deleted');
    }
}
