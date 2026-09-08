<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JokiService extends Model
{
    protected $fillable = [
        'slug', 'title', 'title_en', 'desc', 'desc_en', 'category', 'category_en', 'icon', 'logo', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
