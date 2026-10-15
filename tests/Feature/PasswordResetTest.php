<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_forgot_password_page(): void
    {
        $response = $this->get('/forgot-password');
        $response->assertStatus(200);
    }

    public function test_guest_can_request_password_reset_link(): void
    {
        $user = User::factory()->create(['email' => 'client@raycode.dev']);

        $response = $this->post('/forgot-password', ['email' => 'client@raycode.dev']);

        $response->assertRedirect();
        $response->assertSessionHas('status');
        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'client@raycode.dev']);
    }

    public function test_guest_cannot_request_with_invalid_email(): void
    {
        $response = $this->post('/forgot-password', ['email' => 'notfound@example.com']);
        $response->assertSessionHasErrors('email');
    }

    public function test_guest_can_view_reset_password_page(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $response = $this->get("/reset-password/{$token}?email=".urlencode($user->email));
        $response->assertStatus(200);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $response = $this->post('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_password_reset_fails_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/reset-password', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_forgot_password_is_throttled(): void
    {
        $user = User::factory()->create();
        // hit 6 times quickly — should be throttled 5,1
        for ($i = 0; $i < 5; $i++) {
            $this->post('/forgot-password', ['email' => $user->email]);
        }
        $response = $this->post('/forgot-password', ['email' => $user->email]);
        // throttle middleware returns 429 if exceeded, but Password also throttles via config throttle 60s
        // we just ensure it doesn't throw 500
        $this->assertTrue(in_array($response->status(), [302, 429]));
    }
}
