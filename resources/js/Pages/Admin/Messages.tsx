import type { ContactMessageRow, PageProps } from '@/types';
import { R } from '@/lib/routes';
import { cn, timeAgo } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Badge, Button, Card } from '@/Components/ui';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Inbox, MailOpen, SendHorizonal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useConfirm } from '@/Components/useConfirm';

interface Thread {
    id: number;
    name: string;
    email: string;
    has_unread: boolean;
    last_message_at: string | null;
}

interface Props extends PageProps {
    threads: Thread[];
    contactMessages: ContactMessageRow[];
}

export default function AdminMessages({ threads, contactMessages }: Props) {
    const [openThread, setOpenThread] = useState<number | null>(null);

    return (
        <AdminLayout title="Pesan" description="Inbox dari form kontak dan chat klien">
            <div className="grid gap-6 xl:grid-cols-2">
                {/* Client threads */}
                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        Percakapan klien
                        <Badge tone="slate">{threads.length}</Badge>
                    </h2>

                    {threads.length === 0 ? (
                        <Card className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">Belum ada percakapan klien.</Card>
                    ) : (
                        <div className="space-y-3">
                            {threads.map((thread) => (
                                <ThreadCard
                                    key={thread.id}
                                    thread={thread}
                                    open={openThread === thread.id}
                                    onToggle={() => setOpenThread(openThread === thread.id ? null : thread.id)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Contact form inbox */}
                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        Inbox kontak
                        <Badge tone={contactMessages.some((c) => !c.read_at) ? 'red' : 'slate'}>
                            {contactMessages.filter((c) => !c.read_at).length} belum dibaca
                        </Badge>
                    </h2>

                    {contactMessages.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                            <Inbox className="mb-2 size-6 text-slate-400" />
                            Inbox kosong.
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {contactMessages.map((contact) => (
                                <ContactCard key={contact.id} contact={contact} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

function ThreadCard({ thread, open, onToggle }: { thread: Thread; open: boolean; onToggle: () => void }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const [messages, setMessages] = useState<{ id: number; sender_role: string; sender_name: string; body: string; created_at: string }[] | null>(null);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        onToggle();
        if (open || messages) return;
        setLoading(true);
        const response = await fetch(R.adminMessagesShow(thread.id));
        const json = await response.json();
        setMessages(json.messages);
        setLoading(false);
    };

    const reply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.body.trim()) return;
        post(R.adminMessagesReply(thread.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                fetch(R.adminMessagesShow(thread.id))
                    .then((r) => r.json())
                    .then((json) => setMessages(json.messages));
            },
        });
    };

    return (
        <Card className="overflow-hidden p-0">
            <button onClick={load} className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50" aria-expanded={open}>
                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {thread.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    {thread.has_unread && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{thread.name}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{thread.email}</span>
                </span>
                <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180')} />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <div className="border-t border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/30">
                            {loading || !messages ? (
                                <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">Memuat percakapan...</p>
                            ) : (
                                <>
                                    <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                                        {messages.map((message) => (
                                            <div key={message.id} className={cn('flex', message.sender_role === 'admin' ? 'justify-end' : 'justify-start')}>
                                                <div
                                                    className={cn(
                                                        'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm',
                                                        message.sender_role === 'admin'
                                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                            : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700',
                                                    )}
                                                >
                                                    <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                                                    <p className={cn('mt-1 font-mono text-[10px]', message.sender_role === 'admin' ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400')}>
                                                        {timeAgo(message.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <form onSubmit={reply} className="mt-4 flex items-end gap-2">
                                        <textarea
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            rows={2}
                                            placeholder={`Balas ke ${thread.name.split(' ')[0]}...`}
                                            className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white dark:focus:ring-white/10"
                                        />
                                        <Button type="submit" size="sm" disabled={processing} aria-label="Kirim balasan">
                                            <SendHorizonal className="size-4" />
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

function ContactCard({ contact }: { contact: ContactMessageRow }) {
    const { confirm } = useConfirm();
    const markRead = () => router.patch(R.adminContactsRead(contact.id), {}, { preserveScroll: true });
    const destroy = async () => {
        if (await confirm({
            title: `Hapus Pesan Kontak`,
            description: `Hapus pesan kontak dari "${contact.name}" (${contact.email})? Tindakan ini tidak dapat dibatalkan.`,
            variant: 'danger',
            confirmLabel: 'Ya, Hapus Pesan',
        })) {
            router.delete(R.adminContactsDestroy(contact.id), { preserveScroll: true });
        }
    };

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{contact.name}</p>
                        {!contact.read_at && <span className="size-1.5 rounded-full bg-red-500" aria-label="Belum dibaca" />}
                    </div>
                    <a href={`mailto:${contact.email}`} className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        {contact.email}
                    </a>
                </div>
                <span className="font-mono text-[11px] whitespace-nowrap text-slate-400">{timeAgo(contact.created_at)}</span>
            </div>
            <p className="mt-2.5 text-sm font-medium text-slate-900 dark:text-white">{contact.subject}</p>
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{contact.message}</p>
            <div className="mt-4 flex gap-2 border-t border-dashed border-slate-200 pt-3 dark:border-slate-800">
                {!contact.read_at && (
                    <Button size="sm" variant="secondary" onClick={markRead}>
                        <MailOpen className="size-3.5" />
                        Tandai dibaca
                    </Button>
                )}
                <Button size="sm" variant="ghost" className="text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400" onClick={destroy} aria-label="Hapus pesan">
                    <Trash2 className="size-3.5" />
                    Hapus
                </Button>
            </div>
        </Card>
    );
}
