<?php

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;

class EnsureUserIsAdmin
{
    use ApiResponse;

    /**
     * A dedicated middleware (rather than repeating an isAdmin() check in
     * every UserController method) keeps the "who can even reach this
     * route" concern separate from the policy layer, which governs
     * "who can act on this specific resource" (like TicketPolicy does).
     */
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()?->isAdmin()) {
            return $this->error('This action requires admin privileges.', 403);
        }

        return $next($request);
    }
}
