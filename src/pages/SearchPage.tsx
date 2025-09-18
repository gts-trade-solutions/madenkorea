// import { TopNavigation } from "@/components/TopNavigation";
// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate, useParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Search, Filter, ChevronDown } from "lucide-react";

// import { Footer } from "@/components/Footer";
// import { ModernProductCard } from "@/components/ModernProductCard";
// import { useCart } from "@/hooks/useCart";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
// import { DynamicSearch } from "@/components/DynamicSearch";

// // Mock products data (same as ProductGrid)
// const allProducts = [
//   {
//     id: "1",
//     name: "COSRX Advanced Snail 92 All In One Cream",
//     brand: "COSRX",
//     price: 1199,
//     originalPrice: 1599,
//     rating: 4.8,
//     reviewCount: 2847,
//     image: "",
//     hoverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400",
//     badges: [
//       { text: "Bestseller", type: "bestseller" as const },
//       { text: "Vegan", type: "vegan" as const }
//     ],
//     category: "Moisturizer",
//     skinType: ["All Skin Types"],
//     keyIngredients: ["Snail Secretion Filtrate", "Hyaluronic Acid"],
//     isNew: false,
//     variants: 2,
//     stockCount: 3,
//     shippingTime: "24 hrs",
//     isLimitedOffer: true,
//     offerEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
//   },
//   {
//     id: "2",
//     name: "INNISFREE Green Tea Seed Serum",
//     brand: "INNISFREE",
//     price: 979,
//     originalPrice: 1299,
//     rating: 4.6,
//     reviewCount: 1923,
//     image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400",
//     badges: [
//       { text: "New Arrival", type: "new" as const },
//       { text: "Organic", type: "organic" as const }
//     ],
//     category: "Serum",
//     skinType: ["Oily", "Combination"],
//     keyIngredients: ["Green Tea Extract", "Niacinamide"],
//     isNew: true,
//     variants: 1,
//     shippingTime: "2-3 days"
//   },
//   {
//     id: "3",
//     name: "LANEIGE Water Bank Blue Hyaluronic Cream",
//     brand: "LANEIGE",
//     price: 2199,
//     originalPrice: 2899,
//     rating: 4.9,
//     reviewCount: 3456,
//     image: "https://images.unsplash.com/photo-1556228578-dd1e4b0d6ba1?q=80&w=400",
//     badges: [
//       { text: "Premium", type: "bestseller" as const }
//     ],
//     category: "Moisturizer",
//     skinType: ["Dry", "Normal"],
//     keyIngredients: ["Blue Hyaluronic Acid", "Ceramides"],
//     isNew: false,
//     variants: 3,
//     shippingTime: "24 hrs"
//   },
//   {
//     id: "4",
//     name: "ETUDE HOUSE SoonJung pH 6.5 Whip Cleanser",
//     brand: "ETUDE HOUSE",
//     price: 679,
//     originalPrice: 899,
//     rating: 4.7,
//     reviewCount: 1567,
//     image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400",
//     badges: [
//       { text: "Gentle", type: "vegan" as const }
//     ],
//     category: "Cleanser",
//     skinType: ["Sensitive", "All Skin Types"],
//     keyIngredients: ["Panthenol", "Madecassoside"],
//     isNew: false,
//     stockCount: 8,
//     shippingTime: "2-3 days"
//   },
//   {
//     id: "5",
//     name: "BEAUTY OF JOSEON Glow Deep Serum",
//     brand: "BEAUTY OF JOSEON",
//     price: 899,
//     originalPrice: 1199,
//     rating: 4.8,
//     reviewCount: 2134,
//     image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=400",
//     badges: [
//       { text: "Trending", type: "sale" as const }
//     ],
//     category: "Serum",
//     skinType: ["All Skin Types"],
//     keyIngredients: ["Alpha Arbutin", "Niacinamide"],
//     isNew: false,
//     variants: 2,
//     shippingTime: "24 hrs"
//   },
//   {
//     id: "6",
//     name: "SOME BY MI Red Tea Tree Spot Treatment",
//     brand: "SOME BY MI",
//     price: 649,
//     originalPrice: 849,
//     rating: 4.5,
//     reviewCount: 987,
//     image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400",
//     badges: [
//       { text: "Acne Care", type: "vegan" as const }
//     ],
//     category: "Treatment",
//     skinType: ["Acne-Prone", "Oily"],
//     keyIngredients: ["Red Tea Tree", "Centella Asiatica"],
//     isNew: true,
//     stockCount: 2,
//     shippingTime: "24 hrs"
//   }
// ];

