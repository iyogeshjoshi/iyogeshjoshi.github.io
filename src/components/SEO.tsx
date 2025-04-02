import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "Yogesh Joshi - Lead Software Engineer",
  description = "Lead Software Engineer with ~11 years of expertise in JavaScript and Full-stack development. Skilled in designing, developing, and optimizing scalable software solutions.",
  image = "https://deviloper.dev/images/android-chrome-512x512.png",
  url = "https://deviloper.dev"
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#FF0000" />
      <meta name="keywords" content="Software Engineer, Full Stack Developer, JavaScript, TypeScript, React, Node.js, Lead Developer" />
      <meta name="author" content="Yogesh Joshi" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />

      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="icon" href="/images/favicon.ico" />
      <meta name="msapplication-TileColor" content="#FF0000" />
    </Helmet>
  );
};

export default SEO; 