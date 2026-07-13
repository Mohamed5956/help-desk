<?php

namespace App\Actions\Reply;

use App\Models\Reply;
use App\Models\Ticket;
use App\Models\User;

class CreateReplyAction
{
    /**
     * @param  array{body: string}  $data
     */
    public function execute(Ticket $ticket, User $author, array $data): Reply
    {
        $reply = $ticket->replies()->create([
            'user_id' => $author->id,
            'body' => $data['body'],
        ]);

        return $reply->load('user');
    }
}
