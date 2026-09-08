<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectUpdate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Projects', [
            'projects' => Project::with(['user:id,name,email', 'service:id,title'])
                ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
                ->orderBy('deadline')
                ->paginate(10)
                ->withQueryString(),
            'filters' => ['status' => $request->query('status')],
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'progress' => ['required', 'integer', 'between:0,100'],
            'title' => ['required', 'string', 'max:255'],
            'budget' => ['required', 'integer', 'min:0'],
        ]);

        $project->update($validated);

        if ($request->filled('update_title')) {
            ProjectUpdate::create([
                'project_id' => $project->id,
                'title' => $request->input('update_title'),
                'notes' => $request->input('update_notes'),
            ]);
        }

        return back()->with('success', "Project '{$project->title}' updated.");
    }
}
