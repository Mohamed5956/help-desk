<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Validation\ValidationException;

class UpdateUserAction
{
    public function execute(User $user, string $role): User
    {
        if (
            $user->isAdmin() &&
            $role === 'user' &&
            User::where('role', 'admin')->count() === 1
        ) {
            throw ValidationException::withMessages([
                'role' => 'Cannot change the role of the last administrator.',
            ]);
        }

        $user->update([
            'role' => $role,
        ]);

        return $user->refresh();
    }
}
