import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Mail,
  Eye,
  User,
  Calendar,
  Download,
  FileText,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'processing' | 'dispatched' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  order_items: any;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  tracking_number?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
    case 'returned': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'processing': return <Clock className="h-4 w-4" />;
    case 'dispatched': return <Truck className="h-4 w-4" />;
    case 'delivered': return <CheckCircle className="h-4 w-4" />;
    case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
    case 'returned': return <Package className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case 'processing': return 'dispatched';
    case 'dispatched': return 'delivered';
    default: return null;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'processing': return 'Processing';
    case 'dispatched': return 'Dispatched';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'returned': return 'Returned';
    default: return status;
  }
};

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("processing");
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId));
    
    try {
      const updateData: any = { status: newStatus };
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any, tracking_number: trackingNumber || order.tracking_number }
          : order
      ));

      // Send notification to customer
      await sendStatusNotification(orderId, newStatus);

      toast({
        title: "Order Updated! 📦",
        description: `Order status changed to ${getStatusLabel(newStatus)}`,
      });

    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const sendStatusNotification = async (orderId: string, status: string) => {
    try {
      // Create notification in database
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      await supabase.rpc('create_notification', {
        target_user_id: order.user_id,
        target_user_role: 'customer',
        notification_title: `Order ${getStatusLabel(status)}`,
        notification_message: `Your order ${order.order_number} has been ${status}`,
        notification_type_param: 'order_status',
        notification_metadata: { order_id: orderId, status, order_number: order.order_number }
      });

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const downloadReport = async (reportType: string) => {
    try {
      const reportData = {
        type: reportType,
        date: new Date().toISOString(),
        orders: orders,
        summary: {
          processing: getOrdersByStatus('processing').length,
          dispatched: getOrdersByStatus('dispatched').length,
          delivered: getOrdersByStatus('delivered').length,
          cancelled: getOrdersByStatus('cancelled').length,
          returned: getOrdersByStatus('returned').length,
          totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0)
        }
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded! 📊",
        description: `${reportType} report has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const nextStatus = getNextStatus(order.status);
    const isUpdating = updatingOrders.has(order.id);
    const canReturn = order.status === 'delivered';

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{order.order_number}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                Customer ID: {order.user_id.slice(0, 8)}...
                <Calendar className="h-4 w-4 ml-2" />
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">₹{order.total_amount.toLocaleString()}</div>
              <Badge className={`${getStatusColor(order.status)} border`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status)}
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Order Items Preview */}
            <div>
              <p className="text-sm font-medium mb-1">Items:</p>
              <p className="text-sm text-muted-foreground">
                {Array.isArray(order.order_items) ? 
                  `${order.order_items.length} items` : 
                  'Order details available'
                }
              </p>
            </div>

            {/* Shipping Address Preview */}
            {order.shipping_address && (
              <div>
                <p className="text-sm font-medium mb-1">Shipping to:</p>
                <p className="text-sm text-muted-foreground">
                  {typeof order.shipping_address === 'object' ? 
                    `${order.shipping_address.city}, ${order.shipping_address.state}` :
                    'Shipping address on file'
                  }
                </p>
              </div>
            )}

            {/* Tracking Number */}
            {order.tracking_number && (
              <div>
                <p className="text-sm font-medium mb-1">Tracking Number:</p>
                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {order.tracking_number}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 flex-wrap">
              {nextStatus && (
                <Button
                  onClick={() => updateOrderStatus(order.id, nextStatus)}
                  disabled={isUpdating}
                  className="flex-1 min-w-[140px]"
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(nextStatus)}
                      Mark as {getStatusLabel(nextStatus)}
                    </div>
                  )}
                </Button>
              )}

              {canReturn && (
                <Button
                  onClick={() => updateOrderStatus(order.id, 'returned')}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Process Return
                </Button>
              )}
              
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-1" />
                Notify Customer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order Management</h2>
          <p className="text-muted-foreground">Track and update order status</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => downloadReport('Orders Report')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button onClick={fetchOrders} variant="outline">
            Refresh Orders
          </Button>
        </div>
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['processing', 'dispatched', 'delivered', 'cancelled', 'returned'].map(status => (
          <Card 
            key={status} 
            className={`text-center cursor-pointer hover:shadow-lg transition-all duration-200 ${
              activeTab === status ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveTab(status)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(status)}
              </div>
              <div className="text-2xl font-bold">{getOrdersByStatus(status).length}</div>
              <div className="text-sm text-muted-foreground">{getStatusLabel(status)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders by Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="processing">Processing ({getOrdersByStatus('processing').length})</TabsTrigger>
          <TabsTrigger value="dispatched">Dispatched ({getOrdersByStatus('dispatched').length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({getOrdersByStatus('delivered').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({getOrdersByStatus('cancelled').length})</TabsTrigger>
          <TabsTrigger value="returned">Returned ({getOrdersByStatus('returned').length})</TabsTrigger>
        </TabsList>

        {['processing', 'dispatched', 'delivered', 'cancelled', 'returned'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {getOrdersByStatus(status).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No {status} orders</p>
                </CardContent>
              </Card>
            ) : (
              getOrdersByStatus(status).map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};