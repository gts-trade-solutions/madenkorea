// import { useState, useEffect } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Heart, Eye, ShoppingCart, Star, Clock, Truck } from "lucide-react";
// import { cn, formatPrice } from "@/lib/utils";

// interface ProductCardProps {
//   id: string;
//   name: string;
//   brand: string;
//   price: number;
//   originalPrice?: number;
//   image: string;
//   hoverImage?: string;
//   allImages?: string[]; // New prop for automatic cycling
//   rating: number;
//   reviewCount: number;
//   badges?: Array<{
//     text: string;
//     type: 'bestseller' | 'new' | 'vegan' | 'sale' | 'stock' | 'organic';
//   }>;
//   variants?: number;
//   stockCount?: number;
//   shippingTime?: string;
//   isLimitedOffer?: boolean;
//   offerEndsAt?: Date;
//   onAddToCart: (id: string) => void;
//   onAddToWishlist: (id: string) => void;
//   onQuickView: (id: string) => void;
//   className?: string;
// }

// export const ModernProductCard = ({
//   id,
//   name,
//   brand,
//   price,
//   originalPrice,
//   image,
//   hoverImage,
//   allImages = [],
//   rating,
//   reviewCount,
//   badges = [],
//   variants,
//   stockCount,
//   shippingTime = "2-3 days",
//   isLimitedOffer,
//   offerEndsAt,
//   onAddToCart,
//   onAddToWishlist,
//   onQuickView,
//   className
// }: ProductCardProps) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   // FORCE 4 IMAGES - Use allImages directly without fallback logic
//   const imagesToCycle = allImages && allImages.length > 0 ? allImages : [image].filter(Boolean);
//   const currentImage = imagesToCycle[currentImageIndex] || image;

//   // Image cycling functionality

//   const discountPercentage = originalPrice 
//     ? Math.round(((originalPrice - price) / originalPrice) * 100)
//     : 0;

//   // Automatic image cycling effect
//   useEffect(() => {
//     if (imagesToCycle.length <= 1 || isHovered) return;

//     const interval = setInterval(() => {
//       setCurrentImageIndex((prevIndex) => 
//         (prevIndex + 1) % imagesToCycle.length
//       );
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [imagesToCycle.length, isHovered]);

//   // Reset to first image when not hovered for consistency
//   useEffect(() => {
//     if (!isHovered && imagesToCycle.length > 1) {
//       const resetTimer = setTimeout(() => {
//         setCurrentImageIndex(0);
//       }, 1000);
//       return () => clearTimeout(resetTimer);
//     }
//   }, [isHovered, imagesToCycle.length]);

//   const handleWishlistClick = () => {
//     setIsWishlisted(!isWishlisted);
//     onAddToWishlist(id);
//   };

//   const getBadgeColor = (type: string) => {
//     switch (type) {
//       case 'bestseller': return 'bg-orange-500 text-white';
//       case 'new': return 'bg-green-500 text-white';
//       case 'vegan': return 'bg-emerald-600 text-white';
//       case 'sale': return 'bg-red-500 text-white';
//       case 'stock': return 'bg-yellow-500 text-black';
//       case 'organic': return 'bg-lime-600 text-white';
//       default: return 'bg-gray-500 text-white';
//     }
//   };

//   return (
//     <Card 
//       className={cn(
//         "group relative overflow-hidden border border-border shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-300 hover:scale-[1.02] bg-card",
//         className
//       )}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Badges */}
//       <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
//         {badges.map((badge, index) => (
//           <Badge 
//             key={index}
//             className={cn(
//               "text-xs font-semibold px-2 py-1 rounded-md shadow-sm",
//               getBadgeColor(badge.type)
//             )}
//           >
//             {badge.text}
//           </Badge>
//         ))}
//         {discountPercentage > 0 && (
//           <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
//             {discountPercentage}% OFF
//           </Badge>
//         )}
//       </div>

//       {/* Quick Actions */}
//       <div className={cn(
//         "absolute top-3 right-3 z-20 flex flex-col gap-2 transition-all duration-300",
//         isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
//       )}>
//         <Button
//           size="icon"
//           variant="secondary"
//           className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white"
//           onClick={handleWishlistClick}
//         >
//           <Heart className={cn("h-4 w-4", isWishlisted ? "fill-red-500 text-red-500" : "")} />
//         </Button>
//         <Button
//           size="icon"
//           variant="secondary"
//           className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white"
//           onClick={() => onQuickView(id)}
//         >
//           <Eye className="h-4 w-4" />
//         </Button>
//       </div>

//       {/* Limited Offer Timer */}
//       {isLimitedOffer && offerEndsAt && (
//         <div className="absolute top-3 right-3 z-20 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
//           <Clock className="h-3 w-3" />
//           Limited Time
//         </div>
//       )}

