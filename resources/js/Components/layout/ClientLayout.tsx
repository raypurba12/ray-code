import { R } from '@/lib/routes';
import { cn, initials } from '@/lib/utils';
import type { PageProps, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderKanban, Home, LayoutDashboard, LogOut, Mail, Menu, ReceiptText, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Toast } from '@/Components/Toast';

import { ThemeToggle } from '@/Components/ThemeToggle';

const nav = [
    { label: 'Dashboard', href: R.clientDashboard, icon: LayoutDashboard },
    { label: 'New Order', href: R.clientOrder, icon: FolderKanban },
    { label: 'Invoices', href: R.clientInvoices, icon: ReceiptText },
    { label: 'Messages', href: R.clientMessages, icon: Mail },
];

export function ClientLayout({ title, children }: { title?: string; children: ReactNode }) {
    const { auth } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const url = usePage().url;
    const user = auth?.user;

    return (
        <div className="min-h-screen bg-base transition-colors duration-200">
            {/* Sidebar — desktop */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-alt lg:flex">
                {user && <SidebarContent user={user} url={url} />}
            </aside>

            {/* Sidebar — mobile drawer */}
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
                            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card/95 backdrop-blur-xl dark:bg-[#0c1017]/95 shadow-2xl lg:hidden"
                        >
                            {user && <SidebarContent user={user} url={url} onNavigate={() => setOpen(false)} />}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className="lg:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-card/85 px-5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a0d14]/80 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOpen(true)}
                            className="flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-hover lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="size-5" />
                        </button>
                        <h1 className="text-base font-semibold text-ink">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {user && <UserMenu user={user} />}
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8">{children}</main>
            </div>

            <Toast />
        </div>
    );
}

function SidebarContent({ user, url, onNavigate }: { user: User; url: string; onNavigate?: () => void }) {
    return (
        <>
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <Link href={R.home} className="inline-flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 font-mono text-sm font-bold text-white">{'</>'}</span>
                    <span className="font-mono font-semibold tracking-tight text-ink">
                        ray<span className="text-brand-500">code</span>
                    </span>
                </Link>
                <button onClick={onNavigate} className="text-ink-4 hover:text-ink-2 lg:hidden" aria-label="Close menu">
                    <X className="size-5" />
                </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Client navigation">
                {nav.map((item) => {
                    const active = item.href === '/dashboard' ? url === '/dashboard' : url.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                                active
                                    ? 'bg-brand-500/10 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                                    : 'text-ink-2 dark:text-slate-400 hover:bg-hover hover:text-ink dark:hover:text-white',
                            )}
                        >
                            <item.icon className={cn('size-[18px]', active && 'drop-shadow')} strokeWidth={active ? 2.2 : 1.8} />
                            {item.label}
                        </Link>
                    );
                })}
                <Link
                    href={R.home}
                    className="mt-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-3 transition-colors hover:bg-hover hover:text-ink"
                >
                    <Home className="size-[18px]" strokeWidth={1.8} />
                    Back to Site
                </Link>
            </nav>

            <div className="border-t border-line p-4">
                <Link href={R.contact} className="block rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white transition-transform duration-300 hover:-translate-y-0.5">
                    <p className="text-sm font-semibold">Need something custom?</p>
                    <p className="mt-0.5 text-xs text-brand-100">Talk to an engineer →</p>
                </Link>
            </div>
        </>
    );
}

export function UserMenu({ user }: { user: User }) {
    return (
        <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-ink">{user.name}</p>
                <p className="text-xs text-ink-3">{user.company ?? user.email}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 ring-2 ring-white dark:bg-brand-500/15 dark:text-brand-300 dark:ring-white/20">
                {initials(user.name)}
            </span>
            <Link
                href={R.logout}
                method="post"
                as="button"
                className="flex size-9 items-center justify-center rounded-lg text-ink-4 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                title="Log out"
            >
                <LogOut className="size-[18px]" />
            </Link>
        </div>
    );
}
