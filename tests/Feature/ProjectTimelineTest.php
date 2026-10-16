<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\ProjectUpdate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProjectTimelineTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(): Project
    {
        $user = User::factory()->create(['role' => 'client']);

        return Project::create([
            'user_id' => $user->id,
            'title' => 'Proyek Timeline',
            'requirements' => str_repeat('kebutuhan ', 10),
            'status' => 'in_progress',
            'progress' => 20,
            'budget' => 2000000,
        ]);
    }

    private function makeFile(Project $project, ProjectUpdate $update, string $name, string $mime): ProjectFile
    {
        $path = 'project_files/'.$project->id.'/'.$name;
        Storage::disk('public')->put($path, 'lorem-ipsum');

        return ProjectFile::create([
            'project_id' => $project->id,
            'project_update_id' => $update->id,
            'file_name' => $name,
            'disk_path' => $path,
            'mime' => $mime,
            'size' => 11,
            'version' => 1,
            'uploaded_by' => $project->user_id,
        ]);
    }

    public function test_upload_creates_timeline_entry_and_links_file(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $project = $this->makeProject();

        $this->actingAs($admin)
            ->post(route('admin.projects.files.store', $project), [
                'file' => UploadedFile::fake()->image('progres.png', 800, 600),
                'version_notes' => 'Layout homepage jadi',
            ])
            ->assertRedirect();

        $file = ProjectFile::where('project_id', $project->id)->first();
        $this->assertNotNull($file);
        $this->assertNotNull($file->project_update_id);

        $update = ProjectUpdate::find($file->project_update_id);
        $this->assertSame('Progres v1 diunggah', $update->title);
        $this->assertSame('Layout homepage jadi', $update->notes);
        $this->assertSame(30, $project->fresh()->progress);
    }

    public function test_pantau_timeline_shows_photo_and_file_attachments_with_signed_urls(): void
    {
        Storage::fake('public');
        $project = $this->makeProject();
        $update = ProjectUpdate::create([
            'project_id' => $project->id,
            'title' => 'Progres v1 diunggah',
            'notes' => 'Layout homepage jadi',
        ]);
        $this->makeFile($project, $update, 'progres.png', 'image/png');
        $this->makeFile($project, $update, 'aset.txt', 'text/plain');

        $this->get('/pantau-pesanan?code='.$project->order_code)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/TrackOrder')
                ->has('project.updates', 1)
                ->where('project.updates.0.notes', 'Layout homepage jadi')
                ->where('project.updates.0.files.0.is_image', true)
                ->where('project.updates.0.files.0.previewUrl', fn ($url) => is_string($url) && str_contains($url, 'signature='))
                ->where('project.updates.0.files.0.downloadUrl', fn ($url) => is_string($url) && str_contains($url, 'signature='))
                ->where('project.updates.0.files.1.is_image', false)
                ->where('project.updates.0.files.1.previewUrl', null)
                ->where('project.updates.0.files.1.downloadUrl', fn ($url) => is_string($url) && str_contains($url, 'signature='))
                ->etc());
    }

    public function test_photo_preview_requires_signature_and_serves_file(): void
    {
        Storage::fake('public');
        $project = $this->makeProject();
        $update = ProjectUpdate::create([
            'project_id' => $project->id,
            'title' => 'Progres v1 diunggah',
        ]);
        $file = $this->makeFile($project, $update, 'progres.png', 'image/png');

        $this->get('/pantau-pesanan/'.$project->order_code.'/files/'.$file->id.'/preview')
            ->assertForbidden();

        $url = URL::temporarySignedRoute('track.files.preview', now()->addMinutes(30), [
            'code' => $project->order_code,
            'file' => $file->id,
        ]);

        $this->get($url)->assertOk();
    }
}
