import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  variant_data?: any;
  productName?: string;
  productPrice?: string;
  productImage?: string;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number, variantData?: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Generate session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Load cart items
  const loadCartItems = async () => {
    try {
      let query = supabase.from('cart_items').select('*');
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setItems(data || []);
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartItems();
  }, [user]);

  const addToCart = async (productId: string, quantity = 1, variantData?: any) => {
    console.log('=== ADD TO CART CALLED ===');
    console.log('Product ID:', productId);
    console.log('Quantity:', quantity);
    console.log('Variant Data:', variantData);
    console.log('User:', user);
    console.log('Session ID would be:', getSessionId());
    
    try {
      const cartData = {
        product_id: productId,
        quantity,
        variant_data: variantData,
        ...(user ? { user_id: user.id } : { session_id: getSessionId() })
      };

      console.log('Cart data to insert:', cartData);

      const { error } = await supabase
        .from('cart_items')
        .insert(cartData);

      console.log('Supabase insert result:', { error });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Cart insert successful, reloading items...');
      await loadCartItems();
      
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart.",
      });
    } catch (error: any) {
      console.error('addToCart error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    console.log('removeFromCart called with:', itemId);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      await loadCartItems();
      
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error: any) {
      console.error('removeFromCart error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    console.log('updateQuantity called with:', { itemId, quantity });
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      await loadCartItems();
    } catch (error: any) {
      console.error('updateQuantity error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      let query = supabase.from('cart_items').delete();
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { error } = await query;

      if (error) throw error;

      setItems([]);
      
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};