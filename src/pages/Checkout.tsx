import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartContext } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { squadcoClient, SQUADCO_CONFIG } from '@/integrations/squadco/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Form validation schema
const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter your complete address'),
  city: z.string().min(2, 'Please enter your city'),
  state: z.string().min(2, 'Please enter your state'),
  zipCode: z.string().min(5, 'Please enter a valid ZIP code'),
  country: z.string().min(2, 'Please select your country').default('Nigeria'),
  paymentMethod: z.enum(['squadco']),
  specialInstructions: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart } = useCartContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no items in cart
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'Nigeria',
      paymentMethod: 'squadco',
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const subtotal = cartTotal;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      console.log('Starting checkout process...');
      
      // Skip the table check and proceed directly to creating the order
      // If the table doesn't exist, the insert will fail and we'll catch the error
      
      // Create order in database first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: `${data.firstName} ${data.lastName}`,
          customer_email: data.email,
          customer_phone: data.phone,
          shipping_address: data.address,
          shipping_city: data.city,
          shipping_state: data.state,
          shipping_zip_code: data.zipCode,
          shipping_country: data.country,
          payment_method: 'squadco',
          special_instructions: data.specialInstructions || null,
          subtotal: subtotal,
          shipping_cost: shipping,
          tax_amount: tax,
          total_amount: total,
          status: 'pending',
          items: cartItems.map(item => ({
            product_id: item.product_id,
            product_name: item.products.name,
            quantity: item.quantity,
            price: item.products.price,
            size: item.size,
            color: item.color,
          })),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Initialize Squadco payment
      const paymentReference = squadcoClient.generateReference();

      const paymentData = {
        amount: total,
        email: data.email,
        reference: paymentReference,
        callback_url: `${window.location.origin}/order-confirmation`,
        metadata: {
          order_id: order.id,
          customer_name: `${data.firstName} ${data.lastName}`,
          items: cartItems.map(item => ({
            name: item.products.name,
            quantity: item.quantity,
            price: item.products.price,
          })),
        },
      };

      console.log('Initiating payment with Squadco...');
      const paymentResponse = await squadcoClient.initializePayment(paymentData);
      console.log('Payment response:', paymentResponse);

      if (paymentResponse.status === 'success' && paymentResponse.data) {
        // Store payment reference in order for verification
        console.log('Updating order with payment reference...');
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_reference: paymentReference,
            payment_url: paymentResponse.data.authorization_url
          })
          .eq('id', order.id);
          
        if (updateError) {
          console.error('Error updating order with payment reference:', updateError);
          throw new Error(`Failed to update order with payment reference: ${updateError.message}`);
        }

        console.log('Redirecting to payment page:', paymentResponse.data.authorization_url);
        // Redirect to Squadco payment page
        window.location.href = paymentResponse.data.authorization_url;
      } else {
        throw new Error(paymentResponse.message || 'Failed to initialize payment');
      }

    } catch (error) {
      console.error('Error processing checkout:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        data: error
      });
      
      let errorMessage = `Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Check if it's a database relation error
      if (error instanceof Error && error.message.includes('relation "public.orders" does not exist')) {
        errorMessage = 'Database setup incomplete. Please contact the administrator to set up the orders table.';
        console.log('The orders table does not exist in the database. Please run the migration script to create it.');
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
            <div>
              <h1 className="text-3xl font-light tracking-wide">Checkout</h1>
              <p className="text-muted-foreground">
                Complete your purchase
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Textarea
                        id="address"
                        {...register('address')}
                        className={errors.address ? 'border-red-500' : ''}
                        placeholder="Enter your complete street address"
                      />
                      {errors.address && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...register('city')}
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province *</Label>
                        <Input
                          id="state"
                          {...register('state')}
                          className={errors.state ? 'border-red-500' : ''}
                        />
                        {errors.state && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                        <Input
                          id="zipCode"
                          {...register('zipCode')}
                          className={errors.zipCode ? 'border-red-500' : ''}
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.zipCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={watch('country')}
                        onValueChange={(value) => setValue('country', value)}
                      >
                        <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="paymentMethod">Select Payment Method *</Label>
                      <Select
                        value={watch('paymentMethod')}
                        onValueChange={(value) => setValue('paymentMethod', value as any)}
                      >
                        <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="squadco">Squadco Payment Gateway</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.paymentMethod && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.paymentMethod.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                      <Textarea
                        id="specialInstructions"
                        {...register('specialInstructions')}
                        placeholder="Any special delivery instructions or notes..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="btn-blvck px-8"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.products.name}</p>
                          <p className="text-muted-foreground">
                            Qty: {item.quantity}
                            {item.size && ` | Size: ${item.size}`}
                            {item.color && ` | Color: ${item.color}`}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.products.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
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
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-medium">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      <span>Free shipping on orders over $100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;