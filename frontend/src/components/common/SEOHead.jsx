import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({ title, description, ogTitle, ogDescription, ogImage, canonical }) {
  const siteName = 'CMS Website';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={ogTitle || fullTitle} />
      {(ogDescription || description) && (
        <meta property="og:description" content={ogDescription || description} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      {(ogDescription || description) && (
        <meta name="twitter:description" content={ogDescription || description} />
      )}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
