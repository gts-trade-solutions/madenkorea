import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Edit3,
  Save,
  Upload,
  FileText,
  Image as ImageIcon,
  Palette,
  Globe,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  lastUpdated: string;
  status: "published" | "draft";
}

interface SiteSettings {
  siteName: string;
  tagline: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export const ContentManager = () => {
  const [activeTab, setActiveTab] = useState("pages");

  const [staticPages, setStaticPages] = useState<StaticPage[]>([
    {
      id: "about",
      title: "About Us",
      slug: "about-us",
      content:
        "Learn about our mission to bring authentic Korean beauty products to you.",
      metaDescription:
        "Discover our story and commitment to authentic Consumer Innovations products.",
      lastUpdated: "2024-01-15",
      status: "published",
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      slug: "shipping-returns",
      content: "Information about our shipping policies and return procedures.",
      metaDescription: "Learn about shipping, returns, and exchange policies.",
      lastUpdated: "2024-01-10",
      status: "published",
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      slug: "privacy-policy",
      content:
        "Our commitment to protecting your privacy and personal information.",
      metaDescription: "Read our privacy policy and data protection practices.",
      lastUpdated: "2024-01-05",
      status: "draft",
    },
  ]);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "Consumer Innovations Store",
    tagline: "Authentic Korean Beauty Products",
    logo: "/api/placeholder/400/400",
    favicon: "/favicon.ico",
    primaryColor: "#ef4444",
    secondaryColor: "#ec4899",
    footerText: "© 2024 Consumer Innovations Store. All rights reserved.",
    socialLinks: {
      instagram: "https://instagram.com/kbeautystore",
      facebook: "https://facebook.com/kbeautystore",
      youtube: "https://youtube.com/@kbeautystore",
    },
    seoSettings: {
      metaTitle:
        "Consumer Innovations Store | Authentic Korean Beauty Products",
      metaDescription:
        "Discover the best Korean beauty products. Shop authentic Consumer Innovations skincare, makeup, and more from top Korean brands.",
      keywords:
        "korean beauty, Consumer Innovations, skincare, korean skincare, korean makeup, korean cosmetics",
    },
  });

  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);

  const handleSavePage = (page: StaticPage) => {
    if (editingPage) {
      const updated = staticPages.map((p) => (p.id === page.id ? page : p));
      setStaticPages(updated);
      setEditingPage(null);
      toast.success("Page updated successfully!");
    }
  };

  const handleSiteSettings = () => {
    toast.success("Site settings saved successfully!");
  };

  const addNewPage = () => {
    const newPage: StaticPage = {
      id: `page-${Date.now()}`,
      title: "New Page",
      slug: "new-page",
      content: "",
      metaDescription: "",
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "draft",
    };
    setStaticPages([...staticPages, newPage]);
    setEditingPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "pages" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("pages")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Static Pages
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("settings")}
        >
          <Globe className="h-4 w-4 mr-2" />
          Site Settings
        </Button>
        <Button
          variant={activeTab === "seo" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("seo")}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          SEO Settings
        </Button>
        <Button
          variant={activeTab === "footer" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("footer")}
        >
          <Globe className="h-4 w-4 mr-2" />
          Footer Management
        </Button>
      </div>

      {/* Static Pages Management */}
      {activeTab === "pages" && (
        <div className="space-y-6">
          {editingPage ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Edit Page: {editingPage.title}</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => handleSavePage(editingPage)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingPage(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-title">Page Title</Label>
                    <Input
                      id="page-title"
                      value={editingPage.title}
                      onChange={(e) =>
                        setEditingPage({
                          ...editingPage,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="page-slug">Slug</Label>
                    <Input
                      id="page-slug"
                      value={editingPage.slug}
                      onChange={(e) =>
                        setEditingPage({ ...editingPage, slug: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page-meta">Meta Description</Label>
                  <Input
                    id="page-meta"
                    value={editingPage.metaDescription}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        metaDescription: e.target.value,
                      })
                    }
                    placeholder="Brief description for search engines"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page-content">Content</Label>
                  <Textarea
                    id="page-content"
                    value={editingPage.content}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        content: e.target.value,
                      })
                    }
                    rows={10}
                    placeholder="Page content (supports Markdown)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={editingPage.status}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        status: e.target.value as "published" | "draft",
                      })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Static Pages</CardTitle>
                <Button onClick={addNewPage}>
                  <Upload className="h-4 w-4 mr-2" />
                  Add New Page
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staticPages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{page.title}</h3>
                          <Badge
                            variant={
                              page.status === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {page.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          /{page.slug}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {page.lastUpdated}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPage(page)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Site Settings */}
      {activeTab === "settings" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Site Settings</CardTitle>
            <Button onClick={handleSiteSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={siteSettings.siteName}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        siteName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={siteSettings.tagline}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        tagline: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={siteSettings.logo}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, logo: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    value={siteSettings.favicon}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        favicon: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={siteSettings.primaryColor}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      value={siteSettings.primaryColor}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={siteSettings.secondaryColor}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          secondaryColor: e.target.value,
                        })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      value={siteSettings.secondaryColor}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          secondaryColor: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={siteSettings.socialLinks.instagram || ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socialLinks: {
                          ...siteSettings.socialLinks,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={siteSettings.socialLinks.facebook || ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socialLinks: {
                          ...siteSettings.socialLinks,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={siteSettings.socialLinks.youtube || ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socialLinks: {
                          ...siteSettings.socialLinks,
                          youtube: e.target.value,
                        },
                      })
                    }
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={siteSettings.socialLinks.twitter || ""}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socialLinks: {
                          ...siteSettings.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Footer</h3>
              <div className="space-y-2">
                <Label htmlFor="footer-text">Footer Text</Label>
                <Textarea
                  id="footer-text"
                  value={siteSettings.footerText}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      footerText: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Settings */}
      {activeTab === "seo" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>SEO Settings</CardTitle>
            <Button onClick={handleSiteSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save SEO Settings
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input
                id="meta-title"
                value={siteSettings.seoSettings.metaTitle}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    seoSettings: {
                      ...siteSettings.seoSettings,
                      metaTitle: e.target.value,
                    },
                  })
                }
                placeholder="Your site's meta title"
              />
              <p className="text-xs text-muted-foreground">
                Recommended length: 50-60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={siteSettings.seoSettings.metaDescription}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    seoSettings: {
                      ...siteSettings.seoSettings,
                      metaDescription: e.target.value,
                    },
                  })
                }
                placeholder="Brief description of your site"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Recommended length: 150-160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Textarea
                id="keywords"
                value={siteSettings.seoSettings.keywords}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    seoSettings: {
                      ...siteSettings.seoSettings,
                      keywords: e.target.value,
                    },
                  })
                }
                placeholder="keyword1, keyword2, keyword3"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Separate keywords with commas
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Management */}
      {activeTab === "footer" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Footer Management</CardTitle>
            <Button onClick={handleSiteSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Footer Settings
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Newsletter Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Newsletter Section</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newsletter-title">Newsletter Title</Label>
                  <Input
                    id="newsletter-title"
                    defaultValue="Stay Updated with Consumer Innovations Trends"
                    placeholder="Newsletter section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletter-description">
                    Newsletter Description
                  </Label>
                  <Textarea
                    id="newsletter-description"
                    defaultValue="Get exclusive offers, new product launches, and skincare tips directly in your inbox"
                    placeholder="Newsletter section description"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    defaultValue="Consumer Innovations"
                    placeholder="Company display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-description">
                    Company Description
                  </Label>
                  <Textarea
                    id="company-description"
                    defaultValue="Your premier destination for authentic Korean beauty products. We bring you the finest Consumer Innovations innovations directly from Korea."
                    placeholder="Brief company description"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-address">Address</Label>
                  <Textarea
                    id="contact-address"
                    defaultValue="123 Consumer Innovations Street&#10;Mumbai, Maharashtra 400001&#10;India"
                    placeholder="Company address (use line breaks for formatting)"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    defaultValue="+91 98765 43210"
                    placeholder="Contact phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    defaultValue="hello@madeinkorea.in"
                    placeholder="Contact email address"
                  />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quick-link-about">About Us URL</Label>
                  <Input
                    id="quick-link-about"
                    defaultValue="#"
                    placeholder="/about-us"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-link-guide">
                    Consumer Innovations Guide URL
                  </Label>
                  <Input
                    id="quick-link-guide"
                    defaultValue="#"
                    placeholder="/Consumer Innovations-guide"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-link-analysis">Skin Analysis URL</Label>
                  <Input
                    id="quick-link-analysis"
                    defaultValue="#"
                    placeholder="/skin-analysis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-link-brands">Brand Stories URL</Label>
                  <Input
                    id="quick-link-brands"
                    defaultValue="#"
                    placeholder="/brand-stories"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-link-reviews">Reviews URL</Label>
                  <Input
                    id="quick-link-reviews"
                    defaultValue="#"
                    placeholder="/reviews"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-link-blog">Blog URL</Label>
                  <Input
                    id="quick-link-blog"
                    defaultValue="#"
                    placeholder="/blog"
                  />
                </div>
              </div>
            </div>

            {/* Category Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Category Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-skincare">Skincare URL</Label>
                  <Input
                    id="category-skincare"
                    defaultValue="#"
                    placeholder="/products?category=skincare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-masks">Sheet Masks URL</Label>
                  <Input
                    id="category-masks"
                    defaultValue="#"
                    placeholder="/products?category=sheet-masks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-serums">Serums URL</Label>
                  <Input
                    id="category-serums"
                    defaultValue="#"
                    placeholder="/products?category=serums"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-cleansers">Cleansers URL</Label>
                  <Input
                    id="category-cleansers"
                    defaultValue="#"
                    placeholder="/products?category=cleansers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-sunscreens">Sunscreens URL</Label>
                  <Input
                    id="category-sunscreens"
                    defaultValue="#"
                    placeholder="/products?category=sunscreens"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-makeup">K-Makeup URL</Label>
                  <Input
                    id="category-makeup"
                    defaultValue="#"
                    placeholder="/products?category=k-makeup"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-facebook">Facebook URL</Label>
                  <Input
                    id="footer-facebook"
                    defaultValue="#"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-instagram">Instagram URL</Label>
                  <Input
                    id="footer-instagram"
                    defaultValue="#"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-twitter">Twitter URL</Label>
                  <Input
                    id="footer-twitter"
                    defaultValue="#"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-youtube">YouTube URL</Label>
                  <Input
                    id="footer-youtube"
                    defaultValue="#"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Copyright & Legal</h3>
              <div className="space-y-2">
                <Label htmlFor="copyright-text">Copyright Text</Label>
                <Input
                  id="copyright-text"
                  defaultValue="for Consumer Innovations lovers © 2024 Made in Korea. All rights reserved."
                  placeholder="Copyright text (the heart will be added automatically)"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
