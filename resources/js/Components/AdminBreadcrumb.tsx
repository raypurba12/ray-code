'use client';

import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

const ROUTE_LABELS: Record<string, BreadcrumbItem> = {
    '/admin': { label: 'Dashboard', href: '/admin', icon: Home },
    '/admin/dashboard': { label: 'Dashboard', href: '/admin', icon: Home },
    '/admin/orders': { label: 'Pesanan', href: '/admin/orders', icon: Settings },
    '/admin/orders/create': { label: 'Buat Pesanan' },
    '/admin/projects': { label: 'Proyek', href: '/admin/projects', icon: Settings },
    '/admin/projects/create': { label: 'Buat Proyek' },
    '/admin/services': { label: 'Layanan', href: '/admin/services', icon: Settings },
    '/admin/services/create': { label: 'Tambah Layanan' },
    '/admin/joki-services': { label: 'Joki Service', href: '/admin/joki-services', icon: Settings },
    '/admin/joki-services/create': { label: 'Tambah Joki' },
    '/admin/portfolios': { label: 'Portofolio', href: '/admin/portfolios', icon: Settings },
    '/admin/portfolios/create': { label: 'Tambah Portofolio' },
    '/admin/users': { label: 'Pengguna', href: '/admin/users', icon: Settings },
    '/admin/testimonials': { label: 'Testimoni', href: '/admin/testimonials', icon: Settings },
    '/admin/pricing-plans': { label: 'Paket Harga', href: '/admin/pricing-plans', icon: Settings },
    '/admin/faqs': { label: 'FAQ', href: '/admin/faqs', icon: Settings },
    '/admin/blog': { label: 'Artikel', href: '/admin/blog', icon: Settings },
    '/admin/blog/create': { label: 'Tulis Artikel' },
    '/admin/messages': { label: 'Pesan', href: '/admin/messages', icon: Settings },
    '/admin/settings': { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
    '/admin/homepage': { label: 'Halaman Depan', href: '/admin/homepage', icon: Settings },
    '/admin/estimator': { label: 'Estimator', href: '/admin/estimator', icon: Settings },
};

export function AdminBreadcrumb({ customItems = [] }: { customItems?: BreadcrumbItem[] }) {
    const { url } = usePage();
    const pathname = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0].split('#')[0];

    // Build breadcrumb from route
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: Home },
    ];

    let currentPath = '';
    for (const segment of segments) {
        currentPath += `/${segment}`;
        const routeKey = Object.keys(ROUTE_LABELS).find((key) => key === currentPath);
        if (routeKey) {
            breadcrumbs.push(ROUTE_LABELS[routeKey]);
        } else {
            // Fallback: format segment
            breadcrumbs.push({
                label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                href: currentPath,
            });
        }
    }

    // Add custom items (for dynamic IDs like /admin/orders/RAY-xxx)
    breadcrumbs.push(...customItems);

    return (
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const showIcon = item.icon && (index === 0 || isLast);

                    return (
                        <li key={`${item.href}-${index}`} className="flex items-center gap-2">
                            {index > 0 && (
                                <ChevronRight className="size-4 text-slate-400 shrink-0" aria-hidden />
                            )}
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                                        showIcon && 'gap-1.5'
                                    )}
                                >
                                    {showIcon && <item.icon className="size-3.5" aria-hidden />}
                                    <span>{item.label}</span>
                                </Link>
                            ) : (
                                <span className={cn(
                                    'flex items-center gap-1.5 font-medium text-slate-900 dark:text-white',
                                    showIcon && 'gap-1.5'
                                )}>
                                    {showIcon && <item.icon className="size-3.5" aria-hidden />}
                                    <span>{item.label}</span>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}