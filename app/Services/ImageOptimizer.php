<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Optimizer gambar ketat berbasis GD untuk upload admin.
 *
 * - Hanya menerima gambar asli (divalidasi ulang via getimagesize, bukan ekstensi/nama file).
 * - File non-gambar / gambar korup / format tak didukung ditolak dengan ValidationException,
 *   tidak pernah disimpan mentah (mencegah file script lolos via ekstensi gambar).
 * - Auto-resize (sisi terpanjang max $maxDim) + kompres ke WebP q75 (fallback JPEG).
 */
class ImageOptimizer
{
    private const MAX_PIXELS = 24_000_000;

    private const SUPPORTED_TYPES = [
        IMAGETYPE_JPEG,
        IMAGETYPE_PNG,
        IMAGETYPE_WEBP,
        IMAGETYPE_GIF,
        IMAGETYPE_BMP,
        IMAGETYPE_AVIF,
    ];

    public function store(UploadedFile $file, string $dir, int $maxDim = 1280, string $field = 'image'): string
    {
        $tmpPath = $file->getRealPath();
        $info = $tmpPath ? @getimagesize($tmpPath) : false;

        if (! $info || ! in_array($info[2] ?? null, self::SUPPORTED_TYPES, true)) {
            throw $this->invalid($field, 'File harus berupa gambar (JPG, PNG, WebP, GIF, BMP, atau AVIF).');
        }

        [$width, $height, $type] = $info;

        if (($width * $height) > self::MAX_PIXELS) {
            throw $this->invalid($field, 'Resolusi gambar terlalu besar (maksimal ±24 megapiksel).');
        }

        $source = $this->createImage($tmpPath, $type);

        if (! $source) {
            throw $this->invalid($field, 'Format gambar tidak didukung oleh server.');
        }

        [$newWidth, $newHeight] = $this->fit($width, $height, $maxDim);

        $canvas = imagecreatetruecolor($newWidth, $newHeight);

        if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true)) {
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
            imagefilledrectangle($canvas, 0, 0, $newWidth, $newHeight, $transparent);
        } else {
            imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
        }

        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($source);

        $dir = trim($dir, '/');
        $fullDir = Storage::disk('public')->path($dir);

        if (! is_dir($fullDir)) {
            mkdir($fullDir, 0755, true);
        }

        $saved = false;
        $filename = Str::random(20).'.webp';

        if (function_exists('imagewebp')) {
            $saved = @imagewebp($canvas, $fullDir.DIRECTORY_SEPARATOR.$filename, 75);
        }

        if (! $saved) {
            $filename = Str::random(20).'.jpg';
            $flattened = imagecreatetruecolor($newWidth, $newHeight);
            imagefill($flattened, 0, 0, imagecolorallocate($flattened, 255, 255, 255));
            imagecopy($flattened, $canvas, 0, 0, 0, 0, $newWidth, $newHeight);
            $saved = @imagejpeg($flattened, $fullDir.DIRECTORY_SEPARATOR.$filename, 75);
            imagedestroy($flattened);
        }

        imagedestroy($canvas);

        if (! $saved || ! is_file($fullDir.DIRECTORY_SEPARATOR.$filename)) {
            throw $this->invalid($field, 'Gagal memproses gambar, coba file lain.');
        }

        return $dir.'/'.$filename;
    }

    private function createImage(string $path, int $type): ?\GdImage
    {
        $image = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null,
            IMAGETYPE_GIF => @imagecreatefromgif($path),
            IMAGETYPE_BMP => function_exists('imagecreatefrombmp') ? @imagecreatefrombmp($path) : null,
            IMAGETYPE_AVIF => function_exists('imagecreatefromavif') ? @imagecreatefromavif($path) : null,
            default => null,
        };

        return $image instanceof \GdImage ? $image : null;
    }

    private function fit(int $width, int $height, int $maxDim): array
    {
        if ($width <= $maxDim && $height <= $maxDim) {
            return [$width, $height];
        }

        $ratio = $width / $height;

        if ($width >= $height) {
            return [$maxDim, (int) round($maxDim / $ratio)];
        }

        return [(int) round($maxDim * $ratio), $maxDim];
    }

    private function invalid(string $field, string $message): ValidationException
    {
        return ValidationException::withMessages([$field => $message]);
    }
}
