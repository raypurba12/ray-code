<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class InvoicePdfSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_without_signature_gets_403(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $project = Project::create([
            'user_id' => $user->id,
            'title' => 'Test',
            'requirements' => str_repeat('a ', 20),
            'status' => 'pending',
            'budget' => 2000000,
        ]);
        Invoice::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'number' => 'INV-TEST-PDF-001',
            'amount' => 1000000,
            'tax' => 110000,
            'total' => 1110000,
            'status' => 'unpaid',
        ]);

        $response = $this->get('/invoice/'.$project->order_code.'/pdf?invoice=INV-TEST-PDF-001');
        $response->assertStatus(403);
    }

    public function test_guest_with_valid_signature_gets_200(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $project = Project::create([
            'user_id' => $user->id,
            'title' => 'Test',
            'requirements' => str_repeat('a ', 20),
            'status' => 'pending',
            'budget' => 2000000,
        ]);
        Invoice::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'number' => 'INV-TEST-PDF-002',
            'amount' => 1000000,
            'tax' => 110000,
            'total' => 1110000,
            'status' => 'unpaid',
        ]);

        $url = URL::temporarySignedRoute('invoice.pdf', now()->addMinutes(30), ['code' => $project->order_code, 'invoice' => 'INV-TEST-PDF-002']);
        $response = $this->get($url);
        $response->assertStatus(200);
    }

    public function test_owner_authenticated_can_access_without_signature(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $project = Project::create([
            'user_id' => $user->id,
            'title' => 'Test',
            'requirements' => str_repeat('a ', 20),
            'status' => 'pending',
            'budget' => 2000000,
        ]);
        Invoice::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'number' => 'INV-TEST-PDF-003',
            'amount' => 1000000,
            'tax' => 110000,
            'total' => 1110000,
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($user)->get('/invoice/'.$project->order_code.'/pdf?invoice=INV-TEST-PDF-003');
        $response->assertStatus(200);
    }

    public function test_other_user_cannot_access_without_signature(): void
    {
        $owner = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);
        $project = Project::create([
            'user_id' => $owner->id,
            'title' => 'Test',
            'requirements' => str_repeat('a ', 20),
            'status' => 'pending',
            'budget' => 2000000,
        ]);
        Invoice::create([
            'project_id' => $project->id,
            'user_id' => $owner->id,
            'number' => 'INV-TEST-PDF-004',
            'amount' => 1000000,
            'tax' => 110000,
            'total' => 1110000,
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($other)->get('/invoice/'.$project->order_code.'/pdf?invoice=INV-TEST-PDF-004');
        $response->assertStatus(403);
    }

    public function test_security_headers_present(): void
    {
        $response = $this->get('/');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Content-Security-Policy');
    }
}
