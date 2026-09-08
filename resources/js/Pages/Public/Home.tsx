import type { BlogPost, Faq, PortfolioItem, PricingPlan, Service, Testimonial } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatIDRShort } from '@/lib/utils';
import BannerGlass from '@/Components/BannerGlass';
import MiniTerminal from '@/Components/MiniTerminal';
import { useCountUp } from '@/hooks/useCountUp';
import { useTypedCode } from '@/hooks/useTypedCode';
import { ServiceIcon as ServiceGlyph } from '@/lib/icons';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Reveal } from '@/Components/Reveal';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/Accordion';
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    Braces,
    Check,
    CheckCircle2,
    Code2,
    Cpu,
    Gauge,
    Globe,
    Layers,
    Mail,
    MonitorSmartphone,
    Quote,
    Rocket,
    Server,
    ShieldCheck,
    Sparkles,
    Star,
    Terminal,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';

interface HomepageData {
    hero_badge_available: string;
    hero_badge_role: string;
    hero_socials: { label: string; href: string; platform?: string }[];
    hero_perks: { icon?: string; title: string; desc: string }[];
    hero_eyebrow: string;
    hero_heading_prefix: string;
    hero_heading_highlight: string;
    hero_heading_suffix: string;
    hero_description: string;
    hero_primary_cta_label: string;
    hero_primary_cta_href: string;
    hero_secondary_cta_label: string;
    hero_secondary_cta_href: string;
    hero_stats: { icon?: string; value: number; suffix?: string; label: string }[];
    hero_image_src: string;
    hero_image_alt: string;
    hero_code_lines: string[];
    hero_terminal_badge_top: string;
    hero_terminal_badge_bottom: string;
    hero_terminal_title: string;
    hero_terminal_env: string;
    hero_terminal_footer: string;
    marquee_stack: string[];
    services_eyebrow: string;
    services_heading: string;
    services_cta_label: string;
    process_eyebrow: string;
    process_heading: string;
    process_steps: { n: string; title: string; desc: string }[];
    work_eyebrow: string;
    work_heading: string;
    work_cta_label: string;
    why_eyebrow: string;
    why_heading: string;
    why_points: { title: string; desc: string }[];
    why_code_title: string;
    why_code_content: string;
    why_code_footer: string;
    testimonials_eyebrow: string;
    testimonials_heading: string;
    pricing_eyebrow: string;
    pricing_heading: string;
    faq_eyebrow: string;
    faq_heading: string;
    faq_footer_text: string;
    cta_eyebrow: string;
    cta_heading: string;
    cta_description: string;
    cta_primary_label: string;
    cta_primary_href: string;
    cta_secondary_label: string;
    cta_secondary_href: string;
}

interface HomeProps {
    featuredServices: Service[];
    featuredPortfolios: PortfolioItem[];
    testimonials: Testimonial[];
    plans: Pick<PricingPlan, 'slug' | 'name' | 'tagline' | 'price' | 'unit'>[];
    faqs: Faq[];
    homepage: HomepageData;
    latestPosts: BlogPost[];
}

function getPerkIcon(name?: string): LucideIcon {
    const map: Record<string, LucideIcon> = {
        'monitor-smartphone': MonitorSmartphone,
        'monitor': MonitorSmartphone,
        braces: Braces,
        zap: Zap,
        rocket: Rocket,
        'shield-check': ShieldCheck,
    };
    return map[name ?? ''] ?? Zap;
}
function getStatIcon(name?: string): LucideIcon {
    const map: Record<string, LucideIcon> = {
        rocket: Rocket,
        braces: Braces,
        'shield-check': ShieldCheck,
        zap: Zap,
        monitor: MonitorSmartphone,
    };
    return map[name ?? ''] ?? Star;
}

/* ═══════════════════════ REUSABLE MODERN BADGE ═══════════════════════ */
function SectionBadge({ text, light = false, center = false }: { text: string; light?: boolean; center?: boolean }) {
    if (!text) return null;
    const cleanText = text.replace(/^\/\/\s*/, '');
    return (
        <div className={cn('mb-4 flex', center ? 'justify-center' : 'justify-start')}>
            <span
                className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur transition-colors',
                    light
                        ? 'border border-white/20 bg-white/10 text-white shadow-sm'
                        : 'border border-brand-200/80 bg-brand-50/80 text-brand-700 shadow-sm dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300'
                )}
            >
                <span className={cn('size-1.5 rounded-full', light ? 'bg-sky-300' : 'bg-brand-500 dark:bg-brand-400')} aria-hidden />
                {cleanText}
            </span>
        </div>
    );
}

export default function Home({
    featuredServices,
    featuredPortfolios,
    testimonials,
    plans,
    faqs,
    homepage: h,
    latestPosts,
}: HomeProps) {
    // Global lightweight spotlight for any .spotlight-card
    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let raf = 0;
        const onMove = (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest?.('.spotlight-card') as HTMLElement | null;
            if (!target) return;
            const r = target.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                target.style.setProperty('--mx', `${x}%`);
                target.style.setProperty('--my', `${y}%`);
            });
        };
        document.addEventListener('mousemove', onMove, { passive: true });
        return () => { cancelAnimationFrame(raf); document.removeEventListener('mousemove', onMove); };
    }, []);

    return (
        <PublicLayout>
            <Hero h={h} />
            <Marquee stack={h.marquee_stack} />
            <ServicesSection services={featuredServices} eyebrow={h.services_eyebrow} heading={h.services_heading} ctaLabel={h.services_cta_label} />
            <ProcessSection eyebrow={h.process_eyebrow} heading={h.process_heading} steps={h.process_steps} />
            <WorkSection portfolios={featuredPortfolios} eyebrow={h.work_eyebrow} heading={h.work_heading} ctaLabel={h.work_cta_label} />
            <WhySection eyebrow={h.why_eyebrow} heading={h.why_heading} points={h.why_points} codeTitle={h.why_code_title} codeContent={h.why_code_content} codeFooter={h.why_code_footer} />
            <TestimonialsSection testimonials={testimonials} eyebrow={h.testimonials_eyebrow} heading={h.testimonials_heading} />
            <PricingTeaser plans={plans} eyebrow={h.pricing_eyebrow} heading={h.pricing_heading} />
            <BlogSection posts={latestPosts} />
            <FaqSection faqs={faqs} eyebrow={h.faq_eyebrow} heading={h.faq_heading} footerText={h.faq_footer_text} />
            <CtaBand eyebrow={h.cta_eyebrow} heading={h.cta_heading} description={h.cta_description} primaryLabel={h.cta_primary_label} primaryHref={h.cta_primary_href} secondaryLabel={h.cta_secondary_label} secondaryHref={h.cta_secondary_href} />
        </PublicLayout>
    );
}

