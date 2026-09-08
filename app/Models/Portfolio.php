<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $table = 'portfolios';

    protected $fillable = [
        'slug', 'title', 'category', 'client_name', 'year', 'thumbnail_url',
        'gallery_urls', 'description', 'tech_stack', 'live_url', 'is_featured', 'sort_order',
    ];

    protected $casts = [
        'gallery_urls' => 'array',
        'tech_stack' => 'array',
    ];
}
