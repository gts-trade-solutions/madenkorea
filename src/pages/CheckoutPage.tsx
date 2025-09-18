import { TopNavigation } from '@/components/TopNavigation';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard, Truck, MapPin, Plus } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [gstInvoice, setGstInvoice] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Mock product data
  const mockProducts = {
    "1": { name: "COSRX Advanced Snail 92 All In One Cream", price: 1199, originalPrice: 1599 },
    "2": { name: "INNISFREE Green Tea Seed Serum", price: 979, originalPrice: 1299 },
    "3": { name: "LANEIGE Water Bank Blue Hyaluronic Cream", price: 2199, originalPrice: 2899 }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    loadAddresses();
  }, [user, items]);

  const loadAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      
      // Auto-select default address
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateOrderTotal = () => {
    const subtotal = items.reduce((sum, item) => {
      const product = mockProducts[item.product_id as keyof typeof mockProducts];
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const shippingCost = subtotal >= 1999 ? 0 : 99;
    const discountAmount = (subtotal * discount) / 100;
    
    return {
      subtotal,
      shippingCost,
      discountAmount,
      total: subtotal + shippingCost - discountAmount
    };
  };

  const applyCoupon = () => {
    // Mock coupon logic
    const validCoupons = {
      'WELCOME10': 10,
      'SAVE15': 15,
      'NEWUSER': 20
    };

    const discountPercent = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];
    
    if (discountPercent) {
      setDiscount(discountPercent);
      toast({
        title: "Coupon Applied!",
        description: `${discountPercent}% discount applied to your order.`,
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "Please check your coupon code and try again.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a shipping address.",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: mockProducts[item.product_id as keyof typeof mockProducts]?.price || 0
          })),
          shipping_address_id: selectedAddress,
          shipping_method: shippingMethod,
          gst_invoice: gstInvoice,
          coupon_code: couponCode,
          discount: discount
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const orderSummary = calculateOrderTotal();

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                1
              </div>
              <span className="font-medium">Shipping</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                2
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              // Shipping Step
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Shipping Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No saved addresses found</p>
                        <Button onClick={() => navigate('/account')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Address
                        </Button>
                      </div>
                    ) : (
                      <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                        {addresses.map((address) => (
                          <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Label htmlFor={address.id} className="font-medium">
                                  {address.name}
                                </Label>
                                {address.is_default && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.street_address}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} {address.postal_code}
                              </p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Truck className="h-5 w-5" />
                      <span>Shipping Method</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <div>
                            <Label htmlFor="standard" className="font-medium">Standard Delivery</Label>
                            <p className="text-sm text-muted-foreground">3-5 business days</p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {orderSummary.subtotal >= 1999 ? 'FREE' : '₹99'}
                        </span>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gst-invoice"
                        checked={gstInvoice}
                        onCheckedChange={(checked) => setGstInvoice(checked as boolean)}
                      />
                      <Label htmlFor="gst-invoice">
                        I need a GST invoice (for business purchases)
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!selectedAddress}
                    className="min-w-[200px]"
                  >
                    Continue to Payment
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              // Payment Step
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Method</span>
                    </CardTitle>
                    <CardDescription>
                      Secure payment powered by Stripe. We accept all major cards, UPI, and digital wallets.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Payment will be processed securely via Stripe</p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span>💳 Visa/Mastercard</span>
                        <span>•</span>
                        <span>📱 UPI</span>
                        <span>•</span>
                        <span>💰 Digital Wallets</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Coupon Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={applyCoupon}>
                        Apply
                      </Button>
                    </div>
                    {discount > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        {discount}% discount applied!
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. 
                        I understand that payment will be processed in INR and settled in KRW via Stripe's cross-border payment system.
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Shipping
                  </Button>
                  <Button 
                    onClick={handlePayment}
                    disabled={!termsAccepted || loading}
                    className="min-w-[200px]"
                  >
                    {loading ? "Processing..." : `Pay ₹${orderSummary.total.toLocaleString()}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const product = mockProducts[item.product_id as keyof typeof mockProducts];
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span>₹{((product?.price || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{orderSummary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{orderSummary.shippingCost === 0 ? 'FREE' : `₹${orderSummary.shippingCost}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>-₹{orderSummary.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{orderSummary.total.toLocaleString()}</span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>🔒 Secure SSL encrypted payment</p>
                  <p>📦 Easy returns within 30 days</p>
                  <p>🚚 Free shipping on orders ₹1999+</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}