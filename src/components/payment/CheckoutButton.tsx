import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';

interface CheckoutItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CheckoutButtonProps {
  items: CheckoutItem[];
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  customerInfo?: {
    email?: string;
    name?: string;
  };
  shippingAddress?: any;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export default function CheckoutButton({
  items,
  className,
  variant = "default",
  size = "default",
  customerInfo,
  shippingAddress,
  onSuccess,
  children
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!items || items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("[CHECKOUT] Starting checkout process for items:", items);

      // Calculate total for display
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      console.log("[CHECKOUT] Total amount:", total);

      // Call checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items,
          customer_info: customerInfo,
          shipping_address: shippingAddress,
        },
      });

      if (error) {
        console.error("[CHECKOUT] Edge function error:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }

      if (!data?.url) {
        throw new Error("No checkout URL received");
      }

      console.log("[CHECKOUT] Checkout session created, redirecting to:", data.url);

      // Redirect to Stripe Checkout
      window.open(data.url, '_blank');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      toast({
        title: "Redirecting to Payment",
        description: "Opening Stripe checkout in a new tab...",
      });

    } catch (error) {
      console.error("[CHECKOUT] Error:", error);
      
      let errorMessage = "Payment processing failed. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("not configured")) {
          errorMessage = "Payment system is being set up. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Checkout Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total for display
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || items.length === 0}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {children || (
        <>
          {isLoading ? "Processing..." : "Checkout"} 
          {total > 0 && (
            <span className="ml-2">
              {formatPrice(total)} ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          )}
        </>
      )}
    </Button>
  );
}