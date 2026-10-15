import type { PortfolioItem } from '@/types';
import { R } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { getVideoKind, getVimeoEmbedUrl, getYoutubeEmbedUrl } from '@/lib/video';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { SeoHead } from '@/Components/SeoHead';
import { Reveal } from '@/Components/Reveal';
import { Eyebrow, EmptyState } from '@/Components/ui';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, FolderOpen, Play } from 'lucide-react';

interface Props {
    items: PortfolioItem[];
    categories: string[];
}

export default function PortfolioIndex({ items, categories }: Props) {
    const cats = ['All', ...categories];

    return (
        <PublicLayout>
            <SeoHead
                title="Portofolio & Studi Kasus Proyek"
                description="Koleksi karya pembuatan website, aplikasi web, dan solusi digital yang telah berhasil diselesaikan oleh Raycode Studio."
            />
            <section className="relative overflow-hidden pt-17">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-12 lg:px-8 lg:pt-24">
                    <Reveal>
                        <Eyebrow>Portofolio</Eyebrow>
                        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">
                            Sistem yang berjalan di produksi. Hasil yang bisa Anda verifikasi.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
                            Setiap studi kasus di bawah ini adalah produk nyata yang melayani pengguna sungguhan — lengkap dengan dokumentasi keputusan arsitekturnya.
                        </p>
                    </Reveal>

                    <Reveal delay={140}>
                        <div className="mt-9 flex flex-wrap gap-2">
                            {cats.map((cat) => (
                                <Link
                                    key={cat}
                                    href={cat === 'All' ? R.portfolioIndex : `${R.portfolioIndex}?category=${encodeURIComponent(cat)}`}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200',
                                        cat === 'All'
                                            ? 'border-line bg-card text-ink-2 hover:border-brand-300 hover:text-brand-700'
                                            : 'border-line bg-card text-ink-3 hover:border-brand-300 hover:text-brand-700',
                                    )}
                                >
                                    {cat === 'All' ? 'Semua' : cat}
                                </Link>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
                {items.length === 0 ? (
                    <EmptyState icon={<FolderOpen className="size-5" />} title="Belum ada proyek di kategori ini" description="Kembali lagi nanti — studi kasus baru akan segera hadir." />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {items.map((item, i) => (
                            <Reveal key={item.id} delay={(i % 2) * 100}>
                                <PortfolioCard item={item} />
                            </Reveal>
                        ))}
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
    return (
        <Link
            href={R.portfolioShow(item.slug)}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_3px_rgb(15_23_42/0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[0_24px_48px_-20px_rgb(37_99_235/0.25)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40"
        >
            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900">
                <CardMedia item={item} />
                <span className="absolute top-4 left-4 rounded-md bg-white/90 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 backdrop-blur">
                    {item.category}
                </span>
                {item.video_url && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white backdrop-blur">
                        <Play className="size-3 fill-white" /> DEMO
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-7">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-ink transition-colors group-hover:text-brand-700">{item.title}</h2>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600 dark:text-slate-600" />
                </div>
                <p className="text-xs font-medium text-ink-4">
                    {item.client_name} · {item.year}
                </p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-2">{item.description}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                    {item.tech_stack.map((tech) => (
                        <span key={tech} className="rounded-md bg-alt px-2 py-1 font-mono text-[11px] font-medium text-ink-3 ring-1 ring-line ring-inset dark:bg-white/5 dark:text-slate-400 dark:ring-white/10">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

function CardMedia({ item }: { item: PortfolioItem }) {
    if (item.video_url) {
        const kind = getVideoKind(item.video_url);
        if (kind === 'youtube') {
            const embed = getYoutubeEmbedUrl(item.video_url, { autoplay: true, mute: true, loop: true, controls: false });
            if (embed) {
                return (
                    <iframe
                        src={embed}
                        title={item.title}
                        className="pointer-events-none absolute inset-0 size-full object-cover"
                        allow="autoplay; encrypted-media"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                );
            }
        }
        if (kind === 'vimeo') {
            const embed = getVimeoEmbedUrl(item.video_url, { autoplay: true, mute: true, loop: true, controls: false });
            if (embed) {
                return (
                    <iframe
                        src={embed}
                        title={item.title}
                        className="pointer-events-none absolute inset-0 size-full object-cover"
                        allow="autoplay; fullscreen"
                        loading="lazy"
                    />
                );
            }
        }
        if (kind === 'mp4' || kind === 'unknown') {
            // treat unknown as direct video — browser will fail gracefully and we fallback to thumbnail via poster
            return (
                <video
                    src={item.video_url}
                    poster={item.thumbnail_url ?? undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover"
                />
            );
        }
    }

    if (item.thumbnail_url) {
        return (
            <img
                src={item.thumbnail_url}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
        );
    }

    return (
        <>
            <div className="bg-dots absolute inset-0 opacity-40" aria-hidden />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-lg border border-white/15 bg-black/30 px-4 py-2 font-mono text-xs text-brand-200 backdrop-blur transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">
                    {item.category.toLowerCase().replace(/\s/g, '_')}/{item.year}
                </span>
            </div>
        </>
    );
}
