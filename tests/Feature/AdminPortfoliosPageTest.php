<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPortfoliosPageTest extends TestCase
{
    use RefreshDatabase;

    private function portfolio(): Portfolio
    {
        return Portfolio::create([
            'slug' => 'studi-uji',
            'title' => 'Studi Uji',
            'category' => 'Web App',
            'client_name' => 'Klien Uji',
            'year' => 2026,
            'description' => 'Deskripsi uji.',
            'tech_stack' => ['Laravel', 'React'],
            'status' => 'published',
        ]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('admin.portfolios.index'))->assertRedirect(route('login'));
    }

    public function test_client_is_forbidden(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)->get(route('admin.portfolios.index'))->assertForbidden();
    }

    public function test_admin_page_renders_with_paginated_portfolios_prop(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->portfolio();

        $this->actingAs($admin)
            ->get(route('admin.portfolios.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Portfolios')
                ->has('portfolios.data', 1)
                ->where('portfolios.data.0.title', 'Studi Uji')
                ->etc());
    }
}
