<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;

class ProjectController extends Controller
{
    public function show(Request $request, Project $project)
    {
        abort_unless($project->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        $canTestimonial = $project->status === 'completed' && ! Testimonial::where('project_id', $project->id)->where('user_id', $request->user()->id)->exists();

        return Inertia::render('Client/ProjectShow', [
            'project' => $project->load(['service:id,title,slug,icon', 'updates', 'invoices', 'files']),
            'canTestimonial' => $canTestimonial,
            'hasTestimonial' => Testimonial::where('project_id', $project->id)->where('user_id', $request->user()->id)->exists(),
        ]);
    }

    // Download single file — signed URL 1 jam via temporaryUrl fallback to direct stream
    public function downloadFile(Request $request, Project $project, ProjectFile $file)
    {
        abort_unless(($project->user_id === $request->user()->id || $request->user()->isAdmin()) && $file->project_id === $project->id, 403);
        abort_unless(Storage::disk('public')->exists($file->disk_path), 404);

        return Storage::disk('public')->download($file->disk_path, $file->file_name);
    }

    // Download all as zip
    public function downloadAll(Request $request, Project $project)
    {
        abort_unless($project->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
        $files = $project->files;
        abort_unless($files->count() > 0, 404, 'Belum ada file.');

        if (! class_exists(ZipArchive::class)) {
            return back()->with('error', 'Fitur ZIP belum tersedia di server (php-zip). Silakan download file satu per satu.');
        }

        $zipName = 'deliverable-'.$project->order_code.'-'.now()->format('Ymd_His').'.zip';
        $tmpPath = storage_path('app/private/'.$zipName);

        $zip = new ZipArchive;
        if ($zip->open($tmpPath, ZipArchive::CREATE) !== true) {
            return back()->with('error', 'Gagal membuat ZIP.');
        }
        foreach ($files as $f) {
            $abs = Storage::disk('public')->path($f->disk_path);
            if (file_exists($abs)) {
                $zip->addFile($abs, $f->file_name);
            }
        }
        $zip->close();

        return response()->download($tmpPath, $zipName)->deleteFileAfterSend(true);
    }

    // Client submit testimonial — FR-8
    public function storeTestimonial(Request $request, Project $project)
    {
        abort_unless($project->user_id === $request->user()->id, 403);
        abort_unless($project->status === 'completed', 422, 'Hanya project completed bisa beri testimoni.');

        $exists = Testimonial::where('project_id', $project->id)->where('user_id', $request->user()->id)->exists();
        if ($exists) {
            return back()->with('error', 'Kamu sudah beri testimoni untuk project ini.');
        }

        $data = $request->validate([
            'content' => ['required', 'string', 'min:20', 'max:1000'],
            'rating' => ['required', 'integer', 'between:1,5'],
        ]);

        Testimonial::create([
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'name' => $request->user()->name,
            'role' => 'Client',
            'company' => $request->user()->company ?? '-',
            'content' => $data['content'],
            'rating' => $data['rating'],
            'is_approved' => false,
        ]);

        return back()->with('success', 'Terima kasih! Testimoni kamu akan direview admin.');
    }
}
