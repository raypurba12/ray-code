<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\ProjectUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Projects', [
            'projects' => Project::with(['user:id,name,email', 'service:id,title', 'files'])
                ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
                ->when($request->query('q'), fn ($q, $term) => $q->where(function ($w) use ($term) {
                    $w->where('title', 'like', "%{$term}%")->orWhere('order_code', 'like', "%{$term}%");
                }))
                ->orderBy('deadline')
                ->paginate(10)
                ->withQueryString(),
            'filters' => ['status' => $request->query('status'), 'q' => $request->query('q')],
        ]);
    }

    // PRD Sprint 2 FR-7: upload deliverable
    public function uploadFile(Request $request, Project $project)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:51200', 'mimes:zip,rar,pdf,docx,xlsx,png,jpg,jpeg,webp,mp4,sql,txt'],
            'version_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $uploaded = $request->file('file');
        $path = $uploaded->store('project_files/'.$project->id, 'public');
        $lastVersion = $project->files()->max('version') ?? 0;

        $pf = ProjectFile::create([
            'project_id' => $project->id,
            'file_name' => $uploaded->getClientOriginalName(),
            'disk_path' => $path,
            'mime' => $uploaded->getMimeType(),
            'size' => $uploaded->getSize(),
            'version' => $lastVersion + 1,
            'uploaded_by' => $request->user()->id,
        ]);

        if ($request->filled('version_notes')) {
            ProjectUpdate::create([
                'project_id' => $project->id,
                'title' => 'Deliverable v'.$pf->version.' diunggah',
                'notes' => $request->input('version_notes'),
            ]);
        }

        // auto bump progress if not completed
        if ($project->progress < 90) {
            $project->increment('progress', 10);
        }

        return back()->with('success', 'File '.$pf->file_name.' v'.$pf->version.' diunggah.');
    }

    public function destroyFile(Project $project, ProjectFile $file)
    {
        abort_unless($file->project_id === $project->id, 404);
        Storage::disk('public')->delete($file->disk_path);
        $file->delete();

        return back()->with('success', 'File dihapus.');
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