// // Category mapping from navigation names to database filtering logic
// const categoryMapping: { [key: string]: string[] } = {
//   // Direct matches from Header navigation
//   'serums & essences': ['Skin Care'],
//   'serums': ['Skin Care'],
//   'essences': ['Skin Care'],
//   'skin care': ['Skin Care'],
//   'cleansers': ['Skin Care'],
//   'moisturizers': ['Skin Care'],
//   'sheet masks': ['Skin Care'],
//   'masks': ['Skin Care'],
//   'sunscreens': ['Skin Care'],
//   'treatments': ['Skin Care'],
//   // URL slug versions
//   'skincare': ['Skin Care'],
//   // Add more mappings as needed
// };

// const SearchPage = () => {
//   const [searchParams] = useSearchParams();
//   const { category: urlCategory, brand: urlBrand } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
//   const { toast } = useToast();

//   const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedBrand, setSelectedBrand] = useState("All");
//   const [sortBy, setSortBy] = useState("featured");
//   const [showFilters, setShowFilters] = useState(false);

//   // Database state
//   const [products, setProducts] = useState<any[]>([]);
//   const [categories, setCategories] = useState<string[]>(["All"]);
//   const [brands, setBrands] = useState<string[]>(["All"]);
//   const [loading, setLoading] = useState(true);

//   // Fetch data from database
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch categories
//         const { data: categoriesData } = await supabase
//           .from('categories')
//           .select('name')
//           .eq('is_active', true)
//           .order('position');

//         if (categoriesData) {
//           setCategories(['All', ...categoriesData.map(cat => cat.name)]);
//         }

//         // Fetch brands - Use actual brands from products, not the incomplete brands table
//         const { data: productsForBrands } = await supabase
//           .from('products')
//           .select('brand')
//           .eq('is_active', true);

//         if (productsForBrands) {
//           const uniqueBrands = [...new Set(productsForBrands.map(p => p.brand))].sort();
//           setBrands(['All', ...uniqueBrands]);
//           console.log('🔥 SearchPage - Found brands from products:', uniqueBrands);
//         }

//         // Fetch products with media
//         const { data: productsData } = await supabase
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
//           .eq('is_active', true)
//           .order('created_at', { ascending: false });

//         if (productsData) {
//           const formattedProducts = productsData.map(product => {
//             const mediaImages = product.product_media || [];
//             const primaryImage = mediaImages.find(media => media.is_primary) || mediaImages[0];
//             const hoverImage = mediaImages.find(media => !media.is_primary) || mediaImages[1];

//             // 🔥 EXTRACT ALL IMAGES for cycling
//             const allImages = mediaImages
//               .sort((a, b) => (a.position || 0) - (b.position || 0))
//               .map(media => media.media_url)
//               .filter(Boolean);

//             console.log(`🔍 SearchPage - Product "${product.name}" (${product.product_id}): found ${mediaImages.length} media items`);
//             console.log(`✅ SearchPage - Final result "${product.name}": ${allImages.length} images`, allImages);

