import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { ModernProductCard } from "./ModernProductCard";
import { Professional360Viewer } from "./product/Professional360Viewer";
import { supabase } from "@/integrations/supabase/client";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";

export const ProductGrid = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);

  // filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedSkinType, setSelectedSkinType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // options (for dropdowns)
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [brands, setBrands] = useState<string[]>(["All"]);
  const skinTypes = [
    "All",
    "Dry",
    "Oily",
    "Combination",
    "Sensitive",
    "Acne-Prone",
  ];

  // Quick View
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  /* ---------- base query with ONLY filters (no sort) ---------- */
  const buildBase = (forCount = false) => {
    let q = supabase
      .from("products")
      .select("*", { count: forCount ? "exact" : undefined, head: forCount })
      .eq("is_active", true);

    if (selectedCategory !== "All") q = q.eq("category", selectedCategory);
    if (selectedBrand !== "All") q = q.eq("brand", selectedBrand);
    if (selectedSkinType !== "All") q = q.eq("skin_type", selectedSkinType);

    // 🚫 No .order(...) here — DB default order is used.
    return q;
  };

  // fetch dropdown options once
  const fetchFilterOptions = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("category, brand")
      .eq("is_active", true);

    if (!error && data) {
      const cats = Array.from(
        new Set(data.map((d: any) => d.category).filter(Boolean) as string[])
      ).sort();
      const brs = Array.from(
        new Set(data.map((d: any) => d.brand).filter(Boolean) as string[])
      ).sort();
      setCategories(["All", ...cats]);
      setBrands(["All", ...brs]);
    }
  };

  // transform rows + media to ModernProductCard shape
  const transform = (rows: any[], mediaRows: any[]) =>
    (rows || []).map((product: any) => {
      const allMedia = mediaRows.filter(
        (m) => m.product_id === (product.product_id || product.id)
      );
      const primaryImage = allMedia.find((m) => m.is_primary)?.media_url || "";
      const hoverImage = allMedia.length > 1 ? allMedia[1]?.media_url : "";
      const allImages = allMedia.map((m) => m.media_url);

      return {
        id: product.product_id || product.id,
        name: product.name,
        brand: product.brand,
        price: product.cost_price || 0,
        originalPrice:
          product.selling_price && product.selling_price > product.cost_price
            ? product.selling_price
            : undefined,
        rating: 4.5,
        reviewCount: 0,
        image: primaryImage,
        hoverImage,
        allImages,
        badges: product.is_featured
          ? [{ text: "Featured", type: "bestseller" as const }]
          : [],
        category: product.category,
        skinType: product.skin_type || ["All Skin Types"],
        keyIngredients: product.ingredients ? [product.ingredients] : [],
        isNew: false,
        variants: 1,
        stockCount: product.stock_quantity,
        shippingTime: "24 hrs",
        slug: product.slug,
      };
    });

  // main fetch — simple range pagination in DB default order
  const fetchProducts = async () => {
    setLoading(true);

    // 1) count (full filtered set)
    const { count: totalCount, error: countErr } = await buildBase(true);
    if (countErr) {
      console.error(countErr);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load products. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    setTotal(totalCount || 0);

    // 2) page slice (no ORDER BY => DB default order)
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: pageRows, error: pageErr } = await buildBase(false).range(
      from,
      to
    );

    if (pageErr) {
      console.error(pageErr);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // 3) fetch media for JUST the rows we’ll show this page
    const idsThisPage = (pageRows || []).map((p) => p.product_id || p.id);
    let mediaRows: any[] = [];
    if (idsThisPage.length) {
      const { data: media } = await supabase
        .from("product_media")
        .select("product_id, media_url, is_primary, position")
        .eq("media_type", "image")
        .in("product_id", idsThisPage)
        .order("position"); // keep gallery order
      if (media) mediaRows = media;
    }

    // 4) transform + set
    setProducts(transform(pageRows || [], mediaRows));
    setLoading(false);
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, selectedBrand, selectedSkinType]);

  useEffect(() => {
    const subscription = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        fetchProducts
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        fetchProducts
      )
      .subscribe();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedBrand, selectedSkinType]);

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast({
        title: "Added to Cart! 🛒",
        description: "Product successfully added to your cart",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickView = async (productId: string) => {
    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("product_id", productId)
      .single();

    const { data: mediaData } = await supabase
      .from("product_media")
      .select("media_url, is_primary, position")
      .eq("product_id", productId)
      .order("position");

    setSelectedProduct({
      ...productData,
      images: mediaData?.map((m) => m.media_url) || [],
    });
    setIsQuickViewOpen(true);
  };

  const handlePageClick = (e: { selected: number }) => {
    setPage(e.selected + 1);
  };

  const from = (page - 1) * pageSize;
  const showingFrom = total === 0 ? 0 : from + 1;
  const showingTo = Math.min(total, from + products.length);

  return (
    <section className="py-4 md:py-2 bg-background" id="products">
      <div className="container mx-auto px-2 sm:px-4">
        {/* count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground font-medium">
            {loading
              ? "Loading products..."
              : `Showing ${showingFrom}–${showingTo} of ${total} products`}
          </p>
        </div>

        {/* grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-72" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
            <p className="text-muted-foreground">
              Products will appear here once they are added to the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/product/${product.id}`);
                }}
                tabIndex={0}
              >
                <ModernProductCard
                  id={product.id}
                  name={product.name}
                  brand={product.brand}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  benefits={product.benefits}
                  hoverImage={product.hoverImage}
                  allImages={product.allImages}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  badges={product.badges}
                  variants={product.variants}
                  stockCount={product.stockCount}
                  shippingTime={product.shippingTime}
                  isLimitedOffer={product.isLimitedOffer}
                  offerEndsAt={product.offerEndsAt}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={() =>
                    toast({
                      title: "Added to Wishlist ❤️",
                      description: `${product.name} has been saved to your wishlist`,
                    })
                  }
                  onQuickView={handleQuickView}
                />
              </div>
            ))}
          </div>
        )}

        {/* pagination */}
        {total > pageSize && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <ReactPaginate
              breakLabel="…"
              nextLabel="Next"
              previousLabel="Prev"
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={totalPages}
              forcePage={page - 1}
              renderOnZeroPageCount={null}
              containerClassName="flex items-center gap-2"
              pageClassName="border rounded-md"
              pageLinkClassName="px-3 py-1.5 block text-sm"
              previousClassName="border rounded-md"
              previousLinkClassName="px-3 py-1.5 block text-sm"
              nextClassName="border rounded-md"
              nextLinkClassName="px-3 py-1.5 block text-sm"
              activeClassName="bg-primary text-primary-foreground border-primary"
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        )}

        {/* quick view */}
        <Professional360Viewer
          product={selectedProduct}
          isOpen={isQuickViewOpen}
          onClose={() => {
            setIsQuickViewOpen(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    </section>
  );
};



// // src/components/ProductGrid.tsx
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "@/hooks/useCart";
// import { useToast } from "@/hooks/use-toast";
// import { ModernProductCard } from "./ModernProductCard";
// import { Professional360Viewer } from "./product/Professional360Viewer";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";

// export const ProductGrid = () => {
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
//   const { toast } = useToast();

//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedProduct, setSelectedProduct] = useState<any>(null);
//   const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

//   // ✅ pagination state
//   const PAGE_SIZE = 8; // change to 12/16 if you want
//   const [currentPage, setCurrentPage] = useState(1);

//   // Keep page in range when products change
//   useEffect(() => {
//     const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
//     if (currentPage > pageCount) setCurrentPage(pageCount);
//   }, [products.length]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Build page list like: 1 … 4 5 6 … 20
//   const buildPagination = (current: number, total: number, window = 1): (number | "ellipsis")[] => {
//     const pages: (number | "ellipsis")[] = [];
//     if (total <= 5 + window * 2) {
//       for (let i = 1; i <= total; i++) pages.push(i);
//       return pages;
//     }
//     pages.push(1);
//     const left = Math.max(2, current - window);
//     const right = Math.min(total - 1, current + window);
//     if (left > 2) pages.push("ellipsis");
//     for (let i = left; i <= right; i++) pages.push(i);
//     if (right < total - 1) pages.push("ellipsis");
//     pages.push(total);
//     return pages;
//   };

//   // Fetch all products (list)
//   const fetchProducts = async () => {
//     setLoading(true);

//     const { data: productsData, error: productsError } = await supabase
//       .from("products")
//       .select("*")
//       .eq("is_active", true)
//       .order("created_at", { ascending: false });

//     if (productsError) {
//       toast({
//         title: "Error",
//         description: "Failed to load products",
//         variant: "destructive",
//       });
//       setLoading(false);
//       return;
//     }

//     const { data: mediaData } = await supabase
//       .from("product_media")
//       .select("product_id, media_url, is_primary, position")
//       .eq("media_type", "image")
//       .order("position");

//     const transformed = (productsData || []).map((p) => {
//       const media = mediaData?.filter((m) => m.product_id === p.product_id) || [];
//       const primaryImage =
//         media.find((m) => m.is_primary)?.media_url || media[0]?.media_url || "";
//       const hoverImage = media.length > 1 ? media[1]?.media_url : "";

//       return {
//         id: p.product_id, // product_id for nav & cart
//         name: p.name,
//         brand: p.brand,
//         price: p.cost_price,
//         originalPrice: p.selling_price,
//         image: primaryImage,
//         hoverImage,
//         allImages: media.map((m) => m.media_url),
//         stockCount: p.stock_quantity,
//         category: p.category,
//         rating: 4.5,
//       };
//     });

//     setProducts(transformed);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   // Quick View (eye icon) — fetch by product_id
//   const handleQuickView = async (productId: string) => {
//     const { data, error } = await supabase
//       .from("products")
//       .select("*, product_media(media_url, media_type, is_primary, position)")
//       .eq("product_id", productId)
//       .eq("is_active", true)
//       .maybeSingle();

//     if (!data) {
//       console.error("Quick view fetch error:", error);
//       toast({
//         title: "Not found",
//         description: "This product is not available.",
//         variant: "destructive",
//       });
//       return;
//     }

//     const productWithImages = {
//       ...data,
//       images: data.product_media?.map((m: any) => m.media_url) || [],
//     };

//     setSelectedProduct(productWithImages);
//     setIsQuickViewOpen(true);
//   };

//   const handleAddToCart = async (productId: string) => {
//     try {
//       await addToCart(productId, 1);
//       toast({
//         title: "Added to Cart 🛒",
//         description: "Product successfully added",
//       });
//     } catch {
//       toast({
//         title: "Error",
//         description: "Could not add to cart",
//         variant: "destructive",
//       });
//     }
//   };

//   // ✅ pagination calculations
//   const total = products.length;
//   const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
//   const safeCurrent = Math.min(Math.max(currentPage, 1), pageCount);
//   const start = (safeCurrent - 1) * PAGE_SIZE;
//   const end = Math.min(start + PAGE_SIZE, total);
//   const pageItems = loading ? [] : products.slice(start, end);

//   return (
//     <section className="bg-background py-8" id="products">
//       <div className="container mx-auto px-2">
//         <h2 className="text-center text-3xl font-bold mb-6">
//           Premium Consumer Innovations Products
//         </h2>

//         {/* Results count */}
//         {!loading && (
//           <div className="mb-4 text-sm text-muted-foreground">
//             {total === 0 ? "No products" : `Showing ${start + 1}-${end} of ${total} products`}
//           </div>
//         )}

//         {loading ? (
//           <div className="text-center">Loading…</div>
//         ) : (
//           <>
//             {/* Grid */}
//             <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
//               {pageItems.map((product) => (
//                 <div
//                   key={product.id}
//                   onClick={() => navigate(`/product/${product.id}`)} // navigate by product_id
//                   className="cursor-pointer"
//                 >
//                   <ModernProductCard
//                     id={product.id}
//                     name={product.name}
//                     brand={product.brand}
//                     price={product.price}
//                     originalPrice={product.originalPrice}
//                     image={product.image}
//                     hoverImage={product.hoverImage}
//                     allImages={product.allImages}
//                     rating={product.rating}
//                     reviewCount={0}
//                     stockCount={product.stockCount}
//                     onAddToCart={handleAddToCart}
//                     onAddToWishlist={() =>
//                       toast({
//                         title: "Added to Wishlist ❤️",
//                         description: `${product.name} has been saved to your wishlist`,
//                       })
//                     }
//                     onQuickView={handleQuickView} // passes product.id automatically
//                   />
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {pageCount > 1 && (
//               <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">
//                 {/* First / Prev */}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="px-3"
//                   disabled={safeCurrent === 1}
//                   onClick={() => setCurrentPage(1)}
//                   aria-label="First page"
//                 >
//                   «
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="px-3"
//                   disabled={safeCurrent === 1}
//                   onClick={() => setCurrentPage(safeCurrent - 1)}
//                   aria-label="Previous page"
//                 >
//                   ‹
//                 </Button>

//                 {/* Numbers + ellipses */}
//                 {buildPagination(safeCurrent, pageCount, 1).map((p, idx) =>
//                   p === "ellipsis" ? (
//                     <span key={`e-${idx}`} className="px-2 text-muted-foreground select-none">
//                       …
//                     </span>
//                   ) : (
//                     <Button
//                       key={p}
//                       variant={p === safeCurrent ? "default" : "outline"}
//                       size="sm"
//                       className={`px-3 ${p === safeCurrent ? "pointer-events-none" : ""}`}
//                       onClick={() => setCurrentPage(p as number)}
//                       aria-current={p === safeCurrent ? "page" : undefined}
//                     >
//                       {p}
//                     </Button>
//                   )
//                 )}

//                 {/* Next / Last */}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="px-3"
//                   disabled={safeCurrent === pageCount}
//                   onClick={() => setCurrentPage(safeCurrent + 1)}
//                   aria-label="Next page"
//                 >
//                   ›
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="px-3"
//                   disabled={safeCurrent === pageCount}
//                   onClick={() => setCurrentPage(pageCount)}
//                   aria-label="Last page"
//                 >
//                   »
//                 </Button>
//               </nav>
//             )}
//           </>
//         )}

//         {/* Quick View Modal */}
//         <Professional360Viewer
//           product={selectedProduct}
//           isOpen={isQuickViewOpen}
//           onClose={() => {
//             setIsQuickViewOpen(false);
//             setSelectedProduct(null);
//           }}
//         />
//       </div>
//     </section>
//   );
// };
