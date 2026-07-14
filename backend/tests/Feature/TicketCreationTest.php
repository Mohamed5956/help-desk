<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_a_ticket(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/tickets', [
            'title' => 'My printer is on fire',
            'description' => 'Smoke is coming out of the side panel.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'My printer is on fire')
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.user.id', $user->id);

        $this->assertDatabaseHas('tickets', [
            'user_id' => $user->id,
            'title' => 'My printer is on fire',
            'status' => 'open',
        ]);
    }

    public function test_ticket_creation_requires_title_and_description(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/tickets', [
            'title' => '',
            'description' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'description']);

        $this->assertDatabaseCount('tickets', 0);
    }

    public function test_unauthenticated_request_cannot_create_a_ticket(): void
    {
        $response = $this->postJson('/api/tickets', [
            'title' => 'Should not be created',
            'description' => 'No auth token provided.',
        ]);

        $response->assertUnauthorized();
        $this->assertDatabaseCount('tickets', 0);
    }

    public function test_ticket_owner_is_always_the_authenticated_user_not_the_payload(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/tickets', [
            'title' => 'Ownership spoofing attempt',
            'description' => 'Trying to create a ticket as someone else.',
            'user_id' => $otherUser->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.id', $user->id);
    }
}
