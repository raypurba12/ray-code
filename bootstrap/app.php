<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            // Let API / JSON requests pass through untouched
            if ($request->expectsJson() || $request->is('api/*')) {
                return $response;
            }

            $status = $response->getStatusCode();

            // Only handle our pretty error pages
            if (! in_array($status, [403, 404, 419, 429, 500, 503], true)) {
                return $response;
            }

            // Dont override debug pages in local when APP_DEBUG is on for 500
            if (app()->hasDebugModeEnabled() && $status === 500 && app()->environment('local')) {
                return $response;
            }

            // Inertia requests: render React Error page with animation
            if ($request->header('X-Inertia')) {
                $message = $e instanceof HttpException ? $e->getMessage() : '';

                // Fallback friendly message when exception message is empty
                if ($message === '') {
                    $message = match ($status) {
                        403 => 'Kamu tidak memiliki izin untuk mengakses halaman ini.',
                        404 => 'Halaman yang kamu cari tidak ditemukan.',
                        419 => 'Sesi telah kadaluarsa. Silakan muat ulang halaman.',
                        429 => 'Terlalu banyak permintaan. Coba lagi nanti.',
                        503 => 'Layanan sedang dalam pemeliharaan.',
                        default => 'Terjadi kesalahan pada server.',
                    };
                }

                return Inertia::render('Error', [
                    'status' => $status,
                    'message' => $message,
                ])->toResponse($request)->setStatusCode($status);
            }

            // Non-Inertia (direct browser / bot / SEO): let Laravel render resources/views/errors/{status}.blade.php
            return $response;
        });
    })->create();
