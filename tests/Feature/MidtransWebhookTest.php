<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MidtransWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Project $project;

    protected Invoice $invoice;

    protected string $serverKey;

    protected function setUp(): void
    {
        parent::setUp();

        $this->serverKey = config('midtrans.server_key', 'SB-Mid-server-test-key');
        config(['midtrans.server_key' => $this->serverKey]);

        $this->user = User::factory()->create([
            'role' => 'client',
        ]);

        $this->project = Project::create([
            'user_id' => $this->user->id,
            'title' => 'Test Web Project',
            'requirements' => 'Build a responsive agency website',
            'status' => 'pending',
            'budget' => 1500000,
        ]);

        $this->invoice = Invoice::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'number' => 'INV-TEST-001',
            'midtrans_order_id' => 'INV-TEST-001-123456',
            'amount' => 1500000,
            'total' => 1500000,
            'status' => 'unpaid',
            'payment_status' => 'pending',
        ]);
    }

    public function test_rejects_webhook_with_invalid_signature(): void
    {
        $payload = [
            'order_id' => $this->invoice->midtrans_order_id,
            'status_code' => '200',
            'gross_amount' => '1500000',
            'signature_key' => 'invalid_sha512_hash',
            'transaction_status' => 'settlement',
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid signature']);
    }

    public function test_updates_invoice_to_paid_on_valid_settlement_webhook(): void
    {
        $orderId = $this->invoice->midtrans_order_id;
        $statusCode = '200';
        $grossAmount = '1500000';
        $signatureKey = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signatureKey,
            'transaction_status' => 'settlement',
            'payment_type' => 'bank_transfer',
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Notification processed successfully']);

        $this->assertDatabaseHas('invoices', [
            'id' => $this->invoice->id,
            'status' => 'paid',
            'payment_status' => 'settlement',
            'payment_type' => 'bank_transfer',
        ]);
    }

    public function test_returns_idempotent_success_when_invoice_already_settled(): void
    {
        $this->invoice->update([
            'status' => 'paid',
            'payment_status' => 'settlement',
            'paid_at' => now(),
        ]);

        $orderId = $this->invoice->midtrans_order_id;
        $statusCode = '200';
        $grossAmount = '1500000';
        $signatureKey = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signatureKey,
            'transaction_status' => 'settlement',
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Already settled']);
    }

    public function test_rejects_webhook_when_gross_amount_mismatches(): void
    {
        $orderId = $this->invoice->midtrans_order_id;
        $statusCode = '200';
        $wrongGrossAmount = '500000';
        $signatureKey = hash('sha512', $orderId.$statusCode.$wrongGrossAmount.$this->serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $wrongGrossAmount,
            'signature_key' => $signatureKey,
            'transaction_status' => 'settlement',
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Gross amount mismatch']);
    }
}