/* ═══════════════════════ HERO — High Performance & Human Crafted ═══════════════════════ */
function Hero({ h }: { h: HomepageData }) {
    const heroRef = useRef<HTMLElement>(null);
    const ctaWrapRef = useRef<HTMLDivElement>(null);
    const ctaBtnRef = useRef<HTMLAnchorElement>(null);

    // Spotlight follow + magnetic CTA (rAF, passive, compositor-only)
    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const hero = heroRef.current;
        const ctaWrap = ctaWrapRef.current;
        const ctaBtn = ctaBtnRef.current;
        let rafSpot = 0;
        let mx = 52, my = 28;

        const onHeroMove = (e: MouseEvent) => {
            if (!hero) return;
            const r = hero.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width) * 100;
            my = ((e.clientY - r.top) / r.height) * 100;
            if (rafSpot) return;
            rafSpot = requestAnimationFrame(() => {
                hero.style.setProperty('--mx', `${mx}%`);
                hero.style.setProperty('--my', `${my}%`);
                rafSpot = 0;
            });
        };

        let rafMag = 0;
        const onCtaMove = (e: MouseEvent) => {
            if (!ctaWrap || !ctaBtn) return;
            const r = ctaWrap.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const dx = (e.clientX - cx) * 0.22;
            const dy = (e.clientY - cy) * 0.28;
            const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
            const active = dist < 240;
            cancelAnimationFrame(rafMag);
            rafMag = requestAnimationFrame(() => {
                ctaBtn.style.transform = active ? `translate3d(${dx}px, ${dy}px, 0)` : 'translate3d(0,0,0)';
            });
        };
        const onCtaLeave = () => {
            if (ctaBtn) ctaBtn.style.transform = 'translate3d(0,0,0)';
        };

        hero?.addEventListener('mousemove', onHeroMove, { passive: true });
        ctaWrap?.addEventListener('mousemove', onCtaMove, { passive: true });
        ctaWrap?.addEventListener('mouseleave', onCtaLeave);

        return () => {
            cancelAnimationFrame(rafSpot);
            cancelAnimationFrame(rafMag);
            hero?.removeEventListener('mousemove', onHeroMove);
            ctaWrap?.removeEventListener('mousemove', onCtaMove);
            ctaWrap?.removeEventListener('mouseleave', onCtaLeave);
        };
    }, []);

    return (
        <section ref={heroRef as any} className="hero-wrap relative overflow-hidden bg-[#0645c9] dark:bg-[#041a6b] [--mx:52%] [--my:28%]">
            <div
                className="absolute inset-0 bg-[linear-gradient(180deg,#0a4fe0_0%,#0750dd_20%,#0645c9_40%,#0533a3_66%,#04207c_86%,#031a66_100%)] dark:bg-[linear-gradient(180deg,#062fb0_0%,#052a9e_20%,#041e7a_40%,#03185f_66%,#021247_86%,#010b33_100%)]"
                aria-hidden
            />
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_52%_46%_at_72%_28%,rgb(12_116_235/0.6),transparent_68%)] dark:bg-[radial-gradient(ellipse_52%_46%_at_72%_28%,rgb(8_65_130/0.38),transparent_68%)]"
                aria-hidden
            />
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_8%_100%,rgb(2_10_70/0.55),transparent_62%)] dark:bg-[radial-gradient(ellipse_50%_45%_at_8%_100%,rgb(1_5_30/0.75),transparent_62%)]"
                aria-hidden
            />
            <div className="bg-grid-light mask-fade-y absolute inset-0 opacity-100 dark:opacity-45" aria-hidden />
            
            {/* Ambient depth background glow */}
            <HeroDecorations />
            
            {/* Spotlight that follows cursor */}
            <div className="hero-spotlight hidden sm:block" aria-hidden />

            <div className="relative mx-auto max-w-7xl px-5 pt-16">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
                    <div className="text-center lg:text-left">
                        <Reveal>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 py-1.5 pr-4 pl-1.5 text-xs font-medium text-white shadow-sm">
                                <span className="animate-pulse-dot size-2 rounded-full bg-emerald-400" aria-hidden />
                                {h.hero_badge_available}
                            </span>
                        </Reveal>

                        <Reveal delay={200}>
                            <div className="mt-6 flex justify-center lg:justify-start">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-white uppercase">
                                    <span className="size-1.5 rounded-full bg-sky-300" />
                                    {h.hero_eyebrow.replace(/^\/\/\s*/, '')}
                                </span>
                            </div>
                            <h1 className="mt-3 text-4xl leading-[1.06] font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.45rem]">
                                {h.hero_heading_prefix}{' '}
                                <span className="relative inline-block whitespace-nowrap">
                                    <span className="text-sky-300">{h.hero_heading_highlight}</span>
                                    <svg
                                        className="absolute -bottom-2 left-0 w-full text-sky-400/80"
                                        viewBox="0 0 120 10"
                                        fill="none"
                                        preserveAspectRatio="none"
                                        aria-hidden
                                    >
                                        <path d="M2 7C25 2.5 60 1.5 118 5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                                    </svg>
                                </span>{' '}
                                {h.hero_heading_suffix}
                            </h1>
                        </Reveal>

                        <Reveal delay={300}>
                            <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100/85 sm:text-lg">
                                {h.hero_description}
                            </p>
                        </Reveal>

                        <Reveal delay={360}>
                            <div className="mt-7 flex flex-wrap items-center gap-4">
                                <div ref={ctaWrapRef} className="magnetic-wrap">
                                    <a
                                        ref={ctaBtnRef}
                                        href={h.hero_primary_cta_href}
                                        className="magnetic-btn sheen group inline-flex h-13 items-center gap-2 rounded-xl bg-[#1d6ff2] px-7 text-base font-semibold text-white shadow-[0_18px_44px_-12px_rgb(29_111_242/0.75)] hover:-translate-y-0.5 hover:bg-[#3b82f6] hover:shadow-[0_24px_54px_-12px_rgb(59_130_246/0.8)] active:translate-y-0"
                                    >
                                        {h.hero_primary_cta_label}
                                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </a>
                                </div>
                                <a
                                    href={h.hero_secondary_cta_href}
                                    className="inline-flex h-13 items-center gap-2 rounded-xl border border-white/30 bg-white/12 px-6 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/15 active:translate-y-0"
                                >
                                    {h.hero_secondary_cta_label}
                                </a>
                            </div>
                        </Reveal>

                        <Reveal delay={390}>
                            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 sm:gap-6">
                                {h.hero_stats?.map((stat, i) => {
                                    const Icon = getStatIcon(stat.icon);
                                    return <HeroStat key={i} icon={Icon} value={stat.value} suffix={stat.suffix} label={stat.label} />;
                                })}
                            </div>
                        </Reveal>

                        <Reveal delay={430}>
                            <BannerGlass text={h.announcement_text} />
                            <MiniTerminal lines={h.hero_code_lines} />
                        </Reveal>
                    </div>

                    <Reveal delay={260} direction="left" className="relative">
                        <HeroMagangStyleShowcase h={h} />
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════ HERO MAGANG-STYLE SHOWCASE ═══════════════════════ */
function HeroMagangStyleShowcase({ h }: { h: HomepageData }) {
    return (
        <div className="relative mx-auto w-full max-w-[620px] px-2 pt-4 sm:px-4 sm:pt-6 lg:px-0 lg:pt-0">
            {/* Outer Stage Frame with Depth Glow */}
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 bg-gradient-to-b from-[#09359e]/90 via-[#031d66]/95 to-[#01103a] p-3 pt-6 sm:p-6 sm:pt-9 shadow-[0_32px_90px_-20px_rgb(0_6_40/0.85)] backdrop-blur-xl">
                {/* Background Grid & Radial Lighting */}
                <div className="bg-grid-light absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] opacity-20" aria-hidden />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-sky-400/25 blur-3xl pointer-events-none" aria-hidden />
                <div className="absolute bottom-4 right-4 size-56 rounded-full bg-blue-500/25 blur-2xl pointer-events-none" aria-hidden />

                {/* Central Character Image with Full Headroom & Faded Base */}
                <div className="relative z-10 mx-auto flex h-[440px] sm:h-[490px] lg:h-[530px] items-end justify-center overflow-hidden rounded-b-[1.75rem] sm:rounded-b-[2rem] pt-3 sm:pt-4">
                    {h.hero_image_src ? (
                        <img
                            src={h.hero_image_src}
                            alt={h.hero_image_alt || 'Developer Raycode'}
                            className="h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_24px_50px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:scale-[1.03]"
                            fetchPriority="high"
                            decoding="async"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-white/50">Developer Image</div>
                    )}
                    
                    {/* Bottom Smooth Blend Gradient */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-[#01103a] via-[#01103a]/80 to-transparent" aria-hidden />
                </div>

                {/* ─── FLOATING OVERLAY BADGES (Visible on Both Mobile & Desktop) ─── */}
                
                {/* 1. Top Left Badge */}
                <div className="animate-float absolute top-4 -left-2.5 sm:top-6 sm:-left-4 lg:top-7 lg:-left-6 z-30 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/95 bg-white/95 py-1.5 px-2.5 sm:py-2 sm:px-3.5 lg:py-2.5 lg:px-4 shadow-[0_16px_36px_-8px_rgb(0_10_50/0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105">
                    <div className="flex size-7 sm:size-8 lg:size-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 border border-amber-200/50">
                        <CheckCircle2 className="size-4 sm:size-4.5 lg:size-5" />
                    </div>
                    <div>
                        <p className="text-[11px] sm:text-xs lg:text-[13px] font-extrabold leading-tight text-slate-900">SLA Respons Cepat</p>
                        <p className="hidden sm:block text-[10px] lg:text-[11px] font-medium leading-tight text-slate-500 mt-0.5">&lt; 24 Jam Dibalas</p>
                    </div>
                </div>

                {/* 2. Mid Left Badge */}
                <div className="animate-float-slow absolute top-[48%] -translate-y-1/2 -left-3 sm:-left-5 lg:-left-8 z-30 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/95 bg-white/95 py-1.5 px-2.5 sm:py-2 sm:px-3.5 lg:py-2.5 lg:px-4 shadow-[0_16px_36px_-8px_rgb(0_10_50/0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105">
                    <div className="flex size-7 sm:size-8 lg:size-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                        <Code2 className="size-4 sm:size-4.5 lg:size-5" />
                    </div>
                    <div>
                        <p className="text-[11px] sm:text-xs lg:text-[13px] font-extrabold leading-tight text-slate-900">Clean Code & TDD</p>
                        <p className="hidden sm:block text-[10px] lg:text-[11px] font-medium leading-tight text-slate-500 mt-0.5">Standar Industri Modern</p>
                    </div>
                </div>

                {/* 3. Bottom Left Badge */}
                <div className="animate-float absolute bottom-4 -left-2 sm:bottom-6 sm:-left-4 lg:bottom-6 lg:-left-4 z-30 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/95 bg-white/95 py-1.5 px-2.5 sm:py-2 sm:px-3.5 lg:py-2.5 lg:px-4 shadow-[0_16px_36px_-8px_rgb(0_10_50/0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105">
                    <div className="flex size-7 sm:size-8 lg:size-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 border border-blue-200/50">
                        <Star className="size-4 sm:size-4.5 lg:size-5 fill-blue-600" />
                    </div>
                    <div>
                        <p className="text-[11px] sm:text-xs lg:text-[13px] font-extrabold leading-tight text-slate-900">Portofolio Teruji</p>
                        <p className="hidden sm:block text-[10px] lg:text-[11px] font-medium leading-tight text-slate-500 mt-0.5">10+ Proyek Sukses Live</p>
                    </div>
                </div>

                {/* 4. Top Right Badge */}
                <div className="animate-float-slow absolute top-4 -right-2.5 sm:top-6 sm:-right-4 lg:top-7 lg:-right-6 z-30 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/95 bg-white/95 py-1.5 px-2.5 sm:py-2 sm:px-3.5 lg:py-2.5 lg:px-4 shadow-[0_16px_36px_-8px_rgb(0_10_50/0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105">
                    <div className="flex size-7 sm:size-8 lg:size-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-sky-50 text-sky-600 border border-sky-200/50">
                        <Zap className="size-4 sm:size-4.5 lg:size-5 fill-sky-600" />
                    </div>
                    <div>
                        <p className="text-[11px] sm:text-xs lg:text-[13px] font-extrabold leading-tight text-slate-900">Lighthouse 99</p>
                        <p className="hidden sm:block text-[10px] lg:text-[11px] font-medium leading-tight text-slate-500 mt-0.5">Super Cepat & SEO Ready</p>
                    </div>
                </div>

                {/* 5. Mid Right Badge */}
                <div className="animate-float absolute top-[56%] -translate-y-1/2 -right-3 sm:-right-5 lg:-right-8 z-30 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/95 bg-white/95 py-1.5 px-2.5 sm:py-2 sm:px-3.5 lg:py-2.5 lg:px-4 shadow-[0_16px_36px_-8px_rgb(0_10_50/0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105">
                    <div className="flex size-7 sm:size-8 lg:size-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 border border-purple-200/50">
                        <Layers className="size-4 sm:size-4.5 lg:size-5" />
                    </div>
                    <div>
                        <p className="text-[11px] sm:text-xs lg:text-[13px] font-extrabold leading-tight text-slate-900">Full Stack Senior</p>
                        <p className="hidden sm:block text-[10px] lg:text-[11px] font-medium leading-tight text-slate-500 mt-0.5">Laravel • React • MySQL</p>
                    </div>
                </div>

                {/* 6. Bottom Right Badge */}
                <div className="animate-float-slow absolute bottom-4 -right-2 sm:bottom-6 sm:-right-4 lg:bottom-6 lg:-right-4 z-30 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/95 bg-white/95 py-1.5 px-2.5 sm:py-2 sm:px-3.5 lg:py-2.5 lg:px-4 shadow-[0_16px_36px_-8px_rgb(0_10_50/0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105">
                    <div className="flex size-7 sm:size-8 lg:size-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                        <ShieldCheck className="size-4 sm:size-4.5 lg:size-5" />
                    </div>
                    <div>
                        <p className="text-[11px] sm:text-xs lg:text-[13px] font-extrabold leading-tight text-slate-900">Garansi Bug Free</p>
                        <p className="hidden sm:block text-[10px] lg:text-[11px] font-medium leading-tight text-slate-500 mt-0.5">Dukungan & Maintenance</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════ STUDIO SHOWCASE (Product & App Hub) ═══════════════════════ */
function StudioShowcase({ h }: { h: HomepageData }) {
    const [activeTab, setActiveTab] = useState<'app' | 'architecture' | 'terminal'>('app');
    const { output, done } = useTypedCode(h.hero_code_lines?.length ? h.hero_code_lines : ['$ raycode new project']);
    const showcaseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const el = showcaseRef.current;
        if (!el) return;
        let raf = 0;
        const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
            });
        };
        const onLeave = () => {
            el.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
        };
        el.addEventListener('mousemove', onMove, { passive: true });
        el.addEventListener('mouseleave', onLeave);
        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return (
        <div className="relative mx-auto w-full max-w-[580px]">
            {/* Verified status badges */}
            <div className="animate-glow-pulse absolute -top-4 left-4 z-30 inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-[#03206e]/95 px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_12px_30px_-8px_rgb(0_8_50/0.8)] backdrop-blur sm:left-6">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>{h.hero_terminal_badge_top || 'SLA Respons Cepat < 24 Jam'}</span>
            </div>

            <div className="animate-glow-pulse absolute -bottom-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-[#03206e]/95 px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_12px_30px_-8px_rgb(0_8_50/0.8)] backdrop-blur sm:right-6">
                <Check className="size-3.5 text-emerald-400" />
                <span>{h.hero_terminal_badge_bottom || 'Lighthouse 99 • Zero Glitch'}</span>
            </div>

            {/* Main Interactive Studio Card */}
            <div
                ref={showcaseRef}
                className="relative overflow-hidden rounded-2xl border border-sky-300/30 bg-[#07173e]/90 shadow-[0_32px_80px_-24px_rgb(0_6_45/0.85)] backdrop-blur-md transition-transform duration-300"
                style={{ transform: 'perspective(1000px) rotateY(0) rotateX(0)' }}
            >
                {/* Window top bar */}
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.05] px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-red-400/90 shadow-xs" />
                        <span className="size-3 rounded-full bg-amber-400/90 shadow-xs" />
                        <span className="size-3 rounded-full bg-emerald-400/90 shadow-xs" />
                        <span className="ml-2 hidden font-mono text-[11px] font-medium text-sky-200/70 sm:inline-block">
                            studio.raycode.dev
                        </span>
                    </div>

                    {/* Interactive Tab Switcher */}
                    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] p-0.5">
                        <button
                            type="button"
                            onClick={() => setActiveTab('app')}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all',
                                activeTab === 'app'
                                    ? 'bg-brand-500 text-white shadow-xs'
                                    : 'text-sky-200/70 hover:text-white'
                            )}
                        >
                            <Layers className="size-3" />
                            <span className="hidden xs:inline">App Live</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('architecture')}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all',
                                activeTab === 'architecture'
                                    ? 'bg-brand-500 text-white shadow-xs'
                                    : 'text-sky-200/70 hover:text-white'
                            )}
                        >
                            <Cpu className="size-3" />
                            <span className="hidden xs:inline">Arsitektur</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('terminal')}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all',
                                activeTab === 'terminal'
                                    ? 'bg-brand-500 text-white shadow-xs'
                                    : 'text-sky-200/70 hover:text-white'
                            )}
                        >
                            <Terminal className="size-3" />
                            <span className="hidden xs:inline">CLI Shell</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[300px] p-5 sm:p-6">
                    {activeTab === 'app' && (
                        <div className="space-y-4">
                            {/* App Header info */}
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30">
                                        <Activity className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Waroeng Kita POS v2.4</p>
                                        <p className="text-[10px] text-sky-200/70">Produksi Aktif · 8 Cabang Outlet</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                                    99.98% Uptime
                                </span>
                            </div>

                            {/* App Metric grid */}
                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                    <p className="text-[10px] font-medium text-sky-200/70">Latensi API (p95)</p>
                                    <p className="mt-1 font-mono text-base font-extrabold text-white">18 ms</p>
                                    <span className="mt-1 inline-block text-[9px] font-bold text-emerald-400">⚡ Super Cepat</span>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                    <p className="text-[10px] font-medium text-sky-200/70">Lighthouse Score</p>
                                    <p className="mt-1 font-mono text-base font-extrabold text-white">99/100</p>
                                    <span className="mt-1 inline-block text-[9px] font-bold text-sky-300">✓ Hijau Sempurna</span>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                    <p className="text-[10px] font-medium text-sky-200/70">Test Coverage</p>
                                    <p className="mt-1 font-mono text-base font-extrabold text-white">100%</p>
                                    <span className="mt-1 inline-block text-[9px] font-bold text-amber-300">✓ TDD Suite</span>
                                </div>
                            </div>

                            {/* Live pipeline check items */}
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-2">
                                <p className="text-[11px] font-semibold text-sky-200/80">Status Rekayasa & Deployment:</p>
                                <div className="grid gap-1.5 text-xs">
                                    <div className="flex items-center gap-2 text-sky-100/90 text-[11px]">
                                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                                        <span>Full TypeScript Type-Safety di Client & Server</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sky-100/90 text-[11px]">
                                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                                        <span>Automated CI/CD Pipeline via GitHub Actions</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sky-100/90 text-[11px]">
                                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                                        <span>Zero-Downtime Deployment dengan Redis & Queue</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'architecture' && (
                        <div className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                    <div className="flex items-center gap-2 text-sky-300">
                                        <Code2 className="size-4" />
                                        <p className="text-xs font-bold text-white">Frontend</p>
                                    </div>
                                    <p className="mt-2 text-[11px] leading-relaxed text-sky-100/80">React 19 + TypeScript, Inertia.js v2, Tailwind CSS</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                    <div className="flex items-center gap-2 text-emerald-300">
                                        <Server className="size-4" />
                                        <p className="text-xs font-bold text-white">Backend Core</p>
                                    </div>
                                    <p className="mt-2 text-[11px] leading-relaxed text-sky-100/80">Laravel 12, PHP 8.3, RESTful & WebSocket</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                    <div className="flex items-center gap-2 text-amber-300">
                                        <Layers className="size-4" />
                                        <p className="text-xs font-bold text-white">Database & Cache</p>
                                    </div>
                                    <p className="mt-2 text-[11px] leading-relaxed text-sky-100/80">MySQL 8, Redis Caching, High-Performance Indexing</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                    <div className="flex items-center gap-2 text-sky-300">
                                        <Gauge className="size-4" />
                                        <p className="text-xs font-bold text-white">Infrastruktur</p>
                                    </div>
                                    <p className="mt-2 text-[11px] leading-relaxed text-sky-100/80">Docker Containers, Cloudflare CDN, SSL A+</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-center">
                                <p className="text-xs font-semibold text-emerald-300">
                                    ✨ Kode Bersih, Terdokumentasi Lengkap, dan 100% Hak Milik Klien
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'terminal' && (
                        <div className="rounded-xl border border-white/10 bg-[#020b29]/80 p-4">
                            <pre className="font-mono text-[12px] leading-6 overflow-x-auto text-sky-100">
                                {output.map((line, i) => (
                                    <div key={i} className="whitespace-pre">
                                        {line.startsWith('$') ? (
                                            <span className="font-semibold text-white">{line}</span>
                                        ) : line.startsWith('●') ? (
                                            <span className="font-semibold text-emerald-300">{line}</span>
                                        ) : (
                                            <>
                                                <span className={line.startsWith('✓') ? 'text-emerald-300' : 'text-sky-300'}>{line.slice(0, 1)}</span>
                                                <span className="text-sky-100/85">{line.slice(1)}</span>
                                            </>
                                        )}
                                        {!done && i === output.findIndex((l) => l !== undefined && l.length > 0 && l === output.at(-1)) && (
                                            <span className="animate-blink ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-sky-300" />
                                        )}
                                    </div>
                                ))}
                                {!done && <span className="animate-blink mt-1 inline-block h-3.5 w-1.5 bg-sky-300" />}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Footer status bar */}
                <div className="flex items-center justify-between border-t border-white/10 bg-[#031138]/60 px-5 py-2.5 font-mono text-[10px] text-sky-200/60">
                    <span>{h.hero_terminal_footer || '$ uptime: 99.98% · latensi p95: 18ms · zero incident'}</span>
                    <span className="font-semibold text-emerald-400">● LIVE</span>
                </div>
            </div>
        </div>
    );
}

/* Minimalist ambient lighting (Cleaned of cheesy floating math/code icons) */
function HeroDecorations() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {/* Elegant ambient light discs */}
            <div className="absolute top-1/4 -left-20 size-96 rounded-full bg-sky-400/15 blur-3xl" />
            <div className="absolute top-1/3 -right-20 size-[480px] rounded-full bg-brand-400/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-blue-600/30 blur-2xl" />
        </div>
    );
}

