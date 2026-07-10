import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Café Azzura';
const SITE_URL = 'https://cafeazzura.com';
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
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description || 'Cafe Azzura - Tempat dimana setiap tegukan bercerita. Nikmati kopi artisan, suasana nyaman, dan pelayanan terbaik.';
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
      <meta property="og:site_name" content={SITE_NAME} />
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
          headline: title || SITE_NAME,
          description: desc,
          url,
          image,
          ...(type === 'article' && published_time ? {
            datePublished: published_time,
            author: { '@type': 'Person', name: author || SITE_NAME },
            publisher: { '@type': 'Organization', name: SITE_NAME },
          } : {}),
        })}
      </script>
    </Helmet>
  );
}
