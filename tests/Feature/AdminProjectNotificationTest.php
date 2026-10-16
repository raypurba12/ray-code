<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Services\WhatsappService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProjectNotificationTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(string $status = 'pending', int $progress = 0): Project
    {
        $user = User::factory()->create(['role' => 'client', 'phone' => '6281234567890']);

        return Project::create([
            'user_id' => $user->id,
            'title' => 'Proyek Notif WA',
            'requirements' => str_repeat('kebutuhan ', 10),
            'status' => $status,
            'progress' => $progress,
            'budget' => 2000000,
            'client_wa_cache' => '6281234567890',
        ]);
    }

    public function test_status_change_triggers_wa_notification(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $project = $this->makeProject();

        $this->mock(WhatsappService::class, fn ($mock) => $mock
            ->shouldReceive('notifyProjectUpdate')->once()->andReturn(['sent' => true, 'via' => 'test']));

        $this->actingAs($admin)
            ->patch(route('admin.orders.status', $project), ['status' => 'in_review'])
            ->assertRedirect();

        $this->assertSame('in_review', $project->fresh()->status);
    }

    public function test_same_status_does_not_trigger_wa_notification(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $project = $this->makeProject('in_review', 10);

        $this->mock(WhatsappService::class, fn ($mock) => $mock->shouldNotReceive('notifyProjectUpdate'));

        $this->actingAs($admin)
            ->patch(route('admin.orders.status', $project), ['status' => 'in_review'])
            ->assertRedirect();
    }

    public function test_progress_change_triggers_wa_notification(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $project = $this->makeProject('in_progress', 20);

        $this->mock(WhatsappService::class, fn ($mock) => $mock
            ->shouldReceive('notifyProjectUpdate')->once()->andReturn(['sent' => true, 'via' => 'test']));

        $this->actingAs($admin)
            ->patch(route('admin.projects.update', $project), [
                'progress' => 40,
                'title' => $project->title,
                'budget' => $project->budget,
            ])
            ->assertRedirect();

        $this->assertSame(40, $project->fresh()->progress);
    }

    public function test_progress_unchanged_does_not_trigger_wa_notification(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $project = $this->makeProject('in_progress', 20);

        $this->mock(WhatsappService::class, fn ($mock) => $mock->shouldNotReceive('notifyProjectUpdate'));

        $this->actingAs($admin)
            ->patch(route('admin.projects.update', $project), [
                'progress' => 20,
                'title' => $project->title,
                'budget' => $project->budget,
            ])
            ->assertRedirect();
    }
}
