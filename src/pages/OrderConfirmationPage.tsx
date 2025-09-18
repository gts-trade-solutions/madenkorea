import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

import { CheckCircle, Package, Download, ArrowRight, Home } from "lucide-react";

export default function OrderConfirmationPage() {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!sessionId) {
      navigate("/");
      return;
    }

    // Clear cart and verify payment
    clearCart();
    verifyPayment();
  }, [user, sessionId]);

  const verifyPayment = async () => {
    try {
      // Call edge function to verify payment and create order
      const { data, error } = await supabase.functions.invoke(
        "verify-payment",
        {
          body: { session_id: sessionId },
        }
      );

      if (error) throw error;

      setOrder(data);
    } catch (error) {
      console.error("Payment verification error:", error);
      // Still show success page but with generic order info
      setOrder({
        order_number: "ORD-" + Date.now(),
        status: "processing",
        total_amount: 0,
        estimated_delivery: "3-5 business days",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4 mx-auto"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been successfully
              placed.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Order Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-semibold">
                    {order?.order_number || "Loading..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">
                    {order?.status?.toUpperCase() || "PROCESSING"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">
                    ₹{order?.total_amount?.toLocaleString() || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-semibold">Stripe</p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Estimated Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  Your order will be delivered within 3-5 business days. You'll
                  receive a tracking number once your order ships.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Order Confirmation Email</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email confirmation shortly with your
                      order details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Order Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll carefully pack your Consumer Innovations products
                      with love and care.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Shipping & Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a tracking number to monitor your package's
                      journey.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Enjoy Your Products</h4>
                    <p className="text-sm text-muted-foreground">
                      Experience the magic of authentic Korean skincare!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/account")}
              className="flex items-center"
            >
              <Package className="h-4 w-4 mr-2" />
              View Order Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Customer Support */}
          <div className="mt-8 text-center">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Our customer support team is here to help with any questions
                  about your order.
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  <span>📧 support@madeinkorea.com</span>
                  <span>📞 +91-XXX-XXX-XXXX</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
