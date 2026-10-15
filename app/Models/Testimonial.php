<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = ['project_id', 'user_id', 'name', 'role', 'company', 'content', 'rating', 'is_approved'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $casts = [
        'is_approved' => 'boolean',
    ];
}
