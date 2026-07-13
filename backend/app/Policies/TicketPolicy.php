<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Admins can view/reply to any ticket. Regular users only their own.
     * This is the single source of truth for that rule — controllers call
     * $this->authorize() and never re-implement the ownership check.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin() || $ticket->user_id === $user->id;
    }

    public function reply(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin() || $ticket->user_id === $user->id;
    }

    /**
     * Only admins can change ticket status — a standard user shouldn't be
     * able to close their own ticket and hide it from support queues.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin();
    }
}
