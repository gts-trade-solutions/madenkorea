// import { useParams, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";

// import { EnhancedProductMediaSection } from "@/components/enhanced/EnhancedProductMediaSection";
// import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";
// import { EnhancedProductTabs } from "@/components/enhanced/EnhancedProductTabs";
// import { RelatedProductsSection } from "@/components/product/RelatedProductsSection";
// import { FrequentlyBoughtTogether } from "@/components/product/FrequentlyBoughtTogether";
// import { SEOMeta, ProductSchema, BreadcrumbSchema } from "@/components/SEO/SEOComponents";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
// import { ShoppingCart, LogIn, LogOut, User, Package, Settings, ChevronDown, Sparkles, Heart, Sun, Droplets, Zap, Shield, Star, Crown, Award, ChevronRight } from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";
// import { useCart } from "@/hooks/useCart";
// import { DynamicSearch } from "@/components/DynamicSearch";
// import { NotificationBell } from "@/components/notifications/NotificationBell";
// import { supabase } from "@/integrations/supabase/client";
// import { LoadingSpinner } from "@/components/LoadingSpinner";
// export default function ProductPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user, signOut } = useAuth();
//   const { getTotalItems } = useCart();
//   const [logoUrl, setLogoUrl] = useState<string>('');
//   const [activeBanner, setActiveBanner] = useState<any>(null);
//   const [brands, setBrands] = useState<any[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [hierarchicalCategories, setHierarchicalCategories] = useState<any[]>([]);
//   const [selectedVariant, setSelectedVariant] = useState<{size?: string, type?: string, color?: string, volume?: string, pack?: string}>({});

//   const totalItems = getTotalItems();
//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchNavigationData = async () => {
//       const fetchLogo = async () => {
//         const { data } = await supabase
//           .from('site_settings')
//           .select('setting_value')
//           .eq('setting_key', 'main_logo')
//           .single();

//         if (data?.setting_value) {
//           setLogoUrl(data.setting_value);
//         }
//       };

//       const fetchActiveBanner = async () => {
//         const { data } = await supabase
//           .from('homepage_banners')
//           .select('*')
//           .eq('is_active', true)
//           .eq('banner_type', 'promotional')
//           .order('position')
//           .limit(1);

//         if (data && data.length > 0) {
//           setActiveBanner(data[0]);
//         }
//       };

//       const fetchBrands = async () => {
//         const { data } = await supabase
//           .from('brands')
//           .select('*')
//           .eq('is_active', true)
//           .order('position');

//         if (data) {
//           setBrands(data);
//         }
//       };

//       const fetchCategories = async () => {
//         const { data } = await supabase
//           .from('categories')
//           .select('*')
//           .eq('is_active', true)
//           .order('level, position, name');

//         if (data) {
//           setCategories(data);

//           // Create hierarchical structure
//           const hierarchy = data.filter(cat => cat.level === 0).map(parentCat => ({
//             ...parentCat,
//             children: data.filter(cat => cat.parent_id === parentCat.slug && cat.level === 1).map(childCat => ({
//               ...childCat,
//               children: data.filter(cat => cat.parent_id === childCat.slug && cat.level === 2)
//             }))
//           }));

//           setHierarchicalCategories(hierarchy);
//         }
//       };

//       fetchLogo();
//       fetchActiveBanner();
//       fetchBrands();
//       fetchCategories();
//     };

//     fetchNavigationData();

//     const fetchProduct = async () => {
//       if (!id) return;

//       try {
//         console.log('🔍 Fetching product with ID:', id);

//         const { data: productData, error: productError } = await supabase
//           .from('products')
//           .select(`
//             *,
//             product_media (
//               media_url,
//               media_type,
//               is_primary,
//               position
//             )
//           `)
//           .eq('product_id', id)
//           .eq('is_active', true)
//           .single();

//         if (productError) {
//           console.error('Product fetch error:', productError);
//           setError('Product not found');
//           setLoading(false);
//           return;
//         }

//         if (!productData) {
//           setError('Product not found');
//           setLoading(false);
//           return;
//         }

//         console.log('✅ Product found:', productData);

//         // Format product data for the component
//         const formattedProduct = {
//           id: productData.product_id,
//           name: productData.name,
//           brand: productData.brand,
//           slug: productData.slug,
//           badges: ["AUTHENTIC", "KOREAN BEAUTY"],
//           tags: productData.tags || [],
//           description: productData.description || '',
//           images: productData.product_media?.map((media: any) => media.media_url) || ['/placeholder.svg'],
//           videoUrl: productData.product_media?.find((media: any) => media.media_type === 'video')?.media_url,
//           price: Number(productData.selling_price || productData.cost_price),
//           discountPrice: productData.selling_price ? Number(productData.cost_price) : undefined,
//           rating: 4.5, // Default rating
//           reviews: 123, // Default review count
//           stockStatus: productData.stock_quantity > 0 ? "In Stock" as const : "Out of Stock" as const,
//           stockQuantity: productData.stock_quantity,
//           variants: { size: ["Standard"] }, // Default variant
//           ingredients: productData.ingredients || "Natural ingredients",
//           howToUse: productData.how_to_use || "Follow product instructions",
//           fullDescription: productData.description || '',
//           benefits: productData.benefits?.split(',') || ["Premium quality", "Authentic Korean beauty"],
//           category: productData.category?.toLowerCase() || "skincare",
//           subCategory: productData.category || "Beauty Product"
//         };

