<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected User $clientUser;

    protected Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->clientUser = User::factory()->create([
            'role' => 'client',
        ]);

        $this->service = Service::create([
            'title' => 'Web Development Package',
            'slug' => 'web-development-package',
            'short_desc' => 'Paket pembuatan website profesional',
            'description' => 'Fullstack web development service',
            'features' => ['Responsive Layout', 'SEO Optimized'],
            'icon' => 'globe',
            'type' => 'package',
            'starting_price' => 2500000,
            'delivery_days' => 7,
            'is_featured' => true,
        ]);
    }

    public function test_client_can_view_order_page(): void
    {
        $response = $this->actingAs($this->clientUser)->get(route('client.order.create'));

        $response->assertStatus(200);
    }

    public function test_client_can_place_order_successfully(): void
    {
        $payload = [
            'title' => 'Toko Online UMKM',
            'service_id' => $this->service->id,
            'requirements' => 'Membutuhkan toko online lengkap dengan payment gateway dan katalog produk.',
            'budget' => 3000000,
            'deadline' => now()->addDays(14)->toDateString(),
        ];

        $response = $this->actingAs($this->clientUser)->post(route('client.order.store'), $payload);

        $this->assertDatabaseHas('projects', [
            'user_id' => $this->clientUser->id,
            'title' => 'Toko Online UMKM',
            'service_id' => $this->service->id,
            'budget' => 3000000,
            'status' => 'pending',
        ]);

        $response->assertRedirect();
    }

    public function test_estimator_lead_can_be_stored(): void
    {
        $payload = [
            'service_id' => $this->service->id,
            'complexity' => 'medium',
            'features' => ['auth', 'payment', 'admin'],
            'urgency' => 'normal',
            'low' => 2000000,
            'high' => 3500000,
            'email' => 'prospective.client@example.com',
            'wa' => '081234567890',
        ];

        $response = $this->post(route('estimator.lead'), $payload);

        $response->assertRedirect();

        $this->assertDatabaseHas('estimator_leads', [
            'email' => 'prospective.client@example.com',
            'wa' => '081234567890',
            'complexity' => 'medium',
        ]);
    }
}
