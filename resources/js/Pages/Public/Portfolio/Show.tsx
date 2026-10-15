import type { PortfolioItem } from '@/types';
import { R } from '@/lib/routes';
import { getVideoKind, getVimeoEmbedUrl, getYoutubeEmbedUrl } from '@/lib/video';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { SeoHead } from '@/Components/SeoHead';
import { Reveal } from '@/Components/Reveal';
import { Badge, ButtonLink, Eyebrow } from '@/Components/ui';
import { ArrowLeft, ArrowRight, ExternalLink, Play } from 'lucide-react';
import { useState } from 'react';

interface Props {
    item: PortfolioItem;
    related: Pick<PortfolioItem, 'slug' | 'title' | 'category' | 'thumbnail_url'>[];
}

export default function PortfolioShow({ item, related }: Props) {
    return (
        <PublicLayout>
            <SeoHead
                title={`${item.title} — Portofolio ${item.category}`}
                description={item.description.slice(0, 160)}
                image={item.thumbnail_url || undefined}
            />
            <article className="pt-17">
                {/* Hero — video as background / full-bleed */}
                <section className="relative overflow-hidden bg-slate-950">
                    {item.video_url && <HeroVideoBackground url={item.video_url} thumbnail={item.thumbnail_url} title={item.title} />}
                    {/* overlay gradient untuk keterbacaan teks — jangan terlalu gelap, cukup untuk teks putih */}
                    {item.video_url && <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/20" aria-hidden />}
                    {item.video_url && <div className="absolute inset-0 bg-slate-950/25" aria-hidden />}
                    <div className={`bg-dots absolute inset-0 ${item.video_url ? 'opacity-15' : 'opacity-30'}`} aria-hidden />
                    <div
                        className="pointer-events-none absolute -top-32 right-0 size-[480px] rounded-full bg-brand-600/20 blur-3xl"
                        aria-hidden
                    />
                    <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
                        <Reveal>
                            <a href={R.portfolioIndex} className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white">
                                <ArrowLeft className="size-4" />
                                Kembali ke portofolio
                            </a>
                        </Reveal>
                        <Reveal delay={80}>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-md border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs font-semibold text-brand-300 backdrop-blur">
                                    {item.category}
                                </span>
                                <span className="font-mono text-xs text-white/60">{item.year}</span>
                                {item.is_featured && <Badge tone="blue">★ Unggulan</Badge>}
                            </div>
                            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-balance text-white sm:text-5xl">{item.title}</h1>
                            <p className="mt-4 font-medium text-white/70">Klien: {item.client_name}</p>
                        </Reveal>

                        {item.live_url && (
                            <Reveal delay={160}>
                                <a
                                    href={item.live_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-500"
                                >
                                    Kunjungi Situs Langsung
                                    <ExternalLink className="size-4" />
                                </a>
                            </Reveal>
                        )}
                    </div>
                </section>

                {/* Body */}
                <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
                    <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr]">
                        <Reveal>
                            <Eyebrow>Studi Kasus</Eyebrow>
                            <div className="space-y-5">
                                {item.description.split('\n\n').map((paragraph) => (
                                    <p key={paragraph.slice(0, 32)} className="text-lg leading-relaxed text-ink-2">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>

                            {item.gallery_urls && item.gallery_urls.length > 0 && (
                                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                    {item.gallery_urls.map((url) => (
                                        <img
                                            key={url}
                                            src={url}
                                            alt={`${item.title} tangkapan layar`}
                                            loading="lazy"
                                            decoding="async"
                                            className="aspect-video w-full rounded-xl border border-line object-cover shadow-sm"
                                        />
                                    ))}
                                </div>
                            )}
                        </Reveal>

                        <Reveal delay={140}>
                            <aside className="lg:sticky lg:top-28">
                                <div className="rounded-2xl border border-line bg-card p-7 shadow-sm dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
                                    <h2 className="font-mono text-xs font-semibold tracking-widest text-ink-4 uppercase">Teknologi</h2>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {item.tech_stack.map((tech) => (
                                            <span key={tech} className="rounded-lg bg-alt px-3 py-1.5 font-mono text-xs font-medium text-ink-2 ring-1 ring-line ring-inset dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <dl className="mt-7 space-y-4 border-t border-line pt-6">
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-sm text-ink-3">Klien</dt>
                                            <dd className="text-sm font-semibold text-ink">{item.client_name}</dd>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-sm text-ink-3">Tahun</dt>
                                            <dd className="text-sm font-semibold text-ink">{item.year}</dd>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-sm text-ink-3">Kategori</dt>
                                            <dd className="text-sm font-semibold text-ink">{item.category}</dd>
                                        </div>
                                    </dl>

                                    <ButtonLink href={R.contact} className="mt-8 w-full">
                                        Buat Hal Serupa
                                        <ArrowRight className="size-4" />
                                    </ButtonLink>
                                </div>
                            </aside>
                        </Reveal>
                    </div>
                </section>

                {/* Related */}
                {related.length > 0 && (
                    <section className="border-t border-line bg-alt">
                        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
                            <Reveal>
                                <h2 className="font-mono text-sm font-semibold tracking-widest text-ink-4 uppercase">// Karya Lainnya</h2>
                            </Reveal>
                            <div className="mt-8 grid gap-5 md:grid-cols-3">
                                {related.map((rel, i) => (
                                    <Reveal key={rel.slug} delay={i * 90}>
                                        <a
                                            href={R.portfolioShow(rel.slug)}
                                            className="group block overflow-hidden rounded-2xl border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40"
                                        >
                                            <div className="relative h-36 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900">
                                                <div className="bg-dots absolute inset-0 opacity-40" aria-hidden />
                                            </div>
                                            <div className="p-5">
                                                <p className="font-mono text-[11px] text-ink-4">{rel.category}</p>
                                                <h3 className="mt-1 font-bold text-ink group-hover:text-brand-700">{rel.title}</h3>
                                            </div>
                                        </a>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </article>
        </PublicLayout>
    );
}

function HeroVideoBackground({ url, thumbnail, title }: { url: string; thumbnail: string | null; title: string }) {
    const kind = getVideoKind(url);
    if (kind === 'mp4') {
        return (
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <video
                    src={url}
                    poster={thumbnail ?? undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover"
                />
            </div>
        );
    }
    if (kind === 'youtube') {
        const embed = getYoutubeEmbedUrl(url, { autoplay: true, mute: true, loop: true, controls: false });
        if (!embed) return null;
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <iframe
                    src={embed}
                    title={`${title} — background`}
                    className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
                    allow="autoplay; encrypted-media"
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="eager"
                />
            </div>
        );
    }
    if (kind === 'vimeo') {
        const embed = getVimeoEmbedUrl(url, { autoplay: true, mute: true, loop: true, controls: false });
        if (!embed) return null;
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <iframe
                    src={embed}
                    title={`${title} — background`}
                    className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
                    allow="autoplay; fullscreen"
                    loading="eager"
                />
            </div>
        );
    }
    return null;
}

function DemoVideo({ url, thumbnail, title, compact }: { url: string; thumbnail: string | null; title: string; compact?: boolean }) {
    const [muted, setMuted] = useState(true);
    const kind = getVideoKind(url);

    if (kind === 'youtube') {
        const autoplayEmbed = getYoutubeEmbedUrl(url, { autoplay: true, mute: muted, loop: true, controls: true });
        if (!autoplayEmbed) return <div className="p-8 text-center text-sm text-white/60">URL YouTube tidak valid</div>;
        return (
            <div className={compact ? 'relative aspect-video w-full bg-black' : 'relative aspect-video w-full bg-black'}>
                <iframe
                    src={autoplayEmbed}
                    title={`${title} — demo`}
                    className="absolute inset-0 size-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="eager"
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        );
    }

    if (kind === 'vimeo') {
        const embed = getVimeoEmbedUrl(url, { autoplay: true, mute: muted, loop: true, controls: true });
        if (!embed) return <div className="p-8 text-center text-sm text-white/60">URL Vimeo tidak valid</div>;
        return (
            <div className="relative aspect-video w-full bg-black">
                <iframe src={embed} title={`${title} — demo`} className="absolute inset-0 size-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="eager" />
            </div>
        );
    }

    // mp4 / webm / direct
    return (
        <div className="relative aspect-video w-full bg-black">
            <video
                src={url}
                poster={thumbnail ?? undefined}
                autoPlay
                muted={muted}
                loop
                playsInline
                controls
                preload="metadata"
                className="absolute inset-0 size-full object-contain"
            />
            <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="absolute right-3 bottom-3 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[11px] font-medium text-white backdrop-blur hover:bg-black/80"
            >
                {muted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
        </div>
    );
}
