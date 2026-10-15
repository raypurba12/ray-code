<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = ['question', 'answer', 'category', 'sort_order', 'is_active', 'status', 'published_at'];

    protected $casts = ['is_active' => 'boolean', 'published_at' => 'datetime'];

    public function scopePublished($q)
    {
        return $q->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }
}
