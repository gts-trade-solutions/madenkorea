import {
  Download,
  FileText,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface ReportDownloadProps {
  reportType: "admin" | "supplier";
  activeTab: string;
  data?: any;
}

export const ReportDownload = ({
  reportType,
  activeTab,
  data,
}: ReportDownloadProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchSupplierSpecificData = async (
    period: string,
    startDate: Date,
    endDate: Date
  ) => {
    try {
      // For supplier portal, focus on supplier-specific metrics
      // Since we're using sample data, we'll generate supplier-specific mock data
      const supplierData = {
        period,
        generatedAt: new Date().toISOString(),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        supplier: {
          name: "Sample Supplier",
          totalProducts: 24,
          activeProducts: 22,
          pendingProducts: 2,
          totalRevenue: 450000,
          commissionEarned: 67500,
          averageCommissionRate: 15,
        },
        products: {
          totalListed: 24,
          approved: 22,
          pending: 2,
          rejected: 0,
          outOfStock: 1,
          lowStock: 3,
          topPerforming: [
            { name: "Consumer Innovations Serum", sales: 45, revenue: 67500 },
            { name: "Hydrating Cream", sales: 32, revenue: 48000 },
            { name: "Face Mask Set", sales: 28, revenue: 42000 },
          ],
        },
        orders: {
          totalOrders: 89,
          completedOrders: 78,
          pendingOrders: 11,
          totalRevenue: 450000,
          averageOrderValue: 5056,
          recentOrders: [
            {
              orderId: "ORD-001",
              amount: 5500,
              status: "delivered",
              date: new Date().toISOString(),
            },
            {
              orderId: "ORD-002",
              amount: 3200,
              status: "processing",
              date: new Date().toISOString(),
            },
            {
              orderId: "ORD-003",
              amount: 7800,
              status: "dispatched",
              date: new Date().toISOString(),
            },
          ],
        },
        performance: {
          customerRating: 4.8,
          responseTime: "2.3 hours",
          fulfillmentRate: 98.5,
          returnRate: 1.2,
        },
      };

      return supplierData;
    } catch (error) {
      console.error("Error fetching supplier data:", error);
      throw error;
    }
  };

  const fetchComprehensiveData = async (
    period: "today" | "month" | "year" | "all"
  ) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(2020, 0, 1); // Far past date for "all"
    }

    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow

    try {
      // If this is a supplier report, get supplier-specific data
      if (reportType === "supplier") {
        return await fetchSupplierSpecificData(period, startDate, endDate);
      }

      // Admin comprehensive data (existing logic)
      // Fetch suppliers data
      const { data: suppliers, error: suppliersError } = await supabase
        .from("suppliers")
        .select("*");

      if (suppliersError) throw suppliersError;

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lt("created_at", endDate.toISOString());

      if (ordersError) throw ordersError;

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*");

      if (productsError) throw productsError;

      // Fetch product variants for stock data
      const { data: variants, error: variantsError } = await supabase
        .from("product_variants")
        .select("*");

      if (variantsError) throw variantsError;

      // Calculate comprehensive metrics
      const totalOrders = orders?.length || 0;
      const totalRevenue =
        orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) ||
        0;

      const ordersByStatus = {
        processing:
          orders?.filter((o) => o.status === "processing").length || 0,
        dispatched:
          orders?.filter((o) => o.status === "dispatched").length || 0,
        delivered: orders?.filter((o) => o.status === "delivered").length || 0,
        cancelled: orders?.filter((o) => o.status === "cancelled").length || 0,
        returned: orders?.filter((o) => o.status === "returned").length || 0,
      };

      // Stock analysis
      const totalStock =
        products?.reduce(
          (sum, product) => sum + (product.stock_quantity || 0),
          0
        ) || 0;
      const lowStockProducts =
        products?.filter((p) => (p.stock_quantity || 0) < 10).length || 0;
      const outOfStockProducts =
        products?.filter((p) => (p.stock_quantity || 0) === 0).length || 0;

      // Product analysis
      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter((p) => p.is_active).length || 0;
      const featuredProducts =
        products?.filter((p) => p.is_featured).length || 0;

      // Supplier analysis
      const totalSuppliers = suppliers?.length || 0;
      const activeSuppliers =
        suppliers?.filter((s) => s.status === "approved" && s.is_active)
          .length || 0;
      const pendingSuppliers =
        suppliers?.filter((s) => s.status === "pending").length || 0;
      const suspendedSuppliers =
        suppliers?.filter((s) => s.status === "suspended").length || 0;

      // Revenue by period breakdown
      const revenueByDay = calculateRevenueByPeriod(orders || [], "day");
      const revenueByMonth = calculateRevenueByPeriod(orders || [], "month");

      return {
        period,
        generatedAt: new Date().toISOString(),
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus,
          totalRevenue: totalRevenue,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          revenueBreakdown: {
            byDay: revenueByDay,
            byMonth: revenueByMonth,
          },
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          featured: featuredProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          totalStockValue:
            products?.reduce(
              (sum, p) =>
                sum + (p.stock_quantity || 0) * Number(p.cost_price || 0),
              0
            ) || 0,
          totalSellingValue:
            products?.reduce(
              (sum, p) =>
                sum + (p.stock_quantity || 0) * Number(p.selling_price || 0),
              0
            ) || 0,
        },
        suppliers: {
          total: totalSuppliers,
          active: activeSuppliers,
          pending: pendingSuppliers,
          suspended: suspendedSuppliers,
          totalRevenue:
            suppliers?.reduce(
              (sum, s) => sum + Number(s.total_revenue || 0),
              0
            ) || 0,
          averageRating:
            totalSuppliers > 0
              ? (suppliers?.reduce(
                  (sum, s) => sum + Number(s.rating || 0),
                  0
                ) || 0) / totalSuppliers
              : 0,
        },
        stock: {
          totalUnits: totalStock,
          categories: calculateStockByCategory(products || []),
          lowStockAlerts:
            products
              ?.filter((p) => (p.stock_quantity || 0) < 10)
              .map((p) => ({
                productId: p.product_id,
                name: p.name,
                currentStock: p.stock_quantity,
                category: p.category,
              })) || [],
        },
        financial: {
          totalRevenue: totalRevenue,
          costOfGoodsSold: calculateCOGS(orders || [], products || []),
          grossProfit: 0, // Will be calculated below
          profitMargin: 0, // Will be calculated below
        },
      };
    } catch (error) {
      console.error("Error fetching comprehensive data:", error);
      throw error;
    }
  };

  const calculateRevenueByPeriod = (orders: any[], period: "day" | "month") => {
    const revenueMap = new Map();

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      let key: string;

      if (period === "day") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`; // YYYY-MM
      }

      const current = revenueMap.get(key) || 0;
      revenueMap.set(key, current + Number(order.total_amount));
    });

    return Object.fromEntries(revenueMap);
  };

  const calculateStockByCategory = (products: any[]) => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const category = product.category || "Uncategorized";
      const current = categoryMap.get(category) || {
        count: 0,
        totalStock: 0,
        totalValue: 0,
      };

      categoryMap.set(category, {
        count: current.count + 1,
        totalStock: current.totalStock + (product.stock_quantity || 0),
        totalValue:
          current.totalValue +
          (product.stock_quantity || 0) * Number(product.cost_price || 0),
      });
    });

    return Object.fromEntries(categoryMap);
  };

  const calculateCOGS = (orders: any[], products: any[]) => {
    let totalCOGS = 0;

    orders.forEach((order) => {
      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((item: any) => {
          const product = products.find((p) => p.product_id === item.productId);
          if (product) {
            totalCOGS += Number(product.cost_price || 0) * (item.quantity || 1);
          }
        });
      }
    });

    return totalCOGS;
  };

  const downloadComprehensiveReport = async (
    format: "json" | "csv",
    period: "today" | "month" | "year" | "all"
  ) => {
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];

      // Fetch comprehensive data from Supabase
      const comprehensiveData = await fetchComprehensiveData(period);

      // Calculate final financial metrics (only for admin reports)
      if (reportType === "admin" && "financial" in comprehensiveData) {
        const grossProfit =
          comprehensiveData.financial.totalRevenue -
          comprehensiveData.financial.costOfGoodsSold;
        const profitMargin =
          comprehensiveData.financial.totalRevenue > 0
            ? (grossProfit / comprehensiveData.financial.totalRevenue) * 100
            : 0;

        comprehensiveData.financial.grossProfit = grossProfit;
        comprehensiveData.financial.profitMargin = profitMargin;
      }

      const content = convertComprehensiveToCSV(comprehensiveData);
      const filename = `${reportType}-comprehensive-${period}-report-${timestamp}.csv`;
      const mimeType = "text/csv";

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded! 📊",
        description: `${period} report downloaded as CSV`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download comprehensive report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = (tab: string, data: any) => {
    const timestamp = new Date().toISOString();

    switch (tab) {
      case "overview":
        return {
          totalRevenue: data?.totalRevenue || "₹2,85,000",
          dailyOrders: data?.dailyOrders || 45,
          activeUsers: data?.activeUsers || 1240,
          conversionRate: data?.conversionRate || "3.2%",
          reportDate: timestamp,
        };

      case "products":
        return {
          totalProducts: data?.totalProducts || 156,
          outOfStock: data?.outOfStock || 8,
          lowStock: data?.lowStock || 15,
          featured: data?.featured || 23,
          categories: data?.categories || 12,
          reportDate: timestamp,
        };

      case "suppliers":
        return {
          activeSuppliers: data?.activeSuppliers || 12,
          pendingOrders: data?.pendingOrders || 28,
          revenueShare: data?.revenueShare || "₹2.4L",
          performance: data?.performance || "96%",
          reportDate: timestamp,
        };

      case "orders":
        return {
          todaysOrders: data?.todaysOrders || 23,
          pending: data?.pending || 8,
          dispatched: data?.dispatched || 15,
          delivered: data?.delivered || 142,
          cancelled: data?.cancelled || 3,
          returned: data?.returned || 5,
          reportDate: timestamp,
        };

      case "cms":
        return {
          totalPages: data?.totalPages || 15,
          publishedPages: data?.publishedPages || 12,
          drafts: data?.drafts || 3,
          media: data?.media || 234,
          reportDate: timestamp,
        };

      default:
        return {
          tabName: tab,
          dataAvailable: !!data,
          reportDate: timestamp,
        };
    }
  };

  const convertComprehensiveToCSV = (data: any) => {
    let csv = "";

    if (reportType === "supplier") {
      // Supplier-specific CSV format
      csv += "SUPPLIER PERFORMANCE REPORT\n";
      csv += `Report Period:,${data.period}\n`;
      csv += `Generated At:,${data.generatedAt}\n`;
      csv += `Date Range:,${data.dateRange.start} to ${data.dateRange.end}\n\n`;

      // Supplier Summary
      csv += "SUPPLIER SUMMARY\n";
      csv += "Metric,Value\n";
      csv += `Supplier Name,${data.supplier.name}\n`;
      csv += `Total Products,${data.supplier.totalProducts}\n`;
      csv += `Active Products,${data.supplier.activeProducts}\n`;
      csv += `Pending Products,${data.supplier.pendingProducts}\n`;
      csv += `Total Revenue,₹${data.supplier.totalRevenue.toLocaleString()}\n`;
      csv += `Commission Earned,₹${data.supplier.commissionEarned.toLocaleString()}\n`;
      csv += `Average Commission Rate,${data.supplier.averageCommissionRate}%\n\n`;

      // Product Performance
      csv += "TOP PERFORMING PRODUCTS\n";
      csv += "Product Name,Sales,Revenue\n";
      data.products.topPerforming.forEach((product: any) => {
        csv += `${product.name},${
          product.sales
        },₹${product.revenue.toLocaleString()}\n`;
      });
      csv += "\n";

      // Order Summary
      csv += "ORDER SUMMARY\n";
      csv += "Metric,Value\n";
      csv += `Total Orders,${data.orders.totalOrders}\n`;
      csv += `Completed Orders,${data.orders.completedOrders}\n`;
      csv += `Pending Orders,${data.orders.pendingOrders}\n`;
      csv += `Total Revenue,₹${data.orders.totalRevenue.toLocaleString()}\n`;
      csv += `Average Order Value,₹${data.orders.averageOrderValue.toLocaleString()}\n\n`;

      // Performance Metrics
      csv += "PERFORMANCE METRICS\n";
      csv += "Metric,Value\n";
      csv += `Customer Rating,${data.performance.customerRating}/5\n`;
      csv += `Response Time,${data.performance.responseTime}\n`;
      csv += `Fulfillment Rate,${data.performance.fulfillmentRate}%\n`;
      csv += `Return Rate,${data.performance.returnRate}%\n`;
    } else {
      // Admin comprehensive CSV format (existing logic)
      csv += "COMPREHENSIVE BUSINESS REPORT\n";
      csv += `Report Period:,${data.period}\n`;
      csv += `Generated At:,${data.generatedAt}\n`;
      csv += `Date Range:,${data.dateRange.start} to ${data.dateRange.end}\n\n`;

      // Orders Summary
      csv += "ORDERS SUMMARY\n";
      csv += "Metric,Value\n";
      csv += `Total Orders,${data.orders.total}\n`;
      csv += `Total Revenue,${data.orders.totalRevenue}\n`;
      csv += `Average Order Value,${data.orders.averageOrderValue.toFixed(
        2
      )}\n`;
      csv += `Processing Orders,${data.orders.byStatus.processing}\n`;
      csv += `Dispatched Orders,${data.orders.byStatus.dispatched}\n`;
      csv += `Delivered Orders,${data.orders.byStatus.delivered}\n`;
      csv += `Cancelled Orders,${data.orders.byStatus.cancelled}\n`;
      csv += `Returned Orders,${data.orders.byStatus.returned}\n\n`;

      // Revenue Breakdown by Day
      if (data.orders.revenueBreakdown) {
        csv += "DAILY REVENUE BREAKDOWN\n";
        csv += "Date,Revenue\n";
        Object.entries(data.orders.revenueBreakdown.byDay).forEach(
          ([date, revenue]) => {
            csv += `${date},${revenue}\n`;
          }
        );
        csv += "\n";

        // Revenue Breakdown by Month
        csv += "MONTHLY REVENUE BREAKDOWN\n";
        csv += "Month,Revenue\n";
        Object.entries(data.orders.revenueBreakdown.byMonth).forEach(
          ([month, revenue]) => {
            csv += `${month},${revenue}\n`;
          }
        );
        csv += "\n";
      }

      // Products Summary
      csv += "PRODUCTS SUMMARY\n";
      csv += "Metric,Value\n";
      csv += `Total Products,${data.products.total}\n`;
      csv += `Active Products,${data.products.active}\n`;
      csv += `Featured Products,${data.products.featured}\n`;
      csv += `Low Stock Products,${data.products.lowStock}\n`;
      csv += `Out of Stock Products,${data.products.outOfStock}\n`;
      csv += `Total Stock Value (Cost),${data.products.totalStockValue}\n`;
      csv += `Total Stock Value (Selling),${data.products.totalSellingValue}\n\n`;

      // Suppliers Summary
      csv += "SUPPLIERS SUMMARY\n";
      csv += "Metric,Value\n";
      csv += `Total Suppliers,${data.suppliers.total}\n`;
      csv += `Active Suppliers,${data.suppliers.active}\n`;
      csv += `Pending Suppliers,${data.suppliers.pending}\n`;
      csv += `Suspended Suppliers,${data.suppliers.suspended}\n`;
      csv += `Total Supplier Revenue,${data.suppliers.totalRevenue}\n`;
      csv += `Average Supplier Rating,${data.suppliers.averageRating.toFixed(
        2
      )}\n\n`;

      // Stock by Category
      if (data.stock.categories) {
        csv += "STOCK BY CATEGORY\n";
        csv += "Category,Product Count,Total Stock,Total Value\n";
        Object.entries(data.stock.categories).forEach(
          ([category, details]: [string, any]) => {
            csv += `${category},${details.count},${details.totalStock},${details.totalValue}\n`;
          }
        );
        csv += "\n";
      }

      // Low Stock Alerts
      if (data.stock.lowStockAlerts) {
        csv += "LOW STOCK ALERTS\n";
        csv += "Product ID,Product Name,Current Stock,Category\n";
        data.stock.lowStockAlerts.forEach((alert: any) => {
          csv += `${alert.productId},${alert.name},${alert.currentStock},${alert.category}\n`;
        });
        csv += "\n";
      }

      // Financial Summary (only for admin)
      if (data.financial) {
        csv += "FINANCIAL SUMMARY\n";
        csv += "Metric,Value\n";
        csv += `Total Revenue,${data.financial.totalRevenue}\n`;
        csv += `Cost of Goods Sold,${data.financial.costOfGoodsSold}\n`;
        csv += `Gross Profit,${data.financial.grossProfit}\n`;
        csv += `Profit Margin (%),${data.financial.profitMargin.toFixed(2)}\n`;
      }
    }

    return csv;
  };

  const convertToCSV = (data: any) => {
    const summary = data.summary;
    const headers = Object.keys(summary);
    const values = Object.values(summary);

    let csv = "Metric,Value\n";
    headers.forEach((header, index) => {
      csv += `${header},${values[index]}\n`;
    });

    return csv;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Download className="h-4 w-4 mr-2" />
          {isLoading ? "Generating..." : "Download Report"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Download Reports (CSV)</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => downloadComprehensiveReport("csv", "today")}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Today's Report
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => downloadComprehensiveReport("csv", "month")}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Monthly Report
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => downloadComprehensiveReport("csv", "year")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Yearly Report
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => downloadComprehensiveReport("csv", "all")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Complete Data Export
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