//             return {
//               id: product.product_id,
//               name: product.name,
//               brand: product.brand,
//               price: Number(product.selling_price || product.cost_price),
//               originalPrice: Number(product.cost_price),
//               rating: 4.5, // Default rating
//               reviewCount: 100, // Default review count
//               image: primaryImage?.media_url || "",
//               hoverImage: hoverImage?.media_url || "",
//               allImages: allImages, // 🔥 ADD THIS FOR IMAGE CYCLING
//               badges: product.is_featured ? [{ text: "Featured", type: "bestseller" }] : [],
//               category: product.category,
//               skinType: product.skin_type || ["All Skin Types"],
//               keyIngredients: product.ingredients?.split(',').slice(0, 2) || ["Natural Ingredients"],
//               isNew: new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//               variants: 1,
//               stockCount: product.stock_quantity,
//               shippingTime: "24 hrs",
//               isLimitedOffer: product.discount_percentage > 0,
//               offerEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//             };
//           });
//           setProducts(formattedProducts);
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         // Fallback to mock data
//         setProducts(allProducts);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle URL parameters for category/brand filtering
//   useEffect(() => {
//     const query = searchParams.get('q');
//     const category = searchParams.get('category');
//     const brand = searchParams.get('brand');

//     console.log('SearchPage - URL Parameters:', { query, category, brand });

//     if (query) setSearchQuery(query);
//     if (category) setSelectedCategory(category);
//     if (brand) {
//       // Decode the brand parameter (reverse the transformation from Header)
//       const decodedBrand = brand.replace(/-/g, ' ');
//       console.log('SearchPage - Setting brand from URL:', brand, '-> decoded:', decodedBrand);
//       setSelectedBrand(decodedBrand);
//     }

//     // Handle URL path parameters for category/brand
//     if (urlCategory) {
//       const mappedCategories = categoryMapping[urlCategory.toLowerCase()];
//       if (mappedCategories) {
//         // For mapped categories, we need special handling in the filter
//         setSelectedCategory(urlCategory); // Use the URL slug as the selected category
//       } else {
//         setSelectedCategory(urlCategory);
//       }
//     }

//     if (urlBrand) {
//       setSelectedBrand(urlBrand);
//     }
//   }, [searchParams, urlCategory, urlBrand]);

//   // Filter products based on search query
//   const filteredProducts = products.filter(product => {
//     const matchesSearch = !searchQuery ||
//       product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (product.keyIngredients && product.keyIngredients.some((ingredient: string) =>
//         ingredient.toLowerCase().includes(searchQuery.toLowerCase())
//       )) ||
//       (product.skinType && product.skinType.some((type: string) =>
//         type.toLowerCase().includes(searchQuery.toLowerCase())
//       ));

//     // Enhanced category matching with URL slug mapping
//     let matchesCategory = selectedCategory === "All";
//     if (!matchesCategory && selectedCategory) {
//       // First try direct category match
//       if (product.category === selectedCategory) {
//         matchesCategory = true;
//       } else {
//         // Then try mapped category + keyword matching for subcategories
//         const mappedCategories = categoryMapping[selectedCategory.toLowerCase()];
//         if (mappedCategories && mappedCategories.includes(product.category)) {
//           // For subcategories like "serums & essences", also check product name
//           const categoryLower = selectedCategory.toLowerCase();
//           if (categoryLower.includes('serum') || categoryLower === 'serums & essences') {
//             matchesCategory = product.name.toLowerCase().includes('serum') ||
//                             product.name.toLowerCase().includes('essence') ||
//                             product.description?.toLowerCase().includes('serum') ||
//                             product.description?.toLowerCase().includes('essence');
//           } else if (categoryLower.includes('cleanser')) {
//             matchesCategory = product.name.toLowerCase().includes('cleanser') ||
//                             product.name.toLowerCase().includes('foam') ||
//                             product.name.toLowerCase().includes('cleansing');
//           } else if (categoryLower.includes('moistur') || categoryLower.includes('cream')) {
//             matchesCategory = product.name.toLowerCase().includes('cream') ||
//                             product.name.toLowerCase().includes('moistur') ||
//                             product.name.toLowerCase().includes('lotion');
//           } else if (categoryLower.includes('mask')) {
//             matchesCategory = product.name.toLowerCase().includes('mask') ||
//                             product.name.toLowerCase().includes('sheet');
//           } else if (categoryLower.includes('sun')) {
//             matchesCategory = product.name.toLowerCase().includes('sun') ||
//                             product.name.toLowerCase().includes('spf') ||
//                             product.name.toLowerCase().includes('uv');
//           } else {
//             // For other mapped categories, just match the main category
//             matchesCategory = true;
//           }
//         }
//       }
//     }

