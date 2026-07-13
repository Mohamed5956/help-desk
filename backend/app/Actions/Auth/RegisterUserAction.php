<?php

namespace App\Actions\Auth;

use App\Models\User;

class RegisterUserAction
{
    /**
     * @param  array{name: string, email: string, password: string}  $data
     * @return array{user: User, token: string}
     */
    public function execute(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }
}
