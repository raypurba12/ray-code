<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function show(Request $request, Project $project)
    {
        abort_unless($project->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        return Inertia::render('Client/ProjectShow', [
            'project' => $project->load(['service:id,title,slug,icon', 'updates', 'invoices']),
        ]);
    }
}
