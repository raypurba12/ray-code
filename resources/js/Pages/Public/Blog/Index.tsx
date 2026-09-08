import type { BlogPost } from '@/types';
import { R } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Reveal } from '@/Components/Reveal';
import { Badge } from '@/Components/ui';
import { Link } from '@inertiajs/react';
import { Calendar, Newspaper, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    posts: BlogPost[];
    categories: string[];
}

export default function BlogIndex({ posts, categories }: Props) {
    const [active, setActive] = useState<string>('Semua');
    const filtered = useMemo(() => (active === 'Semua' ? posts : posts.filter((p) => p.category === active)), [posts, active]);

    return (
        <PublicLayout>
            <section className="relative overflow-hidden pt-17">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-10 lg:px-8 lg:pt-24">
                    <Reveal>
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                                <Newspaper className="size-6" />
                            </span>
                            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Artikel & Insight</h1>
                            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
                                Tulisan terbaru dari Raycode — rekayasa, performa, dan budaya kerja yang kami pakai sehari-hari.
                            </p>
                        </div>
                    </Reveal>

                    <div className="mt-10 flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setActive('Semua')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active === 'Semua' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300'}`}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActive(cat)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
                {filtered.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
                        <p className="text-sm text-slate-500">Belum ada artikel di kategori ini.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((post, i) => (
                            <Reveal key={post.id} delay={Math.min(i * 60, 180)}>
                                <Link href={R.blogShow(post.slug)} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-slate-900">
                                    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        {post.cover_url ? (
                                            <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                                <Newspaper className="size-10 text-slate-300 dark:text-slate-600" />
                                            </div>
                                        )}
                                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">{post.category}</span>
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <h3 className="line-clamp-2 text-base font-bold leading-tight text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">{post.title}</h3>
                                        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{post.excerpt}</p>
                                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 text-xs text-slate-400 dark:border-white/10">
                                            <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {formatDate(post.published_at)}</span>
                                            <span>{post.author?.name ?? 'Raycode'}</span>
                                        </div>
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {post.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/5 dark:text-slate-400">
                                                        <Tag className="size-3" /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
