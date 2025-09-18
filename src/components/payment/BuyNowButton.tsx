import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';

interface Product {
  product_id: string;
  name: string;
  selling_price?: number;
  cost_price: number;
  image_url?: string;
}

interface BuyNowButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function BuyNowButton({
  product,
  quantity = 1,
  className,
  variant = "default",
  size = "default"
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBuyNow = async () => {
    setIsLoading(true);

    try {
      console.log("[BUY-NOW] Starting immediate checkout for product:", product.name);

      const price = product.selling_price || product.cost_price;
      const checkoutItem = {
        product_id: product.product_id,
        name: product.name,
        price: price,
        quantity: quantity,
        image_url: product.image_url,
      };

      // Call checkout edge function directly
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: [checkoutItem],
        },
      });

      if (error) {
        console.error("[BUY-NOW] Edge function error:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }

      if (!data?.url) {
        throw new Error("No checkout URL received");
      }

      console.log("[BUY-NOW] Checkout session created, redirecting to:", data.url);

      // Redirect to Stripe Checkout in new tab
      window.open(data.url, '_blank');

      toast({
        title: "Redirecting to Payment",
        description: "Opening Stripe checkout in a new tab...",
      });

    } catch (error) {
      console.error("[BUY-NOW] Error:", error);
      
      let errorMessage = "Purchase failed. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("not configured")) {
          errorMessage = "Payment system is being set up. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const price = product.selling_price || product.cost_price;
  const total = price * quantity;

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <ShoppingBag className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Processing..." : `Buy Now - ${formatPrice(total)}`}
    </Button>
  );
}