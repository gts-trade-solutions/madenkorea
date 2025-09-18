import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Save, Eye, EyeOff, Upload, Download, Image, Video, FileText, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingManager } from "./TrendingManager";
import { DynamicHeroManager } from "./DynamicHeroManager";
import { DynamicImageDemo } from "./DynamicImageDemo";
import { AddMultipleImages } from "./AddMultipleImages";
import { LogoManager } from "./LogoManager";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
  background_color: string;
  text_color: string;
  position: number;
  is_active: boolean;
  banner_type: string;
  animation_speed: number;
}

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
}

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  is_featured: boolean;
  is_active: boolean;
  position: number;
  color_theme: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  color_theme: string;
  image_url?: string;
  is_active: boolean;
  position: number;
  product_count: number;
}

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  video_type: string;
  is_active: boolean;
  position: number;
  duration?: number;
  tags?: string[];
}

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  category: string;
  is_active: boolean;
}

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_url: string;
  file_type: string;
  mime_type: string;
  file_size?: number;
  alt_text?: string;
  description?: string;
  tags?: string[];
  is_active: boolean;
  uploaded_by?: string;
}

export const CMSManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productEditorial, setProductEditorial] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  
  
  const [activeTab, setActiveTab] = useState("banners");
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Handle logo upload for brands
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, brand: Brand) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `brand-logos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to upload logo",
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Update brand with new logo URL
      setEditingBrand({...brand, logo_url: publicUrl});
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('homepage_banners')
      .select('*')
      .order('position');
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch banners", variant: "destructive" });
      return;
    }
    setBanners(data || []);
  };

  const fetchStaticPages = async () => {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .order('title');
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch pages", variant: "destructive" });
      return;
    }
    setStaticPages(data || []);
  };

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('position');
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch brands", variant: "destructive" });
      return;
    }
    setBrands(data || []);
  };

  const fetchCategories = async () => {
    console.log('Fetching categories...'); // Debug log
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('position');
    
    if (error) {
      console.error('Categories fetch error:', error); // Debug log
      toast({ title: "Error", description: "Failed to fetch categories", variant: "destructive" });
      return;
    }
    console.log('Categories fetched:', data?.length || 0); // Debug log
    setCategories(data || []);
  };

  const fetchVideos = async () => {
    console.log('fetchVideos: Starting to fetch videos...');
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('position');
    
    if (error) {
      console.error('fetchVideos: Error fetching videos:', error);
      toast({ title: "Error", description: "Failed to fetch videos", variant: "destructive" });
      return;
    }
    console.log('fetchVideos: Fetched videos:', data?.length || 0, data);
    setVideos(data || []);
    console.log('fetchVideos: Videos state updated');
  };

  const fetchSiteSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch site settings", variant: "destructive" });
      return;
    }
    setSiteSettings(data || []);
  };

  const fetchMediaFiles = async () => {
    console.log('Fetching media files...'); // Debug log
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Media fetch error:', error); // Debug log
      toast({ title: "Error", description: "Failed to fetch media files", variant: "destructive" });
      return;
    }
    console.log('Media files fetched:', data?.length || 0); // Debug log
    setMediaFiles(data || []);
  };

  const fetchProducts = async () => {
    console.log('Fetching products...'); // Debug log
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Products fetch error:', error); // Debug log
      toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" });
      return;
    }
    console.log('Products fetched:', data?.length || 0, data); // Debug log
    setProducts(data || []);
  };

  const fetchProductEditorial = async () => {
    const { data, error } = await supabase
      .from('product_editorial')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch product editorial data", variant: "destructive" });
      return;
    }
    setProductEditorial(data || []);
  };

  useEffect(() => {
    console.log('CMS Component mounted, fetching all data...');
    fetchBanners();
    fetchStaticPages();
    fetchBrands();
    fetchCategories();
    fetchVideos();
    fetchSiteSettings();
    fetchMediaFiles();
    fetchProducts();
    fetchProductEditorial();
  }, []);

  // Debug effect to log products state changes
  useEffect(() => {
    console.log('Products state updated:', products.length, products);
  }, [products]);

  const saveBanner = async (banner: Banner) => {
    console.log('saveBanner function called with:', banner);
    setLoading(true);
    
    try {
      // Prepare banner data for insertion/update
      const bannerData = {
        title: banner.title,
        subtitle: banner.subtitle,
        description: banner.description,
        image_url: banner.image_url,
        cta_text: banner.cta_text,
        cta_link: banner.cta_link,
        background_color: banner.background_color,
        text_color: banner.text_color,
        position: banner.position,
        is_active: banner.is_active,
        banner_type: banner.banner_type,
        animation_speed: banner.animation_speed
      };
      
      console.log('Prepared banner data:', bannerData);
      
      const { data, error } = banner.id && banner.id !== '' 
        ? await supabase.from('homepage_banners').update(bannerData).eq('id', banner.id).select()
        : await supabase.from('homepage_banners').insert([bannerData]).select();

      console.log('Banner save result:', { data, error });

      if (error) {
        console.error('Error saving banner:', error);
        toast({ title: "Error", description: `Failed to save banner: ${error.message}`, variant: "destructive" });
      } else {
        console.log('Banner saved successfully');
        toast({ title: "Success", description: "Banner saved successfully" });
        await fetchBanners();
        setEditingBanner(null);
      }
    } catch (err) {
      console.error('Unexpected error saving banner:', err);
      toast({ title: "Error", description: "Unexpected error occurred", variant: "destructive" });
    }
    setLoading(false);
  };

  const deleteBanner = async (id: string) => {
    const { error } = await supabase.from('homepage_banners').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete banner", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Banner deleted successfully" });
      fetchBanners();
    }
  };

  const savePage = async (page: StaticPage) => {
    setLoading(true);
    const { error } = page.id 
      ? await supabase.from('static_pages').update(page).eq('id', page.id)
      : await supabase.from('static_pages').insert([page]);

    if (error) {
      toast({ title: "Error", description: "Failed to save page", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Page saved successfully" });
      fetchStaticPages();
      setEditingPage(null);
    }
    setLoading(false);
  };

  const deletePage = async (id: string) => {
    const { error } = await supabase.from('static_pages').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete page", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Page deleted successfully" });
      fetchStaticPages();
    }
  };

  const saveBrand = async (brand: Brand) => {
    setLoading(true);
    const { error } = brand.id 
      ? await supabase.from('brands').update(brand).eq('id', brand.id)
      : await supabase.from('brands').insert([brand]);

    if (error) {
      toast({ title: "Error", description: "Failed to save brand", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Brand saved successfully" });
      fetchBrands();
      setEditingBrand(null);
    }
    setLoading(false);
  };

  const deleteBrand = async (id: string) => {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete brand", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Brand deleted successfully" });
      fetchBrands();
    }
  };

  const saveCategory = async (category: Category) => {
    setLoading(true);
    const { error } = category.id 
      ? await supabase.from('categories').update(category).eq('id', category.id)
      : await supabase.from('categories').insert([category]);

    if (error) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Category saved successfully" });
      fetchCategories();
      setEditingCategory(null);
    }
    setLoading(false);
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Category deleted successfully" });
      fetchCategories();
    }
  };

  const saveVideo = async (video: Video) => {
    console.log('saveVideo function called with:', video);
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id);
    
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save videos", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting to save video...');
      
      // Prepare video data for insertion/update
      const videoData = {
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        video_type: video.video_type,
        is_active: video.is_active,
        position: video.position,
        duration: video.duration,
        tags: video.tags
      };
      
      console.log('Prepared video data:', videoData);
      
      let result;
      if (video.id && video.id !== '') {
        console.log('Updating existing video with ID:', video.id);
        result = await supabase.from('videos').update(videoData).eq('id', video.id).select();
        console.log('Update result:', result);
      } else {
        console.log('Inserting new video');
        result = await supabase.from('videos').insert([videoData]).select();
        console.log('Insert result:', result);
      }
      
      const { data, error } = result;

      console.log('Supabase response error:', error);
      
      if (error) {
        console.error('Error saving video:', error);
        toast({ title: "Error", description: `Failed to save video: ${error.message}`, variant: "destructive" });
      } else {
        console.log('Video saved successfully', data);
        toast({ title: "Success", description: "Video saved successfully" });
        console.log('Calling fetchVideos to refresh list...');
        // Small delay to ensure database consistency
        setTimeout(async () => {
          await fetchVideos();
          console.log('fetchVideos completed, closing edit dialog...');
          setEditingVideo(null);
        }, 500);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({ title: "Error", description: "Unexpected error occurred", variant: "destructive" });
    }
    setLoading(false);
  };

  const deleteVideo = async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete video", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Video deleted successfully" });
      fetchVideos();
    }
  };

  const saveSiteSetting = async (setting: SiteSetting) => {
    setLoading(true);
    const { error } = setting.id 
      ? await supabase.from('site_settings').update(setting).eq('id', setting.id)
      : await supabase.from('site_settings').insert([setting]);

    if (error) {
      toast({ title: "Error", description: "Failed to save setting", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Setting saved successfully" });
      fetchSiteSettings();
      setEditingSetting(null);
    }
    setLoading(false);
  };

  const deleteSiteSetting = async (id: string) => {
    const { error } = await supabase.from('site_settings').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete setting", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Setting deleted successfully" });
      fetchSiteSettings();
    }
  };

  const saveProductEditorial = async (editorial: any) => {
    setLoading(true);
    const { error } = editorial.id 
      ? await supabase.from('product_editorial').update(editorial).eq('id', editorial.id)
      : await supabase.from('product_editorial').insert([editorial]);

    if (error) {
      toast({ title: "Error", description: "Failed to save editorial data", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Editorial data saved successfully" });
      fetchProductEditorial();
      
    }
    setLoading(false);
  };

  const deleteProductEditorial = async (id: string) => {
    const { error } = await supabase.from('product_editorial').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete editorial data", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Editorial data deleted successfully" });
      fetchProductEditorial();
    }
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Editorial counts
  const trendingCount = productEditorial.filter(p => p.is_trending).length;
  const bestSellerCount = productEditorial.filter(p => p.is_bestseller).length;
  const newArrivalCount = productEditorial.filter(p => p.is_new_arrival).length;
  const featuredCount = productEditorial.filter(p => p.is_featured).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="hero">Hero Videos</TabsTrigger>
          <TabsTrigger value="trending">Editorial</TabsTrigger>
          <TabsTrigger value="demo">Image Demo</TabsTrigger>
          <TabsTrigger value="images">Multi Images</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Homepage Banners</h2>
            <Button onClick={() => {
              console.log("Add Banner clicked");
              setEditingBanner({
                id: '',
                title: '',
                subtitle: '',
                description: '',
                image_url: '',
                cta_text: '',
                cta_link: '',
                background_color: '#ffffff',
                text_color: '#000000',
                position: banners.length + 1,
                is_active: true,
                banner_type: 'promotional',
                animation_speed: 30
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>

          {/* Banner List */}
          <div className="grid gap-4">
            {banners.map((banner) => (
              <Card key={banner.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{banner.title}</CardTitle>
                    <Badge variant={banner.is_active ? "default" : "secondary"}>
                      {banner.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{banner.banner_type}</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingBanner(banner)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteBanner(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Position: {banner.position} | Speed: {banner.animation_speed}s
                  </div>
                  <div className="mt-2 p-2 rounded border" style={{ 
                    backgroundColor: banner.background_color, 
                    color: banner.text_color 
                  }}>
                    Preview: {banner.title}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Banner Edit Form */}
          {editingBanner && (
            <Card>
              <CardHeader>
                <CardTitle>{editingBanner.id ? 'Edit Banner' : 'Add New Banner'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editingBanner.title}
                      onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={editingBanner.subtitle || ''}
                      onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingBanner.description || ''}
                    onChange={(e) => setEditingBanner({...editingBanner, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta_text">CTA Text</Label>
                    <Input
                      id="cta_text"
                      value={editingBanner.cta_text || ''}
                      onChange={(e) => setEditingBanner({...editingBanner, cta_text: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta_link">CTA Link</Label>
                    <Input
                      id="cta_link"
                      value={editingBanner.cta_link || ''}
                      onChange={(e) => setEditingBanner({...editingBanner, cta_link: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="banner_type">Type</Label>
                    <Select value={editingBanner.banner_type} onValueChange={(value) => setEditingBanner({...editingBanner, banner_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      type="number"
                      value={editingBanner.position}
                      onChange={(e) => setEditingBanner({...editingBanner, position: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="animation_speed">Animation Speed (s)</Label>
                    <Input
                      id="animation_speed"
                      type="number"
                      value={editingBanner.animation_speed}
                      onChange={(e) => setEditingBanner({...editingBanner, animation_speed: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingBanner.is_active}
                    onCheckedChange={(checked) => setEditingBanner({...editingBanner, is_active: checked})}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => saveBanner(editingBanner)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Banner
                  </Button>
                  <Button variant="outline" onClick={() => setEditingBanner(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Static Pages</h2>
            <Button onClick={() => setEditingPage({
              id: '',
              slug: '',
              title: '',
              content: '',
              meta_title: '',
              meta_description: '',
              is_published: false
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </div>

          {/* Pages List */}
          <div className="grid gap-4">
            {staticPages.map((page) => (
              <Card key={page.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <Badge variant={page.is_published ? "default" : "secondary"}>
                      {page.is_published ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                      {page.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingPage(page)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deletePage(page.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Slug: /{page.slug}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Page Edit Form */}
          {editingPage && (
            <Card>
              <CardHeader>
                <CardTitle>{editingPage.id ? 'Edit Page' : 'Add New Page'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="page_title">Title</Label>
                    <Input
                      id="page_title"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({...editingPage, slug: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Content (HTML)</Label>
                  <Textarea
                    id="content"
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({...editingPage, content: e.target.value})}
                    rows={10}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={editingPage.meta_title || ''}
                      onChange={(e) => setEditingPage({...editingPage, meta_title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Input
                      id="meta_description"
                      value={editingPage.meta_description || ''}
                      onChange={(e) => setEditingPage({...editingPage, meta_description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingPage.is_published}
                    onCheckedChange={(checked) => setEditingPage({...editingPage, is_published: checked})}
                  />
                  <Label>Published</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => savePage(editingPage)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Page
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPage(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Brands Management</h2>
            <Button onClick={() => setEditingBrand({
              id: '',
              name: '',
              logo_url: '',
              description: '',
              website_url: '',
              is_featured: false,
              is_active: true,
              position: brands.length + 1,
              color_theme: '#000000'
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </div>

          {/* Brands List */}
          <div className="grid gap-4">
            {brands.map((brand) => (
              <Card key={brand.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brand.color_theme }}
                    >
                      {brand.logo_url ? (
                        <img src={brand.logo_url} alt={brand.name} className="w-6 h-6 object-contain" />
                      ) : (
                        brand.name.slice(0, 2)
                      )}
                    </div>
                    <CardTitle className="text-lg">{brand.name}</CardTitle>
                    <Badge variant={brand.is_active ? "default" : "secondary"}>
                      {brand.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {brand.is_featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingBrand(brand)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteBrand(brand.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Position: {brand.position} | {brand.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Brand Edit Form */}
          {editingBrand && (
            <Card>
              <CardHeader>
                <CardTitle>{editingBrand.id ? 'Edit Brand' : 'Add New Brand'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand_name">Brand Name</Label>
                    <Input
                      id="brand_name"
                      value={editingBrand.name}
                      onChange={(e) => setEditingBrand({...editingBrand, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo_url">Logo</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id="logo_url"
                          value={editingBrand.logo_url || ''}
                          onChange={(e) => setEditingBrand({...editingBrand, logo_url: e.target.value})}
                          placeholder="https://example.com/logo.png or upload below"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, editingBrand)}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          disabled={uploading}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                      {editingBrand.logo_url && (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={editingBrand.logo_url} 
                            alt="Brand logo preview" 
                            className="w-12 h-12 object-contain border rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="text-sm text-muted-foreground">Logo preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="brand_description">Description</Label>
                  <Textarea
                    id="brand_description"
                    value={editingBrand.description || ''}
                    onChange={(e) => setEditingBrand({...editingBrand, description: e.target.value})}
                    placeholder="Short description about the brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      value={editingBrand.website_url || ''}
                      onChange={(e) => setEditingBrand({...editingBrand, website_url: e.target.value})}
                      placeholder="https://brand.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color_theme">Brand Color</Label>
                    <Input
                      id="color_theme"
                      type="color"
                      value={editingBrand.color_theme}
                      onChange={(e) => setEditingBrand({...editingBrand, color_theme: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      type="number"
                      value={editingBrand.position}
                      onChange={(e) => setEditingBrand({...editingBrand, position: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingBrand.is_featured}
                        onCheckedChange={(checked) => setEditingBrand({...editingBrand, is_featured: checked})}
                      />
                      <Label>Featured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingBrand.is_active}
                        onCheckedChange={(checked) => setEditingBrand({...editingBrand, is_active: checked})}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => saveBrand(editingBrand)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Brand
                  </Button>
                  <Button variant="outline" onClick={() => setEditingBrand(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Categories Management</h2>
            <Button onClick={() => setEditingCategory({
              id: '',
              name: '',
              slug: '',
              description: '',
              icon_name: '',
              color_theme: '#000000',
              image_url: '',
              is_active: true,
              position: categories.length + 1,
              product_count: 0
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="grid gap-4">
            {categories.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Categories Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first category to organize your products
                </p>
                <Button onClick={() => setEditingCategory({
                  id: '',
                  name: '',
                  slug: '',
                  description: '',
                  icon_name: '',
                  color_theme: '#000000',
                  image_url: '',
                  is_active: true,
                  position: 1,
                  product_count: 0
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              </Card>
            ) : (
              categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: category.color_theme }}
                    >
                      {category.name.slice(0, 2)}
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{category.product_count} products</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Slug: /{category.slug} | Position: {category.position}
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>

          {editingCategory && (
            <Card>
              <CardHeader>
                <CardTitle>{editingCategory.id ? 'Edit Category' : 'Add New Category'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category_name">Category Name</Label>
                    <Input
                      id="category_name"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category_slug">Slug</Label>
                    <Input
                      id="category_slug"
                      value={editingCategory.slug}
                      onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category_description">Description</Label>
                  <Textarea
                    id="category_description"
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="icon_name">Icon Name</Label>
                    <Input
                      id="icon_name"
                      value={editingCategory.icon_name || ''}
                      onChange={(e) => setEditingCategory({...editingCategory, icon_name: e.target.value})}
                      placeholder="Droplets, Heart, Star..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="category_color">Color Theme</Label>
                    <Input
                      id="category_color"
                      type="color"
                      value={editingCategory.color_theme}
                      onChange={(e) => setEditingCategory({...editingCategory, color_theme: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category_position">Position</Label>
                    <Input
                      id="category_position"
                      type="number"
                      value={editingCategory.position}
                      onChange={(e) => setEditingCategory({...editingCategory, position: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingCategory.is_active}
                    onCheckedChange={(checked) => setEditingCategory({...editingCategory, is_active: checked})}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => saveCategory(editingCategory)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Category
                  </Button>
                  <Button variant="outline" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Video Content Management</h2>
            <Button onClick={() => setEditingVideo({
              id: '', // This will be treated as a new video
              title: '',
              description: '',
              video_url: '',
              thumbnail_url: '',
              video_type: 'hero',
              is_active: true,
              position: videos.length + 1,
              duration: 0,
              tags: []
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>

          <div className="grid gap-4">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <Badge variant={video.is_active ? "default" : "secondary"}>
                      {video.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{video.video_type}</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingVideo(video)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteVideo(video.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Position: {video.position} | Duration: {video.duration}s
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {editingVideo && (
            <Card>
              <CardHeader>
                <CardTitle>{editingVideo.id ? 'Edit Video' : 'Add New Video'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_title">Title</Label>
                    <Input
                      id="video_title"
                      value={editingVideo.title}
                      onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="video_type">Video Type</Label>
                    <Select value={editingVideo.video_type} onValueChange={(value) => setEditingVideo({...editingVideo, video_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="testimonial">Testimonial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="video_description">Description</Label>
                  <Textarea
                    id="video_description"
                    value={editingVideo.description || ''}
                    onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_url">Video URL</Label>
                    <Input
                      id="video_url"
                      value={editingVideo.video_url}
                      onChange={(e) => setEditingVideo({...editingVideo, video_url: e.target.value})}
                      placeholder="https://youtube.com/embed/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                    <Input
                      id="thumbnail_url"
                      value={editingVideo.thumbnail_url || ''}
                      onChange={(e) => setEditingVideo({...editingVideo, thumbnail_url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_position">Position</Label>
                    <Input
                      id="video_position"
                      type="number"
                      value={editingVideo.position}
                      onChange={(e) => setEditingVideo({...editingVideo, position: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="video_duration">Duration (seconds)</Label>
                    <Input
                      id="video_duration"
                      type="number"
                      value={editingVideo.duration || 0}
                      onChange={(e) => setEditingVideo({...editingVideo, duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingVideo.is_active}
                    onCheckedChange={(checked) => setEditingVideo({...editingVideo, is_active: checked})}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => {
                    console.log('Save button clicked, editingVideo:', editingVideo);
                    saveVideo(editingVideo);
                  }} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Video
                  </Button>
                  <Button variant="outline" onClick={() => setEditingVideo(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Site Settings</h2>
            <Button onClick={() => setEditingSetting({
              id: '',
              setting_key: '',
              setting_value: '',
              setting_type: 'text',
              description: '',
              category: 'general',
              is_active: true
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </Button>
          </div>

          <div className="space-y-6">
            {['general', 'seo', 'header', 'footer', 'home'].map((categoryType) => (
              <Card key={categoryType}>
                <CardHeader>
                  <CardTitle className="capitalize">{categoryType} Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {siteSettings
                      .filter(setting => setting.category === categoryType)
                      .map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{setting.setting_key}</h4>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {setting.setting_value}
                          </p>
                          {setting.description && (
                            <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{setting.setting_type}</Badge>
                          <Button variant="outline" size="sm" onClick={() => setEditingSetting(setting)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteSiteSetting(setting.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {editingSetting && (
            <Card>
              <CardHeader>
                <CardTitle>{editingSetting.id ? 'Edit Setting' : 'Add New Setting'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="setting_key">Setting Key</Label>
                    <Input
                      id="setting_key"
                      value={editingSetting.setting_key}
                      onChange={(e) => setEditingSetting({...editingSetting, setting_key: e.target.value})}
                      placeholder="site_title, contact_email..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="setting_type">Type</Label>
                    <Select value={editingSetting.setting_type} onValueChange={(value) => setEditingSetting({...editingSetting, setting_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="image">Image URL</SelectItem>
                        <SelectItem value="video">Video URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="setting_value">Value</Label>
                  <Textarea
                    id="setting_value"
                    value={editingSetting.setting_value}
                    onChange={(e) => setEditingSetting({...editingSetting, setting_value: e.target.value})}
                    rows={editingSetting.setting_type === 'json' ? 6 : 3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="setting_category">Category</Label>
                    <Select value={editingSetting.category} onValueChange={(value) => setEditingSetting({...editingSetting, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="seo">SEO</SelectItem>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                        <SelectItem value="home">Home Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="setting_description">Description</Label>
                    <Input
                      id="setting_description"
                      value={editingSetting.description || ''}
                      onChange={(e) => setEditingSetting({...editingSetting, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingSetting.is_active}
                    onCheckedChange={(checked) => setEditingSetting({...editingSetting, is_active: checked})}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => saveSiteSetting(editingSetting)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Setting
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSetting(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logos" className="space-y-6">
          <LogoManager />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          {/* Add Multiple Images Component */}
          <AddMultipleImages />
          
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Media Library</h2>
            <Button onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.multiple = true;
              fileInput.accept = 'image/*,video/*,.jfif';
              fileInput.onchange = async (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  for (const file of Array.from(files)) {
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                      const { data, error } = await supabase.storage
                        .from('product-images')
                        .upload(fileName, file);
                      
                      if (error) throw error;
                      
                      const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(fileName);
                      
                      // Add to media library table with better error handling
                      const { error: dbError } = await supabase.from('media_library').insert({
                        filename: fileName,
                        original_name: file.name,
                        file_url: publicUrl,
                        file_type: file.type.startsWith('image/') ? 'image' : 'video',
                              mime_type: file.type,
                              file_size: file.size
                        // uploaded_by field removed since it's causing UUID issues
                      });
                      
                      if (dbError) {
                        console.error('Database error:', dbError);
                        toast({ 
                          title: "Warning", 
                          description: `File uploaded but metadata save failed: ${dbError.message}`,
                          variant: "destructive"
                        });
                      } else {
                        console.log('Media library entry created successfully');
                      }
                      
                      toast({ title: "Success", description: `${file.name} uploaded successfully` });
                      fetchMediaFiles(); // Refresh the list
                    } catch (error) {
                      console.error('Upload error:', error);
                      toast({ title: "Error", description: `Failed to upload ${file.name}`, variant: "destructive" });
                    }
                  }
                }
              };
              fileInput.click();
            }}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaFiles.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Media Files</h3>
                <p className="text-muted-foreground mb-4">Upload images and videos to get started</p>
                <Button onClick={() => {
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (fileInput) fileInput.click();
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First File
                </Button>
              </div>
            ) : (
              mediaFiles.map((file) => (
              <Card 
                key={file.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => window.open(file.file_url, '_blank')}
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {file.file_type === 'image' ? (
                    <img 
                      src={file.file_url} 
                      alt={file.alt_text || file.original_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : file.file_type === 'video' ? (
                    <video 
                      src={file.file_url}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div className="hidden w-full h-full items-center justify-center">
                    {file.file_type === 'image' ? (
                      <Image className="h-8 w-8 text-muted-foreground" />
                    ) : file.file_type === 'video' ? (
                      <Video className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardContent className="p-2">
                  <div className="text-xs font-medium truncate" title={file.original_name}>
                    {file.original_name}
                  </div>
                  <div className="text-xs text-muted-foreground">{file.file_type}</div>
                </CardContent>
              </Card>
              ))
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload New Media</CardTitle>
              <CardDescription>Upload images, videos, and documents to your media library</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Drag and drop files here, or click to select</p>
                <Button 
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Choose Files button clicked'); // Debug log
                    
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.multiple = true;
                    fileInput.accept = 'image/*,video/*,.jpg,.jpeg,.png,.gif,.jfif,.mp4,.mov,.avi';
                    fileInput.style.display = 'none';
                    
                    // Add to DOM temporarily
                    document.body.appendChild(fileInput);
                    
                    fileInput.onchange = async (e) => {
                      console.log('File input changed'); // Debug log
                      const files = (e.target as HTMLInputElement).files;
                      console.log('Selected files:', files); // Debug log
                      
                      if (files && files.length > 0) {
                        setUploading(true);
                        toast({ title: "Info", description: `Selected ${files.length} file(s). Uploading...` });
                        
                        for (const file of Array.from(files)) {
                          try {
                            console.log('Uploading file:', file.name); // Debug log
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                            
                            const { data, error } = await supabase.storage
                              .from('product-images')
                              .upload(fileName, file);
                            
                            if (error) {
                              console.error('Upload error:', error);
                              throw error;
                            }
                            
                            console.log('Upload successful:', data); // Debug log
                            
                            const { data: { publicUrl } } = supabase.storage
                              .from('product-images')
                              .getPublicUrl(fileName);
                            
                            // Add to media library table
                            const { error: dbError } = await supabase.from('media_library').insert({
                              filename: fileName,
                              original_name: file.name,
                              file_url: publicUrl,
                              file_type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'other',
                              mime_type: file.type,
                              file_size: file.size
                            });
                            
                            if (dbError) {
                              console.error('Database error:', dbError);
                              throw dbError;
                            }
                            
                            toast({ title: "Success", description: `${file.name} uploaded successfully` });
                          } catch (error) {
                            console.error('Upload error:', error);
                            toast({ title: "Error", description: `Failed to upload ${file.name}`, variant: "destructive" });
                          }
                        }
                        
                        // Refresh the media library
                        try {
                          await fetchMediaFiles();
                        } catch (error) {
                          console.error('Error refreshing media:', error);
                        }
                        
                        setUploading(false);
                      }
                      
                      // Clean up
                      document.body.removeChild(fileInput);
                    };
                    
                    // Trigger click
                    fileInput.click();
                    console.log('File input click triggered'); // Debug log
                  }}
                >
                  {uploading ? "Uploading..." : "Choose Files"}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Alt Text</Label>
                  <Input placeholder="Describe the image..." />
                </div>
                <div>
                  <Label>Tags</Label>
                  <Input placeholder="skincare, beauty, product..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <DynamicHeroManager />
        </TabsContent>

        <TabsContent value="trending">
          <TrendingManager />
        </TabsContent>

        <TabsContent value="demo">
          <DynamicImageDemo />
        </TabsContent>

        <TabsContent value="images">
          <AddMultipleImages />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Product Media Mapping</h2>
              <p className="text-sm text-muted-foreground">
                Products loaded: {products.length} | Debug: Check console for details
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => {
                console.log('Refreshing products...');
                fetchProducts();
              }}>
                <Eye className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button onClick={() => window.open('/supplier', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button variant="outline" onClick={() => {
                // Switch to media tab
                const mediaTab = document.querySelector('[data-value="media"]') as HTMLElement;
                if (mediaTab) mediaTab.click();
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Media
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Database Overview</CardTitle>
                <CardDescription>Real-time product statistics from your database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium mb-2">Total Products</h3>
                    <p className="text-2xl font-bold text-primary">{products.length}</p>
                    <p className="text-sm text-muted-foreground">In database</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium mb-2">Active Products</h3>
                    <p className="text-2xl font-bold text-green-600">{products.filter(p => p.is_active).length}</p>
                    <p className="text-sm text-muted-foreground">Live on site</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium mb-2">Media Files</h3>
                    <p className="text-2xl font-bold text-blue-600">{mediaFiles.length}</p>
                    <p className="text-sm text-muted-foreground">Images & videos</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium mb-2">Featured</h3>
                    <p className="text-2xl font-bold text-yellow-600">{products.filter(p => p.is_featured).length}</p>
                    <p className="text-sm text-muted-foreground">Homepage items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>All products in your database - click to manage media</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't uploaded any products yet. Use the Supplier Portal to add products.
                      </p>
                      <Button onClick={() => window.open('/supplier', '_blank')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} of {products.length} products
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="flex items-center px-3 py-1 text-sm bg-muted rounded">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        {currentProducts.map((product) => (
                          <Card 
                            key={product.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-medium">{product.name}</h3>
                                    <Badge variant={product.is_active ? "default" : "secondary"}>
                                      {product.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                    {product.is_featured && (
                                      <Badge variant="outline">Featured</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Brand: {product.brand} | Category: {product.category}</p>
                                    <p>Price: ₹{product.cost_price} | Stock: {product.stock_quantity}</p>
                                    <p>Product ID: {product.product_id}</p>
                                  </div>
                                </div>
                                 <div className="text-right space-y-2">
                                  <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`/product/${product.slug}`, '_blank');
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open('/', '_blank');
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View on Site
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Editorial Features</CardTitle>
                <CardDescription>Manage product tags, features, and editorial content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Trending Products</h3>
                      <Badge variant="secondary">{trendingCount}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Marked as trending</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTab("trending")}
                    >
                      Manage
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Best Sellers</h3>
                      <Badge variant="secondary">{bestSellerCount}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Top performing items</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTab("trending")}
                    >
                      Manage
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">New Arrivals</h3>
                      <Badge variant="secondary">{newArrivalCount}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Recently added</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTab("trending")}
                    >
                      Manage
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Featured Items</h3>
                      <Badge variant="secondary">{featuredCount}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Homepage featured</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTab("trending")}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media Management</CardTitle>
                <CardDescription>Product images and videos mapped by Product ID</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Product Media Mapping</h4>
                        <p className="text-sm text-muted-foreground">
                          All images and videos are mapped using Product ID as primary key
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Product ID Based</Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Switch to media tab
                            const mediaTab = document.querySelector('[value="media"]') as HTMLElement;
                            if (mediaTab) mediaTab.click();
                          }}
                        >
                          <Image className="h-4 w-4 mr-2" />
                          View Media
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Images</h4>
                      <p className="text-2xl font-bold text-blue-600">342</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Total product images</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100">Videos</h4>
                      <p className="text-2xl font-bold text-purple-600">68</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">Product videos</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100">Coverage</h4>
                      <p className="text-2xl font-bold text-green-600">94%</p>
                      <p className="text-xs text-green-700 dark:text-green-300">Products with media</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Operations</CardTitle>
                <CardDescription>Perform bulk operations on products and media</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col" onClick={() => window.location.href = '/supplier#bulk'}>
                    <Upload className="h-6 w-6 mb-2" />
                    CSV Upload
                    <span className="text-xs text-muted-foreground">With videos</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Export Data
                    <span className="text-xs text-muted-foreground">Products + Media</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Edit2 className="h-6 w-6 mb-2" />
                    Bulk Edit
                    <span className="text-xs text-muted-foreground">Mass updates</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Image className="h-6 w-6 mb-2" />
                    Media Sync
                    <span className="text-xs text-muted-foreground">Re-map Product IDs</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CSV/Excel Upload Format</CardTitle>
                <CardDescription>Required format for bulk product upload (supports .csv and .xlsx files)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Required CSV Columns:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>name</strong> - Product name (required)</p>
                    <p><strong>brand</strong> - Brand name (required)</p>
                    <p><strong>category</strong> - Product category (required)</p>
                    <p><strong>cost_price</strong> - Cost price (required)</p>
                    <p><strong>stock_quantity</strong> - Stock count (required)</p>
                    <p><strong>description</strong> - Product description (optional)</p>
                    <p><strong>size</strong> - Product size (optional)</p>
                    <p><strong>product_code</strong> - SKU/Product code (optional)</p>
                    <p><strong>keywords</strong> - SEO keywords (optional)</p>
                    <p><strong>images</strong> - Comma-separated image filenames from media library (optional)</p>
                  </div>
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                    <p><strong>Note:</strong> Product ID is auto-generated. Images should reference filenames from the media library.</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Create and download CSV template with all product fields
                      const csvContent = `product_id,name,slug,brand,category,description,keywords,product_code,size,stock_quantity,cost_price,selling_price,discount_percentage,is_featured,is_active,weight,ingredients,how_to_use,benefits,skin_type,age_group,gender,country_of_origin,manufacturing_date,expiry_date,safety_information,tags,seo_title,seo_description,image_url_1,image_url_2,image_url_3,image_url_4
