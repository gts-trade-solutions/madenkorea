import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface RelatedProductsSectionProps {
  category: string;
  currentProductId: number;
}

// Mock related products data
const getRelatedProducts = (category: string, currentProductId: number) => {
  const allProducts = [
    {
      id: 2,
      name: "INNISFREE Green Tea Seed Serum",
      brand: "INNISFREE",
      price: 979,
      originalPrice: 1299,
      image: "/placeholder.svg",
      rating: 4.6,
      category: "serum"
    },
    {
      id: 3,
      name: "LANEIGE Water Bank Blue Hyaluronic Cream",
      brand: "LANEIGE", 
      price: 2199,
      originalPrice: 2899,
      image: "/placeholder.svg",
      rating: 4.9,
      category: "moisturizer"
    },
    {
      id: 4,
      name: "ETUDE HOUSE SoonJung pH 6.5 Whip Cleanser",
      brand: "ETUDE HOUSE",
      price: 679,
      originalPrice: 899,
      image: "/placeholder.svg",
      rating: 4.7,
      category: "cleanser"
    },
    {
      id: 5,
      name: "THE ORDINARY Niacinamide 10% + Zinc 1%",
      brand: "THE ORDINARY",
      price: 449,
      originalPrice: 599,
      image: "/placeholder.svg",
      rating: 4.5,
      category: "serum"
    },
    {
      id: 6,
      name: "BEAUTY OF JOSEON Glow Deep Serum",
      brand: "BEAUTY OF JOSEON",
      price: 899,
      originalPrice: 1199,
      image: "/placeholder.svg",
      rating: 4.8,
      category: "serum"
    },
    {
      id: 9,
      name: "PURITO Centella Unscented Serum",
      brand: "PURITO",
      price: 1099,
      originalPrice: 1399,
      image: "/placeholder.svg",
      rating: 4.7,
      category: "serum"
    }
  ];

  // Filter products by category and exclude current product
  return allProducts
    .filter(product => product.category === category && product.id !== currentProductId)
    .slice(0, 4);
};

export const RelatedProductsSection = ({ category, currentProductId }: RelatedProductsSectionProps) => {
  const navigate = useNavigate();
  const relatedProducts = getRelatedProducts(category, currentProductId);

  if (relatedProducts.length === 0) return null;

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    // Scroll to top when navigating to new product
    window.scrollTo(0, 0);
  };

  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">You Might Also Like</h3>
        <p className="text-muted-foreground">
          Similar products that complement your skincare routine
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          
          return (
            <div
              key={product.id}
              className="group cursor-pointer border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="aspect-square bg-gray-50 p-4 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg bg-white"
                />
                
                {/* Brand badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.brand}
                  </Badge>
                </div>
                
                {/* Discount badge */}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500 text-white text-xs">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
                
                {/* Rating */}
                <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-xs font-bold">{product.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-sm mb-2 leading-tight line-clamp-2">
                  {product.name}
                </h4>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-primary">₹{product.price}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to cart functionality
                    console.log("Add to cart:", product.id);
                  }}
                >
                  Quick Add
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center mt-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
        >
          View All Products
        </Button>
      </div>
    </div>
  );
};