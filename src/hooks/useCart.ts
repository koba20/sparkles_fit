import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
}

const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const { toast } = useToast();

  // Initialize session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem('cart_session_id');
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem('cart_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  const fetchCartItems = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        `);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log('Fetched cart items:', data);
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = async (productId: string, quantity: number = 1, size?: string, color?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Check if item already exists in cart
      const existingItem = cartItems.find(item =>
        item.product_id === productId &&
        item.size === (size || null) &&
        item.color === (color || null)
      );

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user?.id || null,
            session_id: user ? null : sessionId,
            product_id: productId,
            quantity,
            size: size || null,
            color: color || null,
          });

        if (error) throw error;
      }

      await fetchCartItems();
      console.log('Cart updated successfully:', { productId, quantity, size, color });
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      await fetchCartItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchCartItems();
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase.from('cart_items').delete();

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { error } = await query;
      if (error) throw error;

      await fetchCartItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    }
  };

  const cartTotal = cartItems.reduce((total, item) =>
    total + (item.products.price * item.quantity), 0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    refetch: fetchCartItems,
  };
};