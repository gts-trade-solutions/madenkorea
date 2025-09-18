import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface FrequentlyBoughtTogetherProps {
  productId: number;
}

// Mock data for frequently bought together products
const getBundleProducts = (productId: number) => {
  const bundles = {
    1: [
      {
        id: 1,
        name: "COSRX Advanced Snail 92 All In One Cream",
        price: 1199,
        image: "/placeholder.svg",
        selected: true,
        disabled: true // Current product
      },
      {
        id: 7,
        name: "COSRX Snail 96 Mucin Power Essence",
        price: 1499,
        image: "/placeholder.svg",
        selected: true,
        disabled: false
      },
      {
        id: 8,
        name: "COSRX Low pH Good Morning Gel Cleanser",
        price: 799,
        image: "/placeholder.svg",
        selected: true,
        disabled: false
      }
    ]
  };
  
  return bundles[productId as keyof typeof bundles] || [];
};

export const FrequentlyBoughtTogether = ({ productId }: FrequentlyBoughtTogetherProps) => {
  const bundleProducts = getBundleProducts(productId);
  const [selectedProducts, setSelectedProducts] = useState(
    bundleProducts.reduce((acc, product) => ({
      ...acc,
      [product.id]: product.selected
    }), {})
  );

  if (bundleProducts.length === 0) return null;

  const handleProductToggle = (productId: number) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId as keyof typeof prev]
    }));
  };

  const selectedItems = bundleProducts.filter(product => 
    selectedProducts[product.id as keyof typeof selectedProducts]
  );

  const totalPrice = selectedItems.reduce((sum, product) => sum + product.price, 0);
  const originalTotalPrice = bundleProducts.reduce((sum, product) => sum + product.price, 0);
  const savings = originalTotalPrice - totalPrice;

  const handleAddBundle = () => {
    const selectedProductNames = selectedItems.map(p => p.name).join(", ");
    toast.success("Bundle added to cart!", {
      description: `Added ${selectedItems.length} products to your cart.`
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-16">
      <h3 className="text-2xl font-bold mb-6 text-center">Frequently Bought Together</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Products */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {bundleProducts.map((product, index) => (
              <div key={product.id} className="flex items-center">
                <div className="relative">
                  <div className={`bg-white rounded-lg p-4 border-2 transition-all ${
                    selectedProducts[product.id as keyof typeof selectedProducts] 
                      ? "border-primary shadow-md" 
                      : "border-gray-200"
                  }`}>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                        />
                        {!product.disabled && (
                          <div className="absolute -top-2 -right-2">
                            <Checkbox
                              checked={selectedProducts[product.id as keyof typeof selectedProducts]}
                              onCheckedChange={() => handleProductToggle(product.id)}
                              className="bg-white"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <h4 className="font-medium text-sm leading-tight mb-1 max-w-32">
                          {product.name.length > 40 
                            ? `${product.name.substring(0, 40)}...` 
                            : product.name
                          }
                        </h4>
                        <p className="font-bold text-primary">₹{product.price}</p>
                      </div>
                    </div>
                  </div>
                  
                  {product.disabled && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Current
                    </div>
                  )}
                </div>
                
                {index < bundleProducts.length - 1 && (
                  <Plus className="h-6 w-6 text-gray-400 mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bundle Summary */}
        <div className="bg-white rounded-lg p-6 border border-border">
          <div className="text-center space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Bundle Price</div>
              <div className="text-2xl font-bold text-primary">₹{totalPrice}</div>
              {savings > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  Save ₹{savings}
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              onClick={handleAddBundle}
              disabled={selectedItems.length === 0}
            >
              Add Bundle to Cart
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Free shipping on this bundle
            </div>
          </div>
        </div>
      </div>
      
      {/* Bundle Benefits */}
      <div className="mt-6 text-center">
        <h4 className="font-semibold mb-3">Bundle Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Complete skincare routine</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Better results together</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Free shipping included</span>
          </div>
        </div>
      </div>
    </div>
  );
};