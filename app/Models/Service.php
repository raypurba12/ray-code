<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'slug', 'title', 'icon', 'logo', 'short_desc', 'description', 'features',
        'starting_price', 'delivery_days', 'type', 'category', 'category_en',
        'is_featured', 'sort_order', 'status', 'published_at',
    ];

    protected $casts = [
        'features' => 'array',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    // Scopes PRD FR-2: filter paket vs joki
    public function scopePackage($q)
    {
        return $q->where('type', 'package');
    }

    public function scopeJoki($q)
    {
        return $q->where('type', 'joki');
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }
}
