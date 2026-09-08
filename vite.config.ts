import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined;
                    // framer-motion + its runtime deps (motion-dom, motion-utils) get their own
                    // chunk so public pages that don't use them never download them
                    if (id.includes('framer-motion') || /[\\/]motion(-dom|-utils)?[\\/]/.test(id) || /[\\/]tslib[\\/]/.test(id)) {
                        return 'motion';
                    }
                    // react, react-dom, jsx-runtime, @inertiajs, lucide, axios → one vendor chunk
                    return 'vendor';
                },
            },
        },
    },
});
