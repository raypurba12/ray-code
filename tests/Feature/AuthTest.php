<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_login_page(): void
    {
        $response = $this->get(route('login'));

        $response->assertStatus(200);
    }

    public function test_client_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'client@raycode.dev',
            'password' => Hash::make('password123'),
            'role' => 'client',
        ]);

        $response = $this->post(route('login.attempt'), [
            'email' => 'client@raycode.dev',
            'password' => 'password123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_admin_user_redirects_to_admin_panel_after_login(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@raycode.dev',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $response = $this->post(route('login.attempt'), [
            'email' => 'admin@raycode.dev',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect('/admin');
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'client@raycode.dev',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->post(route('login.attempt'), [
            'email' => 'client@raycode.dev',
            'password' => 'wrongpassword',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_register_is_disabled_and_creates_no_user(): void
    {
        $payload = [
            'name' => 'Budi Santoso',
            'email' => 'budi.new@example.com',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
            'company' => 'PT Karya Digital',
        ];

        $response = $this->post(route('register.store'), $payload);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseMissing('users', ['email' => 'budi.new@example.com']);
    }

    public function test_register_page_redirects_to_login(): void
    {
        $this->get(route('register'))->assertRedirect(route('login'));
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
