import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModernProductCard } from "./ModernProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Award, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  cost_price: number;
  selling_price?: number;
  discount_percentage: number;
  stock_quantity: number;
  is_active: boolean;
  tags: string[];
}

interface ProductMedia {
  product_id: string;
  media_url: string;
  media_type: string;
  position: number;
  is_primary: boolean;
}

interface EditorialProduct extends Product {
  images: string[];
  is_trending?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  is_featured?: boolean;
}

/** Stretch grid items so all cards in a row share the same height */
const GRID_CLASSES =
  "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-stretch gap-3 md:gap-6";

const SectionHeader = ({
  title,
  icon: Icon,
  count,
  color,
}: {
  title: string;
  icon: any;
  count: number;
  color: string;
}) => (
  <div className="flex items-center justify-between mb-4 md:mb-6">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        <Badge variant="secondary" className="mt-1">
          {count} products
        </Badge>
      </div>
    </div>
    <Button variant="outline" size="sm" className="group">
      View All
      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
    </Button>
  </div>
);

const mrpFromCost = (cost: number) => Math.round((cost ?? 0) * 1.3);

export const EditorialProductSections = () => {
  const [trendingProducts, setTrendingProducts] = useState<EditorialProduct[]>(
    []
  );
  const [bestSellers, setBestSellers] = useState<EditorialProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<EditorialProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<EditorialProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEditorialProducts();
  }, []);

  const fetchEditorialProducts = async () => {
    try {
      const { data: editorialData, error: editorialError } = await supabase
        .from("product_editorial")
        .select("*");

      if (editorialError) {
        console.error("Error fetching editorial data:", editorialError);
        return;
      }

      if (!editorialData || editorialData.length === 0) {
        setTrendingProducts([]);
        setBestSellers([]);
        setNewArrivals([]);
        setFeaturedProducts([]);
        setLoading(false);
        return;
      }

      // Get product details for editorial products
      const productIds = editorialData.map((item) => item.product_id);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .in("product_id", productIds)
        .eq("is_active", true);

      if (productsError) {
        console.error("Error fetching products:", productsError);
        setLoading(false);
        return;
      }

      // Get product media for all products
      const { data: mediaData, error: mediaError } = await supabase
        .from("product_media")
        .select("*")
        .in("product_id", productIds)
        .eq("media_type", "image")
        .order("position");

      if (mediaError) {
        console.error("Error fetching media data:", mediaError);
      }

      // Group media by product_id
      const mediaByProduct = (mediaData || []).reduce((acc, media) => {
        if (!acc[media.product_id]) acc[media.product_id] = [];
        acc[media.product_id].push(media.media_url);
        return acc;
      }, {} as Record<string, string[]>);

      // Create product lookup
      const productLookup = (productsData || []).reduce((acc, product) => {
        acc[product.product_id] = product;
        return acc;
      }, {} as Record<string, any>);

      // Process and categorize products
      const trending: EditorialProduct[] = [];
      const bestsellers: EditorialProduct[] = [];
      const newArrivalsArr: EditorialProduct[] = [];
      const featured: EditorialProduct[] = [];

      editorialData.forEach((item) => {
        const product = productLookup[item.product_id];
        if (!product) return;

        const productImages = mediaByProduct[product.product_id] || [
          "/placeholder.svg",
        ];

        const productWithImages: EditorialProduct = {
          ...product,
          images: productImages,
          is_trending: item.is_trending,
          is_bestseller: item.is_bestseller,
          is_new_arrival: item.is_new_arrival,
          is_featured: item.is_featured,
        };

        if (item.is_trending) trending.push(productWithImages);
        if (item.is_bestseller) bestsellers.push(productWithImages);
        if (item.is_new_arrival) newArrivalsArr.push(productWithImages);
        if (item.is_featured) featured.push(productWithImages);
      });

      setTrendingProducts(trending.slice(0, 4));
      setBestSellers(bestsellers.slice(0, 4));
      setNewArrivals(newArrivalsArr.slice(0, 4));
      setFeaturedProducts(featured.slice(0, 4));
    } catch (error) {
      console.error("Error in fetchEditorialProducts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold">
            Loading Editorial Products...
          </h2>
        </div>
        <div className={GRID_CLASSES}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 md:h-80 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast({
        title: "Added to Cart! 🛒",
        description: "Product successfully added to your cart",
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = (productId: string) => {
    toast({
      title: "Added to Wishlist! ❤️",
      description: "Product saved to your wishlist",
    });
  };

  // ✅ navigate to PDP when clicking the card (safe: ignores clicks on inner buttons/links)
  const handleCardClick = (e: React.MouseEvent, productId: string) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button, a, input, select, textarea, [data-no-nav='true']")
    )
      return;
    navigate(`/product/${productId}`);
  };

  // Keep your Quick View behavior consistent (navigate to PDP)
  const handleQuickView = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Wrapper to force each card to fill its grid cell height
  const Wrap: React.FC<{ id: string; children: React.ReactNode }> = ({
    id,
    children,
  }) => (
    <div key={id} className="h-full">
      <div className="h-full items-stretch">{children}</div>
    </div>
  );

  return (
    <div className="container mx-auto px-2 space-y-8">
      {/* Trending Products */}
      <section>
        <SectionHeader
          title="Trending Now"
          icon={TrendingUp}
          count={trendingProducts.length}
          color="bg-gradient-to-r from-pink-500 to-purple-600"
        />

        {trendingProducts.length === 0 ? (
          <div className="text-center py-10 md:py-12 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100">
            <TrendingUp className="h-10 w-10 md:h-12 md:w-12 mx-auto text-pink-400 mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
              No trending products available
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Products marked as trending in the admin panel will appear here.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "/products")}
            >
              Browse All Products
            </Button>
          </div>
        ) : (
          <div className={GRID_CLASSES}>
            {trendingProducts.map((product) => {
              const cost = Number(product.cost_price ?? 0);
              const mrp = mrpFromCost(cost);
              return (
                <Wrap id={product.product_id} key={product.product_id}>
                  <div
                    className="h-full cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label={`${product.name} details`}
                    onClick={(e) => handleCardClick(e, product.product_id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleCardClick(e as any, product.product_id);
                    }}
                  >
                    <ModernProductCard
                      id={product.product_id}
                      name={product.name}
                      brand={product.brand ?? undefined}
                      price={cost} // current = cost
                      originalPrice={mrp} // strike = cost × 1.30 (≈23% OFF)
                      image={product.images?.[0] ?? "/placeholder.svg"}
                      hoverImage={product.images?.[1]}
                      allImages={
                        product.images?.length
                          ? product.images
                          : ["/placeholder.svg"]
                      }
                      rating={4.5}
                      reviewCount={123}
                      stockCount={product.stock_quantity ?? 0}
                      onAddToCart={() => handleAddToCart(product.product_id)}
                      onAddToWishlist={() =>
                        handleAddToWishlist(product.product_id)
                      }
                      onQuickView={() => handleQuickView(product.product_id)}
                    />
                  </div>
                </Wrap>
              );
            })}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section>
          <SectionHeader
            title="Best Sellers"
            icon={Award}
            count={bestSellers.length}
            color="bg-gradient-to-r from-yellow-500 to-orange-600"
          />
          <div className={GRID_CLASSES}>
            {bestSellers.map((product) => (
              <Wrap id={product.product_id}>
                <div
                  className="h-full cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`${product.name} details`}
                  onClick={(e) => handleCardClick(e, product.product_id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleCardClick(e as any, product.product_id);
                  }}
                >
                  <ModernProductCard
                    id={product.product_id}
                    name={product.name}
                    brand={product.brand}
                    price={Number(product.cost_price ?? 0)}
                    originalPrice={mrpFromCost(Number(product.cost_price ?? 0))}
                    image={product.images[0] || "/placeholder.svg"}
                    allImages={product.images}
                    rating={4.5}
                    reviewCount={123}
                    badges={[{ text: "BESTSELLER", type: "bestseller" }]}
                    stockCount={product.stock_quantity}
                    onAddToCart={() => handleAddToCart(product.product_id)}
                    onAddToWishlist={() =>
                      handleAddToWishlist(product.product_id)
                    }
                    onQuickView={() => handleQuickView(product.product_id)}
                  />
                </div>
              </Wrap>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section>
          <SectionHeader
            title="New Arrivals"
            icon={Sparkles}
            count={newArrivals.length}
            color="bg-gradient-to-r from-green-500 to-teal-600"
          />
          <div className={GRID_CLASSES}>
            {newArrivals.map((product) => (
              <Wrap id={product.product_id}>
                <div
                  className="h-full cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`${product.name} details`}
                  onClick={(e) => handleCardClick(e, product.product_id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleCardClick(e as any, product.product_id);
                  }}
                >
                  <ModernProductCard
                    id={product.product_id}
                    name={product.name}
                    brand={product.brand}
                    price={Number(product.cost_price ?? 0)}
                    originalPrice={mrpFromCost(Number(product.cost_price ?? 0))}
                    image={product.images[0] || "/placeholder.svg"}
                    allImages={product.images}
                    rating={4.5}
                    reviewCount={123}
                    badges={[{ text: "NEW ARRIVAL", type: "new" }]}
                    stockCount={product.stock_quantity}
                    onAddToCart={() => handleAddToCart(product.product_id)}
                    onAddToWishlist={() =>
                      handleAddToWishlist(product.product_id)
                    }
                    onQuickView={() => handleQuickView(product.product_id)}
                  />
                </div>
              </Wrap>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section>
          <SectionHeader
            title="Featured Products"
            icon={Star}
            count={featuredProducts.length}
            color="bg-gradient-to-r from-blue-500 to-indigo-600"
          />
          <div className={GRID_CLASSES}>
            {featuredProducts.map((product) => (
              <Wrap id={product.product_id}>
                <div
                  className="h-full cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`${product.name} details`}
                  onClick={(e) => handleCardClick(e, product.product_id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleCardClick(e as any, product.product_id);
                  }}
                >
                  <ModernProductCard
                    id={product.product_id}
                    name={product.name}
                    brand={product.brand}
                    price={Number(product.cost_price ?? 0)}
                    originalPrice={mrpFromCost(Number(product.cost_price ?? 0))}
                    image={product.images[0] || "/placeholder.svg"}
                    allImages={product.images}
                    rating={4.5}
                    reviewCount={123}
                    badges={[{ text: "FEATURED", type: "bestseller" }]}
                    stockCount={product.stock_quantity}
                    onAddToCart={() => handleAddToCart(product.product_id)}
                    onAddToWishlist={() =>
                      handleAddToWishlist(product.product_id)
                    }
                    onQuickView={() => handleQuickView(product.product_id)}
                  />
                </div>
              </Wrap>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {trendingProducts.length === 0 &&
        bestSellers.length === 0 &&
        newArrivals.length === 0 &&
        featuredProducts.length === 0 && (
          <div className="text-center py-14 md:py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-muted rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-medium mb-2">
                No Editorial Products Yet
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Products marked as trending, best sellers, new arrivals, or
                featured will appear here.
              </p>
            </div>
          </div>
        )}
    </div>
  );
};
