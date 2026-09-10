import React from 'react';
import { Helmet } from 'react-helmet-async';
import { usePortfolio } from '../context/PortfolioContext';
import { profileData } from '../data/portfolioData';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string;
}

/**
 * Seo component: Injects page-specific meta tags (Helmet) + JSON-LD structured data.
 * Falls back to site-wide defaults from profileData.
 * The current language from PortfolioContext is used to localize title/description.
 */
export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  image = '/images/irvan_photo_portrait.jpg',
  url,
  type = 'website',
  keywords = '',
}) => {
  const { language, t } = usePortfolio();
  const siteName = 'Muchamad Irvan - Software Engineer Portfolio';
  const defaultDescription =
    language === 'id'
      ? 'Portofolio pribadi Muchamad Irvan, Fullstack Developer & Software Engineer yang menguasai sistem web scalable, aplikasi interaktif, dan arsitektur bersih.'
      : "Personal portfolio of Muchamad Irvan, Fullstack Developer & Software Engineer specializing in scalable web systems, interactive applications, and clean architecture.";

  const finalTitle = title || siteName;
  const finalDescription = description || defaultDescription;
  const finalUrl = url || 'https://vanviolet.my.id';
  const baseUrl = 'https://vanviolet.my.id';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : type === 'profile' ? 'Person' : 'WebSite',
    name: finalTitle,
    description: finalDescription,
    image: image ? `${baseUrl}${image}` : undefined,
    url: finalUrl,
    ...(type === 'profile'
      ? {
          jobTitle: t(profileData.title),
          worksFor: { '@type': 'Organization', name: 'University Academic Technology Center' },
          sameAs: [profileData.github, profileData.instagram],
        }
      : type === 'article'
      ? { datePublished: new Date().toISOString() }
      : {}),
    ...(type === 'website'
      ? { potentialAction: { '@type': 'SearchAction', target: `${baseUrl}?q={search_term_string}`, 'query-input': 'required' } }
      : {}),
  };

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Muchamad Irvan" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Canonical */}
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image ? `${baseUrl}${image}` : `${baseUrl}/images/irvan_photo_portrait.jpg`} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={language === 'id' ? 'id_ID' : 'en_US'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image ? `${baseUrl}${image}` : `${baseUrl}/images/irvan_photo_portrait.jpg`} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};
