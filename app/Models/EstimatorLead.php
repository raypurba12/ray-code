<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstimatorLead extends Model
{
    protected $fillable = [
        'service_id', 'complexity', 'features', 'urgency',
        'low_estimate', 'high_estimate', 'email', 'wa', 'ip', 'user_agent',
    ];

    protected $casts = [
        'features' => 'array',
        'low_estimate' => 'integer',
        'high_estimate' => 'integer',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
