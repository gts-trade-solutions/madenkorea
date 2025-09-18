import { TopNavigation } from "@/components/TopNavigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown } from "lucide-react";

import { Footer } from "@/components/Footer";
import { ModernProductCard } from "@/components/ModernProductCard";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DynamicSearch } from "@/components/DynamicSearch";
import { Helmet } from "react-helmet-async";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleProductsCount, setVisibleProductsCount] = useState(24);

  // Database state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [brands, setBrands] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("name")
          .eq("is_active", true)
          .order("position");

        if (categoriesData) {
          setCategories(["All", ...categoriesData.map((cat) => cat.name)]);
        }

        // Fetch brands - Use actual brands from products, not the incomplete brands table
        const { data: productsForBrands } = await supabase
          .from("products")
          .select("brand")
          .eq("is_active", true);

        if (productsForBrands) {
          const uniqueBrands = [
            ...new Set(productsForBrands.map((p) => p.brand)),
          ].sort();
          setBrands(["All", ...uniqueBrands]);
          console.log(
            "🔥 ProductsPage - Found brands from products:",
            uniqueBrands
          );
        }

        // Fetch products with media
        const { data: productsData } = await supabase
          .from("products")
          .select(
            `
            *,
            product_media (
              media_url,
              media_type,
              is_primary,
              position
            )
          `
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (productsData) {
          console.log(
            "Products state updated:",
            productsData.length,
            productsData.slice(0, 5)
          );
          const formattedProducts = productsData.map((product) => {
            const mediaImages = product.product_media || [];
            const primaryImage =
              mediaImages.find((media) => media.is_primary) || mediaImages[0];
            const hoverImage =
              mediaImages.find((media) => !media.is_primary) || mediaImages[1];

            // 🔥 EXTRACT ALL IMAGES for cycling
            const allImages = mediaImages
              .sort((a, b) => (a.position || 0) - (b.position || 0))
              .map((media) => media.media_url)
              .filter(Boolean);

            console.log(
              `🔍 ProductsPage - Product "${product.name}" (${product.product_id}): found ${mediaImages.length} media items`
            );
            console.log(
              `✅ ProductsPage - Final result "${product.name}": ${allImages.length} images`,
              allImages
            );

            return {
              id: product.product_id,
              name: product.name,
              brand: product.brand,
              price: Number(product.selling_price || product.cost_price),
              originalPrice: Number(product.cost_price),
              rating: 4.5, // Default rating
              reviewCount: 100, // Default review count
              image: primaryImage?.media_url || "",
              hoverImage: hoverImage?.media_url || "",
              allImages: allImages, // 🔥 ADD THIS FOR IMAGE CYCLING
              badges: product.is_featured
                ? [{ text: "Featured", type: "bestseller" }]
                : [],
              category: product.category,
              skinType: product.skin_type || ["All Skin Types"],
              keyIngredients: product.ingredients?.split(",").slice(0, 2) || [
                "Natural Ingredients",
              ],
              isNew:
                new Date(product.created_at) >
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              variants: 1,
              stockCount: Number(product.stock_quantity) || 0,
              shippingTime: "24 hrs",
              isLimitedOffer: product.discount_percentage > 0,
              offerEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };
          });
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle URL search parameters
  useEffect(() => {
    const query = searchParams.get("q");
    const brand = searchParams.get("brand");
    if (query) setSearchQuery(query);
    if (brand) setSelectedBrand(brand);
  }, [searchParams]);

  // Filter products based on search query and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.keyIngredients &&
        product.keyIngredients.some((ingredient: string) =>
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
      (product.skinType &&
        product.skinType.some((type: string) =>
          type.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesBrand =
      selectedBrand === "All" ||
      product.brand === selectedBrand ||
      product.brand.toLowerCase() === selectedBrand.toLowerCase();

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.isNew ? 1 : -1;
      default:
        return 0;
    }
  });

  const visibleProducts = sortedProducts.slice(0, visibleProductsCount);

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast({
        title: "Added to Cart! 🛒",
        description: "Product successfully added to your cart",
      });
    } catch (error) {
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

  const handleQuickView = (productId: string) => {
    window.location.href = `/product/${productId}`;
  };

  const loadMoreProducts = () => {
    setVisibleProductsCount((prev) => prev + 24);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading products...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>All Products - Consumer Innovations Store</title>
        <meta
          name="description"
          content="Browse our complete collection of authentic Korean beauty products. Find skincare, cosmetics, and Consumer Innovations essentials."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TopNavigation />

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">All Products</h1>
            <p className="text-muted-foreground mb-6">
              Discover our complete collection of authentic Korean beauty
              products
            </p>
            {/* <div className="max-w-xl">
              <DynamicSearch 
                placeholder="Search products..."
                className="w-full"
                autoFocus={false}
              />
            </div> */}
          </div>

          {/* Filters & Sort */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>

                <div className="hidden lg:flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm bg-background"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Brand:</span>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm bg-background"
                    >
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm bg-background"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mt-4 p-4 bg-muted rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Brand
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {visibleProducts.length} of {filteredProducts.length}{" "}
              products
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedBrand("All");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleProducts.map((product) => (
                  <ModernProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    brand={product.brand}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    image={product.image}
                    hoverImage={product.hoverImage}
                    allImages={product.allImages} // 🔥 PASS ALL IMAGES FOR CYCLING
                    badges={product.badges}
                    variants={product.variants}
                    stockCount={product.stockCount}
                    shippingTime={product.shippingTime}
                    isLimitedOffer={product.isLimitedOffer}
                    offerEndsAt={product.offerEndsAt}
                    onAddToCart={() => handleAddToCart(product.id)}
                    onAddToWishlist={() => handleAddToWishlist(product.id)}
                    onQuickView={() => handleQuickView(product.id)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {visibleProducts.length < filteredProducts.length && (
                <div className="text-center mt-12">
                  <Button
                    onClick={loadMoreProducts}
                    variant="outline"
                    size="lg"
                  >
                    Load More Products (
                    {filteredProducts.length - visibleProducts.length}{" "}
                    remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProductsPage;
