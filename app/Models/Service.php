<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'slug', 'title', 'icon', 'short_desc', 'description', 'features',
        'starting_price', 'delivery_days', 'is_featured', 'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
    ];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}
