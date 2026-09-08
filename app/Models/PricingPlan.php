<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingPlan extends Model
{
    protected $fillable = [
        'slug', 'name', 'tagline', 'price', 'unit', 'features',
        'is_popular', 'cta_text', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_popular' => 'boolean',
    ];
}
