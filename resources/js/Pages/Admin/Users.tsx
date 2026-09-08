import type { PageProps, User } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatDate } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Badge, Button, Card } from '@/Components/ui';
import { router, usePage } from '@inertiajs/react';
import { Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props extends PageProps {
    users: {
        data: (User & { projects_count?: number; created_at: string })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { role: string | null; search: string | null };
}

export default function AdminUsers({ users, filters }: Props) {
    const currentUser = usePage<PageProps>().props.auth.user!;
    const [search, setSearch] = useState(filters.search ?? '');

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(R.adminUsers, { search: search || undefined, role: filters.role ?? undefined }, { preserveState: true });
    };

    const setRole = (user: User, role: 'admin' | 'client') => {
        if (confirm(`Ubah ${user.name} menjadi ${role}?`)) {
            router.patch(R.adminUsersRole(user.id), { role }, { preserveScroll: true });
        }
    };

    const destroy = (user: User) => {
        if (confirm(`Hapus ${user.name} beserta semua proyeknya? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(R.adminUsersDestroy(user.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Pengguna" description="Kelola hak akses">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    {(['all', 'admin', 'client'] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() =>
                                router.get(
                                    R.adminUsers,
                                    { role: role === 'all' ? undefined : role, search: filters.search ?? undefined },
                                    { preserveState: true },
                                )
                            }
                            className={cn(
                                'rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors',
                                (filters.role ?? 'all') === role
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
                            )}
                        >
                            {role === 'all' ? 'Semua' : role}
                        </button>
                    ))}
                </div>

                <form onSubmit={applySearch} className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau email..."
                        className="w-64 rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white dark:focus:ring-white/10"
                    />
                </form>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-[11px] tracking-widest text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                <th className="px-6 py-3 font-semibold">Pengguna</th>
                                <th className="px-6 py-3 font-semibold">Perusahaan</th>
                                <th className="px-6 py-3 font-semibold">Bergabung</th>
                                <th className="px-6 py-3 font-semibold">Peran</th>
                                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.data.map((user) => (
                                <tr key={user.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.company ?? '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(user.created_at)}</td>
                                    <td className="px-6 py-4">
                                        <Badge tone="slate" className={cn(user.role === 'admin' && 'bg-slate-900 text-white ring-slate-900 dark:bg-white dark:text-slate-900 dark:ring-white')}>
                                            {user.role === 'admin' && <ShieldCheck className="size-3" />}
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.id !== currentUser.id ? (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => setRole(user, user.role === 'admin' ? 'client' : 'admin')}>
                                                    Jadikan {user.role === 'admin' ? 'client' : 'admin'}
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400" onClick={() => destroy(user)} aria-label={`Hapus ${user.name}`}>
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-right text-xs text-slate-400 italic dark:text-slate-500">Anda</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <p className="border-t border-slate-200 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        Halaman {users.current_page} dari {users.last_page} · {users.total} pengguna
                    </p>
                )}
            </Card>
        </AdminLayout>
    );
}
