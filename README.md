# Mini Helpdesk System

A simple support ticketing system: a Laravel API backend with Sanctum
token authentication, and a React (Vite) single-page frontend.

## Stack

- **Backend:** Laravel 13, Sanctum (token auth), MySQL
- **Frontend:** React 18, Vite, React Router, Bootstrap
- **Auth:** Bearer token (Sanctum's token guard, not the cookie/SPA guard —
  the two apps run on separate origins: `localhost:5173` and `localhost:8000`)

## Design decisions & assumptions

The brief left a few things unspecified. Documenting the calls made here
rather than leaving them implicit, since they're the kind of thing worth
being able to explain and defend:

- **Ticket status updates are admin-only.** The brief's business rules
  explicitly grant standard users "view and reply" on their own tickets;
  status changes are never mentioned as a user capability, so this was
  treated as intentionally scoped out rather than an omission to fill in.
- **Ticket deletion is admin-only.** Not in the original brief — added as
  a reasonable extension for a support-ticket admin workflow. Deleting a
  ticket cascades to its replies via a database-level foreign key
  constraint (`ON DELETE CASCADE`), not application code.
- **User management** (list / create / update role / delete) is an
  addition beyond the brief's scope, gated behind an admin-only
  middleware (`EnsureUserIsAdmin`) on the API and an equivalent route
  guard on the frontend. A safeguard prevents demoting or deleting the
  last remaining admin, and an admin cannot delete their own account.
- **Tickets are created by standard users only** (per the brief), not
  admins — the "New Ticket" control only appears for non-admin users.
- **`GET /api/tickets` is intentionally not wrapped** in the app's usual
  `{status, message, data}` response envelope — see Architecture notes
  below for why.

## Prerequisites

- Docker and Docker Compose (recommended — see Quick start), **or**
- PHP 8.2+, Composer, Node.js 20+, npm, and a local MySQL 8 instance for
  manual setup

## Quick start with Docker

From the project root:

```bash
docker compose up --build
```

First boot handles everything automatically: waits for MySQL to be
healthy, installs PHP dependencies, generates an `APP_KEY` if one isn't
set, and runs migrations — see `backend/docker-entrypoint.sh` if you
want the exact sequence.

Once it's up:

- Backend API: http://localhost:8000/api
- Frontend: http://localhost:5173

Seed demo data (run once, after containers are up):

```bash
docker compose exec backend php artisan db:seed
```

To stop:

```bash
docker compose down
```

To reset the database entirely (drops the MySQL volume too):

```bash
docker compose down -v
```

## Manual setup (without Docker)

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your local MySQL credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=helpdesk
DB_USERNAME=root
DB_PASSWORD=
```

Create the `helpdesk` database in MySQL, then migrate and seed:

```bash
php artisan migrate
php artisan db:seed
```

Run the API:

```bash
php artisan serve
```

The API is now available at `http://localhost:8000/api`.

Run the tests:

```bash
php artisan test
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env` in `frontend/`:

```
VITE_API_URL=http://localhost:8000/api
```

Run the dev server:

```bash
npm run dev
```

The frontend is now available at `http://localhost:5173`.

## Demo accounts (after seeding)

| Email | Password | Role |
|---|---|---|
| admin@example.com | password | Admin |
| user@example.com | password | Standard user |
| other@example.com | password | Standard user |

## API overview

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/register` | Public | Always creates a standard user |
| POST | `/api/login` | Public | Returns a bearer token |
| POST | `/api/logout` | Token | Revokes the current token only |
| GET | `/api/me` | Token | Current authenticated user |
| GET | `/api/tickets` | Token | `?status=` filter, paginated (`?page=`, `?per_page=`) |
| POST | `/api/tickets` | Token | Standard users create; owner is always the authenticated user |
| GET | `/api/tickets/{id}` | Token | Owner or admin |
| PATCH | `/api/tickets/{id}` | Token | Admin only — status change |
| DELETE | `/api/tickets/{id}` | Token | Admin only — cascades to replies |
| POST | `/api/tickets/{id}/replies` | Token | Owner or admin |
| GET | `/api/users` | Token, admin | |
| POST | `/api/users` | Token, admin | |
| PATCH | `/api/users/{id}` | Token, admin | Role only; blocked for the last admin |
| DELETE | `/api/users/{id}` | Token, admin | Blocked for self and the last admin |

## Architecture notes

- **Request → Action → Controller.** Validation lives in Form Request
  classes (`app/Http/Requests/`); business logic lives in single-purpose
  Action classes (`app/Actions/`); controllers stay thin — they
  authorize, call an Action, and shape the response. Not every
  controller method has a matching Action: trivial ones (a single
  Eloquent lookup with no business rule) were left inline rather than
  wrapped for the sake of it.
- **Authorization is centralized**, not reimplemented ad hoc per
  controller: `TicketPolicy` governs ownership-based rules (view, reply,
  update, delete), and `EnsureUserIsAdmin` middleware gates entire
  admin-only route groups (user management).
- **`ApiResponse` trait** gives most endpoints a consistent
  `{status, message, data}` JSON envelope. `GET /api/tickets` is a
  deliberate exception: it returns Laravel's native paginated resource
  shape (`{data, links, meta}`) directly, since re-wrapping it would
  bury `current_page`/`last_page` pagination metadata under an extra
  layer for no real benefit.
- **Ownership is always server-derived.** Ticket and reply creation
  take `user_id` from the authenticated request (`$request->user()`),
  never from the request payload — verified explicitly in
  `TicketCreationTest`.
- **Cascading deletes are database-level**, not application loops:
  `tickets.user_id` and `replies.ticket_id`/`replies.user_id` all use
  `cascadeOnDelete()` at the migration level, so deleting a user or a
  ticket correctly removes dependent rows atomically.

## Testing

```bash
php artisan test
```

Feature tests cover the ticket creation endpoint
(`tests/Feature/TicketCreationTest.php`): successful creation,
validation failures, unauthenticated rejection, and confirmation that
ticket ownership can't be spoofed via the request payload.
