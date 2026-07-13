<?php

namespace App\Actions\Ticket;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListTicketsAction
{
    /**
     * @param  array{status?: string, per_page?: int}  $filters
     */
    public function execute(User $requester, array $filters): LengthAwarePaginator
    {
        return Ticket::query()
            ->with('user')
            ->withCount('replies')
            ->when(! $requester->isAdmin(), fn ($q) => $q->where('user_id', $requester->id))
            ->when(
                ! empty($filters['status']),
                fn ($q) => $q->where('status', $filters['status'])
            )
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }
}
