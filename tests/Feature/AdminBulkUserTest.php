<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBulkUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_bulk_users(): void
    {
        $response = $this->post(route('admin.users.bulk'), [
            'ids' => [1, 2],
            'action' => 'set_admin',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_client_cannot_access_bulk_users(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($client)->post(route('admin.users.bulk'), [
            'ids' => [1, 2],
            'action' => 'set_admin',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_bulk_update_user_roles(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user1 = User::factory()->create(['role' => 'client']);
        $user2 = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($admin)->post(route('admin.users.bulk'), [
            'ids' => [$user1->id, $user2->id],
            'action' => 'set_admin',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('admin', $user1->fresh()->role);
        $this->assertEquals('admin', $user2->fresh()->role);
    }

    public function test_admin_cannot_bulk_modify_own_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.users.bulk'), [
            'ids' => [$admin->id],
            'action' => 'delete',
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_can_bulk_delete_other_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user1 = User::factory()->create(['role' => 'client']);
        $user2 = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($admin)->post(route('admin.users.bulk'), [
            'ids' => [$user1->id, $user2->id],
            'action' => 'delete',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('users', ['id' => $user1->id]);
        $this->assertDatabaseMissing('users', ['id' => $user2->id]);
    }
}
