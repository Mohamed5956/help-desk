<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class DeleteUserAction
{
    public function execute(User $user): void
    {
        $currentUser = Auth::user();

        if (
            $user->isAdmin() &&
            User::where('role', 'admin')->count() === 1
        ) {
            throw ValidationException::withMessages([
                'user' => 'Cannot delete the last administrator.',
            ]);
        }

        if ($user->is($currentUser)) {
            throw ValidationException::withMessages([
                'user' => 'You cannot delete your own account.',
            ]);
        }

        $user->delete();
    }
}
