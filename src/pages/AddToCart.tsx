import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartContext } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AddToCart = () => {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount
  } = useCartContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    setIsUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Item Removed",
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

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const subtotal = cartTotal;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
              <div>
                <h1 className="text-3xl font-light tracking-wide">Shopping Cart</h1>
                <p className="text-muted-foreground">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>

            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <ShoppingBag className="h-24 w-24 text-muted-foreground" />
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0"
                >
                  <X className="h-3 w-3" />
                </Badge>
              </div>
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8 text-center max-w-md">
                Looks like you haven't added any items to your cart yet.
                Start shopping to discover our amazing products.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate('/products')}
                  className="btn-blvck"
                >
                  Browse Products
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Go Home
                </Button>
              </div>
            </div>
          ) : (
            /* Cart Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.products.image_url || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop'}
                            alt={item.products.name}
                            className="w-20 h-20 object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1 truncate">
                                {item.products.name}
                              </h3>
                              <p className="text-muted-foreground mb-2">
                                {formatPrice(item.products.price)}
                              </p>

                              {/* Size and Color */}
                              {(item.size || item.color) && (
                                <div className="flex gap-2 text-sm text-muted-foreground mb-3">
                                  {item.size && (
                                    <Badge variant="outline" className="text-xs">
                                      Size: {item.size}
                                    </Badge>
                                  )}
                                  {item.color && (
                                    <Badge variant="outline" className="text-xs">
                                      Color: {item.color}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-destructive hover:text-destructive h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">Quantity:</span>
                              <div className="flex items-center border border-border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                  disabled={isUpdating === item.id}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="px-3 py-1 text-center min-w-[2rem] text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                  disabled={isUpdating === item.id}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-medium">
                                {formatPrice(item.products.price * item.quantity)}
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
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({cartCount} items)</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>
                          {shipping === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-medium">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    {shipping > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Add {formatPrice(100 - subtotal)} more for free shipping
                      </div>
                    )}

                    {/* Checkout Button */}
                    <Button
                      className="w-full btn-blvck"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>

                    {/* Continue Shopping */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/products')}
                    >
                      Continue Shopping
                    </Button>

                    {/* Trust Indicators */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>Free shipping on orders over $100</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RotateCcw className="h-4 w-4" />
                        <span>30-day return policy</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Secure checkout</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddToCart;