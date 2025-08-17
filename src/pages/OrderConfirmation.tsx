import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle, Package, Mail, Phone, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { squadcoClient } from '@/integrations/squadco/client';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Get payment reference from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get('reference');
  const trxref = urlParams.get('trxref');

  // Get order data from location state or URL
  const { orderId, orderData } = location.state || {};

  useEffect(() => {
    const verifyPayment = async () => {
      if (reference || trxref) {
        setIsVerifying(true);
        try {
          // Verify payment with Squadco
          const paymentRef = reference || trxref;
          console.log('Starting payment verification with reference:', paymentRef);
          
          const verificationResponse = await squadcoClient.verifyPayment(paymentRef!);
          console.log('Verification response:', verificationResponse);

          if (verificationResponse.status === 'success' && verificationResponse.data) {
            const paymentData = verificationResponse.data;
            console.log('Payment data:', paymentData);

            if (paymentData.status === 'success') {
              setPaymentStatus('success');

              // Update order status in database
              // First check if we have order_id in metadata
              if (paymentData.metadata?.order_id) {
                console.log('Updating order status with ID:', paymentData.metadata.order_id);
                const { error: updateError } = await supabase
                  .from('orders')
                  .update({
                    status: 'paid',
                    payment_status: 'success',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', paymentData.metadata.order_id);
                  
                if (updateError) {
                  console.error('Error updating order status:', updateError);
                }
              } else {
                console.warn('No order_id found in payment metadata');
              }

              toast({
                title: "Payment Successful!",
                description: "Your payment has been processed successfully.",
              });
            } else {
              setPaymentStatus('failed');
              toast({
                title: "Payment Failed",
                description: "Your payment was not successful. Please try again.",
                variant: "destructive",
              });
            }
          } else {
            setPaymentStatus('failed');
            toast({
              title: "Payment Verification Failed",
              description: "Unable to verify payment status. Please contact support.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentStatus('failed');
          toast({
            title: "Payment Verification Error",
            description: "An error occurred while verifying your payment.",
            variant: "destructive",
          });
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyPayment();
  }, [reference, trxref, toast]);

  // Redirect if no order data and no payment reference
  if ((!orderId || !orderData) && !reference && !trxref) {
    navigate('/');
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Payment Status Header */}
            <div className="text-center mb-8">
              {isVerifying ? (
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  </div>
                </div>
              ) : paymentStatus === 'success' ? (
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
              ) : paymentStatus === 'failed' ? (
                <div className="flex justify-center mb-4">
                  <div className="bg-red-100 p-4 rounded-full">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="bg-yellow-100 p-4 rounded-full">
                    <Package className="h-12 w-12 text-yellow-600" />
                  </div>
                </div>
              )}

              <h1 className="text-3xl font-light tracking-wide mb-2">
                {isVerifying ? 'Verifying Payment...' :
                 paymentStatus === 'success' ? 'Payment Successful!' :
                 paymentStatus === 'failed' ? 'Payment Failed' : 'Order Confirmed!'}
              </h1>
              <p className="text-muted-foreground">
                {isVerifying ? 'Please wait while we verify your payment...' :
                 paymentStatus === 'success' ? 'Thank you for your purchase. Your payment has been processed successfully.' :
                 paymentStatus === 'failed' ? 'Your payment was not successful. Please try again or contact support.' :
                 'Thank you for your purchase. Your order has been successfully placed.'}
              </p>
            </div>

            {/* Order Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Number</span>
                  <span className="font-medium">#{orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Date</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={
                    paymentStatus === 'success' ? 'default' :
                    paymentStatus === 'failed' ? 'destructive' :
                    'secondary'
                  }>
                    {paymentStatus === 'success' ? 'Paid' :
                     paymentStatus === 'failed' ? 'Failed' :
                     'Processing'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{orderData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{orderData.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p>{orderData.address}</p>
                          <p>
                            {orderData.city}, {orderData.state} {orderData.zipCode}
                          </p>
                          <p>{orderData.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Confirmation Email</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll receive a confirmation email with your order details shortly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Package className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Order Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll start processing your order and notify you when it ships.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Tracking Information</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll receive tracking information once your order ships.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {paymentStatus === 'success' ? (
                <>
                  <Button
                    onClick={() => navigate('/products')}
                    className="btn-blvck flex-1"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Go Home
                  </Button>
                </>
              ) : paymentStatus === 'failed' ? (
                <>
                  <Button
                    onClick={() => navigate('/cart')}
                    className="btn-blvck flex-1"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Go Home
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/products')}
                    className="btn-blvck flex-1"
                    disabled={isVerifying}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                    disabled={isVerifying}
                  >
                    Go Home
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;