//       <CardContent className="p-0">
//         {/* Product Image */}
//         <div className="relative aspect-square overflow-hidden bg-muted/20 rounded-t-lg">
//           {currentImage ? (
//             <img
//               src={currentImage}
//               alt={name}
//               className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
//             />
//           ) : (
//             <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
//               <div className="w-12 h-12 mb-3 rounded-full bg-muted-foreground/10 flex items-center justify-center">
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//               <span className="text-sm font-medium">Image coming soon</span>
//             </div>
//           )}
          
          
//           {/* Click areas for next/previous image */}
//           {imagesToCycle.length > 1 && (
//             <>
//               <button
//                 className="absolute left-0 top-0 w-1/2 h-full z-10 opacity-0 hover:opacity-100 bg-gradient-to-r from-black/20 to-transparent transition-opacity"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrentImageIndex((prev) => 
//                     prev === 0 ? imagesToCycle.length - 1 : prev - 1
//                   );
//                 }}
//               >
//                 <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white">
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </div>
//               </button>
//               <button
//                 className="absolute right-0 top-0 w-1/2 h-full z-10 opacity-0 hover:opacity-100 bg-gradient-to-l from-black/20 to-transparent transition-opacity"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrentImageIndex((prev) => 
//                     (prev + 1) % imagesToCycle.length
//                   );
//                 }}
//               >
//                 <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white">
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </div>
//               </button>
//             </>
//           )}
          
//           {/* Quick Add to Cart - Mobile Friendly */}
//           <div className={cn(
//             "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300",
//             isHovered ? "opacity-100" : "opacity-0"
//           )}>
//             <Button 
//               className="w-full bg-white text-black hover:bg-gray-100 font-semibold"
//               onClick={() => onAddToCart(id)}
//             >
//               <ShoppingCart className="h-4 w-4 mr-2" />
//               Add to Cart
//             </Button>
//           </div>
//         </div>

//         {/* Product Info */}
//         <div className="p-4 space-y-3">
//           {/* Brand & Name */}
//           <div>
//             <p className="text-sm text-muted-foreground font-medium">{brand}</p>
//             <h3 className="font-semibold text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors cursor-pointer">
//               {name}
//             </h3>
//           </div>

//           {/* Rating */}
//           <div className="flex items-center gap-2">
//             <div className="flex items-center gap-1">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={cn(
//                     "h-3 w-3",
//                     i < Math.floor(rating) 
//                       ? "fill-yellow-400 text-yellow-400" 
//                       : "text-gray-300"
//                   )}
//                 />
//               ))}
//             </div>
//             <span className="text-sm text-muted-foreground">
//               {rating} ({reviewCount})
//             </span>
//           </div>

//           {/* Pricing - CORRECT: current price bold, original price struck through */}
//           <div className="flex items-center gap-2">
//             {originalPrice && originalPrice !== price ? (
//               <>
//                 <span className="text-lg font-bold text-foreground">{formatPrice(price)}</span>
//                 <span className="text-sm text-muted-foreground line-through">
//                   {formatPrice(originalPrice)}
//                 </span>
//                 <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-semibold">
//                   Save {formatPrice(originalPrice - price)}
//                 </span>
//               </>
//             ) : (
//               <span className="text-lg font-bold text-foreground">{formatPrice(price)}</span>
//             )}
//           </div>

//           {/* Smart Labels */}
//           <div className="flex flex-wrap gap-2 text-xs">
//             {variants && variants > 1 && (
//               <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
//                 +{variants} variants
//               </span>
//             )}
            
//             {stockCount !== undefined && stockCount === 0 ? (
//               <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md font-medium">
//                 Out of Stock
//               </span>
//             ) : stockCount && stockCount <= 5 ? (
//               <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-md font-medium">
//                 Only {stockCount} left
//               </span>
//             ) : stockCount && stockCount > 5 ? (
//               <span className="px-2 py-1 bg-green-100 text-green-600 rounded-md font-medium">
//                 In Stock ({stockCount} available)
//               </span>
//             ) : null}
            
//             <span className="px-2 py-1 bg-green-100 text-green-600 rounded-md font-medium flex items-center gap-1">
//               <Truck className="h-3 w-3" />
//               Ships in {shippingTime}
//             </span>
//           </div>

//           {/* Mobile Add to Cart Button - More prominent */}
//           <div className="block md:hidden pt-3">
//             <Button 
//               className="w-full h-9 text-sm font-medium"
//               onClick={() => onAddToCart(id)}
//             >
//               <ShoppingCart className="h-4 w-4 mr-2" />
//               Add to Cart
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };




