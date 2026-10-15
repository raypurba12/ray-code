import { R } from '@/lib/routes';
import { cn, initials } from '@/lib/utils';
import type { PageProps, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, BadgeDollarSign, Calculator, ChevronDown, Layers, LayoutGrid, Menu, TerminalSquare, X, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toast } from '@/Components/Toast';
import { CookieConsent } from '@/Components/CookieConsent';
import { ButtonLink } from '@/Components/ui';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { LanguageSwitcher } from '@/Components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';

export function Logo({ light: _light = false }: { light?: boolean }) {
    return (
        <Link href={R.home} className="group inline-flex items-center">
            <img
                src="/ray.png?v=3"
                alt="Raycode"
                width={220}
                height={48}
                className="h-12 w-auto max-w-[240px] object-contain transition-transform duration-300 group-hover:scale-[1.02] dark:invert sm:h-14 sm:max-w-[260px]"
                loading="eager"
                decoding="async"
            />
        </Link>
    );
}

function isNavActive(itemHref: string, currentUrl: string): boolean {
    const path = currentUrl.split('?')[0].split('#')[0];
    if (itemHref === '/' || itemHref === R.home) {
        return path === '/' || path === '';
    }
    return path === itemHref || path.startsWith(`${itemHref}/`);
}

function Navbar({ user }: { user: User | null }) {
    const { t } = useI18n();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [mobileLayananOpen, setMobileLayananOpen] = useState(false);
    const servicesRef = useRef<HTMLDivElement>(null);
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const url = usePage().url;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => setOpen(false), [url]);
    useEffect(() => {
        setServicesOpen(false);
        setMobileLayananOpen(false);
    }, [url]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
                setServicesOpen(false);
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setServicesOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onEsc);
            if (closeTimeout.current) clearTimeout(closeTimeout.current);
        };
    }, []);

    const handleServicesEnter = () => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        setServicesOpen(true);
    };
    const handleServicesLeave = () => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        closeTimeout.current = setTimeout(() => setServicesOpen(false), 120);
    };

    const isServicesActive = url.startsWith('/services');

    return (
        <header
            className={cn(
                'animate-nav-in fixed inset-x-0 top-0 z-50 transition-all duration-300',
                scrolled
                    ? 'border-b border-line/70 bg-white/85 shadow-[0_4px_20px_-8px_rgb(15_23_42/0.08)] backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a0d14]/85 dark:shadow-[0_4px_24px_-8px_rgb(0_0_0/0.6)]'
                    : 'border-b border-transparent bg-white dark:bg-[#0a0d14]',
            )}
        >
            <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 lg:px-8">
                <Logo />

                <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
                    {/* Beranda */}
                    <Link
                        href={R.home}
                        aria-current={isNavActive(R.home, url) ? 'page' : undefined}
                        className={cn(
                            "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:content-['']",
                            isNavActive(R.home, url)
                                ? 'font-semibold text-brand-600 after:bg-brand-600 dark:text-brand-400 dark:after:bg-brand-400'
                                : 'text-slate-600 after:bg-transparent hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                        )}
                    >
                        {t('nav.home')}
                    </Link>

                    {/* LAYANAN DROPDOWN — hover open, click fallback */}
                    <div ref={servicesRef} className="relative" onMouseEnter={handleServicesEnter} onMouseLeave={handleServicesLeave}>
                        <button
                            type="button"
                            onClick={() => setServicesOpen((v) => !v)}
                            onMouseEnter={handleServicesEnter}
                            aria-expanded={servicesOpen}
                            aria-haspopup="true"
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:content-[''] relative",
                                isServicesActive || servicesOpen
                                    ? 'font-semibold text-brand-600 after:bg-brand-600 dark:text-brand-400 dark:after:bg-brand-400'
                                    : 'text-slate-600 after:bg-transparent hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                            )}
                        >
                            {t('nav.services')}
                            <ChevronDown
                                className={cn('size-4 shrink-0 transition-transform duration-200', servicesOpen && 'rotate-180')}
                                aria-hidden
                            />
                        </button>

                        {/* Dropdown panel - simple 4 item */}
                        <div
                            className={cn(
                                'absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-card py-1.5 shadow-lg transition-all duration-200 dark:border-white/10 dark:bg-[#101625]',
                                servicesOpen ? 'visible translate-y-0 opacity-100 pointer-events-auto' : 'invisible -translate-y-1 opacity-0 pointer-events-none',
                            )}
                        >
                            <Link href={R.servicesIndex} onClick={() => setServicesOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hover hover:text-ink dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
                                <LayoutGrid className="size-4 shrink-0 text-ink-4" aria-hidden />
                                {t('nav.allServices')}
                            </Link>
                            <Link href={R.servicesReguler} onClick={() => setServicesOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hover hover:text-ink dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
                                <Layers className="size-4 shrink-0 text-ink-4" aria-hidden />
                                {t('nav.regularServices')}
                            </Link>
                            <Link href={R.pricing} onClick={() => setServicesOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hover hover:text-ink dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
                                <BadgeDollarSign className="size-4 shrink-0 text-ink-4" aria-hidden />
                                {t('nav.proServices')}
                            </Link>
                            <Link href={R.estimator} onClick={() => setServicesOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hover hover:text-ink dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
                                <Calculator className="size-4 shrink-0 text-ink-4" aria-hidden />
                                {t('nav.customServices')}
                            </Link>
                        </div>
                    </div>

                    {/* Portofolio, Blog, Pantau, Cara Pesan, FAQ, Kontak */}
                    {[
                        { label: t('nav.portfolio'), href: R.portfolioIndex },
                        { label: t('nav.blog'), href: R.blogIndex },
                        { label: t('nav.trackOrder'), href: R.trackOrder },
                        { label: t('nav.howToOrder'), href: R.caraPesan },
                        { label: t('nav.faq'), href: R.faq },
                        { label: t('nav.contact'), href: R.contact },
                    ].map((item) => {
                        const active = isNavActive(item.href, url);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:content-['']",
                                    active
                                        ? 'font-semibold text-brand-600 after:bg-brand-600 dark:text-brand-400 dark:after:bg-brand-400'
                                        : 'text-slate-600 after:bg-transparent hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    {user ? (
                        <>
                            <ButtonLink href={user.role === 'admin' ? R.adminDashboard : R.clientDashboard} variant="secondary" size="sm">
                                {t('nav.dashboard')}
                            </ButtonLink>
                            <AvatarChip user={user} />
                        </>
                    ) : (
                        <Link
                            href={R.login}
                            className="px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                        >
                            {t('nav.login')}
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-1.5 lg:hidden shrink-0">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-white/15 dark:bg-white dark:text-slate-900"
                        aria-label="Buka menu"
                        aria-expanded={open}
                    >
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            <svg
                className={cn(
                    'pointer-events-none absolute inset-x-0 top-full h-3 w-full transition-opacity duration-300 sm:h-4',
                    scrolled ? 'opacity-0' : 'opacity-100',
                )}
                viewBox="0 0 1440 26"
                preserveAspectRatio="none"
                aria-hidden
            >
                <path
                    className="fill-white dark:fill-[#0a0d14]"
                    d="M0 0 H1440 V7 C1320 13 1180 16 1010 14.5 C840 13 780 7 640 6.5 C500 6 430 12 300 14 C190 15.5 70 11 0 6 Z"
                />
            </svg>

            {open && (
                <div className="animate-menu-in overflow-hidden border-b border-line bg-base/95 shadow-[0_24px_48px_-16px_rgb(15_23_42/0.15)] backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a0d14]/95 dark:shadow-[0_24px_48px_-16px_rgb(0_0_0/0.7)] lg:hidden">
                    <nav className="space-y-1 px-5 py-4">
                        <Link
                            href={R.home}
                            aria-current={isNavActive(R.home, url) ? 'page' : undefined}
                            className={cn(
                                'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isNavActive(R.home, url)
                                    ? 'bg-brand-500/10 font-semibold text-brand-700 ring-1 ring-brand-500/25 ring-inset dark:bg-brand-500/15 dark:text-brand-300'
                                    : 'text-ink-2 hover:bg-hover hover:text-ink dark:text-slate-300',
                            )}
                        >
                            {t('nav.home')}
                        </Link>

                        {/* Mobile Layanan accordion */}
                        <div className="rounded-lg border border-transparent transition-colors has-[button[aria-expanded=true]]:border-line has-[button[aria-expanded=true]]:bg-alt/40 dark:has-[button[aria-expanded=true]]:border-white/10 dark:has-[button[aria-expanded=true]]:bg-white/[0.03]">
                            <button
                                type="button"
                                onClick={() => setMobileLayananOpen((v) => !v)}
                                aria-expanded={mobileLayananOpen}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                                    isServicesActive || mobileLayananOpen
                                        ? 'font-semibold text-brand-700 dark:text-brand-300'
                                        : 'text-ink-2 hover:text-ink dark:text-slate-300',
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {t('nav.services')}
                                    {isServicesActive && <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />}
                                </span>
                                <ChevronDown
                                    className={cn('size-4 transition-transform duration-200', mobileLayananOpen && 'rotate-180')}
                                    aria-hidden
                                />
                            </button>

                            {mobileLayananOpen && (
                                <div className="animate-menu-in space-y-1 px-2 pt-1 pb-2">
                                    <Link href={R.servicesIndex} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-hover hover:text-ink dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white">
                                        {t('nav.allServices')}
                                    </Link>
                                    <Link href={R.servicesReguler} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-hover hover:text-ink dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white">
                                        {t('nav.regularServices')}
                                    </Link>
                                    <Link href={R.pricing} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-hover hover:text-ink dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white">
                                        {t('nav.proServices')}
                                    </Link>
                                    <Link href={R.estimator} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-hover hover:text-ink dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white">
                                        {t('nav.customServices')}
                                    </Link>
                                </div>
                            )}
                        </div>

                        {[
                            { label: t('nav.portfolio'), href: R.portfolioIndex },
                            { label: t('nav.blog'), href: R.blogIndex },
                            { label: t('nav.trackOrder'), href: R.trackOrder },
                            { label: t('nav.howToOrder'), href: R.caraPesan },
                            { label: t('nav.faq'), href: R.faq },
                            { label: t('nav.contact'), href: R.contact },
                        ].map((item) => {
                            const active = isNavActive(item.href, url);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                        active
                                            ? 'bg-brand-500/10 font-semibold text-brand-700 ring-1 ring-brand-500/25 ring-inset dark:bg-brand-500/15 dark:text-brand-300'
                                            : 'text-ink-2 hover:bg-hover hover:text-ink dark:text-slate-300',
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="mt-3 flex gap-3 border-t border-hairline pt-4 dark:border-white/[0.06]">
                            {user ? (
                                <ButtonLink href={user.role === 'admin' ? R.adminDashboard : R.clientDashboard} className="flex-1" size="sm">
                                    {t('nav.goToDashboard')}
                                </ButtonLink>
                            ) : (
                                <>
                                    <ButtonLink href={R.login} variant="secondary" className="flex-1" size="sm">
                                        {t('nav.login')}
                                    </ButtonLink>
                                    <ButtonLink href={R.contact} className="flex-1" size="sm">
                                        {t('nav.contact')}
                                    </ButtonLink>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

function AvatarChip({ user }: { user: User }) {
    return (
        <span title={user.name} className="inline-flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 ring-2 ring-base dark:bg-brand-500/20 dark:text-brand-300 dark:ring-white/10">
            {initials(user.name)}
        </span>
    );
}

function AnnouncementBand() {
    const { t } = useI18n();
    const { settings } = usePage<{ settings: Record<string, string> }>().props as unknown as { settings: Record<string, string> };
    const text = settings?.announcement_text ?? t('announcement.text');
    const textMobile = settings?.announcement_text_mobile ?? t('announcement.textMobile');
    const ctaLabel = settings?.announcement_cta_label ?? t('announcement.cta');
    const ctaHref = settings?.announcement_cta_href ?? R.contact;
    return (
        <div className="relative z-10 bg-amber-400">
            <div className="animate-bar-in relative z-10 mx-auto flex h-11 max-w-7xl items-center justify-center gap-2 px-4 sm:h-12 sm:gap-2.5">
                <Zap className="size-3.5 shrink-0 fill-slate-950 text-slate-950" aria-hidden />
                <p className="min-w-0 text-xs font-bold tracking-tight text-slate-950">
                    <span className="sm:hidden">{textMobile}</span>
                    <span className="hidden sm:inline">{text}</span>
                </p>
                <Link
                    href={ctaHref}
                    className="group inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-slate-950 px-3 text-[11px] font-bold tracking-wide text-white uppercase transition-all duration-200 hover:-translate-y-px hover:bg-slate-900 active:translate-y-0 sm:h-8 sm:px-4"
                >
                    {ctaLabel}
                    <ArrowUpRight className="size-3 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px" aria-hidden />
                </Link>
            </div>
            <div
                className="pointer-events-none absolute inset-x-0 top-full h-12 bg-gradient-to-b from-[#0a4fe0] to-transparent sm:h-16"
                aria-hidden
            />
            <svg
                className="pointer-events-none absolute inset-x-0 top-full h-4 w-full sm:h-5 lg:h-6"
                viewBox="0 0 1440 40"
                preserveAspectRatio="none"
                aria-hidden
            >
                <path
                    className="animate-wave-shimmer"
                    d="M0 0 H1440 V20 C1330 32 1190 38 1030 36 C870 34 806 24 664 22 C514 20 434 32 302 36 C192 39 72 33 0 24 Z"
                    fill="#fbbf24"
                />
                <path
                    d="M0 0 H1440 V12 C1330 24 1196 30 1036 28 C876 26 812 16 668 14 C518 12 438 24 304 28 C194 31 72 25 0 16 Z"
                    fill="#fbbf24"
                />
            </svg>
        </div>
    );
}

function Footer() {
    const { t } = useI18n();
    const { settings } = usePage<{ settings: Record<string, string> }>().props as unknown as { settings: Record<string, string> };
    const footerDesc = settings?.footer_description ?? t('footer.description');
    const footerTech = settings?.footer_tech_label ?? 'Laravel · React · TypeScript · MySQL';
    const contactEmail = settings?.contact_email ?? 'hello@raycode.dev';
    const contactPhone = settings?.contact_phone ?? '+62 812 3456 7890';
    const address = settings?.address ?? 'Jakarta — Remote-first';
    return (
        <footer className="relative overflow-hidden border-t border-slate-200/70 bg-slate-50 text-slate-600 dark:border-white/[0.06] dark:bg-[#0a0d14] dark:text-slate-400">
            {/* Watermark besar — pakai logo asli /ray.png, konsisten dengan Logo header: light = original, dark = invert */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden" aria-hidden>
                <img
                    src="/ray.png?v=3"
                    alt=""
                    width={1600}
                    height={480}
                    loading="eager"
                    decoding="async"
                    className="mx-auto w-[148%] max-w-[1700px] translate-y-[22%] opacity-[0.11] sm:w-[132%] sm:translate-y-[18%] sm:opacity-[0.12] lg:w-[112%] lg:max-w-[1440px] lg:translate-y-[22%] dark:invert dark:opacity-[0.09] dark:sm:opacity-[0.10] dark:lg:opacity-[0.11]"
                />
            </div>
            <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" aria-hidden />
            <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div>
                        <Logo light={false} />
                        <p className="mt-5 max-w-xs text-sm leading-relaxed">{footerDesc}</p>
                        <p className="mt-6 flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-500">
                            <TerminalSquare className="size-4 text-brand-500 dark:text-brand-400" />
                            {footerTech}
                        </p>
                    </div>

                    <FooterCol
                        title={t('footer.services')}
                        links={[
                            { label: t('footer.webDev'), href: R.servicesShow('website-development') },
                            { label: t('footer.webAppDev'), href: R.servicesShow('web-app-development') },
                            { label: t('footer.debugging'), href: R.servicesShow('debugging-fixing') },
                            { label: t('footer.codeReview'), href: R.servicesShow('code-review') },
                        ]}
                    />
                    <FooterCol
                        title={t('footer.company')}
                        links={[
                            { label: t('nav.home'), href: R.home },
                            { label: t('nav.portfolio'), href: R.portfolioIndex },
                            { label: t('nav.blog'), href: R.blogIndex },
                            { label: t('nav.howToOrder'), href: R.caraPesan },
                            { label: t('nav.faq'), href: R.faq },
                            { label: t('nav.contact'), href: R.contact },
                        ]}
                    />
                    <div>
                        <h3 className="font-mono text-xs font-semibold tracking-widest text-slate-500 uppercase">{t('footer.contact')}</h3>
                        <ul className="mt-4 space-y-3 text-sm">
                            <li>{contactEmail}</li>
                            <li>{contactPhone}</li>
                            <li>{address}</li>
                        </ul>
                        <ButtonLink href={R.contact} size="sm" className="mt-5">
                            {t('nav.requestQuote')}
                        </ButtonLink>
                    </div>
                </div>

                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-8 text-xs sm:flex-row dark:border-white/[0.06]">
                    <p>© {new Date().getFullYear()} Raycode Studio. {t('footer.rights')}</p>
                    <p className="font-mono text-slate-500 dark:text-slate-600">$ git commit -m "ship it 🚢"</p>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div>
            <h3 className="font-mono text-xs font-semibold tracking-widest text-slate-500 uppercase">{title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link href={link.href} className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FloatingWhatsApp() {
    const { t } = useI18n();
    const { settings } = usePage<{ settings: Record<string, string> }>().props as unknown as { settings: Record<string, string> };
    const rawWhatsapp = settings?.whatsapp ?? '+6281234567890';
    const waNumber = rawWhatsapp.replace(/[^0-9]/g, '');
    const waHref = `https://wa.me/${waNumber}?text=Halo%20Raycode%20%F0%9F%91%8B%2C%20saya%20tertarik%20diskusi%20proyek`;
    return (
        <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-2">
            {/* Label KAMI SIAP 24 JAM */}
            <div className="relative inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-1.5 text-[11px] font-extrabold tracking-widest text-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] ring-1 ring-white/10 dark:bg-white dark:text-slate-900 dark:ring-black/10">
                <span className="relative flex size-2">
                    <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-400 opacity-75" aria-hidden />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" aria-hidden />
                </span>
                {t('footer.ready24h')}
                {/* panah kecil */}
                <span className="absolute -bottom-1 right-6 size-2 rotate-45 bg-slate-900 ring-1 ring-white/10 dark:bg-white dark:ring-black/10" aria-hidden />
            </div>

            <a
                href={waHref}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={t('footer.chatWA')}
                className="group flex items-center gap-3"
            >
                <span className="hidden items-center rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink shadow-lg shadow-black/10 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:inline-flex translate-x-2 opacity-0 dark:border-white/10 dark:bg-[#1a2233] dark:text-white dark:shadow-black/30">
                    {t('footer.chatWA')}
                </span>
                <span className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgb(37_211_102/0.6),0_4px_12px_rgb(0_0_0/0.15)] transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_40px_-8px_rgb(37_211_102/0.7),0_8px_20px_rgb(0_0_0/0.2)] active:scale-95 sm:size-[60px]">
                    <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" aria-hidden />
                    <svg viewBox="0 0 24 24" className="relative size-7 sm:size-8 fill-white" aria-hidden>
                        <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9 1 1-2.9-.2-.3a8.2 8.2 0 1 1 6.6 3.6Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0a0d14]">
                        <span className="size-1.5 animate-pulse rounded-full bg-white" />
                    </span>
                </span>
            </a>
        </div>
    );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-base text-ink transition-colors duration-200">
            <Navbar user={auth?.user ?? null} />
            <div className="pt-17">
                <AnnouncementBand />
            </div>
            <main>{children}</main>
            <Footer />
            <FloatingWhatsApp />
            <CookieConsent />
            <Toast />
        </div>
    );
}