//     const matchesBrand = selectedBrand === "All" ||
//                         product.brand === selectedBrand ||
//                         product.brand.toLowerCase() === selectedBrand.toLowerCase();

//     return matchesSearch && matchesCategory && matchesBrand;
//   });

//   // Debug logging to see what's happening with filtering
//   useEffect(() => {
//     console.log('SearchPage - Selected Category:', selectedCategory);
//     console.log('SearchPage - Selected Brand:', selectedBrand);
//     console.log('SearchPage - Products count:', products.length);
//     console.log('SearchPage - Sample product brands:', products.slice(0, 5).map(p => ({ name: p.name, brand: p.brand })));
//     console.log('SearchPage - Filtered products count:', filteredProducts.length);
//   }, [selectedCategory, selectedBrand, products, filteredProducts]);

//   const sortedProducts = [...filteredProducts].sort((a, b) => {
//     switch (sortBy) {
//       case "price-low": return a.price - b.price;
//       case "price-high": return b.price - a.price;
//       case "rating": return b.rating - a.rating;
//       case "newest": return b.isNew ? 1 : -1;
//       default: return 0;
//     }
//   });

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
//     }
//   };

//   const handleAddToCart = async (productId: string) => {
//     try {
//       await addToCart(productId, 1);
//       toast({
//         title: "Added to Cart! 🛒",
//         description: "Product successfully added to your cart",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to add item to cart. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleAddToWishlist = (productId: string) => {
//     toast({
//       title: "Added to Wishlist! ❤️",
//       description: "Product saved to your wishlist",
//     });
//   };

//   const handleQuickView = (productId: string) => {
//     navigate(`/product/${productId}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <TopNavigation />
//         <div className="container mx-auto px-4 py-8">
//           <div className="flex items-center justify-center py-16">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//               <p>Loading products...</p>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <TopNavigation />

//       <div className="container mx-auto px-4 py-8">
//         {/* Search Header */}
//         <div className="mb-8">
//           {/* <h1 className="text-3xl font-bold mb-4">Search Results</h1>
//           <div className="max-w-xl">
//             <DynamicSearch
//               placeholder="Search for Consumer Innovations products..."
//               className="w-full"
//               autoFocus={false}
//             />
//           </div> */}
//         </div>

//         {/* Filters & Sort */}
//         <div className="mb-8">
//           <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
//             <div className="flex flex-wrap gap-4 items-center">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="lg:hidden"
//               >
//                 <Filter className="h-4 w-4 mr-2" />
//                 Filters
//                 <ChevronDown className="h-4 w-4 ml-2" />
//               </Button>

//               <div className="hidden lg:flex flex-wrap gap-4">
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm font-medium">Category:</span>
//                   <select
//                     value={selectedCategory}
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     className="px-3 py-1 border rounded-md text-sm bg-background"
//                   >
//                     {categories.map(cat => (
//                       <option key={cat} value={cat}>{cat}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm font-medium">Brand:</span>
//                   <select
//                     value={selectedBrand}
//                     onChange={(e) => setSelectedBrand(e.target.value)}
//                     className="px-3 py-1 border rounded-md text-sm bg-background"
//                   >
//                     {brands.map(brand => (
//                       <option key={brand} value={brand}>{brand}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               <span className="text-sm font-medium">Sort by:</span>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="px-3 py-1 border rounded-md text-sm bg-background"
//               >
//                 <option value="featured">Featured</option>
//                 <option value="newest">Newest</option>
//                 <option value="price-low">Price: Low to High</option>
//                 <option value="price-high">Price: High to Low</option>
//                 <option value="rating">Highest Rated</option>
//               </select>
//             </div>
//           </div>