//         setProduct(formattedProduct);
//       } catch (error) {
//         console.error('Error fetching product:', error);
//         setError('Failed to load product');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="container mx-auto px-4 py-16 flex items-center justify-center">
//           <LoadingSpinner size="lg" />
//         </div>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="container mx-auto px-4 py-16 text-center">
//           <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
//           <p className="text-muted-foreground mb-4">
//             The product you're looking for doesn't exist or has been removed.
//           </p>
//           <button
//             onClick={() => navigate('/')}
//             className="text-primary hover:underline"
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Breadcrumb data for SEO
//   const breadcrumbItems = [
//     { name: "Home", url: "/", position: 1 },
//     { name: "Consumer Innovations Products", url: "/", position: 2 },
//     { name: product.category.charAt(0).toUpperCase() + product.category.slice(1), url: `/category/${product.category}`, position: 3 },
//     { name: product.name, url: `/product/${id}`, position: 4 }
//   ];

//   return (
//     <>
//       <SEOMeta
//         title={`${product.name} - ${product.brand} | Buy Online at Consumer Innovations Store India`}
//         description={`${product.description} ✅ Authentic ${product.brand} ${product.name} ✅ Best Price ✅ Fast Delivery ✅ Free Shipping across India. Shop now!`}
//         keywords={`${product.name}, ${product.brand}, ${product.tags?.join(', ')}, korean beauty products, buy ${product.name} online india, ${product.brand} india`}
//         image={product.images[0]?.startsWith('http') ? product.images[0] : `${typeof window !== 'undefined' ? window.location.origin : ''}${product.images[0]}`}
//         type="product"
//         section={product.category}
//       />
//       <ProductSchema product={product} />
//       <BreadcrumbSchema items={breadcrumbItems} />

//       <div className="min-h-screen bg-background">
//         {/* Promotional Banner */}
//         {activeBanner && (
//           <div
//             className="w-full py-2 text-center text-sm font-medium overflow-hidden relative"
//             style={{
//               backgroundColor: activeBanner.background_color,
//               color: activeBanner.text_color
//             }}
//           >
//             <div className="container mx-auto px-4">
//               <div className="animate-scroll whitespace-nowrap">
//                 <span className="inline-block px-4">
//                   {activeBanner.title}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Direct Navigation Elements */}
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between gap-8 mb-6">

//             {/* Logo - Direct placement */}
//             <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
//               <img
//                 src={logoUrl || "/lovable-uploads/908a6451-2aaf-44eb-bb13-5823b663f442.png"}
//                 alt="Consumer Innovations Store"
//                 className="h-56 w-auto object-contain hover:scale-105 transition-all duration-300"
//               />
//             </div>

//             {/* Search - Moved towards right */}
//             <div className="flex-1 max-w-xl ml-auto mr-8">
//               <DynamicSearch
//                 onSelect={(result) => navigate(`/search?q=${encodeURIComponent(result.title)}`)}
//                 placeholder="Search for Consumer Innovations products, brands, or categories..."
//                 className="w-full"
//               />
//             </div>

