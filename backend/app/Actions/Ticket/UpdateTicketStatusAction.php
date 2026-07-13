<?php

namespace App\Actions\Ticket;

use App\Models\Ticket;

class UpdateTicketStatusAction
{
    public function execute(Ticket $ticket, string $status): Ticket
    {
        $ticket->update(['status' => $status]);
        return $ticket->load(['user', 'replies.user']);
    }
}