//           {/* Mobile Filters */}
//           {showFilters && (
//             <div className="lg:hidden mt-4 p-4 border rounded-lg bg-background space-y-4">
//               <div>
//                 <label className="text-sm font-medium">Category:</label>
//                 <select
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
//                 >
//                   {categories.map(cat => (
//                     <option key={cat} value={cat}>{cat}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="text-sm font-medium">Brand:</label>
//                 <select
//                   value={selectedBrand}
//                   onChange={(e) => setSelectedBrand(e.target.value)}
//                   className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
//                 >
//                   {brands.map(brand => (
//                     <option key={brand} value={brand}>{brand}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Count */}
//         <div className="mb-6">
//           <p className="text-sm text-muted-foreground">
//             {searchQuery ? `Showing ${sortedProducts.length} results for "${searchQuery}"` : `Showing ${sortedProducts.length} products`}
//           </p>
//         </div>

//         {/* Search Results */}
//         {sortedProducts.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {sortedProducts.map((product) => (
//               <ModernProductCard
//                 key={product.id}
//                 id={product.id}
//                 name={product.name}
//                 brand={product.brand}
//                 price={product.price}
//                 originalPrice={product.originalPrice}
//                 image={product.image}
//                 hoverImage={product.hoverImage}
//                 allImages={product.allImages} // 🔥 PASS ALL IMAGES FOR CYCLING
//                 rating={product.rating}
//                 reviewCount={product.reviewCount}
//                 badges={product.badges}
//                 variants={product.variants}
//                 stockCount={product.stockCount}
//                 shippingTime={product.shippingTime}
//                 isLimitedOffer={product.isLimitedOffer}
//                 offerEndsAt={product.offerEndsAt}
//                 onAddToCart={handleAddToCart}
//                 onAddToWishlist={handleAddToWishlist}
//                 onQuickView={handleQuickView}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-16">
//             <div className="text-6xl mb-4">🔍</div>
//             <h3 className="text-xl font-semibold mb-2">No products found</h3>
//             <p className="text-muted-foreground mb-6">
//               {searchQuery ? `No products match "${searchQuery}". Try adjusting your search or filters.` : "Try adjusting your filters to see more products."}
//             </p>
//             <Button onClick={() => navigate('/')} variant="outline">
//               Browse All Products
//             </Button>
//           </div>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default SearchPage;

// pages/ShowcaseAllInOne.tsx

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BestSellersShowcase from "@/components/video-sections/BestSeller";
import SnapReels from "@/components/video-sections/SkincareVideos";
import SkinConsultPanel from "@/components/video-sections/SkincareBottom";

import { Button } from "@/components/ui/button";
import { Filter, ChevronDown } from "lucide-react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { ModernProductCard } from "@/components/ModernProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

/* ---------------------------
 * Static HERO slides (unchanged)
 * --------------------------*/
type Slide = {
  image: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
};

const slides: Slide[] = [
  {
    image: "/images/6.webp",
    alt: "Hydrating skincare serum on acrylic",
    eyebrow: "New Arrival",
    title: "Brightening Creams",
    description: "Glow like glass — clean, simple, effective.",
    cta: { label: "Shop Now", href: "/products" },
  },
  {
    image: "/images/2.jpg",
    alt: "Flatlay of Korean skincare routine",
    eyebrow: "Editor's Pick",
    title: "Build Your Routine",
    description: "Cleanser → Toner → Essence → Moisturizer → SPF.",
    cta: { label: "Explore Sets", href: "/collections/sets" },
  },
  {
    image: "/images/3.jpg",
    alt: "Minimal bottle on soft fabric",
    eyebrow: "Limited",
    title: "Velvet Night Cream",
    description: "Deep hydration for your PM routine.",
    cta: { label: "View Details", href: "/products/velvet-night-cream" },
  },
  {
    image: "/images/7.png",
    alt: "Soothing toner on stone",
    eyebrow: "Trending",
    title: "Soothing Toner",
    description: "Calm, balance, and prep your skin.",
    cta: { label: "See Product", href: "/products/soothing-toner" },
  },
  {
    image: "/images/1.jpg",
    alt: "Soothing toner on stone",
    eyebrow: "Trending",
    title: "Soothing Toner",
    description: "Calm, balance, and prep your skin.",
    cta: { label: "See Product", href: "/products/soothing-toner" },
  },
];