//             {/* Right Side Actions */}
//             <div className="flex items-center space-x-4">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="flex items-center space-x-2">
//                     <Package className="h-4 w-4" />
//                     <span className="hidden md:inline">Categories</span>
//                     <ChevronDown className="h-4 w-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
//                   <DropdownMenuLabel>Shop by Category</DropdownMenuLabel>
//                   <div className="p-2">
//                     {hierarchicalCategories.map((category) => (
//                       <div key={category.id} className="mb-2">
//                         <div
//                           className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-all duration-200"
//                           onClick={() => navigate(`/products?category=${category.slug}`)}
//                         >
//                           <div className="flex items-center space-x-3">
//                             <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category.color_theme + '20' }}>
//                               {category.icon_name === 'Droplets' && <Droplets className="h-4 w-4" style={{ color: category.color_theme }} />}
//                               {category.icon_name === 'Sparkles' && <Sparkles className="h-4 w-4" style={{ color: category.color_theme }} />}
//                               {category.icon_name === 'Star' && <Star className="h-4 w-4" style={{ color: category.color_theme }} />}
//                               {category.icon_name === 'Heart' && <Heart className="h-4 w-4" style={{ color: category.color_theme }} />}
//                               {category.icon_name === 'Shield' && <Shield className="h-4 w-4" style={{ color: category.color_theme }} />}
//                               {category.icon_name === 'Zap' && <Zap className="h-4 w-4" style={{ color: category.color_theme }} />}
//                               {category.icon_name === 'Sun' && <Sun className="h-4 w-4" style={{ color: category.color_theme }} />}
//                               {category.icon_name === 'Crown' && <Crown className="h-4 w-4" style={{ color: category.color_theme }} />}
//                               {category.icon_name === 'Award' && <Award className="h-4 w-4" style={{ color: category.color_theme }} />}
//                             </div>
//                             <div className="flex-1">
//                               <p className="font-medium text-sm">{category.name}</p>
//                               <p className="text-xs text-muted-foreground">{category.description}</p>
//                             </div>
//                           </div>
//                           {category.children && category.children.length > 0 && (
//                             <ChevronRight className="h-4 w-4 text-muted-foreground" />
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="flex items-center space-x-2">
//                     <Star className="h-4 w-4" />
//                     <span className="hidden md:inline">Brands</span>
//                     <ChevronDown className="h-4 w-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
//                   <DropdownMenuLabel>Shop by Brand</DropdownMenuLabel>
//                   <div className="space-y-1">
//                     {brands.map((brand) => (
//                       <DropdownMenuItem
//                         key={brand.id}
//                         onClick={() => navigate(`/search?brand=${brand.name.replace(/\s+/g, '-').toUpperCase()}`)}
//                         className="group px-3 py-3 rounded-lg hover:bg-accent transition-all duration-200 cursor-pointer"
//                       >
//                         <div className="flex items-center space-x-3 w-full">
//                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
//                             {brand.logo_url ? (
//                               <img
//                                 src={brand.logo_url}
//                                 alt={brand.name}
//                                 className="w-6 h-6 object-contain"
//                               />
//                             ) : (
//                               <span className="text-xs font-bold text-primary">
//                                 {brand.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
//                               </span>
//                             )}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="font-medium text-sm">{brand.name}</p>
//                             {brand.description && (
//                               <p className="text-xs text-muted-foreground truncate">{brand.description}</p>
//                             )}
//                           </div>
//                         </div>
//                       </DropdownMenuItem>
//                     ))}
//                   </div>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {user && (
//                 <>
//                   <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
//                     Admin
//                   </Button>
//                   <Button variant="outline" size="sm" onClick={() => navigate('/supplier')}>
//                     Supplier
//                   </Button>
//                 </>
//               )}

//               {user && <NotificationBell />}

//               <Button variant="ghost" onClick={() => navigate('/cart')} className="relative">
//                 <ShoppingCart className="h-5 w-5" />
//                 {totalItems > 0 && (
//                   <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
//                     {totalItems}
//                   </Badge>
//                 )}
//               </Button>

