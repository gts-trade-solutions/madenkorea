import { TopNavigation } from '@/components/TopNavigation';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { AddAddressDialog } from '@/components/account/AddAddressDialog';
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  ArrowLeft,
  Download,
  ExternalLink,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  mobile_number: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  tracking_number: string | null;
  order_items: any;
}

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

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    mobile_number: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(profileData);
      if (profileData) {
        setProfileData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          mobile_number: profileData.mobile_number || ''
        });
      }

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);

      // Load addresses
      const { data: addressesData } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses(addressesData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile!, ...profileData });
      setEditingProfile(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const setAddressAsDefault = async (addressId: string) => {
    if (!user) return;

    try {
      // First, unset all defaults
      await supabase
        .from('saved_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the selected one as default
      const { error } = await supabase
        .from('saved_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      await loadUserData();
      
      toast({
        title: "Default Address Updated",
        description: "Your default shipping address has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('saved_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      await loadUserData();
      
      toast({
        title: "Address Deleted",
        description: "Your address has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'dispatched': return 'secondary';
      case 'processing': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Account</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.first_name || user?.email}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>My Orders</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Saved Addresses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and track all your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start shopping to see your orders here
                    </p>
                    <Button onClick={() => navigate('/')}>Start Shopping</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{order.order_number}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status.toUpperCase()}
                            </Badge>
                            <p className="font-semibold">₹{order.total_amount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Invoice
                            </Button>
                            {order.tracking_number && (
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Track Shipment
                              </Button>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    value={profileData.mobile_number}
                    onChange={(e) => setProfileData({ ...profileData, mobile_number: e.target.value })}
                    disabled={!editingProfile}
                    placeholder="Optional"
                  />
                </div>

                <div className="flex space-x-2">
                  {editingProfile ? (
                    <>
                      <Button onClick={updateProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditingProfile(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <ChangePasswordForm />
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>
                      Manage your shipping addresses
                    </CardDescription>
                  </div>
                  <AddAddressDialog onAddressAdded={loadUserData} />
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                    <p className="text-muted-foreground mb-4">
                      Add an address to make checkout faster
                    </p>
                    <AddAddressDialog onAddressAdded={loadUserData} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{address.name}</h4>
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
                            <p className="text-sm text-muted-foreground">
                              {address.country}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {!address.is_default && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setAddressAsDefault(address.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <AddAddressDialog 
                              editAddress={address}
                              onAddressAdded={loadUserData}
                              onAddressUpdated={loadUserData}
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this address? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteAddress(address.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}