"COSRX-001","Korean Glow Serum","korean-glow-serum","COSRX","Skin Care","Advanced snail secretion filtrate serum for hydration","korean skincare hydrating serum snail","COSRX-001","50ml",100,25.99,35.99,20,true,true,0.05,"Snail Secretion Filtrate 96%","Apply 2-3 drops on clean face","Hydrates and repairs skin","Dry,Normal","Adult","Unisex","South Korea","2024-01-01","2026-01-01","For external use only","serum,skincare,korean","COSRX Korean Glow Serum","Premium Korean skincare serum for hydration"
"BOJ-002","Hydrating Toner","hydrating-toner","Beauty of Joseon","Skin Care","Rice water and alpha arbutin toner","toner hydrating rice water","BOJ-002","150ml",50,18.50,28.99,25,false,true,0.15,"Rice Water, Alpha Arbutin","Apply with cotton pad","Brightens and hydrates","All","Adult","Unisex","South Korea","2024-02-01","2026-02-01","Avoid contact with eyes","toner,brightening,korean","Beauty of Joseon Hydrating Toner","Rice water toner for bright skin"`;
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = 'bulk-upload-template.csv';
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      toast({
                        title: "CSV Template Downloaded",
                        description: "CSV template downloaded successfully",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Create Excel template with tab-separated values and all fields
                       const excelContent = `product_id\tname\tslug\tbrand\tcategory\tdescription\tkeywords\tproduct_code\tsize\tstock_quantity\tcost_price\tselling_price\tdiscount_percentage\tis_featured\tis_active\tweight\tingredients\thow_to_use\tbenefits\tskin_type\tage_group\tgender\tcountry_of_origin\tmanufacturing_date\texpiry_date\tsafety_information\ttags\tseo_title\tseo_description\timage_url_1\timage_url_2\timage_url_3\timage_url_4
