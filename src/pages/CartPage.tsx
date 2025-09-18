import { TopNavigation } from "@/components/TopNavigation";
import { useState, useEffect } from "react";
import CheckoutButton from "@/components/payment/CheckoutButton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Mock product data - in real app, fetch from your product API
const mockProducts = {
  "1": {
    id: "1",
    name: "COSRX Advanced Snail 92 All In One Cream",
    brand: "COSRX",
    price: 1199,
    originalPrice: 1599,
    image: "/placeholder.svg",
    variant: "50ml",
  },
  "2": {
    id: "2",
    name: "INNISFREE Green Tea Seed Serum",
    brand: "INNISFREE",
    price: 979,
    originalPrice: 1299,
    image: "/placeholder.svg",
    variant: "30ml",
  },
  "3": {
    id: "3",
    name: "LANEIGE Water Bank Blue Hyaluronic Cream",
    brand: "LANEIGE",
    price: 2199,
    originalPrice: 2899,
    image: "/placeholder.svg",
    variant: "50ml",
  },
};

export default function CartPage() {
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [savings, setSavings] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  useEffect(() => {
    console.log("Cart items from hook:", items);

    const fetchProductDetails = async () => {
      if (items.length === 0) {
        setCartItems([]);
        return;
      }

      // Fetch actual product details from database
      const productIds = items.map((item) => item.product_id);
      console.log("Fetching product details for:", productIds);

      const { data: productsData, error } = await supabase
        .from("products")
        .select(
          "product_id, name, brand, selling_price, cost_price, stock_quantity"
        )
        .in("product_id", productIds);

      console.log("Products data from DB:", productsData);

      // Fetch product media
      const { data: mediaData, error: mediaError } = await supabase
        .from("product_media")
        .select("product_id, media_url, is_primary")
        .in("product_id", productIds)
        .eq("is_primary", true);

      console.log("Media data from DB:", mediaData);

      // Enhance cart items with actual product details
      const enhancedItems = items.map((item) => {
        console.log("Processing cart item:", item);

        // Find the actual product data
        const productData = productsData?.find(
          (p) => p.product_id === item.product_id
        );
        const productImage = mediaData?.find(
          (m) => m.product_id === item.product_id
        )?.media_url;

        // Use actual product data or fallback to mock data
        const product = productData
          ? {
              id: item.product_id,
              name: productData.name,
              brand: productData.brand,
              price: parseInt(
                String(productData.selling_price || productData.cost_price)
              ),
              originalPrice: parseInt(String(productData.cost_price)) * 1.3,
              image: productImage || "/placeholder.svg",
              variant: "50ml",
            }
          : mockProducts[item.product_id as keyof typeof mockProducts] || {
              id: item.product_id,
              name: item.productName || `Product ${item.product_id.slice(-8)}`,
              brand: "Consumer Innovations",
              price: parseInt(item.productPrice) || 1199,
              originalPrice: parseInt(item.productPrice) * 1.3 || 1599,
              image: item.productImage || "/placeholder.svg",
              variant: "50ml",
            };

        const enhancedItem = {
          ...item,
          ...product,
          // Keep the cart item's UUID as id, not the product_id
          id: item.id, // This should be the UUID from cart_items table
          totalPrice: product.price * item.quantity,
          totalOriginalPrice: product.originalPrice * item.quantity,
        };

        console.log("Enhanced cart item:", enhancedItem);
        return enhancedItem;
      });

      setCartItems(enhancedItems);

      // Calculate totals
      const newSubtotal = enhancedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const originalTotal = enhancedItems.reduce(
        (sum, item) => sum + item.totalOriginalPrice,
        0
      );

      setSubtotal(newSubtotal);
      setSavings(originalTotal - newSubtotal);

      // Calculate estimated delivery (3-5 business days from now)
      const today = new Date();
      const deliveryStart = new Date(today);
      deliveryStart.setDate(today.getDate() + 3);
      const deliveryEnd = new Date(today);
      deliveryEnd.setDate(today.getDate() + 5);

      setEstimatedDelivery(
        `${deliveryStart.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        })} - ${deliveryEnd.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        })}`
      );
    };

    fetchProductDetails();
  }, [items]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    console.log("handleQuantityChange called:", { itemId, newQuantity });
    try {
      if (newQuantity < 1) {
        console.log("Removing item from cart:", itemId);
        await removeFromCart(itemId);
      } else {
        console.log("Updating quantity:", { itemId, newQuantity });
        await updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      console.error("Error in handleQuantityChange:", error);
    }
  };

  const getShippingCost = () => {
    // Free shipping over ₹1999
    return subtotal >= 1999 ? 0 : 99;
  };

  const getTotalAmount = () => {
    return subtotal + getShippingCost();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
          </div>

          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Discover amazing Consumer Innovations products and add them to
              your cart
            </p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={`cart-${item.id}-${item.quantity}`}>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base lg:text-lg leading-tight truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.brand}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.variant}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 flex-shrink-0"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Mobile-first layout: Stack on mobile, side-by-side on larger screens */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price Section */}
                        <div className="text-right sm:text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="font-semibold text-base lg:text-lg">
                              {formatPrice(item.totalPrice)}
                            </span>
                            {item.totalOriginalPrice > item.totalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.totalOriginalPrice)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Save</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  {getShippingCost() === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>{formatPrice(getShippingCost())}</span>
                  )}
                </div>

                {subtotal < 1999 && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    Add {formatPrice(1999 - subtotal)} more for FREE shipping!
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(getTotalAmount())}</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Estimated Delivery: {estimatedDelivery}</p>
                  <p className="mt-1">Ships within 1-2 business days</p>
                </div>

                <div className="space-y-4">
                  <CheckoutButton
                    items={cartItems.map((item) => ({
                      product_id: item.product_id || item.id,
                      name: item.name || "Consumer Innovations Product",
                      price: item.price || 1199,
                      quantity: item.quantity,
                      image_url: item.image,
                    }))}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  />
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    size="lg"
                    onClick={() => navigate("/")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security & Trust Badges */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  {/* <h4 className="font-medium">Secure Checkout</h4> */}
                  <div className="flex justify-center space-x-2 text-xs text-muted-foreground">
                    <span>🔒 SSL Secured</span>
                    <span>•</span>
                    <span>💳 Stripe Protected</span>
                  </div>
                  <div className="flex justify-center space-x-2 text-xs text-muted-foreground">
                    <span>📦 Easy Returns</span>
                    <span>•</span>
                    <span>🚚 Fast Delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
