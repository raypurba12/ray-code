<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{
    protected $fillable = [
        'user_id', 'service_id', 'title', 'requirements', 'specs',
        'budget', 'deadline', 'status', 'progress', 'started_at', 'completed_at',
        'order_code', 'public_token', 'client_wa_cache',
    ];

    protected static function booted(): void
    {
        static::creating(function ($project) {
            if (empty($project->order_code)) {
                do {
                    $code = 'RAY-'.now()->format('Ymd').'-'.Str::upper(Str::random(4));
                } while (static::where('order_code', $code)->exists());
                $project->order_code = $code;
            }
            if (empty($project->public_token)) {
                $project->public_token = Str::random(32);
            }
        });
    }

    protected $casts = [
        'specs' => 'array',
        'deadline' => 'date',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function updates()
    {
        return $this->hasMany(ProjectUpdate::class)->latest();
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function files()
    {
        return $this->hasMany(ProjectFile::class)->latest();
    }

    public const STATUS_LABELS = [
        'pending' => 'Pending Review',
        'in_review' => 'In Review',
        'in_progress' => 'In Progress',
        'review' => 'Client Review',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];
}
