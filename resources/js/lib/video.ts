export type VideoKind = 'youtube' | 'vimeo' | 'mp4' | 'unknown';

export function getVideoKind(url: string | null | undefined): VideoKind {
    if (!url) return 'unknown';
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be') || u.includes('youtube-nocookie')) return 'youtube';
    if (u.includes('vimeo.com')) return 'vimeo';
    if (u.match(/\.(mp4|webm|ogg)(\?|$)/)) return 'mp4';
    // direct video hosting like cloudinary, cdn usually .mp4
    return 'unknown';
}

export function getYoutubeId(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0] || null;
        if (u.searchParams.get('v')) return u.searchParams.get('v');
        // youtube.com/embed/ID
        const parts = u.pathname.split('/');
        const embedIdx = parts.indexOf('embed');
        if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];
        // youtube.com/shorts/ID
        const shortsIdx = parts.indexOf('shorts');
        if (shortsIdx !== -1 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
        return null;
    } catch {
        return null;
    }
}

export function getYoutubeEmbedUrl(url: string, opts?: { autoplay?: boolean; mute?: boolean; loop?: boolean; controls?: boolean }): string | null {
    const id = getYoutubeId(url);
    if (!id) return null;
    const params = new URLSearchParams();
    if (opts?.autoplay) params.set('autoplay', '1');
    if (opts?.mute) params.set('mute', '1');
    if (opts?.loop) { params.set('loop', '1'); params.set('playlist', id); }
    params.set('controls', opts?.controls ? '1' : '0');
    params.set('playsinline', '1');
    params.set('rel', '0');
    params.set('modestbranding', '1');
    params.set('enablejsapi', '0');
    // no cookie if needed could switch domain
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function getVimeoId(url: string): string | null {
    try {
        const u = new URL(url);
        const match = u.pathname.match(/\/(\d+)(?:\/|$)/);
        return match ? match[1] : null;
    } catch { return null; }
}

export function getVimeoEmbedUrl(url: string, opts?: { autoplay?: boolean; mute?: boolean; loop?: boolean; controls?: boolean }): string | null {
    const id = getVimeoId(url);
    if (!id) return null;
    const params = new URLSearchParams();
    if (opts?.autoplay) params.set('autoplay', '1');
    if (opts?.mute) params.set('muted', '1');
    if (opts?.loop) params.set('loop', '1');
    params.set('controls', opts?.controls ? '1' : '0');
    params.set('background', opts?.controls ? '0' : '0');
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}
