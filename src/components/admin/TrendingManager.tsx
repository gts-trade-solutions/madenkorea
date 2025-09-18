import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, Award, Sparkles, Star, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  product_id: string;
  name: string;
  brand: string;
  category: string;
  cost_price: number;
  selling_price?: number;
  stock_quantity: number;
  is_active: boolean;
}

interface ProductMedia {
  product_id: string;
  media_url: string;
  is_primary: boolean;
}

interface EditorialProduct extends Product {
  image: string;
  is_trending?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  is_featured?: boolean;
}

export const TrendingManager = () => {
  const [products, setProducts] = useState<EditorialProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EditorialProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [editorialFilter, setEditorialFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, brandFilter, editorialFilter]);

  const fetchProducts = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (productsError) throw productsError;

      // Fetch product media
      const { data: mediaData, error: mediaError } = await supabase
        .from('product_media')
        .select('*')
        .eq('media_type', 'image')
        .order('position');

      if (mediaError) throw mediaError;

      // Fetch editorial data
      const { data: editorialData, error: editorialError } = await supabase
        .from('product_editorial')
        .select('*');

      if (editorialError) throw editorialError;

      // Create media lookup
      const mediaByProduct = (mediaData || []).reduce((acc, media) => {
        if (!acc[media.product_id]) {
          acc[media.product_id] = [];
        }
        acc[media.product_id].push(media);
        return acc;
      }, {} as Record<string, ProductMedia[]>);

      // Create editorial lookup
      const editorialByProduct = (editorialData || []).reduce((acc, editorial) => {
        acc[editorial.product_id] = editorial;
        return acc;
      }, {} as Record<string, any>);

      // Combine data
      const enrichedProducts: EditorialProduct[] = (productsData || []).map(product => {
        const productMedia = mediaByProduct[product.product_id] || [];
        const primaryImage = productMedia.find(m => m.is_primary) || productMedia[0];
        const editorial = editorialByProduct[product.product_id];

        return {
          ...product,
          image: primaryImage?.media_url || '',
          is_trending: editorial?.is_trending || false,
          is_bestseller: editorial?.is_bestseller || false,
          is_new_arrival: editorial?.is_new_arrival || false,
          is_featured: editorial?.is_featured || false,
        };
      });

      setProducts(enrichedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter(product => product.brand === brandFilter);
    }

    // Editorial filter
    if (editorialFilter !== "all") {
      switch (editorialFilter) {
        case "trending":
          filtered = filtered.filter(product => product.is_trending);
          break;
        case "bestseller":
          filtered = filtered.filter(product => product.is_bestseller);
          break;
        case "new_arrival":
          filtered = filtered.filter(product => product.is_new_arrival);
          break;
        case "featured":
          filtered = filtered.filter(product => product.is_featured);
          break;
        case "none":
          filtered = filtered.filter(product => 
            !product.is_trending && !product.is_bestseller && 
            !product.is_new_arrival && !product.is_featured
          );
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const updateEditorialStatus = async (productId: string, field: string, value: boolean) => {
    try {
      const currentProduct = products.find(p => p.product_id === productId);
      if (!currentProduct) return;

      // Check if editorial entry exists
      const { data: existingEditorial } = await supabase
        .from('product_editorial')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (existingEditorial) {
        // Update existing
        const { error } = await supabase
          .from('product_editorial')
          .update({ [field]: value })
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        // Create new
        const newEditorial = {
          product_id: productId,
          is_trending: field === 'is_trending' ? value : false,
          is_bestseller: field === 'is_bestseller' ? value : false,
          is_new_arrival: field === 'is_new_arrival' ? value : false,
          is_featured: field === 'is_featured' ? value : false,
        };

        const { error } = await supabase
          .from('product_editorial')
          .insert([newEditorial]);

        if (error) throw error;
      }

      // Update local state
      setProducts(prev => prev.map(product => 
        product.product_id === productId 
          ? { ...product, [field]: value }
          : product
      ));

      toast({
        title: "Success",
        description: `Product ${value ? 'marked as' : 'removed from'} ${field.replace('is_', '').replace('_', ' ')}`,
      });

    } catch (error) {
      console.error('Error updating editorial status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const getUniqueValues = (field: keyof Product) => {
    return [...new Set(products.map(product => product[field] as string))].sort();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  const trendingCount = products.filter(p => p.is_trending).length;
  const bestSellerCount = products.filter(p => p.is_bestseller).length;
  const newArrivalCount = products.filter(p => p.is_new_arrival).length;
  const featuredCount = products.filter(p => p.is_featured).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Editorial Product Management</h1>
          <p className="text-muted-foreground">Manage trending, bestsellers, new arrivals, and featured products</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-pink-500" />
              <div>
                <div className="text-lg font-bold">{trendingCount}</div>
                <div className="text-xs text-muted-foreground">Trending</div>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-lg font-bold">{bestSellerCount}</div>
                <div className="text-xs text-muted-foreground">Bestsellers</div>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-lg font-bold">{newArrivalCount}</div>
                <div className="text-xs text-muted-foreground">New Arrivals</div>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-lg font-bold">{featuredCount}</div>
                <div className="text-xs text-muted-foreground">Featured</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getUniqueValues('category').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {getUniqueValues('brand').map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Editorial Status</Label>
              <Select value={editorialFilter} onValueChange={setEditorialFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="trending">Trending Only</SelectItem>
                  <SelectItem value="bestseller">Bestsellers Only</SelectItem>
                  <SelectItem value="new_arrival">New Arrivals Only</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                  <SelectItem value="none">No Editorial Tags</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.product_id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="text-sm font-medium">Image coming soon</div>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{product.brand}</span>
                    <span>₹{product.selling_price || product.cost_price}</span>
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs">{product.category}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`trending-${product.product_id}`} className="text-xs flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-pink-500" />
                      Trending
                    </Label>
                    <Switch
                      id={`trending-${product.product_id}`}
                      checked={product.is_trending}
                      onCheckedChange={(checked) => updateEditorialStatus(product.product_id, 'is_trending', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor={`bestseller-${product.product_id}`} className="text-xs flex items-center">
                      <Award className="h-3 w-3 mr-1 text-yellow-500" />
                      Bestseller
                    </Label>
                    <Switch
                      id={`bestseller-${product.product_id}`}
                      checked={product.is_bestseller}
                      onCheckedChange={(checked) => updateEditorialStatus(product.product_id, 'is_bestseller', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor={`new-arrival-${product.product_id}`} className="text-xs flex items-center">
                      <Sparkles className="h-3 w-3 mr-1 text-green-500" />
                      New Arrival
                    </Label>
                    <Switch
                      id={`new-arrival-${product.product_id}`}
                      checked={product.is_new_arrival}
                      onCheckedChange={(checked) => updateEditorialStatus(product.product_id, 'is_new_arrival', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor={`featured-${product.product_id}`} className="text-xs flex items-center">
                      <Star className="h-3 w-3 mr-1 text-blue-500" />
                      Featured
                    </Label>
                    <Switch
                      id={`featured-${product.product_id}`}
                      checked={product.is_featured}
                      onCheckedChange={(checked) => updateEditorialStatus(product.product_id, 'is_featured', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No products found matching your filters</div>
        </div>
      )}
    </div>
  );
};