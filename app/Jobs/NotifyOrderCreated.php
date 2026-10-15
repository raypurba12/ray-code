<?php

namespace App\Jobs;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyOrderCreated implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Project $project) {}

    public function handle(): void
    {
        $project = $this->project->loadMissing(['user', 'service']);
        // PRD: notifikasi WA/Email queue — untuk sekarang log + bisa extend ke Mail/WA API
        Log::info('Order created notification', [
            'project_id' => $project->id,
            'title' => $project->title,
            'user' => $project->user->email ?? null,
            'service' => $project->service->title ?? null,
            'budget' => $project->budget,
        ]);

        // TODO: Mail::to($project->user)->send(new OrderCreatedMail($project));
        // TODO: Http::post(wa_gateway, [...])
    }
}
