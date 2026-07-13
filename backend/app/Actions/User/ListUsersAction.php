<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ListUsersAction
{
    public function execute(): Collection
    {
        return User::query()->latest()->get();
    }
}