/* ----------------------------------------------
 * Fallback mock products (used if DB fetch fails)
 * ---------------------------------------------*/
const allProducts = [
  {
    id: "1",
    name: "COSRX Advanced Snail 92 All In One Cream",
    brand: "COSRX",
    price: 1199,
    originalPrice: 1599,
    rating: 4.8,
    reviewCount: 2847,
    image: "",
    hoverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400",
    badges: [
      { text: "Bestseller", type: "bestseller" as const },
      { text: "Vegan", type: "vegan" as const },
    ],
    category: "Moisturizer",
    skinType: ["All Skin Types"],
    keyIngredients: ["Snail Secretion Filtrate", "Hyaluronic Acid"],
    isNew: false,
    variants: 2,
    stockCount: 3,
    shippingTime: "24 hrs",
    isLimitedOffer: true,
    offerEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "INNISFREE Green Tea Seed Serum",
    brand: "INNISFREE",
    price: 979,
    originalPrice: 1299,
    rating: 4.6,
    reviewCount: 1923,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400",
    badges: [
      { text: "New Arrival", type: "new" as const },
      { text: "Organic", type: "organic" as const },
    ],
    category: "Serum",
    skinType: ["Oily", "Combination"],
    keyIngredients: ["Green Tea Extract", "Niacinamide"],
    isNew: true,
    variants: 1,
    shippingTime: "2-3 days",
  },
  {
    id: "3",
    name: "LANEIGE Water Bank Blue Hyaluronic Cream",
    brand: "LANEIGE",
    price: 2199,
    originalPrice: 2899,
    rating: 4.9,
    reviewCount: 3456,
    image:
      "https://images.unsplash.com/photo-1556228578-dd1e4b0d6ba1?q=80&w=400",
    badges: [{ text: "Premium", type: "bestseller" as const }],
    category: "Moisturizer",
    skinType: ["Dry", "Normal"],
    keyIngredients: ["Blue Hyaluronic Acid", "Ceramides"],
    isNew: false,
    variants: 3,
    shippingTime: "24 hrs",
  },
  {
    id: "4",
    name: "ETUDE HOUSE SoonJung pH 6.5 Whip Cleanser",
    brand: "ETUDE HOUSE",
    price: 679,
    originalPrice: 899,
    rating: 4.7,
    reviewCount: 1567,
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400",
    badges: [{ text: "Gentle", type: "vegan" as const }],
    category: "Cleanser",
    skinType: ["Sensitive", "All Skin Types"],
    keyIngredients: ["Panthenol", "Madecassoside"],
    isNew: false,
    stockCount: 8,
    shippingTime: "2-3 days",
  },
  {
    id: "5",
    name: "BEAUTY OF JOSEON Glow Deep Serum",
    brand: "BEAUTY OF JOSEON",
    price: 899,
    originalPrice: 1199,
    rating: 4.8,
    reviewCount: 2134,
    image:
      "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=400",
    badges: [{ text: "Trending", type: "sale" as const }],
    category: "Serum",
    skinType: ["All Skin Types"],
    keyIngredients: ["Alpha Arbutin", "Niacinamide"],
    isNew: false,
    variants: 2,
    shippingTime: "24 hrs",
  },
  {
    id: "6",
    name: "SOME BY MI Red Tea Tree Spot Treatment",
    brand: "SOME BY MI",
    price: 649,
    originalPrice: 849,
    rating: 4.5,
    reviewCount: 987,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400",
    badges: [{ text: "Acne Care", type: "vegan" as const }],
    category: "Treatment",
    skinType: ["Acne-Prone", "Oily"],
    keyIngredients: ["Red Tea Tree", "Centella Asiatica"],
    isNew: true,
    stockCount: 2,
    shippingTime: "24 hrs",
  },
];

/* ---------------------------------------------------
 * Category mapping (URL slug → DB category semantics)
 * --------------------------------------------------*/
