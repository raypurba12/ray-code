<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Basic hardening — tidak mengganggu Inertia / Vite HMR
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        // SAMEORIGIN lebih aman daripada DENY karena masih izinkan embed internal jika diperlukan, tapi blokir clickjacking eksternal
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        // HSTS hanya jika sudah HTTPS (prod) — jangan paksa di local http
        if ($request->isSecure() && app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // CSP minimal yang kompatibel dengan Midtrans Snap + Google Fonts + Vite
        // - 'unsafe-inline' diperlukan untuk inline theme script di app.blade.php dan Vite HMR
        // - 'unsafe-eval' diperlukan untuk dev Vite; di prod bisa dihapus jika sudah build
        // - di local/testing, izinkan Vite dev server di semua loopback (localhost, 127.0.0.1, [::1]) + ws
        $isLocal = app()->environment('local', 'testing');
        $viteHosts = $isLocal
            ? ' http://localhost:5173 https://localhost:5173 ws://localhost:5173 wss://localhost:5173 http://127.0.0.1:5173 https://127.0.0.1:5173 ws://127.0.0.1:5173 wss://127.0.0.1:5173'
            : '';

        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com https://fonts.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://plausible.io{$viteHosts}",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com{$viteHosts}",
            "img-src 'self' data: https: blob: https://www.google-analytics.com https://www.googletagmanager.com{$viteHosts}",
            "font-src 'self' https://fonts.gstatic.com data:{$viteHosts}",
            "connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://plausible.io ws://localhost:5173 wss://localhost:5173 http://localhost:5173 https://localhost:5173 ws://127.0.0.1:5173 wss://127.0.0.1:5173 http://127.0.0.1:5173 https://127.0.0.1:5173",
            'frame-src https://app.sandbox.midtrans.com https://app.midtrans.com',
            "object-src 'none'",
            "base-uri 'self'",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);

        // Jangan expose X-Powered-By jika ada
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}
