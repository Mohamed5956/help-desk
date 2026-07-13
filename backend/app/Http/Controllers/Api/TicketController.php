<?php

namespace App\Http\Controllers\Api;

use App\Actions\Ticket\CreateTicketAction;
use App\Actions\Ticket\ListTicketsAction;
use App\Actions\Ticket\UpdateTicketStatusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketStatusRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    use ApiResponse;

    public function index(Request $request, ListTicketsAction $action)
    {
        $request->validate([
            'status' => ['sometimes', Rule::in(Ticket::STATUSES)],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $tickets = $action->execute($request->user(), $request->only(['status', 'per_page']));
        return TicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request, CreateTicketAction $action)
    {
        $ticket = $action->execute($request->user(), $request->validated());

        return $this->created(new TicketResource($ticket), 'Ticket created');
    }

    public function show(Request $request, Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        return $this->success(new TicketResource($ticket->load(['user', 'replies.user'])));
    }

    public function update(
        UpdateTicketStatusRequest $request,
        Ticket $ticket,
        UpdateTicketStatusAction $action
    ) {
        $this->authorize('update', $ticket);

        $ticket = $action->execute($ticket, $request->validated('status'));

        return $this->success(new TicketResource($ticket), 'Ticket updated');
    }
}
