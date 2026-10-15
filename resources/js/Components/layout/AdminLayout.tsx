import { R } from '@/lib/routes';
import { cn, initials } from '@/lib/utils';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BadgeDollarSign,
    Blocks,
    Calculator,
    FileText,
    FolderKanban,
    HelpCircle,
    Home,
    LayoutDashboard,
    LayoutGrid,
    LayoutTemplate,
    LogOut,
    Mail,
    Megaphone,
    Menu,
    Newspaper,
    Palette,
    ReceiptText,
    Settings,
    Sparkles,
    Users,
    X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { ToastProvider } from '@/Components/ToastProvider';
import { ConfirmProvider } from '@/Components/useConfirm';
import { AdminBreadcrumb } from '@/Components/AdminBreadcrumb';

const navGroups: { title: string; items: { label: string; href: string; icon: typeof LayoutDashboard }[] }[] = [
    {
        title: 'Ringkasan',
        items: [
            { label: 'Dashboard', href: R.adminDashboard, icon: LayoutDashboard },
            { label: 'Pesanan', href: R.adminOrders, icon: ReceiptText },
            { label: 'Proyek', href: R.adminProjects, icon: FolderKanban },
        ],
    },
    {
        title: 'Kelola Website',
        items: [
            { label: 'Halaman Depan', href: R.adminHomepage, icon: LayoutTemplate },
            { label: 'Layanan (Package + Joki)', href: R.adminServices, icon: Sparkles },
            { label: 'Joki Legacy (Redirect)', href: R.adminJokiServices, icon: LayoutGrid },
            { label: 'Portofolio', href: R.adminPortfolios, icon: Palette },
            { label: 'Paket Harga', href: R.adminPricingPlans, icon: BadgeDollarSign },
            { label: 'Estimator', href: R.adminEstimator, icon: Calculator },
            { label: 'FAQ', href: R.adminFaqs, icon: HelpCircle },
            { label: 'Testimoni', href: R.adminTestimonials, icon: Megaphone },
            { label: 'Artikel', href: R.adminBlog, icon: Newspaper },
        ],
    },
    {
        title: 'Interaksi',
        items: [
            { label: 'Pesan', href: R.adminMessages, icon: Mail },
            { label: 'Pengguna', href: R.adminUsers, icon: Users },
        ],
    },
    {
        title: 'Sistem',
        items: [{ label: 'Pengaturan', href: R.adminSettings, icon: Settings }],
    },
];

export function AdminLayout({ title, description, actions, children, breadcrumb }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; breadcrumb?: ReactNode }) {
    const { auth } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const url = usePage().url;
    const userName = auth?.user?.name ?? 'Admin';
    const userEmail = auth?.user?.email ?? '';

    return (
        <ToastProvider>
            <ConfirmProvider>
                <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 antialiased">
                {/* Desktop sidebar */}
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
                    <SidebarContent url={url} userName={userName} userEmail={userEmail} />
                </aside>

                {/* Mobile drawer */}
                <AnimatePresence>
                    {open && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setOpen(false)}
                                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                            />
                            <motion.aside
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:hidden"
                            >
                                <SidebarContent url={url} userName={userName} userEmail={userEmail} onNavigate={() => setOpen(false)} />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                <div className="lg:pl-[280px]">
                    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                onClick={() => setOpen(true)}
                                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:hidden"
                                aria-label="Buka menu"
                            >
                                <Menu className="size-5" />
                            </button>
                            <div className="min-w-0">
                                {title && (
                                    <>
                                        <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
                                        {description && <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">{description}</p>}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <Link href={R.home} className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">
                                <Home className="size-3.5" /> Lihat Website
                            </Link>
                            <ThemeToggle />
                            <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden />
                            <div className="flex items-center gap-3">
                                <div className="hidden text-right sm:block">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{userName}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{userEmail}</p>
                                </div>
                                <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                                    {initials(userName)}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
                        {breadcrumb ?? <AdminBreadcrumb />}
                    </div>

                    <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
                    <footer className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400 dark:border-slate-800/50 dark:text-slate-500">
                        © {new Date().getFullYear()} Raycode — Admin Panel · Semua perubahan tersimpan otomatis
                    </footer>
                </div>
                </div>
            </ConfirmProvider>
        </ToastProvider>
    );
}

function SidebarContent({ url, userName, userEmail, onNavigate }: { url: string; userName: string; userEmail: string; onNavigate?: () => void }) {
    return (
        <>
            <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-slate-100 px-6 dark:border-slate-800">
                <Link href={R.home} className="inline-flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 dark:bg-white dark:ring-white/10">
                        <img src="/ray.png" alt="Raycode" width={32} height={32} className="size-8 object-contain p-1" />
                    </span>
                    <span className="font-mono text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                        ray<span className="text-brand-600 dark:text-brand-400">code</span>
                    </span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">ADMIN</span>
                </Link>
                <button onClick={onNavigate} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 lg:hidden" aria-label="Tutup menu">
                    <X className="size-5" />
                </button>
            </div>

            <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6" aria-label="Navigasi admin">
                {navGroups.map((group) => (
                    <div key={group.title}>
                        <p className="mb-2 px-3 text-[11px] font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">{group.title}</p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = item.href === '/admin' ? url === '/admin' || url === '/admin/' : url === item.href || url.startsWith(item.href + '/') || url.startsWith(item.href + '?');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                                            active
                                                ? 'bg-slate-900 font-medium text-white shadow-sm dark:bg-white dark:text-slate-900'
                                                : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                                        )}
                                    >
                                        <item.icon className={cn('size-[18px] shrink-0', active ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500')} strokeWidth={1.8} />
                                        <span className="flex-1">{item.label}</span>
                                        {active && <span className="size-1.5 rounded-full bg-white dark:bg-slate-900" aria-hidden />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">{initials(userName)}</span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{userName}</p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{userEmail}</p>
                    </div>
                </div>
                <Link
                    href={R.logout}
                    method="post"
                    as="button"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <LogOut className="size-3.5" /> Keluar
                </Link>
            </div>
        </>
    );
}
