import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModernProductCard } from "../ModernProductCard";

export const DynamicImageDemo = () => {
  // Demo product with 4 images
  const demoProduct = {
    id: "demo-4-images",
    name: "Korean Glow Essence Set",
    brand: "BEAUTY OF JOSEON",
    price: 2599,
    originalPrice: 3299,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600",
    allImages: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600", 
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600"
    ],
    rating: 4.8,
    reviewCount: 1247,
    badges: [
      { text: "TRENDING", type: 'new' as const },
      { text: "BESTSELLER", type: 'bestseller' as const }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🎯 Dynamic 4-Image Product Showcase</span>
            <Badge variant="outline">Live Demo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Demo Product Card */}
            <div className="space-y-4">
              <h3 className="font-semibold">Product with 4 Dynamic Images:</h3>
              <ModernProductCard
                id={demoProduct.id}
                name={demoProduct.name}
                brand={demoProduct.brand}
                price={demoProduct.price}
                originalPrice={demoProduct.originalPrice}
                image={demoProduct.image}
                allImages={demoProduct.allImages}
                rating={demoProduct.rating}
                reviewCount={demoProduct.reviewCount}
                badges={demoProduct.badges}
                onAddToCart={() => {}}
                onAddToWishlist={() => {}}
                onQuickView={() => {}}
              />
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <h3 className="font-semibold">Dynamic Image Features:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Automatic Cycling</h4>
                    <p className="text-sm text-muted-foreground">Images change every 4 seconds automatically</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Manual Navigation</h4>
                    <p className="text-sm text-muted-foreground">Click image indicators or left/right areas to navigate</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Hover Pause</h4>
                    <p className="text-sm text-muted-foreground">Auto-cycling pauses when hovering over product</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Visual Indicators</h4>
                    <p className="text-sm text-muted-foreground">Dots show current image and total count</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Smooth Transitions</h4>
                    <p className="text-sm text-muted-foreground">Fade transitions between images with hover zoom</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Try It Out:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Hover over the product card</li>
                  <li>• Click the dots at the bottom</li>
                  <li>• Click left/right sides of image</li>
                  <li>• Watch auto-cycling resume</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};