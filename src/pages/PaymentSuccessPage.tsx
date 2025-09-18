import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Package,
  CreditCard,
  Home,
  Receipt,
  ArrowRight,
  Loader2,
  Mail,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { Footer } from "@/components/Footer";

interface PaymentDetails {
  session_id: string;
  payment_status: string;
  customer_email?: string;
  amount_total?: number;
  currency?: string;
  created?: number;
}

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setError("No payment session found");
      setIsLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log(
        "[PAYMENT-SUCCESS] Verifying payment for session:",
        sessionId
      );

      const { data, error } = await supabase.functions.invoke(
        "verify-payment",
        {
          body: { session_id: sessionId },
        }
      );

      if (error) {
        console.error("[PAYMENT-SUCCESS] Verification error:", error);
        throw new Error(error.message || "Payment verification failed");
      }

      console.log("[PAYMENT-SUCCESS] Payment verified:", data);
      setPaymentDetails(data);

      if (data.payment_status === "paid") {
        toast({
          title: "Payment Successful! 🎉",
          description:
            "Your order has been confirmed and will be processed shortly.",
        });
      }
    } catch (error) {
      console.error("[PAYMENT-SUCCESS] Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to verify payment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">
                Verifying your payment...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your order
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="border-destructive">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-destructive">
                  Payment Verification Failed
                </CardTitle>
                <CardDescription>
                  {error ||
                    "We couldn't verify your payment. Please contact support."}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Button asChild variant="outline">
                  <Link to="/cart">Return to Cart</Link>
                </Button>
                <Button asChild>
                  <Link to="/">Go to Homepage</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaymentSuccessful = paymentDetails.payment_status === "paid";
  const amount = paymentDetails.amount_total
    ? paymentDetails.amount_total / 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div
              className={`mx-auto mb-6 h-16 w-16 rounded-full flex items-center justify-center ${
                isPaymentSuccessful ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <CheckCircle
                className={`h-8 w-8 ${
                  isPaymentSuccessful ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>

            <h1 className="text-3xl font-bold mb-2">
              {isPaymentSuccessful ? "Payment Successful!" : "Payment Failed"}
            </h1>

            <p className="text-lg text-muted-foreground">
              {isPaymentSuccessful
                ? "Thank you for your purchase. Your order has been confirmed."
                : "There was an issue processing your payment. Please try again."}
            </p>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={isPaymentSuccessful ? "default" : "destructive"}
                  >
                    {paymentDetails.payment_status.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Amount
                  </p>
                  <p className="text-lg font-semibold">
                    ₹{amount.toLocaleString()}{" "}
                    {paymentDetails.currency?.toUpperCase()}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Session ID
                  </p>
                  <p className="text-sm font-mono">
                    {paymentDetails.session_id}
                  </p>
                </div>

                {paymentDetails.customer_email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {paymentDetails.customer_email}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {isPaymentSuccessful && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive an email confirmation with your order
                        details shortly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Processing & Packaging</p>
                      <p className="text-sm text-muted-foreground">
                        Your Consumer Innovations products will be carefully
                        packaged within 1-2 business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Shipping & Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        We'll send you tracking information once your order
                        ships.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>

            {isPaymentSuccessful && (
              <Button asChild variant="outline" size="lg">
                <Link to="/account">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Orders
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
