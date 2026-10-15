import { Head, usePage } from '@inertiajs/react';

export interface BreadcrumbItem {
    name: string;
    item: string;
}

export interface SeoHeadProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    publishedAt?: string;
    author?: string;
    // P0-5 SEO enhancements
    robots?: string; // e.g. 'noindex, nofollow' — defaults to undefined (index)
    jsonLd?: Record<string, any> | Record<string, any>[];
    breadcrumbs?: BreadcrumbItem[];
    noIndex?: boolean; // shorthand for robots noindex
}

export function SeoHead({
    title,
    description = 'Raycode — Studio Pengembangan Web & Digital Service berbasis Laravel 12 + React 19. Melayani pembuatan website, web app, joki koding, & perbaikan bug.',
    keywords = 'raycode, web development, studio digital, laravel, react, jasa pembuatan website, joki koding, website murah, website profesional',
    image = '/images/hero-800.webp',
    url,
    type = 'website',
    publishedAt,
    author = 'Raycode Studio',
    robots,
    jsonLd,
    breadcrumbs,
    noIndex,
}: SeoHeadProps) {
    const { url: currentPath } = usePage();
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://raycode.dev';
    const canonicalUrl = url || `${appUrl}${currentPath.split('?')[0]}`;
    const metaTitle = title.includes('Raycode') ? title : `${title} — Raycode Studio`;
    const imageUrl = image?.startsWith('http') ? image : `${appUrl}${image?.startsWith('/') ? '' : '/'}${image || 'images/hero-800.webp'}`;
    const robotsContent = noIndex ? 'noindex, nofollow' : robots;

    // Base JSON-LD: Organization + WebSite (selalu ada untuk P0-5)
    const baseSchemas: Record<string, any>[] = [
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Raycode Studio',
            url: appUrl,
            logo: `${appUrl}/ray.png`,
            description: 'Studio pengembangan web premium — Laravel, React, TypeScript',
            address: { '@type': 'PostalAddress', addressLocality: 'Jakarta', addressCountry: 'ID' },
            sameAs: ['https://github.com/raycode', 'https://www.linkedin.com/company/raycode'],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Raycode Studio',
            url: appUrl,
            inLanguage: 'id-ID',
        },
    ];

    // Breadcrumbs jika ada
    if (breadcrumbs && breadcrumbs.length) {
        baseSchemas.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((b, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: b.name,
                item: b.item.startsWith('http') ? b.item : `${appUrl}${b.item}`,
            })),
        });
    }

    // Merge custom jsonLd (FAQ, BlogPosting dll)
    const extraSchemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    const allSchemas = [...baseSchemas, ...extraSchemas];

    return (
        <Head title={metaTitle}>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />
            {robotsContent && <meta name="robots" content={robotsContent} />}

            {/* hreflang — ID/EN + x-default (P0-5) */}
            <link rel="alternate" hrefLang="id" href={canonicalUrl} />
            <link rel="alternate" hrefLang="en" href={canonicalUrl} />
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:site_name" content="Raycode Studio" />
            <meta property="og:locale" content="id_ID" />
            <meta property="og:locale:alternate" content="en_US" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            {/* Article Meta if applicable */}
            {type === 'article' && publishedAt && (
                <meta property="article:published_time" content={publishedAt} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}

            {/* JSON-LD — Organization + WebSite + Breadcrumbs + custom */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas.length === 1 ? allSchemas[0] : allSchemas) }} />
        </Head>
    );
}

export default SeoHead;
