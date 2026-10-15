<?php

namespace App\Mail;

use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Project $project,
        public Invoice $invoice,
        public string $payUrl,
        public string $trackUrl,
        public string $pdfUrl,
    ) {}

    public function envelope(): Envelope
    {
        $kind = $this->invoice->kind ?? 'full';
        $subject = match ($kind) {
            'dp' => "[Raycode] Invoice DP 50% — {$this->project->order_code} — {$this->invoice->number}",
            'final' => "[Raycode] Invoice Pelunasan 50% — {$this->project->order_code} — Selesai!",
            default => "[Raycode] Invoice {$this->invoice->number} — {$this->project->order_code}",
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice',
            with: [
                'project' => $this->project,
                'invoice' => $this->invoice,
                'payUrl' => $this->payUrl,
                'trackUrl' => $this->trackUrl,
                'pdfUrl' => $this->pdfUrl,
                'isDp' => ($this->invoice->kind ?? 'full') === 'dp',
                'isFinal' => ($this->invoice->kind ?? 'full') === 'final',
            ]
        );
    }
}
