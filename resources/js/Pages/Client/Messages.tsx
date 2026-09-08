import type { ChatMessage, PageProps } from '@/types';
import { R } from '@/lib/routes';
import { cn, initials, timeAgo } from '@/lib/utils';
import { ClientLayout } from '@/Components/layout/ClientLayout';
import { Button } from '@/Components/ui';
import { usePage, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessagesSquare, SendHorizonal } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Props extends PageProps {
    messages: ChatMessage[];
}

export default function Messages({ messages }: Props) {
    const user = usePage<PageProps>().props.auth.user!;
    const { data, setData, post, processing, reset } = useForm({ body: '' });
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages.length]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.body.trim()) return;
        post(R.clientMessages, { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <ClientLayout title="Messages">
            <div className="flex h-[calc(100vh-11rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-sm dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
                {/* Header */}
                <div className="flex items-center gap-3.5 border-b border-line px-6 py-4">
                    <span className="relative flex size-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                        {'</>'}
                        <span className="animate-pulse-dot absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" aria-label="online" />
                    </span>
                    <div>
                        <p className="text-sm font-bold text-ink">Raycode Engineering</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Typically replies within a few hours</p>
                    </div>
                </div>

                {/* Thread */}
                <div className="bg-dots flex-1 space-y-4 overflow-y-auto bg-alt/60 px-6 py-6">
                    {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-brand-500 shadow-sm ring-1 ring-line dark:text-brand-300">
                                <MessagesSquare className="size-6" />
                            </span>
                            <h3 className="mt-4 font-semibold text-ink">Start the conversation</h3>
                            <p className="mt-1 max-w-xs text-sm text-ink-3">
                                Ask about your project, share files links, or just say hi — messages go straight to the engineering team.
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {messages.map((message) => {
                                const mine = message.sender_role === 'client';
                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className={cn('flex items-end gap-2.5', mine ? 'flex-row-reverse' : '')}
                                    >
                                        {!mine && (
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                                                {'</>'}
                                            </span>
                                        )}
                                        <div className={cn('max-w-md', mine ? 'items-end' : '')}>
                                            <div
                                                className={cn(
                                                    'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                                                    mine
                                                        ? 'rounded-br-md bg-brand-600 text-white'
                                                        : 'rounded-bl-md border border-line bg-card text-ink-2',
                                                )}
                                            >
                                                <p className={cn('mb-0.5 text-[11px] font-semibold', mine ? 'text-brand-200' : 'text-ink-4')}>
                                                    {mine ? user.name : `Raycode · ${message.sender_name}`}
                                                </p>
                                                <p className="whitespace-pre-wrap">{message.body}</p>
                                            </div>
                                            <p className={cn('mt-1 font-mono text-[10px] text-ink-4', mine ? 'text-right' : '')}>
                                                {timeAgo(message.created_at)}
                                                {mine && message.read_at && ' · read ✓✓'}
                                            </p>
                                        </div>
                                        {mine && (
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                                {initials(user.name)}
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Composer */}
                <form onSubmit={submit} className="border-t border-line bg-card p-4">
                    <div className="flex items-end gap-3">
                        <textarea
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Write a message... (Enter to send)"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submit(e);
                                }
                            }}
                            className="max-h-32 flex-1 resize-none rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-ink-4 dark:bg-alt focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-500/20"
                        />
                        <Button type="submit" disabled={processing || !data.body.trim()} size="md" className="shrink-0">
                            <SendHorizonal className="size-4" />
                            <span className="hidden sm:inline">Send</span>
                        </Button>
                    </div>
                </form>
            </div>
        </ClientLayout>
    );
}
