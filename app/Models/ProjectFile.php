<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectFile extends Model
{
    protected $fillable = [
        'project_id', 'project_update_id', 'file_name', 'disk_path', 'mime', 'size', 'version', 'uploaded_by',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function projectUpdate()
    {
        return $this->belongsTo(ProjectUpdate::class, 'project_update_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
