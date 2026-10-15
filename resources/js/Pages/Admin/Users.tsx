import type { PageProps, User } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatDate } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Badge, Button, Card } from '@/Components/ui';
import { router, usePage } from '@inertiajs/react';
import { useConfirm } from '@/Components/useConfirm';
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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { confirm } = useConfirm();

    const selectableUsers = users.data.filter((u) => u.id !== currentUser.id);
    const allSelected = selectableUsers.length > 0 && selectableUsers.every((u) => selectedIds.includes(u.id));

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(selectableUsers.map((u) => u.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleBulkRole = async (role: 'admin' | 'client') => {
        if (selectedIds.length === 0) return;
        if (
            await confirm({
                title: `Ubah Peran Massal`,
                description: `Apakah Anda yakin ingin mengubah peran ${selectedIds.length} pengguna yang dipilih menjadi ${role}?`,
                variant: 'primary',
                confirmLabel: `Ya, Jadikan ${role}`,
            })
        ) {
            router.post(
                R.adminUsersBulk,
                { ids: selectedIds, action: role === 'admin' ? 'set_admin' : 'set_client' },
                { preserveScroll: true, onSuccess: () => setSelectedIds([]) }
            );
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (
            await confirm({
                title: `Hapus ${selectedIds.length} Pengguna Terpilih`,
                description: `Tindakan ini akan menghapus ${selectedIds.length} akun pengguna terpilih secara permanen.`,
                variant: 'danger',
                confirmLabel: 'Ya, Hapus Terpilih',
            })
        ) {
            router.post(
                R.adminUsersBulk,
                { ids: selectedIds, action: 'delete' },
                { preserveScroll: true, onSuccess: () => setSelectedIds([]) }
            );
        }
    };

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(R.adminUsers, { search: search || undefined, role: filters.role ?? undefined }, { preserveState: true });
    };

    const setRole = async (user: User, role: 'admin' | 'client') => {
        if (await confirm({
            title: `Ubah Peran Pengguna`,
            description: `Apakah Anda yakin ingin mengubah peran ${user.name} menjadi ${role}?`,
            variant: 'primary',
            confirmLabel: 'Ya, Ubah',
        })) {
            router.patch(R.adminUsersRole(user.id), { role }, { preserveScroll: true });
        }
    };

    const destroy = async (user: User) => {
        if (await confirm({
            title: `Hapus Pengguna`,
            description: `Hapus ${user.name} beserta semua proyeknya? Tindakan ini permanen dan tidak dapat dibatalkan.`,
            variant: 'danger',
            confirmLabel: 'Ya, Hapus Pengguna',
        })) {
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
                    <table className="w-full min-w-[760px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-[11px] tracking-widest text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                <th className="w-12 px-4 py-3 text-center">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        aria-label="Pilih semua pengguna"
                                        className="size-4 rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:accent-white"
                                    />
                                </th>
                                <th className="px-6 py-3 font-semibold">Pengguna</th>
                                <th className="px-6 py-3 font-semibold">Perusahaan</th>
                                <th className="px-6 py-3 font-semibold">Bergabung</th>
                                <th className="px-6 py-3 font-semibold">Peran</th>
                                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.data.map((user) => {
                                const isSelected = selectedIds.includes(user.id);
                                const isSelf = user.id === currentUser.id;
                                return (
                                    <tr
                                        key={user.id}
                                        className={cn(
                                            'transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40',
                                            isSelected && 'bg-brand-50/40 dark:bg-brand-950/20'
                                        )}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                disabled={isSelf}
                                                checked={isSelected}
                                                onChange={() => toggleSelect(user.id)}
                                                aria-label={`Pilih ${user.name}`}
                                                className="size-4 rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-slate-900 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:accent-white"
                                            />
                                        </td>
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
                                            {!isSelf ? (
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
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <p className="border-t border-slate-200 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        Halaman {users.current_page} dari {users.last_page} · {users.total} pengguna
                    </p>
                )}
            </Card>

            {/* Floating Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white shadow-2xl backdrop-blur dark:border-slate-600 dark:bg-slate-800 animate-in fade-in slide-in-from-bottom-4">
                    <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                        {selectedIds.length} pengguna dipilih
                    </span>
                    <div className="h-4 w-px bg-slate-700 dark:bg-slate-600" />
                    <Button size="sm" variant="secondary" className="h-8 text-xs bg-slate-800 text-white border-slate-700 hover:bg-slate-700" onClick={() => handleBulkRole('admin')}>
                        Jadikan Admin
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 text-xs bg-slate-800 text-white border-slate-700 hover:bg-slate-700" onClick={() => handleBulkRole('client')}>
                        Jadikan Client
                    </Button>
                    <Button size="sm" variant="danger" className="h-8 text-xs" onClick={handleBulkDelete}>
                        Hapus ({selectedIds.length})
                    </Button>
                    <button
                        onClick={() => setSelectedIds([])}
                        className="text-xs text-slate-400 hover:text-white px-1 font-medium transition-colors"
                    >
                        Batal
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}
