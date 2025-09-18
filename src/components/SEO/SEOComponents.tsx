import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  locale?: string;
}

export const SEOMeta: React.FC<SEOMetaProps> = ({
  title = "Consumer Innovations Store | Authentic Korean Beauty Products",
  description = "Discover the best Korean beauty products. Shop authentic Consumer Innovations skincare, makeup, and more from top Korean brands.",
  keywords = "korean beauty, Consumer Innovations, skincare, korean skincare, korean makeup, korean cosmetics",
  image = "/api/placeholder/1200/630",
  url = typeof window !== "undefined" ? window.location.href : "",
  type = "website",
  siteName = "Consumer Innovations Store",
  author = "Consumer Innovations Store",
  publishedTime,
  modifiedTime,
  section,
  locale = "en_US",
}) => {
  const currentUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const imageUrl = image?.startsWith("http")
    ? image
    : `${typeof window !== "undefined" ? window.location.origin : ""}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover"
      />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta
        name="theme-color"
        content="#ef4444"
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="theme-color"
        content="#dc2626"
        media="(prefers-color-scheme: dark)"
      />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {section && <meta property="article:section" content={section} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@kbeautystore" />
      <meta name="twitter:creator" content="@kbeautystore" />

      {/* Apple Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />

      {/* Microsoft Meta Tags */}
      <meta name="msapplication-TileColor" content="#ef4444" />
      <meta name="application-name" content={siteName} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />

      {/* JSON-LD for website */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description: description,
          url: currentUrl,
          image: imageUrl,
          publisher: {
            "@type": "Organization",
            name: siteName,
            url: typeof window !== "undefined" ? window.location.origin : "",
          },
        })}
      </script>
    </Helmet>
  );
};

// Enhanced Schema.org structured data for products
export const ProductSchema: React.FC<{
  product: {
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    brand: string;
    images: string[];
    rating: number;
    reviews: number;
    stockStatus: string;
    category: string;
    slug: string;
    ingredients?: string;
    benefits?: string[];
    sku?: string;
    gtin?: string;
  };
}> = ({ product }) => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const productUrl = `${baseUrl}/product/${product.slug}`;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: product.category,
    image: product.images.map((img) =>
      img.startsWith("http") ? img : `${baseUrl}${img}`
    ),
    sku: product.sku || `${product.brand}-${product.slug}`,
    ...(product.gtin && { gtin: product.gtin }),
    offers: {
      "@type": "Offer",
      price: (product.discountPrice || product.price).toString(),
      priceCurrency: "INR",
      availability:
        product.stockStatus === "In Stock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: "Consumer Innovations Store",
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      ...(product.discountPrice && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: product.discountPrice.toString(),
          priceCurrency: "INR",
        },
      }),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating.toString(),
      reviewCount: product.reviews.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    ...(product.benefits && {
      additionalProperty: product.benefits.map((benefit) => ({
        "@type": "PropertyValue",
        name: "Benefit",
        value: benefit,
      })),
    }),
    manufacturer: {
      "@type": "Organization",
      name: product.brand,
    },
    url: productUrl,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// Enhanced Schema.org structured data for organization
export const OrganizationSchema: React.FC = () => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    name: "Consumer Innovations Store",
    alternateName: "K Beauty Store",
    description:
      "Authentic Korean beauty products directly from Korea. Premium Consumer Innovations skincare, makeup, and cosmetics from top Korean brands.",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/api/placeholder/400/400`,
      width: 400,
      height: 400,
    },
    image: `${baseUrl}/api/placeholder/1200/630`,
    sameAs: [
      "https://instagram.com/kbeautystore",
      "https://facebook.com/kbeautystore",
      "https://youtube.com/@kbeautystore",
      "https://twitter.com/kbeautystore",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "support@kbeautystore.com",
        availableLanguage: ["English", "Korean"],
        areaServed: "IN",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "sales@kbeautystore.com",
        availableLanguage: ["English", "Korean"],
        areaServed: "IN",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressRegion: "Delhi",
      addressLocality: "New Delhi",
    },
    founder: {
      "@type": "Person",
      name: "Consumer Innovations Store Team",
    },
    foundingDate: "2023",
    knowsAbout: [
      "Korean Beauty",
      "Consumer Innovations Products",
      "Korean Skincare",
      "Korean Cosmetics",
      "Asian Beauty",
    ],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Korean Beauty Products",
        description: "Authentic Korean beauty and skincare products",
      },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// Enhanced Schema.org structured data for website
export const WebsiteSchema: React.FC = () => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Consumer Innovations Store",
    alternateName: "K Beauty Store - Korean Beauty Products",
    url: baseUrl,
    description:
      "Authentic Korean beauty products directly from Korea. Shop premium Consumer Innovations skincare, makeup, and cosmetics from top Korean brands.",
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Consumer Innovations Store",
      url: baseUrl,
    },
    copyrightYear: "2023",
    genre: ["E-commerce", "Beauty", "Korean Beauty", "Consumer Innovations"],
    keywords:
      "korean beauty, Consumer Innovations, korean skincare, korean makeup, korean cosmetics, authentic korean products",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// Breadcrumb Schema
export const BreadcrumbSchema: React.FC<{
  items: Array<{ name: string; url: string; position: number }>;
}> = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// FAQ Schema
export const FAQSchema: React.FC<{
  faqs: Array<{ question: string; answer: string }>;
}> = ({ faqs }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
