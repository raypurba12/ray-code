<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectUpdate extends Model
{
    protected $fillable = ['project_id', 'title', 'notes'];
}
