<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use Tests\TestCase;
use ZipArchive;

class TrackOrderTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(): Project
    {
        $user = User::factory()->create(['role' => 'client']);

        return Project::create([
            'user_id' => $user->id,
            'title' => 'Proyek Uji Pantau',
            'requirements' => str_repeat('kebutuhan ', 10),
            'status' => 'in_progress',
            'budget' => 4000000,
        ]);
    }

    private function makeInvoice(Project $project, string $number, array $attributes = []): Invoice
    {
        return Invoice::create(array_merge([
            'project_id' => $project->id,
            'user_id' => $project->user_id,
            'number' => $number,
            'amount' => 2000000,
            'tax' => 220000,
            'total' => 2220000,
            'status' => 'unpaid',
            'kind' => 'dp',
        ], $attributes));
    }

    public function test_track_page_renders_project_and_marks_unknown_code(): void
    {
        $project = $this->makeProject();

        $this->get('/pantau-pesanan?code='.$project->order_code)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/TrackOrder')
                ->where('project.order_code', $project->order_code)
                ->where('summary', null)
                ->where('notFound', false)
                ->etc());

        $this->get('/pantau-pesanan?code=RAY-19700101-ZZZZ')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('project', null)
                ->where('notFound', true)
                ->etc());
    }

    public function test_track_page_only_exposes_payment_url_for_unexpired_tokens(): void
    {
        $project = $this->makeProject();
        $this->makeInvoice($project, 'INV-DP-EXPIRED', [
            'snap_token' => 'tok-expired',
            'snap_token_expires_at' => now()->subMinute(),
            'payment_status' => 'pending',
        ]);
        $this->makeInvoice($project, 'INV-FINAL-FRESH', [
            'kind' => 'final',
            'snap_token' => 'tok-fresh',
            'snap_token_expires_at' => now()->addMinutes(10),
            'payment_status' => 'pending',
        ]);

        $this->get('/pantau-pesanan?code='.$project->order_code)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/TrackOrder')
                // Fallback top-level memilih DP (unpaid terlama) yang tokennya expired → null
                ->where('paymentUrl', null)
                ->where('invoices.0.paymentUrl', null)
                ->where('invoices.1.paymentUrl', 'https://app.sandbox.midtrans.com/snap/v2/vtweb/tok-fresh')
                ->etc());
    }

    public function test_track_page_sends_noindex_header_and_csrf_meta(): void
    {
        $this->get('/pantau-pesanan')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertSee('name="csrf-token"', false);
    }

    public function test_track_page_includes_payment_summary_and_snap_token_expiry(): void
    {
        $project = $this->makeProject();
        $this->makeInvoice($project, 'INV-DP-SUM', [
            'status' => 'paid',
            'paid_at' => now(),
            'snap_token' => 'tok-paid',
            'snap_token_expires_at' => now()->subMinutes(30),
            'payment_status' => 'settlement',
        ]);
        $this->makeInvoice($project, 'INV-FINAL-SUM', [
            'kind' => 'final',
            'snap_token' => 'tok-final-sum',
            'snap_token_expires_at' => now()->addMinutes(14),
            'payment_status' => 'pending',
        ]);

        $this->get('/pantau-pesanan?code='.$project->order_code)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/TrackOrder')
                ->where('summary.total', 4440000)
                ->where('summary.paid', 2220000)
                ->where('summary.remaining', 2220000)
                // invoice paid → expiry tidak diekspos
                ->where('invoices.0.snapTokenExpiresAt', null)
                // invoice unpaid dengan token → expiry ISO untuk countdown FE
                ->where('invoices.1.snapTokenExpiresAt', fn ($value) => is_string($value) && str_contains($value, 'T'))
                ->etc());
    }

    public function test_pay_targets_requested_dp_invoice_instead_of_latest(): void
    {
        $project = $this->makeProject();
        $this->makeInvoice($project, 'INV-DP-001');
        $this->makeInvoice($project, 'INV-FINAL-001', ['kind' => 'final']);

        $this->mock(MidtransService::class, function ($mock) {
            $mock->shouldReceive('createSnapToken')
                ->once()
                ->with(Mockery::on(fn ($invoice) => $invoice->number === 'INV-DP-001'))
                ->andReturn('tok-dp');
        });

        $this->post('/track/'.$project->order_code.'/pay', ['invoice' => 'INV-DP-001'])
            ->assertRedirect('https://app.sandbox.midtrans.com/snap/v2/vtweb/tok-dp');
    }

    public function test_pay_falls_back_to_oldest_unpaid_invoice_without_param(): void
    {
        $project = $this->makeProject();
        $this->makeInvoice($project, 'INV-DP-002');
        $this->makeInvoice($project, 'INV-FINAL-002', ['kind' => 'final']);

        $this->mock(MidtransService::class, function ($mock) {
            $mock->shouldReceive('createSnapToken')
                ->once()
                ->with(Mockery::on(fn ($invoice) => $invoice->number === 'INV-DP-002'))
                ->andReturn('tok-fallback');
        });

        $this->post('/track/'.$project->order_code.'/pay')
            ->assertRedirect('https://app.sandbox.midtrans.com/snap/v2/vtweb/tok-fallback');
    }

    public function test_pay_rejects_invoice_that_is_already_paid(): void
    {
        $project = $this->makeProject();
        $this->makeInvoice($project, 'INV-DP-003');
        $this->makeInvoice($project, 'INV-FINAL-003', ['kind' => 'final', 'status' => 'paid']);

        $this->mock(MidtransService::class, function ($mock) {
            $mock->shouldNotReceive('createSnapToken');
        });

        $this->post('/track/'.$project->order_code.'/pay', ['invoice' => 'INV-FINAL-003'])
            ->assertSessionHasErrors('code');
    }

    private function makeFile(Project $project, string $name, string $content = 'isi-file'): ProjectFile
    {
        $path = 'project_files/'.$project->id.'/'.$name;
        Storage::disk('public')->put($path, $content);

        return ProjectFile::create([
            'project_id' => $project->id,
            'file_name' => $name,
            'disk_path' => $path,
            'mime' => 'application/octet-stream',
            'size' => strlen($content),
            'version' => 1,
            'uploaded_by' => $project->user_id,
        ]);
    }

    public function test_track_page_lists_deliverable_files_with_signed_download_url(): void
    {
        Storage::fake('public');
        $project = $this->makeProject();
        $this->makeFile($project, 'hasil-final.zip', 'PK-dummy');

        $this->get('/pantau-pesanan?code='.$project->order_code)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/TrackOrder')
                ->has('files', 1)
                ->where('files.0.file_name', 'hasil-final.zip')
                ->where('files.0.downloadUrl', fn ($url) => is_string($url) && str_contains($url, 'signature='))
                ->where('filesZipUrl', null)
                ->etc());
    }

    public function test_single_file_download_requires_signature_and_works_with_signature(): void
    {
        Storage::fake('public');
        $project = $this->makeProject();
        $file = $this->makeFile($project, 'hasil.zip', 'PK');

        $this->get('/pantau-pesanan/'.$project->order_code.'/files/'.$file->id.'/download')
            ->assertForbidden();

        $url = URL::temporarySignedRoute('track.files.download', now()->addMinutes(30), [
            'code' => $project->order_code,
            'file' => $file->id,
        ]);

        $this->get($url)->assertOk()->assertDownload('hasil.zip');
    }

    public function test_zip_download_requires_signature_and_exposes_zip_url_for_multiple_files(): void
    {
        if (! class_exists(ZipArchive::class)) {
            $this->markTestSkipped('php-zip tidak tersedia di server test.');
        }

        Storage::fake('public');
        $project = $this->makeProject();
        $this->makeFile($project, 'a.txt', 'aaa');
        $this->makeFile($project, 'b.txt', 'bbb');

        $this->get('/pantau-pesanan/'.$project->order_code.'/files/download-zip')
            ->assertForbidden();

        $this->get('/pantau-pesanan?code='.$project->order_code)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('files', 2)
                ->where('filesZipUrl', fn ($url) => is_string($url) && str_contains($url, 'download-zip'))
                ->etc());

        $url = URL::temporarySignedRoute('track.files.zip', now()->addMinutes(30), ['code' => $project->order_code]);

        $this->get($url)->assertOk();
    }
}
