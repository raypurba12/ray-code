<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'user_id', 'service_id', 'title', 'requirements', 'specs',
        'budget', 'deadline', 'status', 'progress', 'started_at', 'completed_at',
    ];

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

    public const STATUS_LABELS = [
        'pending' => 'Pending Review',
        'in_review' => 'In Review',
        'in_progress' => 'In Progress',
        'review' => 'Client Review',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];
}
