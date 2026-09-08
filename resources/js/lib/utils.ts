export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function formatIDR(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatIDRShort(value: number): string {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}jt`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}rb`;
    return String(value);
}

export function formatDate(value?: string | Date | null, opts?: Intl.DateTimeFormatOptions): string {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('en-GB', opts ?? { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(value?: string | Date | null): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const units: [number, string][] = [
        [31536000, 'y'],
        [2592000, 'mo'],
        [604800, 'w'],
        [86400, 'd'],
        [3600, 'h'],
        [60, 'm'],
    ];
    for (const [secs, label] of units) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count}${label} ago`;
    }
    return 'just now';
}

export function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
