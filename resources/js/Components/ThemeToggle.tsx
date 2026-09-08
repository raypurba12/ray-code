import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className, tone = 'default' }: { className?: string; tone?: 'default' | 'overlay' }) {
    const [isDark, setIsDark] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
        const checkIsDark = () => {
            const hasDarkClass = document.documentElement.classList.contains('dark');
            setIsDark(hasDarkClass);
        };
        checkIsDark();

        const observer = new MutationObserver(() => {
            checkIsDark();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const nextDark = !document.documentElement.classList.contains('dark');
        if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        setIsDark(nextDark);
    };

    const base =
        tone === 'overlay'
            ? 'flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-sky-100 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:text-white active:scale-95'
            : 'flex size-9 items-center justify-center rounded-full border border-line bg-card text-ink-2 shadow-sm transition-all duration-200 hover:bg-hover hover:text-ink active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white';

    if (!mounted) {
        return (
            <button
                type="button"
                className={cn(base, className)}
                aria-label="Ganti tema"
            >
                <Sun className="size-4 opacity-0" />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={cn(base, className)}
            title={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
        >
            {isDark ? (
                <Sun className={cn('size-4 transition-transform duration-300', tone === 'overlay' ? 'text-amber-300' : 'text-amber-400')} />
            ) : (
                <Moon className="size-4 transition-transform duration-300" />
            )}
        </button>
    );
}
