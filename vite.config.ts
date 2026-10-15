import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const ssrEnabled = process.env.APP_SSR !== 'false' && process.env.VITE_SSR !== 'false';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: ssrEnabled ? 'resources/js/ssr.tsx' : undefined,
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: { host: '127.0.0.1' },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        cssCodeSplit: true,
        // tanpa ubah animasi/desain, hanya split agar LCP tidak block oleh motion/icons
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined;
                    if (id.includes('framer-motion') || /[\\/]motion(-dom|-utils)?[\\/]/.test(id) || /[\\/]tslib[\\/]/.test(id)) {
                        return 'motion';
                    }
                    if (id.includes('lucide-react')) return 'icons';
                    if (id.includes('axios')) return 'axios';
                    return 'vendor';
                },
            },
        },
    },
});
