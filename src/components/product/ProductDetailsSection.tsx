import { useState } from "react";
import { Heart, Share2, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  badges?: string[];
  tags: string[];
  description: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviews: number;
  stockStatus: "In Stock" | "Only X Left" | "Out of Stock";
  stockQuantity?: number;
  variants?: {
    size?: string[];
    color?: string[];
    type?: string[];
    volume?: string[];
    pack?: string[];
  };
  benefits?: string[];
  category: string;
  subCategory?: string;
}

interface ProductDetailsSectionProps {
  product: Product;
  selectedVariant: { size?: string; type?: string; color?: string; volume?: string; pack?: string };
  onVariantChange: (variant: { size?: string; type?: string; color?: string; volume?: string; pack?: string }) => void;
}

export const ProductDetailsSection = ({ product, selectedVariant, onVariantChange }: ProductDetailsSectionProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  
  const getInventoryStatus = () => {
    switch (product.stockStatus) {
      case "In Stock":
        return { text: "In Stock", color: "text-green-600" };
      case "Only X Left":
        const quantity = product.stockQuantity || 1;
        return { text: `Only ${quantity} left!`, color: "text-orange-600" };
      case "Out of Stock":
        return { text: "Out of Stock", color: "text-red-600" };
      default:
        return { text: "Unknown", color: "text-gray-600" };
    }
  };

  const inventoryStatus = getInventoryStatus();

  const handleAddToCart = () => {
    toast.success("Added to cart!", {
      description: `${product.name} (Qty: ${quantity}) added to your cart.`
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing Korean skincare product!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand and Name */}
      <div>
        <div className="text-sm text-muted-foreground mb-2">{product.brand}</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
        
        {/* Badges */}
        {product.badges && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
          <span className="font-semibold ml-2">{product.rating}</span>
        </div>
        <span className="text-muted-foreground">({product.reviews} reviews)</span>
        <button className="text-primary hover:underline text-sm">Write a review</button>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold text-red-600">
            ₹{product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">₹{product.price}</span>
              <Badge className="bg-red-100 text-red-600 text-sm font-bold">
                {discountPercentage}% OFF
              </Badge>
            </>
          )}
        </div>
        {product.discountPrice && (
          <div className="text-sm text-green-600 font-medium">
            You save ₹{product.price - product.discountPrice}
          </div>
        )}
      </div>

      {/* Inventory Status */}
      <div className={`font-semibold ${inventoryStatus.color}`}>
        {inventoryStatus.text}
      </div>

      {/* Variants */}
      {product.variants && (product.variants.size || product.variants.type || product.variants.color || product.variants.volume || product.variants.pack) && (
        <div className="space-y-4">
          {product.variants.size && (
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <Select
                value={selectedVariant.size}
                onValueChange={(value) => onVariantChange({ ...selectedVariant, size: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.size.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {product.variants.type && (
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select
                value={selectedVariant.type}
                onValueChange={(value) => onVariantChange({ ...selectedVariant, type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.type.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {product.variants.color && (
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <Select
                value={selectedVariant.color}
                onValueChange={(value) => onVariantChange({ ...selectedVariant, color: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.color.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {product.variants.volume && (
            <div>
              <label className="block text-sm font-medium mb-2">Volume</label>
              <Select
                value={selectedVariant.volume}
                onValueChange={(value) => onVariantChange({ ...selectedVariant, volume: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select volume" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.volume.map((volume) => (
                    <SelectItem key={volume} value={volume}>
                      {volume}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {product.variants.pack && (
            <div>
              <label className="block text-sm font-medium mb-2">Pack Size</label>
              <Select
                value={selectedVariant.pack}
                onValueChange={(value) => onVariantChange({ ...selectedVariant, pack: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select pack size" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.pack.map((pack) => (
                    <SelectItem key={pack} value={pack}>
                      {pack}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium mb-2">Quantity</label>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="font-semibold px-4">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= (product.stockQuantity || 10)}
          >
            +
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          onClick={handleAddToCart}
          disabled={product.stockStatus === "Out of Stock"}
        >
          Add to Cart - ₹{(product.discountPrice || product.price) * quantity}
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setIsFavorited(!isFavorited);
              toast.success(isFavorited ? "Removed from wishlist" : "Added to wishlist");
            }}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            {isFavorited ? "Favorited" : "Add to Wishlist"}
          </Button>
          
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Key Benefits */}
      {product.benefits && product.benefits.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Key Benefits</h4>
          <ul className="space-y-2">
            {product.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="flex flex-col items-center">
          <Truck className="h-6 w-6 text-primary mb-1" />
          <span className="font-medium">Free Shipping</span>
          <span className="text-xs text-muted-foreground">on ₹1999+</span>
        </div>
        <div className="flex flex-col items-center">
          <Shield className="h-6 w-6 text-primary mb-1" />
          <span className="font-medium">100% Authentic</span>
          <span className="text-xs text-muted-foreground">Guaranteed</span>
        </div>
        <div className="flex flex-col items-center">
          <RotateCcw className="h-6 w-6 text-primary mb-1" />
          <span className="font-medium">Easy Returns</span>
          <span className="text-xs text-muted-foreground">30 days</span>
        </div>
      </div>
    </div>
  );
};