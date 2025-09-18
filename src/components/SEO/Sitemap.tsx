import React, { useEffect, useState } from 'react';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

// Generate sitemap data for SEO
export const generateSitemapData = (): SitemapUrl[] => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kbeautystore.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages: SitemapUrl[] = [
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${baseUrl}/auth`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      loc: `${baseUrl}/cart`,
      lastmod: currentDate,
      changefreq: 'always',
      priority: '0.8'
    },
    {
      loc: `${baseUrl}/checkout`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      loc: `${baseUrl}/search`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    }
  ];

  // Add product pages
  const productIds = ['1', '2', '3', '4', '5', '6'];
  const productPages: SitemapUrl[] = productIds.map(id => ({
    loc: `${baseUrl}/product/${id}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.9'
  }));

  // Add category pages
  const categories = ['moisturizer', 'serum', 'cleanser', 'treatment'];
  const categoryPages: SitemapUrl[] = categories.map(category => ({
    loc: `${baseUrl}/category/${category}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.8'
  }));

  // Add brand pages
  const brands = ['cosrx', 'innisfree', 'laneige', 'etude-house', 'beauty-of-joseon', 'some-by-mi'];
  const brandPages: SitemapUrl[] = brands.map(brand => ({
    loc: `${baseUrl}/brand/${brand}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.8'
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
};

// Generate XML sitemap content
export const generateSitemapXML = (): string => {
  const urls = generateSitemapData();
  
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urlsXML = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `${xmlHeader}\n${urlsetOpen}${urlsXML}\n${urlsetClose}`;
};

// Component for development sitemap preview
export const SitemapPreview: React.FC = () => {
  const [sitemapData, setSitemapData] = useState<SitemapUrl[]>([]);

  useEffect(() => {
    setSitemapData(generateSitemapData());
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background">
      <h2 className="text-2xl font-bold mb-4">Sitemap Preview (Development Only)</h2>
      <div className="grid gap-2">
        {sitemapData.map((url, index) => (
          <div key={index} className="p-3 border border-border rounded-lg">
            <div className="font-mono text-sm text-primary">{url.loc}</div>
            <div className="text-xs text-muted-foreground">
              Priority: {url.priority} | Frequency: {url.changefreq} | Last Modified: {url.lastmod}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">XML Sitemap</h3>
        <pre className="text-xs overflow-x-auto">
          {generateSitemapXML()}
        </pre>
      </div>
    </div>
  );
};