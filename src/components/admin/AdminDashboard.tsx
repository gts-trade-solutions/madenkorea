import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Settings,
  Video,
  Edit3,
} from "lucide-react";
import { CMSManager } from "./CMSManager";
import { ContentManager } from "./ContentManager";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useNavigate } from "react-router-dom";
import { OrderManagement } from "./OrderManagement";
import { ReportDownload } from "./ReportDownload";
import SupplierManagement from "./SupplierManagement";
import APIKeyManager from "./APIKeyManager";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  dailyOrders: number;
  totalRevenue: number;
  stockAlerts: number;
  supplierActivity: number;
  pendingReviews: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [realStats, setRealStats] = useState<DashboardStats>({
    dailyOrders: 0,
    totalRevenue: 0,
    stockAlerts: 0,
    supplierActivity: 0,
    pendingReviews: 0,
  });
  const navigate = useNavigate();

  const fetchRealStats = async () => {
    try {
      // Fetch active/approved suppliers count only
      const { count: suppliersCount } = await supabase
        .from("suppliers")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("is_active", true);

      // Fetch products for stock alerts
      const { data: products } = await supabase
        .from("products")
        .select("stock_quantity");

      // Fetch today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todaysOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", today.toISOString());

      // Fetch all orders for revenue
      const { data: allOrders } = await supabase
        .from("orders")
        .select("total_amount");

      // Fetch pending reviews
      const { count: pendingReviews } = await supabase
        .from("product_reviews")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);

      const stockAlerts =
        products?.filter((p) => (p.stock_quantity || 0) < 10).length || 0;
      const dailyOrders = todaysOrders?.length || 0;
      const totalRevenue =
        allOrders?.reduce(
          (sum, order) => sum + Number(order.total_amount || 0),
          0
        ) || 0;

      setRealStats({
        dailyOrders,
        totalRevenue,
        stockAlerts,
        supplierActivity: suppliersCount || 0,
        pendingReviews: pendingReviews || 0,
      });
    } catch (error) {
      console.error("Error fetching real stats:", error);
    }
  };

  useEffect(() => {
    fetchRealStats();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your Consumer Innovations store
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ReportDownload
              reportType="admin"
              activeTab={activeTab}
              data={realStats}
            />
            <NotificationBell userRole="admin" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveTab("orders")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Daily Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realStats.dailyOrders}</div>
              <p className="text-xs text-muted-foreground">Today's orders</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveTab("overview")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{realStats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total revenue</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveTab("products")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Alerts
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {realStats.stockAlerts}
              </div>
              <p className="text-xs text-muted-foreground">
                Products low in stock
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveTab("suppliers")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Suppliers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realStats.supplierActivity}
              </div>
              <p className="text-xs text-muted-foreground">
                Approved & active suppliers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="cms">CMS</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div
                        key={order}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">Order #00{order}</p>
                          <p className="text-sm text-muted-foreground">
                            COSRX Snail Cream + 2 more
                          </p>
                        </div>
                        <Badge variant="outline">Paid</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "COSRX Snail Cream", sales: 45 },
                      { name: "Laneige Water Bank", sales: 38 },
                      { name: "Innisfree Green Tea", sales: 32 },
                    ].map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sales} sold this week
                          </p>
                        </div>
                        <Badge variant="secondary">{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage your product catalog</CardDescription>
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(
                      "Add Product button clicked, navigating to /supplier"
                    );
                    alert("Add Product button clicked"); // Simple test
                    navigate("/supplier");
                  }}
                  className="cursor-pointer"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => {
                      console.log("Total Products clicked");
                      setActiveTab("products");
                    }}
                  >
                    <h3 className="font-semibold mb-2">Total Products</h3>
                    <p className="text-2xl font-bold text-primary">156</p>
                    <p className="text-sm text-muted-foreground">
                      +12 this month
                    </p>
                  </Card>
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => {
                      console.log("Out of Stock clicked");
                      navigate("/supplier");
                    }}
                  >
                    <h3 className="font-semibold mb-2">Out of Stock</h3>
                    <p className="text-2xl font-bold text-destructive">8</p>
                    <p className="text-sm text-muted-foreground">
                      Need restocking
                    </p>
                  </Card>
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => {
                      console.log("Low Stock clicked");
                      navigate("/supplier");
                    }}
                  >
                    <h3 className="font-semibold mb-2">Low Stock</h3>
                    <p className="text-2xl font-bold text-orange-500">15</p>
                    <p className="text-sm text-muted-foreground">
                      &lt; 10 items
                    </p>
                  </Card>
                </div>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "Go to Product Management button clicked, navigating to /supplier"
                      );
                      alert("Product Management button clicked"); // Simple test
                      navigate("/supplier");
                    }}
                    className="cursor-pointer"
                  >
                    Go to Product Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <SupplierManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="cms">
            <CMSManager />
          </TabsContent>

          <TabsContent value="api-keys">
            <APIKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