const categoryMapping: { [key: string]: string[] } = {
  "serums & essences": ["Skin Care"],
  serums: ["Skin Care"],
  essences: ["Skin Care"],
  "skin care": ["Skin Care"],
  cleansers: ["Skin Care"],
  moisturizers: ["Skin Care"],
  "sheet masks": ["Skin Care"],
  masks: ["Skin Care"],
  sunscreens: ["Skin Care"],
  treatments: ["Skin Care"],
  skincare: ["Skin Care"],
};

const cls = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(" ");

export default function ShowcaseAllInOne() {
  /* ------------------------
   * HERO slider state/refs
   * -----------------------*/
  const [active, setActive] = useState(0);
  const mainRef = useRef<SwiperType | null>(null);
  const onMainSwiper = (s: SwiperType) => {
    mainRef.current = s;
    setActive(s.realIndex ?? s.activeIndex ?? 0);
  };
  const onMainChange = (s: SwiperType) =>
    setActive(s.realIndex ?? s.activeIndex ?? 0);
  const goTo = (i: number) => mainRef.current?.slideToLoop(i, 500);

  /* ------------------------
   * Product grid (dynamic)
   * -----------------------*/
  const [searchParams] = useSearchParams();
  const { category: urlCategory, brand: urlBrand } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [brands, setBrands] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  // Fetch database content
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Categories
        const { data: categoriesData, error: catErr } = await supabase
          .from("categories")
          .select("name")
          .eq("is_active", true)
          .order("position");
        if (!catErr && categoriesData) {
          setCategories(["All", ...categoriesData.map((c) => c.name)]);
        }

        // Brands (derived from products)
        const { data: productsForBrands } = await supabase
          .from("products")
          .select("brand")
          .eq("is_active", true);
        if (productsForBrands) {
          const uniqueBrands = [
            ...new Set(productsForBrands.map((p) => p.brand).filter(Boolean)),
          ].sort();
          setBrands(["All", ...uniqueBrands]);
        }

        // Products with media
        const { data: productsData, error: prodErr } = await supabase
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

        if (!prodErr && productsData) {
          const formattedProducts = productsData.map((product: any) => {
            const mediaImages = product.product_media || [];
            const primaryImage =
              mediaImages.find((m: any) => m.is_primary) || mediaImages[0];
            const hoverImage =
              mediaImages.find((m: any) => !m.is_primary) || mediaImages[1];

            const allImages = mediaImages
              .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
              .map((m: any) => m.media_url)
              .filter(Boolean);

            return {
              id: product.product_id,
              name: product.name,
              brand: product.brand,
              price: Number(product.selling_price || product.cost_price),
              originalPrice: Number(product.cost_price),
              rating: 4.5,
              reviewCount: 100,
              image: primaryImage?.media_url || "",
              hoverImage: hoverImage?.media_url || "",
              allImages,
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
              stockCount: product.stock_quantity,
              shippingTime: "24 hrs",
              isLimitedOffer: product.discount_percentage > 0,
              offerEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };
          });

          setProducts(formattedProducts);
        } else {
          setProducts(allProducts);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setProducts(allProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // URL parameters → state
  useEffect(() => {
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");

    if (query) setSearchQuery(query);
    if (category) setSelectedCategory(category);
    if (brand) {
      const decodedBrand = brand.replace(/-/g, " ");
      setSelectedBrand(decodedBrand);
    }

    if (urlCategory) {
      const mapped = categoryMapping[urlCategory.toLowerCase()];
      if (mapped) {
        setSelectedCategory(urlCategory);
      } else {
        setSelectedCategory(urlCategory);
      }
    }

    if (urlBrand) {
      setSelectedBrand(urlBrand);
    }
  }, [searchParams, urlCategory, urlBrand]);

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.keyIngredients &&
        product.keyIngredients.some((ingredient: string) =>
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
      (product.skinType &&
        product.skinType.some((type: string) =>
          type.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    let matchesCategory = selectedCategory === "All";
    if (!matchesCategory && selectedCategory) {
      if (product.category === selectedCategory) {
        matchesCategory = true;
      } else {
        const mappedCategories =
          categoryMapping[selectedCategory.toLowerCase()];
        if (mappedCategories && mappedCategories.includes(product.category)) {
          const categoryLower = selectedCategory.toLowerCase();
          if (
            categoryLower.includes("serum") ||
            categoryLower === "serums & essences"
          ) {
            matchesCategory =
              product.name.toLowerCase().includes("serum") ||
              product.name.toLowerCase().includes("essence") ||
              product.description?.toLowerCase().includes("serum") ||
              product.description?.toLowerCase().includes("essence");
          } else if (categoryLower.includes("cleanser")) {
            matchesCategory =
              product.name.toLowerCase().includes("cleanser") ||
              product.name.toLowerCase().includes("foam") ||
              product.name.toLowerCase().includes("cleansing");
          } else if (
            categoryLower.includes("moistur") ||
            categoryLower.includes("cream")
          ) {
            matchesCategory =
              product.name.toLowerCase().includes("cream") ||
              product.name.toLowerCase().includes("moistur") ||
              product.name.toLowerCase().includes("lotion");
          } else if (categoryLower.includes("mask")) {
            matchesCategory =
              product.name.toLowerCase().includes("mask") ||
              product.name.toLowerCase().includes("sheet");
          } else if (categoryLower.includes("sun")) {
            matchesCategory =
              product.name.toLowerCase().includes("sun") ||
              product.name.toLowerCase().includes("spf") ||
              product.name.toLowerCase().includes("uv");
          } else {
            matchesCategory = true;
          }
        }
      }
    }

    const matchesBrand =
      selectedBrand === "All" ||
      product.brand === selectedBrand ||
      product.brand?.toLowerCase() === selectedBrand.toLowerCase();

    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1;
      default:
        return 0;
    }
  });

  // Handlers
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
    navigate(`/product/${productId}`);
  };

  /* ------------------------
   * Render
   * -----------------------*/
  return (
    <>
      <Header />

      {/* HERO SWIPER (overlay text) */}
      <section>
        <div className="relative overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            loop
            autoplay={{ delay: 1500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            onSwiper={onMainSwiper}
            onSlideChange={onMainChange}
            className="h-[60%]"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={i}>
                <div className="relative h-full w-full aspect-[4/1.4]">
                  <img
                    src={s.image}
                    alt={s.alt}
                    style={{ objectFit: "cover" }}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    decoding="async"
                  />
                  {(s.eyebrow || s.title || s.description || s.cta) && (
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                      <div className="relative text-white">
                        {s.eyebrow && (
                          <span className="text-xs sm:text-sm opacity-90">
                            {s.eyebrow}
                          </span>
                        )}
                        {s.title && (
                          <h2 className="text-xl sm:text-3xl font-semibold mt-1">
                            {s.title}
                          </h2>
                        )}
                        {s.description && (
                          <p className="opacity-90 mt-2">{s.description}</p>
                        )}
                        {s.cta && (
                          <a
                            href={s.cta.href}
                            className="inline-flex items-center rounded-xl border border-white/70 text-white px-4 py-2 mt-4 hover:bg-white/10"
                          >
                            {s.cta.label}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* DYNAMIC PRODUCT SECTION */}
      <section className="container mx-auto px-4 py-10">
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
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 p-4 border rounded-lg bg-background space-y-4">
              <div>
                <label className="text-sm font-medium">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Brand:</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                >
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `Showing ${sortedProducts.length} results for "${searchQuery}"`
              : `Showing ${sortedProducts.length} products`}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p>Loading products...</p>
            </div>
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ModernProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
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
                onAddToWishlist={handleAddToWishlist}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `No products match "${searchQuery}". Try adjusting your search or filters.`
                : "Try adjusting your filters to see more products."}
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Browse All Products
            </Button>
          </div>
        )}
      </section>

      {/* Existing static sections below */}
      <BestSellersShowcase />
      <SnapReels />
      <SkinConsultPanel />
      <Footer />
    </>
  );
}
