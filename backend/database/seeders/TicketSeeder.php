<?php

namespace Database\Seeders;

use App\Models\Reply;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
        ]);

        $userA = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'user@example.com',
        ]);

        $userB = User::factory()->create([
            'name' => 'Other User',
            'email' => 'other@example.com',
        ]);

        foreach ([$userA, $userB] as $owner) {
            Ticket::factory(5)
                ->for($owner)
                ->create()
                ->each(function (Ticket $ticket) use ($admin, $owner) {
                    Reply::factory(rand(0, 3))
                        ->for($ticket)
                        ->for(fake()->boolean() ? $admin : $owner)
                        ->create();
                });
        }
    }
}
