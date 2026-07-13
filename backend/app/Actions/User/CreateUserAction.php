<?php

namespace App\Actions\User;

use App\Models\User;

class CreateUserAction
{
    /**
     * @param  array{name: string, email: string, password: string, role: string}  $data
     */
    public function execute(array $data): User
    {
        return User::create($data);
    }
}