function SocialPill({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noreferrer noopener' : undefined}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#03206e]/70 px-4 py-2 text-xs font-semibold text-blue-50 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-[#03206e]/75"
        >
            {children}
            {label}
        </a>
    );
}

function HeroStat({ icon: Icon, value, suffix, label }: { icon: LucideIcon; value: number; suffix?: string; label: string }) {
    const { ref, value: current } = useCountUp<HTMLDivElement>(value);
    return (
        <div ref={ref} className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-amber-300 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] sm:size-12">
                <Icon className="size-4 sm:size-5" aria-hidden />
            </span>
            <div className="min-w-0">
                <p className="text-lg leading-none font-extrabold tracking-tight text-white sm:text-2xl lg:text-[1.7rem]">
                    {current}
                    <span className="text-sky-300">{suffix}</span>
                </p>
                <p className="mt-1 text-[10px] leading-tight font-medium text-blue-100/75 sm:text-xs">{label}</p>
            </div>
        </div>
    );
}

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4 fill-[#25d366]" aria-hidden>
            <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9 1 1-2.9-.2-.3a8.2 8.2 0 1 1 6.6 3.6Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
        </svg>
    );
}
function LinkedInIcon() {
    return (
        <span className="flex size-4 items-center justify-center rounded-[4px] bg-[#0a66c2] text-[9px] leading-none font-extrabold text-white" aria-hidden>
            in
        </span>
    );
}
function GitHubIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden>
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
        </svg>
    );
}

