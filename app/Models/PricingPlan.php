<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingPlan extends Model
{
    protected $fillable = [
        'slug', 'name', 'tagline', 'price', 'unit', 'features',
        'is_popular', 'cta_text', 'sort_order', 'is_active', 'status', 'published_at',
    ];

    protected $casts = [
        'features' => 'array',
        'is_popular' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function scopePublished($q)
    {
        return $q->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }
}