//               {user ? (
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost">
//                       <User className="mr-2 h-4 w-4" />
//                       Account
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem onClick={() => navigate('/account')}>
//                       <Package className="mr-2 h-4 w-4" />
//                       My Orders
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => navigate('/account')}>
//                       <Settings className="mr-2 h-4 w-4" />
//                       Account Settings
//                     </DropdownMenuItem>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem onClick={signOut}>
//                       <LogOut className="mr-2 h-4 w-4" />
//                       Sign Out
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               ) : (
//                 <div className="flex items-center space-x-2">
//                   <Button variant="ghost" onClick={() => navigate('/auth')}>
//                     <LogIn className="mr-2 h-4 w-4" />
//                     Sign In
//                   </Button>
//                   <Button onClick={() => navigate('/auth')}>
//                     <LogIn className="mr-2 h-4 w-4" />
//                     Sign Up
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="container mx-auto px-4 py-8">
//           {/* Breadcrumb */}
//           <nav className="mb-8 text-sm text-muted-foreground">
//             <span
//               className="hover:text-primary cursor-pointer"
//               onClick={() => navigate('/')}
//             >
//               Home
//             </span>
//             <span className="mx-2">/</span>
//             <span
//               className="hover:text-primary cursor-pointer"
//               onClick={() => navigate('/')}
//             >
//               Consumer Innovations Products
//             </span>
//             <span className="mx-2">/</span>
//             <span className="text-foreground">{product.name}</span>
//           </nav>

//           {/* Main Product Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
//             <EnhancedProductMediaSection
//               images={product.images}
//               videoUrl={product.videoUrl}
//               productName={product.name}
//             />

//             <ProductDetailsSection
//               product={product}
//               selectedVariant={selectedVariant}
//               onVariantChange={setSelectedVariant}
//             />
//           </div>

//           {/* Product Information Tabs */}
//           <EnhancedProductTabs product={product} />

//           {/* Frequently Bought Together */}
//           <FrequentlyBoughtTogether productId={product.id} />

//           {/* Related Products */}
//           <RelatedProductsSection
//             category={product.category}
//             currentProductId={product.id}
//           />
//         </div>
//       </div>
//     </>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import {
  CheckCircle2,
  Heart,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type ProductMedia = {
  media_url: string;
  media_type: string;
  is_primary: boolean;
  position: number | null;
};

type Product = {
  product_id: string;
  slug?: string | null;
  name: string;
  brand?: string | null;
  cost_price?: number | null; // current price
  selling_price?: number | null; // MRP (optional)
  description?: string | null;
  is_active?: boolean | null;
  stock_quantity?: number | null;
  product_media?: ProductMedia[];
};

// helpers
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

export default function ProductPage() {
  const { id } = useParams<{ id: string }>(); // product_id in URL
  const { toast } = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // images
  const images = useMemo(() => {
    const list = product?.product_media?.map((m) => m.media_url) || [];
    // move primary to front
    const primary =
      product?.product_media?.find((m) => m.is_primary)?.media_url || list[0];
    return primary ? [primary, ...list.filter((u) => u !== primary)] : list;
  }, [product]);
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => setActiveImg(0), [images.length]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*, product_media(media_url, media_type, is_primary, position)")
        .eq("product_id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (!data) {
        console.warn("Product not found:", id, error);
        toast({
          title: "Product not found",
          description: "This item may be inactive or the link is incorrect.",
          variant: "destructive",
        });
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(data as Product);
      setLoading(false);
    };

    fetchProduct();
  }, [id, toast]);

  const price = round2(product?.cost_price ?? 0);
  const mrp = round2(product?.selling_price ?? 0);
  const showMrp = mrp > price;
  const youSave = showMrp ? round2(mrp - price) : 0;
  const discountPct = showMrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const inStock = (product?.stock_quantity ?? 0) > 0;

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAdding(true);
      await addToCart(product.product_id, qty);
      toast({
        title: "Added to Cart 🛒",
        description: `${product.name} × ${qty} added to your cart.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not add to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setAdding(false), 320);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-6">
            <div className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="md:col-span-6 space-y-4">
            <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-32 w-full bg-muted rounded animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground">
          Please go back and pick another product.
        </p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs (simple) */}
        <nav className="text-sm text-muted-foreground mb-4">
          <span className="hover:text-foreground">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-foreground">Products</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-12 gap-8">
          {/* LEFT: sticky gallery */}
          <div className="md:col-span-6">
            <div className="md:sticky md:top-24">
              <div className="aspect-[4/5] bg-white rounded-xl border overflow-hidden flex items-center justify-center">
                {images[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`aspect-square rounded-lg border overflow-hidden bg-white ${
                        i === activeImg
                          ? "ring-2 ring-primary"
                          : "hover:ring-1 hover:ring-primary/40"
                      }`}
                      aria-label={`Thumbnail ${i + 1}`}
                    >
                      <img
                        src={url}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: info */}
          <div className="md:col-span-6 space-y-5">
            {/* Brand */}
            {product.brand && (
              <div className="text-xs tracking-wide text-primary/90 font-medium">
                {product.brand}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>

            {/* Badges / rating (static stars as placeholder) */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                AUTHENTIC
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">
                KOREAN BEAUTY
              </span>
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 text-sm">
                <Star className="h-4 w-4 fill-amber-500" /> 4.5
                <span className="text-muted-foreground">(123)</span>
              </span>
            </div>

            {/* Price block */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold">{formatINR(price)}</span>
              {showMrp && (
                <>
                  <span className="text-sm line-through text-muted-foreground">
                    {formatINR(mrp)}
                  </span>
                  <span className="rounded-full bg-rose-100 text-rose-600 px-2 py-0.5 text-xs">
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </div>
            {youSave > 0 && (
              <div className="text-sm text-emerald-600">
                You save {formatINR(youSave)}
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  inStock ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span className="text-sm">
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-md border">
                <button
                  className="px-3 py-1 text-lg"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-3 py-1 min-w-[2.5rem] text-center">
                  {qty}
                </span>
                <button
                  className="px-3 py-1 text-lg"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                className={`inline-flex gap-2 ${adding ? "scale-[0.98]" : ""}`}
              >
                <ShoppingCart className="h-4 w-4" />
                {adding ? "Adding..." : "Add to Cart"}
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    title: "Added to Wishlist ❤️",
                    description: `${product.name} saved to your wishlist.`,
                  })
                }
              >
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </Button>
            </div>

            {/* Trust rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-md border p-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs">100% Authentic</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-xs">Ships in 24 hrs</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RotateCcw className="h-4 w-4 text-rose-600" />
                <span className="text-xs">Easy Returns</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">Description</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
