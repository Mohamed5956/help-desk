<?php

namespace App\Http\Controllers\Api;

use App\Actions\Reply\CreateReplyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reply\StoreReplyRequest;
use App\Http\Resources\ReplyResource;
use App\Models\Ticket;
use App\Traits\ApiResponse;

class ReplyController extends Controller
{
    use ApiResponse;

    public function store(StoreReplyRequest $request, Ticket $ticket, CreateReplyAction $action)
    {
        $this->authorize('reply', $ticket);

        $reply = $action->execute($ticket, $request->user(), $request->validated());

        return $this->created(new ReplyResource($reply), 'Reply added');
    }
}