// src/components/ModernProductCard.tsx
// src/components/ModernProductCard.tsx
// src/components/ModernProductCard.tsx
// src/components/ModernProductCard.tsx
import { useState } from "react";
import { Eye, Heart, ShoppingCart, Star, Truck } from "lucide-react";
import clsx from "clsx";

export type ProductCardProps = {
  id: string;
  name: string;
  brand?: string;
  price: number;                // current price
  originalPrice?: number;       // MRP
  image: string;
  benefits?: string;            // e.g. "Paraben free, Cruelty free • Dermatologically tested"
  hoverImage?: string;
  rating?: number;              // e.g., 4.5
  reviewCount?: number;         // e.g., 0
  stockCount?: number;          // 0 => Out of Stock
  onAddToCart: (id: string) => void | Promise<void>;
  onAddToWishlist: (id?: string) => void | Promise<void>;
  onQuickView: (id: string) => void | Promise<void>;
  className?: string;
};

const formatINR0 = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

export function ModernProductCard(props: ProductCardProps) {
  const {
    id,
    name,
    brand,
    price,
    originalPrice,
    image,
    benefits,
    hoverImage,
    rating,
    reviewCount,
    stockCount,
    onAddToCart,
    onAddToWishlist,
    onQuickView,
    className,
  } = props;

  const [adding, setAdding] = useState(false);

  const discountPct =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const saveAmt =
    originalPrice && originalPrice > price ? originalPrice - price : 0;

  const inStock = (stockCount ?? 0) > 0;

  // --- SINGLE BENEFIT CHIP ---
  const defaultBenefit = "Korea's Best Choice";
  const benefitLabel = (() => {
    const list = (benefits ?? "")
      .split(/[,|•]/g) // support comma / pipe / bullet separators
      .map((s) => s.trim())
      .filter(Boolean);
    return list[0] || defaultBenefit;
  })();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    try {
      await onAddToCart(id);
    } finally {
      setTimeout(() => setAdding(false), 320);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onAddToWishlist?.(id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(id);
  };

  return (
    <div
      className={clsx(
        "group relative rounded-2xl border bg-white overflow-hidden",
        "transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      {/* IMAGE AREA */}
      <div className="relative aspect-[4/5] bg-white overflow-hidden">
        {/* % OFF chip (top-left) */}
        {discountPct > 0 && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-rose-600 text-white text-xs font-semibold px-2 py-1">
            {discountPct}% OFF
          </span>
        )}

        {/* quick actions (top-right) */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
          <button
            onClick={handleWishlist}
            className="grid h-8 w-8 place-items-center rounded-full border bg-white/95 shadow-sm hover:bg-white transition"
            aria-label="Add to wishlist"
            title="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            onClick={handleQuickView}
            className="grid h-8 w-8 place-items-center rounded-full border bg-white/95 shadow-sm hover:bg-white transition"
            aria-label="Quick view"
            title="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* base image */}
        <img
          src={image}
          alt={name}
          className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {/* hover image fades in */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${name} alternate`}
            className="absolute inset-0 h-full w-full object-contain p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {/* bottom gradient + Add to Cart */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="pointer-events-auto rounded-lg bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow">
            <button
              onClick={handleAddToCart}
              className={clsx(
                "w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg",
                "bg-foreground text-background hover:brightness-95 transition",
                adding && "opacity-90"
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {/* brand then name */}
        {brand && (
          <div className="text-[12px] text-muted-foreground font-medium">
            {brand}
          </div>
        )}
        <div className="mt-0.5 text-[15px] font-semibold leading-snug line-clamp-2">
          {name}
        </div>

        {/* rating row */}
        {typeof rating === "number" && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={clsx(
                    "h-3.5 w-3.5",
                    i < Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {rating.toFixed(1)} ({reviewCount ?? 0})
            </span>
          </div>
        )}

        {/* single benefit chip (below stars or alone if no rating) */}
        <div className={clsx("mt-2")}>
          <span className="rounded-full border bg-sky-50 text-sky-700 border-sky-200 px-2 py-0.5 text-[11px] font-medium">
            {benefitLabel}
          </span>
        </div>

        {/* price + MRP + Save */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xl font-semibold">{formatINR0(price)}</span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="text-sm line-through text-muted-foreground">
                {formatINR0(originalPrice)}
              </span>
              <span className="rounded-full bg-rose-100 text-rose-600 px-2 py-0.5 text-[11px] font-semibold">
                Save {formatINR0(saveAmt)}
              </span>
            </>
          )}
        </div>

        {/* stock + shipping pills */}
        {/* <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              "rounded-full px-2 py-1 text-[11px] border",
              inStock
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            )}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>

          <span className="rounded-full px-2 py-1 text-[11px] border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center">
            <Truck className="h-3.5 w-3.5 mr-1" />
            Ships in 24 hrs
          </span>
        </div> */}
      </div>
    </div>
  );
}
