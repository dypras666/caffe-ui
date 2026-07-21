import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : '';
const DEFAULT_IMAGE = '/og-image.jpg';

export default function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  published_time,
  author,
  articleSection,
  tags,
}) {
  const [cafeName, setCafeName] = useState(() => sessionStorage.getItem('cafe_name') || '');
  useEffect(() => {
    if (cafeName) return;
    fetch('/api/settings/cafe_name').then(r => r.json()).then(d => {
      const n = d?.setting?.setting_value || d?.setting_value || d?.value || '';
      if (n) { sessionStorage.setItem('cafe_name', n); setCafeName(n); }
    }).catch(() => {});
  }, []);
  const displayName = cafeName || 'Cafe';
  const pageTitle = title ? `${title} | ${displayName}` : displayName;
  const desc = description || `${displayName} - Pesan makanan & minuman favorit Anda dengan mudah.`;
  const url = canonical || SITE_URL;

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={cafeName} />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {/* Article specific */}
      {published_time && <meta property="article:published_time" content={published_time} />}
      {author && <meta property="article:author" content={author} />}
      {articleSection && <meta property="article:section" content={articleSection} />}
      {tags?.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: pageTitle,
          headline: title || cafeName,
          description: desc,
          url,
          image,
          ...(type === 'article' && published_time ? {
            datePublished: published_time,
            author: { '@type': 'Person', name: author || cafeName },
            publisher: { '@type': 'Organization', name: cafeName },
          } : {}),
        })}
      </script>
    </Helmet>
  );
}