COSRX-001\tKorean Glow Serum\tkorean-glow-serum\tCOSRX\tSkin Care\tAdvanced snail secretion filtrate serum for hydration\tkorean skincare hydrating serum snail\tCOSRX-001\t50ml\t100\t25.99\t35.99\t20\ttrue\ttrue\t0.05\tSnail Secretion Filtrate 96%\tApply 2-3 drops on clean face\tHydrates and repairs skin\tDry,Normal\tAdult\tUnisex\tSouth Korea\t2024-01-01\t2026-01-01\tFor external use only\tserum,skincare,korean\tCOSRX Korean Glow Serum\tPremium Korean skincare serum for hydration\tdownload.webp\tdownload (1).webp\tdownload (2).webp\tdownload (3).webp
BOJ-002\tHydrating Toner\thydrating-toner\tBeauty of Joseon\tSkin Care\tRice water and alpha arbutin toner\ttoner hydrating rice water\tBOJ-002\t150ml\t50\t18.50\t28.99\t25\tfalse\ttrue\t0.15\tRice Water, Alpha Arbutin\tApply with cotton pad\tBrightens and hydrates\tAll\tAdult\tUnisex\tSouth Korea\t2024-02-01\t2026-02-01\tAvoid contact with eyes\ttoner,brightening,korean\tBeauty of Joseon Hydrating Toner\tRice water toner for bright skin\tdownload (4).webp\tdownload (5).webp\tdownload (6).webp\tdownload (7).webp`;
                      
                      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = 'bulk-upload-template.xls';
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      toast({
                        title: "Excel Template Downloaded",
                        description: "Excel-compatible template downloaded successfully",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel Template
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logos" className="space-y-4">
          <LogoManager />
        </TabsContent>

      </Tabs>

    </div>
  );
};