/* ═══════════════════════ MARQUEE ═══════════════════════ */
function Marquee({ stack }: { stack: string[] }) {
    if (!stack?.length) return null;
    const doubled = [...stack, ...stack];
    return (
        <section aria-label="Tumpukan teknologi" className="border-y border-hairline bg-alt/60 dark:border-white/[0.05] dark:bg-white/[0.015] py-6">
            <div className="mask-fade-x overflow-hidden">
                <div className="marquee-track animate-marquee flex w-max items-center gap-12 pr-12">
                    {doubled.map((tech, i) => (
                        <span key={`${tech}-${i}`} className="flex items-center gap-12 whitespace-nowrap" aria-hidden={i >= stack.length}>
                            <span className="font-mono text-sm font-medium tracking-wide text-ink-3">{tech}</span>
                            <span className="size-1 rounded-full bg-brand-400/70" aria-hidden />
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════ SERVICES ═══════════════════════ */
function ServicesSection({ services, eyebrow, heading, ctaLabel }: { services: Service[]; eyebrow: string; heading: string; ctaLabel: string }) {
    return (
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
            <Reveal>
                <SectionBadge text={eyebrow} />
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <h2 className="max-w-xl text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">{heading}</h2>
                    <a href={R.servicesIndex} className="group hidden items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:inline-flex dark:text-brand-400 dark:hover:text-brand-300">
                        {ctaLabel}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service, i) => (
                    <Reveal key={service.id} delay={(i % 3) * 90}>
                        <ServiceCard service={service} index={i + 1} />
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
    const ref = useRef<HTMLAnchorElement>(null);
    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const el = ref.current;
        if (!el) return;
        let raf = 0;
        const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.setProperty('--mx', `${x}%`);
                el.style.setProperty('--my', `${y}%`);
            });
        };
        el.addEventListener('mousemove', onMove, { passive: true });
        return () => { cancelAnimationFrame(raf); el.removeEventListener('mousemove', onMove); };
    }, []);
    return (
        <a
            ref={ref}
            href={R.servicesShow(service.slug)}
            className="spotlight-card sheen hover-lift group relative flex h-full flex-col rounded-2xl border border-line bg-card p-7 shadow-[0_1px_3px_rgb(15_23_42/0.04)] hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[0_20px_44px_-18px_rgb(37_99_235/0.22)] dark:border-white/[0.08] dark:bg-card dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40 dark:hover:bg-elev dark:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_20px_48px_-20px_rgb(37_99_235/0.35)]"
        >
            <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-semibold text-ink-3 transition-colors duration-300 group-hover:text-brand-400">
                    {String(index).padStart(2, '0')}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/25 dark:group-hover:bg-brand-500 dark:group-hover:text-white dark:group-hover:ring-brand-400">
                    <ServiceGlyph name={service.icon} />
                </span>
            </div>
            <h3 className="mt-5 text-lg font-bold text-ink transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300">{service.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{service.short_desc}</p>
            <div className="mt-6 flex items-center justify-between border-t border-dashed border-line pt-4">
                <p className="text-xs font-medium text-ink-3">
                    mulai dari <span className="font-mono font-semibold text-ink">{`Rp${formatIDRShort(service.starting_price)}`}</span>
                </p>
                <ArrowUpRight className="size-4 text-ink-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
            </div>
        </a>
    );
}

/* ═══════════════════════ PROCESS ═══════════════════════ */
function ProcessSection({ eyebrow, heading, steps }: { eyebrow: string; heading: string; steps: { n: string; title: string; desc: string }[] }) {
    return (
        <section className="border-y border-hairline bg-alt/50 dark:border-white/[0.05] dark:bg-white/[0.015]">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <Reveal>
                    <div className="mx-auto max-w-2xl text-center">
                        <SectionBadge text={eyebrow} center />
                        <h2 className="text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{heading}</h2>
                    </div>
                </Reveal>

                <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {steps?.map((step, i) => (
                        <li key={step.n + i}>
                            <Reveal delay={i * 110}>
                                <div className="relative">
                                    {i < steps.length - 1 && (
                                        <div
                                            className="process-line absolute top-6 left-14 hidden h-px w-[calc(100%-3rem)] bg-gradient-to-r from-brand-200 to-transparent lg:block dark:from-brand-500/40"
                                            style={{ '--line-delay': `${i * 140 + 420}ms` } as React.CSSProperties}
                                            aria-hidden
                                        />
                                    )}
                                    <span className="relative z-10 flex size-12 items-center justify-center rounded-2xl border border-brand-100 bg-card font-mono text-sm font-bold text-brand-600 shadow-sm transition-transform duration-300 hover:scale-105 dark:border-brand-500/30 dark:bg-elev dark:text-brand-400 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
                                        {step.n}
                                    </span>
                                    <h3 className="mt-5 text-lg font-bold text-ink">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.desc}</p>
                                </div>
                            </Reveal>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

/* ═══════════════════════ WORK ═══════════════════════ */
function WorkSection({ portfolios, eyebrow, heading, ctaLabel }: { portfolios: PortfolioItem[]; eyebrow: string; heading: string; ctaLabel: string }) {
    if (!portfolios.length) return null;
    const [first, ...rest] = portfolios;

    return (
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
            <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <SectionBadge text={eyebrow} />
                        <h2 className="max-w-xl text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{heading}</h2>
                    </div>
                    <a href={R.portfolioIndex} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                        {ctaLabel}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </Reveal>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
                <Reveal direction="left">
                    <WorkCard item={first} large />
                </Reveal>
                <div className="grid gap-5">
                    {rest.slice(0, 2).map((item, i) => (
                        <Reveal key={item.id} delay={i * 110} direction="right">
                            <WorkCard item={item} />
                        </Reveal>
                    ))}
                </div>
            </div>

            {rest.length > 2 && (
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    {rest.slice(2).map((item, i) => (
                        <Reveal key={item.id} delay={i * 90}>
                            <WorkCard item={item} compact />
                        </Reveal>
                    ))}
                </div>
            )}
        </section>
    );
}

function WorkCard({ item, large = false, compact = false }: { item: PortfolioItem; large?: boolean; compact?: boolean }) {
    const ref = useRef<HTMLAnchorElement>(null);
    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const el = ref.current;
        if (!el) return;
        let raf = 0;
        const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.setProperty('--mx', `${x}%`);
                el.style.setProperty('--my', `${y}%`);
            });
        };
        el.addEventListener('mousemove', onMove, { passive: true });
        return () => { cancelAnimationFrame(raf); el.removeEventListener('mousemove', onMove); };
    }, []);
    return (
        <a
            ref={ref}
            href={R.portfolioShow(item.slug)}
            className={cn(
                'spotlight-card sheen hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_3px_rgb(15_23_42/0.04)] hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_20px_44px_-18px_rgb(37_99_235/0.22)] dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40 dark:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_20px_48px_-20px_rgb(37_99_235/0.35)]',
                large ? 'min-h-[340px]' : 'min-h-[160px]',
            )}
        >
            <div className={cn('relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-brand-900 dark:from-[#101625] dark:via-[#0b101c] dark:to-brand-950/80', large ? 'h-52' : compact ? 'h-28' : 'h-36')}>
                <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgb(148_163_184/0.4)_1px,transparent_1px)] [background-size:18px_18px]" aria-hidden />
                <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <span className="rounded-lg border border-white/15 bg-black/40 px-4 py-2 font-mono text-xs text-brand-200 backdrop-blur transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">
                        {item.category.toLowerCase().replace(/\s/g, '_')}/{item.year}
                    </span>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-ink transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300">{item.title}</h3>
                    <ArrowUpRight className="size-4 shrink-0 text-ink-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
                </div>
                <p className="text-xs font-medium text-ink-3">
                    {item.client_name} · {item.year}
                </p>
                {!compact && (
                    <>
                        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-2">{item.description}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {item.tech_stack.slice(0, 4).map((tech) => (
                                <span key={tech} className="rounded-md bg-alt px-2 py-1 font-mono text-[11px] font-medium text-ink-2 ring-1 ring-hairline ring-inset dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.07]">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </a>
    );
}

/* ═══════════════════════ WHY US ═══════════════════════ */
function WhySection({ eyebrow, heading, points, codeTitle, codeContent, codeFooter }: { eyebrow: string; heading: string; points: { title: string; desc: string }[]; codeTitle: string; codeContent: string; codeFooter: string }) {
    return (
        <section className="relative overflow-hidden border-y border-slate-200/70 bg-[#0a0e17] dark:border-white/[0.05] dark:bg-[#080b12]">
            <div
                className="pointer-events-none absolute top-0 left-1/4 h-72 w-[560px] rounded-full bg-brand-500/[0.09] blur-3xl dark:bg-brand-500/[0.07]"
                aria-hidden
            />
            <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <div className="grid items-center gap-14 lg:grid-cols-2">
                    <Reveal direction="left">
                        <SectionBadge text={eyebrow} light />
                        <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">{heading}</h2>
                        <ul className="mt-10 space-y-6">
                            {points?.map((point) => (
                                <li key={point.title} className="flex gap-4">
                                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-400" />
                                    <div>
                                        <h3 className="font-semibold text-white">{point.title}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-400">{point.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal direction="right" delay={150}>
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1119] shadow-2xl shadow-brand-900/40">
                            <div className="border-b border-white/[0.07] px-5 py-3 font-mono text-xs text-slate-500">{codeTitle}</div>
                            <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-7 whitespace-pre-wrap break-words text-slate-300">{codeContent}</pre>
                            <div className="border-t border-white/[0.07] bg-white/[0.02] px-5 py-3.5">
                                <p className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                                    <Sparkles className="size-3.5 text-brand-400" />
                                    {codeFooter}
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */
function TestimonialsSection({ testimonials, eyebrow, heading }: { testimonials: Testimonial[]; eyebrow: string; heading: string }) {
    return (
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
            <Reveal>
                <div className="mx-auto max-w-2xl text-center">
                    <SectionBadge text={eyebrow} center />
                    <h2 className="text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{heading}</h2>
                </div>
            </Reveal>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.slice(0, 6).map((t, i) => (
                    <Reveal key={t.id} delay={(i % 3) * 100}>
                        <figure className="hover-lift spotlight-card flex h-full flex-col rounded-2xl border border-line bg-card p-7 shadow-[0_1px_3px_rgb(15_23_42/0.04)] hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_16px_40px_-16px_rgb(37_99_235/0.18)] dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40 dark:hover:bg-elev dark:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_16px_44px_-18px_rgb(37_99_235/0.3)]">
                            <Quote className="size-7 fill-brand-100 text-brand-200 dark:fill-brand-500/20 dark:text-brand-500/30" aria-hidden />
                            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-2 dark:text-slate-300">"{t.content}"</blockquote>
                            <figcaption className="mt-6 flex items-center gap-3 border-t border-hairline pt-5 dark:border-white/[0.06]">
                                <AvatarInitials name={t.name} />
                                <div>
                                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                                    <p className="text-xs text-ink-3">
                                        {t.role}, {t.company}
                                    </p>
                                </div>
                                <Stars rating={t.rating} />
                            </figcaption>
                        </figure>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

function AvatarInitials({ name }: { name: string }) {
    const letters = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    const palette = [
        'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    ];
    const color = palette[name.length % palette.length];
    return <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold', color)}>{letters}</span>;
}

function Stars({ rating }: { rating: number }) {
    return (
        <div role="img" aria-label={`${rating} dari 5 bintang`} className="ml-auto flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} viewBox="0 0 20 20" className={cn('size-3.5', i <= rating ? 'fill-amber-400' : 'fill-slate-200 dark:fill-slate-700')} aria-hidden>
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                </svg>
            ))}
        </div>
    );
}

/* ═══════════════════════ PRICING TEASER ═══════════════════════ */
function PricingTeaser({ plans, eyebrow, heading }: { plans: Pick<PricingPlan, 'slug' | 'name' | 'tagline' | 'price' | 'unit'>[]; eyebrow: string; heading: string }) {
    return (
        <section className="border-y border-hairline bg-alt/50 dark:border-white/[0.05] dark:bg-white/[0.015]">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <Reveal>
                    <div className="mx-auto max-w-2xl text-center">
                        <SectionBadge text={eyebrow} center />
                        <h2 className="text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{heading}</h2>
                    </div>
                </Reveal>

                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {plans.map((plan, i) => (
                        <Reveal key={plan.slug} delay={i * 90}>
                            <div className="hover-lift spotlight-card sheen group flex h-full flex-col rounded-2xl border border-line bg-card p-6 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_16px_40px_-16px_rgb(37_99_235/0.18)] dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40 dark:hover:bg-elev dark:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_16px_44px_-18px_rgb(37_99_235/0.3)]">
                                <h3 className="font-bold text-ink">{plan.name}</h3>
                                <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-relaxed text-ink-3">{plan.tagline}</p>
                                <p className="mt-5 font-mono text-2xl font-bold text-ink">
                                    {formatIDRShort(plan.price)}
                                    <span className="text-sm font-medium text-ink-4">{plan.unit}</span>
                                </p>
                                <a
                                    href={R.pricing}
                                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors group-hover:text-brand-700 dark:text-brand-400 dark:group-hover:text-brand-300"
                                >
                                    Lihat detail <ArrowRight className="size-3.5" />
                                </a>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════ BLOG TEASER ═══════════════════════ */
function BlogSection({ posts }: { posts: BlogPost[] }) {
    const { t } = useI18n();
    if (!posts?.length) return null;
    return (
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
            <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <SectionBadge text={t('home.blogEyebrow')} />
                        <h2 className="max-w-xl text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{t('home.blogTitle')}</h2>
                    </div>
                    <a href={R.blogIndex} className="group hidden items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:inline-flex dark:text-brand-400 dark:hover:text-brand-300">
                        {t('home.allArticles')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
                {posts.map((post, i) => (
                    <Reveal key={post.id} delay={i * 90}>
                        <a href={R.blogShow(post.slug)} className="hover-lift spotlight-card sheen group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-sm hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-card">
                            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                {post.cover_url ? (
                                    <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">{post.category}</span>
                                    </div>
                                )}
                                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">{post.category}</span>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="line-clamp-2 text-base font-bold leading-tight text-ink group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">{post.title}</h3>
                                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-2">{post.excerpt}</p>
                                <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-4 text-xs text-ink-4 dark:border-white/10">
                                    <span>{post.author?.name ?? 'Raycode'}</span>
                                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </a>
                    </Reveal>
                ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
                <a href={R.blogIndex} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {t('home.allArticles')} <ArrowRight className="size-4" />
                </a>
            </div>
        </section>
    );
}

/* ═══════════════════════ FAQ ═══════════════════════ */
function FaqSection({ faqs, eyebrow, heading, footerText }: { faqs: Faq[]; eyebrow: string; heading: string; footerText: string }) {
    return (
        <section className="mx-auto max-w-3xl px-5 py-24 lg:py-32">
            <Reveal>
                <div className="text-center">
                    <SectionBadge text={eyebrow} center />
                    <h2 className="text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{heading}</h2>
                </div>
            </Reveal>
            <Reveal delay={140}>
                <Accordion type="single" collapsible className="mt-10">
                    {faqs.map((faq) => (
                        <AccordionItem key={faq.question} value={`faq-${faq.question}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Reveal>
            <Reveal delay={220}>
                <p className="mt-8 text-center text-sm text-ink-3">
                    {footerText}{' '}
                    <a href={R.faq} className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                        Baca FAQ lengkap
                    </a>{' '}
                    atau{' '}
                    <a href={R.contact} className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                        hubungi kami langsung
                    </a>
                    .
                </p>
            </Reveal>
        </section>
    );
}

/* ═══════════════════════ CTA BAND ═══════════════════════ */
function CtaBand({ eyebrow, heading, description, primaryLabel, primaryHref, secondaryLabel, secondaryHref }: { eyebrow: string; heading: string; description: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string }) {
    return (
        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
            <Reveal>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-8 py-16 text-center shadow-2xl shadow-brand-600/30 sm:px-16 lg:py-20 dark:from-brand-800 dark:via-brand-700 dark:to-[#12305e] dark:shadow-[0_32px_80px_-24px_rgb(29_78_216/0.55),inset_0_1px_0_rgb(255_255_255/0.12)]">
                    <div className="bg-grid absolute inset-0 opacity-15" aria-hidden />
                    <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
                    <div className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full bg-brand-300/20 blur-3xl" aria-hidden />
                    <div className="relative">
                        <SectionBadge text={eyebrow} light center />
                        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">{heading}</h2>
                        <p className="mx-auto mt-4 max-w-xl text-brand-100">{description}</p>
                        <div className="mt-9 flex flex-wrap justify-center gap-4">
                            <a
                                href={primaryHref}
                                className="sheen inline-flex h-13 items-center rounded-xl bg-white px-8 font-semibold text-brand-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                            >
                                {primaryLabel}
                            </a>
                            <a
                                href={secondaryHref}
                                className="inline-flex h-13 items-center rounded-xl border border-white/30 px-8 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
                            >
                                {secondaryLabel}
                            </a>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
