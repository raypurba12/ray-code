import type { BlogPost } from '@/types';
import { R } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { SeoHead } from '@/Components/SeoHead';
import { Reveal } from '@/Components/Reveal';
import { Badge } from '@/Components/ui';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';

interface Props {
    post: BlogPost & { content: string; author?: { name: string } | null };
    related: BlogPost[];
}

export default function BlogShow({ post, related }: Props) {
    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.cover_url || undefined,
        datePublished: post.published_at || undefined,
        author: { '@type': 'Person', name: post.author?.name ?? 'Raycode Studio' },
        publisher: {
            '@type': 'Organization',
            name: 'Raycode Studio',
            logo: { '@type': 'ImageObject', url: 'https://raycode.dev/ray.png' },
        },
        mainEntityOfPage: `https://raycode.dev/blog/${post.slug}`,
    };

    return (
        <PublicLayout>
            <SeoHead
                title={post.title}
                description={post.excerpt}
                image={post.cover_url || undefined}
                type="article"
                publishedAt={post.published_at || undefined}
                author={post.author?.name}
                breadcrumbs={[
                    { name: 'Home', item: '/' },
                    { name: 'Blog', item: '/blog' },
                    { name: post.title, item: `/blog/${post.slug}` },
                ]}
                jsonLd={blogSchema}
            />
            <article className="mx-auto max-w-3xl px-5 pt-16 pb-16 lg:px-8 lg:pt-24">
                <Reveal>
                    <Link href={R.blogIndex} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        <ArrowLeft className="size-4" /> Kembali ke Blog
                    </Link>
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        <Badge tone="slate">{post.category}</Badge>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="size-3.5" /> {formatDate(post.published_at)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <User className="size-3.5" /> {post.author?.name ?? 'Raycode Studio'}
                        </span>
                    </div>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{post.title}</h1>
                    <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">{post.excerpt}</p>
                </Reveal>

                {post.cover_url && (
                    <Reveal delay={100}>
                        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                            <img src={post.cover_url} alt={post.title} className="h-auto w-full object-cover" />
                        </div>
                    </Reveal>
                )}

                <Reveal delay={140}>
                    <div className="prose prose-slate mt-8 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-brand-600 dark:prose-a:text-brand-400">
                        <div className="whitespace-pre-wrap text-base leading-7 text-slate-700 dark:text-slate-300">{post.content}</div>
                    </div>
                </Reveal>

                {post.tags && post.tags.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-6 dark:border-white/10">
                        {post.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-400">
                                <Tag className="size-3" /> {tag}
                            </span>
                        ))}
                    </div>
                )}
            </article>

            {related.length > 0 && (
                <section className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/50">
                    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Artikel terkait</h2>
                        <div className="mt-6 grid gap-6 md:grid-cols-3">
                            {related.map((r) => (
                                <Link key={r.id} href={R.blogShow(r.slug)} className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/15">
                                    {r.cover_url && <img src={r.cover_url} alt="" className="mb-4 h-36 w-full rounded-lg object-cover" loading="lazy" />}
                                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{r.category}</span>
                                    <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-brand-600 dark:text-white">{r.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{r.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
