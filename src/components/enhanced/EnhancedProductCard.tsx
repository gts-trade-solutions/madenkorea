import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, Heart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  tags?: string[];
  stockStatus: "In Stock" | "Only X Left" | "Out of Stock";
  stockQuantity?: number;
}

interface EnhancedProductCardProps {
  product: Product;
  size?: "small" | "medium" | "large";
  showQuickActions?: boolean;
  showBadges?: boolean;
  className?: string;
}

export const EnhancedProductCard = ({ 
  product, 
  size = "medium",
  showQuickActions = true,
  showBadges = true,
  className = ""
}: EnhancedProductCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const getStockBadge = () => {
    switch (product.stockStatus) {
      case "In Stock":
        return <Badge className="bg-green-100 text-green-700">In Stock</Badge>;
      case "Only X Left":
        return <Badge className="bg-orange-100 text-orange-700">Only {product.stockQuantity} left!</Badge>;
      case "Out of Stock":
        return <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  const sizeClasses = {
    small: "w-64",
    medium: "w-80", 
    large: "w-96"
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.brand} product!`,
        url: `/product/${product.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <Card 
      className={`${sizeClasses[size]} group cursor-pointer transition-all duration-300 border border-border shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1 bg-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Badges */}
          {showBadges && (
            <div className="absolute top-3 left-3 space-y-1">
              {discountPercentage > 0 && (
                <Badge className="bg-red-500 text-white font-bold">
                  {discountPercentage}% OFF
                </Badge>
              )}
              {product.tags && product.tags.includes("new") && (
                <Badge className="bg-blue-500 text-white">New</Badge>
              )}
              {product.tags && product.tags.includes("bestseller") && (
                <Badge className="bg-yellow-500 text-white">Bestseller</Badge>
              )}
            </div>
          )}

          {/* Stock Status */}
          <div className="absolute top-3 right-3">
            {getStockBadge()}
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <Button
                size="sm"
                onClick={handleQuickAdd}
                disabled={product.stockStatus === "Out of Stock"}
                className="bg-white text-black hover:bg-gray-100"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleWishlist}
                className="bg-white/90 hover:bg-white"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="bg-white/90 hover:bg-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Brand */}
          <div className="text-sm font-medium text-primary">{product.brand}</div>

          {/* Product Name */}
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-600">
                ₹{product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.price}
                </span>
              )}
            </div>
            {product.discountPrice && (
              <div className="text-xs text-green-600 font-medium">
                You save ₹{product.price - product.discountPrice}
              </div>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};