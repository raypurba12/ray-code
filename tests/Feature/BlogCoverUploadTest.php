<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BlogCoverUploadTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Artikel Uji Cover',
            'excerpt' => 'Ringkasan artikel uji.',
            'content' => 'Konten artikel uji.',
            'category' => 'Engineering',
        ], $overrides);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_guest_cannot_upload_cover(): void
    {
        $response = $this->post(route('admin.blog.store'), $this->payload([
            'cover_file' => UploadedFile::fake()->image('cover.jpg'),
        ]));

        $response->assertRedirect(route('login'));
    }

    public function test_client_cannot_upload_cover(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($client)->post(route('admin.blog.store'), $this->payload([
            'cover_file' => UploadedFile::fake()->image('cover.jpg'),
        ]));

        $response->assertForbidden();
    }

    public function test_admin_uploaded_cover_is_optimized_to_webp(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin())->post(route('admin.blog.store'), $this->payload([
            'cover_file' => UploadedFile::fake()->image('cover.jpg', 2400, 1600),
        ]));

        $response->assertSessionHasNoErrors();
        $post = BlogPost::firstOrFail();
        $this->assertStringStartsWith('/storage/blog_covers/', (string) $post->cover_url);
        $this->assertStringEndsWith('.webp', (string) $post->cover_url);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $post->cover_url));
    }

    public function test_non_image_file_disguised_as_jpg_is_rejected(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin())->post(route('admin.blog.store'), $this->payload([
            'cover_file' => UploadedFile::fake()->createWithContent('fake.jpg', 'This is plain text pretending to be an image file.'),
        ]));

        $response->assertSessionHasErrors('cover_file');
        $this->assertDatabaseCount('blog_posts', 0);
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_corrupted_image_with_valid_extension_is_rejected(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin())->post(route('admin.blog.store'), $this->payload([
            'cover_file' => UploadedFile::fake()->createWithContent('corrupt.png', "\x89PNG\r\n\x1a\nnot-a-real-png"),
        ]));

        $response->assertSessionHasErrors('cover_file');
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_svg_file_is_rejected(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin())->post(route('admin.blog.store'), $this->payload([
            'cover_file' => UploadedFile::fake()->createWithContent('vector.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'),
        ]));

        $response->assertSessionHasErrors('cover_file');
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_external_cover_url_still_accepted(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.blog.store'), $this->payload([
            'cover_url' => 'https://example.com/cover.jpg',
        ]));

        $response->assertSessionHasNoErrors();
        $this->assertSame('https://example.com/cover.jpg', BlogPost::firstOrFail()->cover_url);
    }

    public function test_update_replaces_and_deletes_old_cover_file(): void
    {
        Storage::fake('public');
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.blog.store'), $this->payload([
            'cover_file' => UploadedFile::fake()->image('cover.jpg', 800, 600),
        ]));

        $post = BlogPost::firstOrFail();
        $oldCover = (string) $post->cover_url;
        $this->assertNotSame('', $oldCover);

        $this->actingAs($admin)->put(route('admin.blog.update', $post), $this->payload([
            'cover_file' => UploadedFile::fake()->image('cover2.png', 800, 600),
        ]));

        $post->refresh();
        $newCover = (string) $post->cover_url;
        $this->assertNotSame($oldCover, $newCover);
        Storage::disk('public')->assertMissing(str_replace('/storage/', '', $oldCover));
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $newCover));
    }

    public function test_remove_cover_deletes_local_file(): void
    {
        Storage::fake('public');
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.blog.store'), $this->payload([
            'cover_file' => UploadedFile::fake()->image('cover.jpg', 800, 600),
        ]));

        $post = BlogPost::firstOrFail();
        $oldCover = (string) $post->cover_url;

        $this->actingAs($admin)->put(route('admin.blog.update', $post), $this->payload([
            'remove_cover' => true,
        ]));

        $post->refresh();
        $this->assertNull($post->cover_url);
        Storage::disk('public')->assertMissing(str_replace('/storage/', '', $oldCover));
    }
}
