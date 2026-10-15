<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $table = 'portfolios';

    protected $fillable = [
        'slug', 'title', 'category', 'client_name', 'year', 'thumbnail_url', 'video_url',
        'gallery_urls', 'description', 'tech_stack', 'live_url', 'is_featured', 'sort_order',
        'status', 'published_at',
    ];

    protected $casts = [
        'gallery_urls' => 'array',
        'tech_stack' => 'array',
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
