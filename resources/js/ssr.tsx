import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const appName = 'Raycode';

const pages = import.meta.glob('./Pages/**/*.tsx');

export default function render(page: any) {
    return createServer((page: any) =>
        createInertiaApp({
            page,
            render: ReactDOMServer.renderToString as any,
            title: (title: string) => (title ? `${title} — ${appName}` : `${appName} — Studio Pengembangan Web`),
            resolve: ((name: string) => resolvePageComponent(`./Pages/${name}.tsx`, pages as any)) as any,
            setup({ App, props }: any) {
                return <App {...props} />;
            },
        } as any),
    );
}
