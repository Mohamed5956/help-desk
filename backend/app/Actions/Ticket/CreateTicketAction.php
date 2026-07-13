<?php

namespace App\Actions\Ticket;

use App\Models\Ticket;
use App\Models\User;

class CreateTicketAction
{
    /**
     * @param  array{title: string, description: string}  $data
     */
    public function execute(User $owner, array $data): Ticket
    {
        $ticket = Ticket::create([
            'user_id' => $owner->id,
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => Ticket::STATUS_OPEN,
        ]);

        return $ticket->load('user');
    }
}
