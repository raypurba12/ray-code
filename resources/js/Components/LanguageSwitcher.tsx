import { useI18n, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const LANGS: Record<Locale, { label: string; short: string; flag: string }> = {
  id: { label: 'Indonesia', short: 'ID', flag: '🇮🇩' },
  en: { label: 'English', short: 'EN', flag: '🇬🇧' },
};

function Flag({ locale, size = 'sm' }: { locale: Locale; size?: 'sm' | 'md' }) {
  // Use emoji flags with fallback styling - matches raycode theme
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[4px] bg-white shadow-sm ring-1 ring-black/10 dark:ring-white/10 overflow-hidden leading-none',
        size === 'sm' ? 'size-5 text-[13px]' : 'size-6 text-[15px]',
      )}
      aria-hidden
    >
      {LANGS[locale].flag}
    </span>
  );
}

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'mobile' }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  if (variant === 'mobile') {
    return (
      <div ref={ref} className="relative w-full">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <span className="flex items-center gap-2.5">
            <Flag locale={locale} />
            {LANGS[locale].label}
          </span>
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-slate-800">
            {(Object.keys(LANGS) as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  locale === l ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5',
                )}
              >
                <Flag locale={l} />
                <span className="flex-1">{LANGS[l].label}</span>
                <span className="text-xs opacity-60">{LANGS[l].short}</span>
                {locale === l && <Check className="size-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:gap-2 sm:px-2.5"
      >
        <Flag locale={locale} size="sm" />
        <span className="hidden sm:inline">{LANGS[locale].short}</span>
        <ChevronDown className={cn('hidden size-3.5 shrink-0 text-slate-400 transition-transform sm:block', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-slate-800">
          <div className="px-2 py-1.5">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">Bahasa / Language</p>
          </div>
          {(Object.keys(LANGS) as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                locale === l ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5',
              )}
            >
              <Flag locale={l} size="md" />
              <span className="flex-1">{LANGS[l].label}</span>
              {locale === l && <Check className="size-4" />}
            </button>
          ))}
          <div className="mt-1 border-t border-slate-100 pt-1 dark:border-white/10">
            <p className="px-3 py-1 text-[11px] text-slate-400">Semua konten akan diterjemahkan</p>
          </div>
        </div>
      )}
    </div>
  );
}
