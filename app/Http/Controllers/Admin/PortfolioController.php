<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        $query = Portfolio::query()->orderBy('sort_order')
            ->when($request->filled('q'), fn ($q) => $q->where(fn ($w) => $w->where('title', 'like', "%{$request->q}%")->orWhere('slug', 'like', "%{$request->q}%")))
            ->when(in_array($request->query('status'), ['draft', 'published']), fn ($q) => $q->where('status', $request->query('status')));

        return Inertia::render('Admin/Portfolios', [
            'portfolios' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['q', 'status']),
            'counts' => [
                'all' => Portfolio::count(),
                'draft' => Portfolio::where('status', 'draft')->count(),
                'published' => Portfolio::where('status', 'published')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request, null);
        $this->handlePublishStatus($validated);

        Portfolio::create($validated);

        return back()->with('success', 'Portfolio created.');
    }

    public function update(Request $request, Portfolio $portfolio)
    {
        $validated = $this->validated($request, $portfolio);
        $this->handlePublishStatus($validated, $portfolio);

        $portfolio->update($validated);

        return back()->with('success', 'Portfolio updated.');
    }

    public function destroy(Portfolio $portfolio)
    {
        // hapus file lokal jika ada (video, thumbnail, gallery)
        foreach (['video_url', 'thumbnail_url'] as $field) {
            if (! empty($portfolio->{$field}) && str_starts_with($portfolio->{$field}, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $portfolio->{$field});
                Storage::disk('public')->delete($oldPath);
            }
        }
        if (! empty($portfolio->gallery_urls) && is_array($portfolio->gallery_urls)) {
            foreach ($portfolio->gallery_urls as $gUrl) {
                if (str_starts_with($gUrl, '/storage/')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $gUrl));
                }
            }
        }
        $portfolio->delete();

        return back()->with('success', 'Portfolio deleted.');
    }

    public function toggleStatus(Request $request, Portfolio $portfolio)
    {
        $newStatus = $request->boolean('status') ? 'published' : 'draft';
        $updateData = ['status' => $newStatus];

        if ($newStatus === 'published' && $portfolio->published_at === null) {
            $updateData['published_at'] = now();
        }

        $portfolio->update($updateData);

        return back()->with('success', "Portfolio status updated to {$newStatus}.");
    }

    private function handlePublishStatus(array &$validated, ?Portfolio $portfolio = null): void
    {
        if (isset($validated['status']) && $validated['status'] === 'published') {
            if (! isset($validated['published_at']) || empty($validated['published_at'])) {
                $validated['published_at'] = now();
            }
        } elseif (isset($validated['status']) && $validated['status'] === 'draft') {
            $validated['published_at'] = null;
        }
    }

    private function validated(Request $request, ?Portfolio $portfolio = null): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'client_name' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'digits:4'],
            'thumbnail_url' => ['nullable', 'string', 'max:2048'],
            'thumbnail_file' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,gif', 'max:10240'],
            'remove_thumbnail' => ['nullable', 'boolean'],
            'video_url' => ['nullable', 'string', 'max:2048'],
            'video_file' => ['nullable', 'file', 'extensions:mp4,webm,ogg,mov,qt,m4v,avi,mkv', 'max:102400'],
            'remove_video' => ['nullable', 'boolean'],
            'gallery_urls' => ['nullable', 'array'],
            'gallery_urls.*' => ['string', 'max:2048'],
            'gallery_files' => ['nullable', 'array'],
            'gallery_files.*' => ['file', 'mimes:jpeg,jpg,png,webp,gif', 'max:10240'],
            'description' => ['required', 'string'],
            'tech_stack' => ['required', 'array', 'min:1'],
            'tech_stack.*' => ['string', 'max:50'],
            'live_url' => ['nullable', 'url'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']).'-'.Str::lower(Str::random(4));
        }

        // handle upload file lokal — prioritas dari file
        if ($request->hasFile('video_file')) {
            // hapus file lama jika ada
            if ($portfolio && ! empty($portfolio->video_url) && str_starts_with($portfolio->video_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $portfolio->video_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('video_file')->store('portfolio_videos', 'public');
            $validated['video_url'] = '/storage/'.$path;
        } elseif ($request->boolean('remove_video')) {
            if ($portfolio && ! empty($portfolio->video_url) && str_starts_with($portfolio->video_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $portfolio->video_url);
                Storage::disk('public')->delete($oldPath);
            }
            $validated['video_url'] = null;
        } else {
            // normalisasi video_url string kosong -> null
            if (array_key_exists('video_url', $validated)) {
                $trimmed = trim((string) $validated['video_url']);
                $validated['video_url'] = $trimmed === '' ? null : $trimmed;
            }
        }

        // handle thumbnail file — prioritas dari file (optimize via GD: resize max 1280, webp)
        if ($request->hasFile('thumbnail_file')) {
            if ($portfolio && ! empty($portfolio->thumbnail_url) && str_starts_with($portfolio->thumbnail_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $portfolio->thumbnail_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $this->storeOptimizedImage($request->file('thumbnail_file'), 'portfolio_images', 1280);
            $validated['thumbnail_url'] = '/storage/'.$path;
        } elseif ($request->boolean('remove_thumbnail')) {
            if ($portfolio && ! empty($portfolio->thumbnail_url) && str_starts_with($portfolio->thumbnail_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $portfolio->thumbnail_url);
                Storage::disk('public')->delete($oldPath);
            }
            $validated['thumbnail_url'] = null;
        } else {
            if (array_key_exists('thumbnail_url', $validated)) {
                $trimmed = trim((string) $validated['thumbnail_url']);
                $validated['thumbnail_url'] = $trimmed === '' ? null : $trimmed;
            }
        }

        // handle gallery files — merge dengan gallery_urls existing
        $existingGallery = $validated['gallery_urls'] ?? [];
        // normalisasi: filter empty strings, trim
        $existingGallery = array_values(array_filter(array_map('trim', (array) $existingGallery), fn ($v) => $v !== ''));
        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                $path = $this->storeOptimizedImage($file, 'portfolio_images', 1280);
                $existingGallery[] = '/storage/'.$path;
            }
        }
        // hapus file storage yang dihapus dari textarea (diff old vs new)
        if ($portfolio && ! empty($portfolio->gallery_urls) && is_array($portfolio->gallery_urls)) {
            $removed = array_diff($portfolio->gallery_urls, $existingGallery);
            foreach ($removed as $r) {
                if (str_starts_with($r, '/storage/')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $r));
                }
            }
        }
        $validated['gallery_urls'] = empty($existingGallery) ? null : array_values($existingGallery);

        unset($validated['video_file'], $validated['remove_video'], $validated['thumbnail_file'], $validated['remove_thumbnail'], $validated['gallery_files']);

        return $validated;
    }

    /**
     * Store image optimized via GD: max 1280px, convert to webp (quality 75) for
     * lightweight LCP. Fallback to original store if GD fails — tanpa ubah animasi/desain.
     */
    private function storeOptimizedImage($file, string $dir, int $maxDim = 1280): string
    {
        try {
            $mime = $file->getMimeType() ?? '';
            if (! str_starts_with($mime, 'image/')) {
                return $file->store($dir, 'public');
            }
            $tmpPath = $file->getRealPath();
            $info = @getimagesize($tmpPath);
            if (! $info) {
                return $file->store($dir, 'public');
            }
            [$w, $h, $type] = $info;
            // skip if already small and webp unsupported for gif
            $src = match ($type) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($tmpPath),
                IMAGETYPE_PNG => @imagecreatefrompng($tmpPath),
                IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($tmpPath) : null,
                IMAGETYPE_GIF => @imagecreatefromgif($tmpPath),
                default => null,
            };
            if (! $src) {
                return $file->store($dir, 'public');
            }
            // calculate new size preserving aspect
            $nw = $w;
            $nh = $h;
            if ($w > $maxDim || $h > $maxDim) {
                $ratio = $w / $h;
                if ($w >= $h) {
                    $nw = $maxDim;
                    $nh = (int) round($maxDim / $ratio);
                } else {
                    $nh = $maxDim;
                    $nw = (int) round($maxDim * $ratio);
                }
            }
            // if no resize needed and already webp, keep original if smaller? still convert to webp for consistency
            $dst = imagecreatetruecolor($nw, $nh);
            // preserve transparency for png/webp/gif
            if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true)) {
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
                $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
                imagefilledrectangle($dst, 0, 0, $nw, $nh, $transparent);
            }
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
            imagedestroy($src);
            $filename = Str::random(20).'.webp';
            $fullDir = Storage::disk('public')->path($dir);
            if (! is_dir($fullDir)) {
                mkdir($fullDir, 0755, true);
            }
            $fullPath = $fullDir.DIRECTORY_SEPARATOR.$filename;
            $saved = false;
            if (function_exists('imagewebp')) {
                $saved = @imagewebp($dst, $fullPath, 75);
            }
            if (! $saved) {
                // fallback jpeg
                $filename = Str::random(20).'.jpg';
                $fullPath = $fullDir.DIRECTORY_SEPARATOR.$filename;
                $bg = imagecreatetruecolor($nw, $nh);
                $white = imagecolorallocate($bg, 255, 255, 255);
                imagefilledrectangle($bg, 0, 0, $nw, $nh, $white);
                imagecopy($bg, $dst, 0, 0, 0, 0, $nw, $nh);
                $saved = @imagejpeg($bg, $fullPath, 75);
                imagedestroy($bg);
            }
            imagedestroy($dst);
            if ($saved && file_exists($fullPath)) {
                return $dir.'/'.$filename;
            }

            return $file->store($dir, 'public');
        } catch (\Throwable $e) {
            return $file->store($dir, 'public');
        }
    }
}
