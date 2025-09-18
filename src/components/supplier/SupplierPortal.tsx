import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Package,
  TrendingUp,
  ShoppingCart,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
  File,
  Download,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ReportDownload } from "@/components/admin/ReportDownload";

const categories = [
  "Skin Care",
  "Make Up",
  "Hair Care",
  "Body Care",
  "Men Care",
  "Beauty Tools",
  "Health & Personal Care",
  "Perfume & Deodorant",
  "Life & Home",
  "Baby",
  "Food & Beverages",
  "Others",
  "K-POP",
  "Exclusive",
];

export default function SupplierPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    monthlySales: 0,
    pendingOrders: 0,
    lowStockAlerts: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    keywords: "",
    description: "",
    productCode: "",
    size: "",
    stock: "",
    costPrice: "",
    category: "",
    brand: "",
    video: "",
  });

  // Fetch real data from Supabase (only supplier's products)
  const fetchProducts = async () => {
    try {
      // Get current supplier's ID first
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (supplierError) {
        console.error("Error fetching supplier:", supplierError);
        return;
      }

      if (!supplierData) {
        console.log("No supplier found for current user");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", supplierData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get current supplier's ID first
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (supplierError) {
        console.error("Error fetching supplier:", supplierError);
        return;
      }

      if (!supplierData) {
        console.log("No supplier found for current user");
        return;
      }

      // Get products count and stock data for this supplier only
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, stock_quantity, selling_price")
        .eq("supplier_id", supplierData.id);

      if (productsError) throw productsError;

      // Get orders data for this supplier's products
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, status, created_at, order_items")
        .gte(
          "created_at",
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString()
        );

      if (ordersError) throw ordersError;

      const totalProducts = products?.length || 0;
      const lowStockProducts =
        products?.filter((p) => (p.stock_quantity || 0) < 10).length || 0;

      // Filter orders that contain products from this supplier
      const supplierOrders =
        orders?.filter((order) => {
          const items = order.order_items as any[];
          return items?.some((item) =>
            products?.some((p) => p.id === item.product_id)
          );
        }) || [];

      const pendingOrders = supplierOrders.filter(
        (o) => o.status === "processing"
      ).length;
      const monthlySales = supplierOrders.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      );

      setStats({
        totalProducts,
        monthlySales,
        pendingOrders,
        lowStockAlerts: lowStockProducts,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  // Check if user is registered as supplier
  const [isSupplier, setIsSupplier] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSupplierStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setIsSupplier(false);
          return;
        }

        const { data: supplierData } = await supabase
          .from("suppliers")
          .select("id, status")
          .eq("user_id", user.id)
          .maybeSingle();

        setIsSupplier(!!supplierData);

        if (!supplierData) {
          toast({
            title: "Supplier Registration Required",
            description:
              "You need to register as a supplier to access this portal.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking supplier status:", error);
        setIsSupplier(false);
      }
    };

    checkSupplierStatus();
  }, []);

  if (isSupplier === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Checking supplier status...
          </p>
        </div>
      </div>
    );
  }

  if (isSupplier === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Supplier Registration Required
            </h1>
            <p className="text-muted-foreground">
              You need to register as a supplier to access this portal and start
              selling your products.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => (window.location.href = "/supplier/register")}
              className="w-full"
            >
              Register as Supplier
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="w-full"
            >
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setLoading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setUploadedImageUrls((prev) => [...prev, ...uploadedUrls]);
      setProductImages((prev) => [...prev, ...files]);

      toast({
        title: "Success! 📸",
        description: `${files.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    console.log("Image click handler triggered", fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("fileInputRef.current is null");
    }
  };

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New product data:", newProduct);

    // Basic validation
    if (
      !newProduct.name ||
      !newProduct.brand ||
      !newProduct.category ||
      !newProduct.stock ||
      !newProduct.costPrice
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (uploadedImageUrls.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one product image",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get current supplier's ID
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (supplierError || !supplierData) {
        throw new Error("You must be registered as a supplier to add products");
      }

      // Generate unique product ID
      const productId = `${newProduct.brand
        .toUpperCase()
        .replace(/\s+/g, "-")}-${Date.now().toString().slice(-3)}`;

      // Create slug if not provided
      const slug =
        newProduct.slug ||
        newProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      // Insert product into database with supplier_id
      const { data, error } = await supabase
        .from("products")
        .insert({
          product_id: productId,
          name: newProduct.name,
          slug,
          description: newProduct.description,
          keywords: newProduct.keywords,
          brand: newProduct.brand,
          category: newProduct.category,
          product_code: newProduct.productCode,
          size: newProduct.size,
          stock_quantity: parseInt(newProduct.stock) || 0,
          cost_price: parseFloat(newProduct.costPrice) || 0,
          selling_price: parseFloat(newProduct.costPrice) * 1.3 || 0, // 30% markup
          supplier_id: supplierData.id, // Link to supplier
          is_active: true,
          is_featured: false,
          discount_percentage: 0,
          country_of_origin: "South Korea",
          gender: "unisex",
        })
        .select();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Product saved to database:", data);

      // Upload images to media library for this product
      if (uploadedImageUrls.length > 0 && data && data[0]) {
        const productId = data[0].product_id;

        for (let i = 0; i < uploadedImageUrls.length; i++) {
          const { error: mediaError } = await supabase
            .from("product_media")
            .insert({
              product_id: productId,
              media_url: uploadedImageUrls[i],
              media_type: "image",
              position: i,
              is_primary: i === 0, // First image is primary
              alt_text: `${newProduct.name} - Image ${i + 1}`,
            });

          if (mediaError) {
            console.error("Media upload error:", mediaError);
          }
        }
      }

      toast({
        title: "Success! 🎉",
        description: "Product saved to database successfully!",
      });

      // Refresh products list and stats
      await fetchProducts();
      await fetchStats();

      // Reset form
      setNewProduct({
        name: "",
        slug: "",
        keywords: "",
        description: "",
        productCode: "",
        size: "",
        stock: "",
        costPrice: "",
        category: "",
        brand: "",
        video: "",
      });

      setProductImages([]);
      setUploadedImageUrls([]);

      // Switch to products tab to show the result
      setActiveTab("products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Error adding product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Supplier Portal
            </h1>
            <p className="text-muted-foreground">
              Manage your Consumer Innovations products and orders
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ReportDownload reportType="supplier" activeTab={activeTab} />
            <NotificationBell userRole="supplier" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveTab("products")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Total products</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveTab("dashboard")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Sales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.monthlySales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveTab("orders")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Require fulfillment
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveTab("products")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Alerts
              </CardTitle>
              <Package className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.lowStockAlerts}
              </div>
              <p className="text-xs text-muted-foreground">
                Products need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="upload">Add Product</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Orders requiring your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div
                        key={order}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">Order #SUP00{order}</p>
                          <p className="text-sm text-muted-foreground">
                            COSRX Advanced Snail Cream
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: 2
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">Paid</Badge>
                          <Button size="sm" className="ml-2">
                            Fulfill
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>Your monthly performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Orders Fulfilled</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Response Time</span>
                      <span className="font-medium">2.3 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Customer Rating</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Products</CardTitle>
                  <CardDescription>Manage your product catalog</CardDescription>
                </div>
                <Button onClick={() => setActiveTab("upload")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No products found. Add your first product to get started.
                    </p>
                  ) : (
                    <>
                      {/* Products Grid with Pagination */}
                      <div className="space-y-4">
                        {products
                          .slice(
                            (currentPage - 1) * productsPerPage,
                            currentPage * productsPerPage
                          )
                          .map((product) => (
                            <div
                              key={product.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
                            >
                              <div className="flex-1 w-full">
                                <h3 className="font-medium text-base leading-tight">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {product.brand} • {product.category}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                  <span className="text-sm font-medium">
                                    ₹
                                    {product.selling_price ||
                                      product.cost_price}
                                  </span>
                                  <span className="text-sm">
                                    Stock: {product.stock_quantity}
                                  </span>
                                  <Badge
                                    variant={
                                      product.stock_quantity > 10
                                        ? "default"
                                        : product.stock_quantity > 0
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {product.stock_quantity > 10
                                      ? "In Stock"
                                      : product.stock_quantity > 0
                                      ? "Low Stock"
                                      : "Out of Stock"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    toast({
                                      title: "View Product",
                                      description: `Viewing ${product.name}`,
                                    })
                                  }
                                  className="flex-1 sm:flex-initial"
                                >
                                  <Eye className="h-4 w-4 sm:mr-0 mr-2" />
                                  <span className="sm:hidden">View</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    toast({
                                      title: "Edit Product",
                                      description: `Editing ${product.name}`,
                                    })
                                  }
                                  className="flex-1 sm:flex-initial"
                                >
                                  <Edit className="h-4 w-4 sm:mr-0 mr-2" />
                                  <span className="sm:hidden">Edit</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Are you sure you want to delete ${product.name}?`
                                      )
                                    ) {
                                      toast({
                                        title: "Product Deleted",
                                        description: `${product.name} has been deleted`,
                                      });
                                    }
                                  }}
                                  className="flex-1 sm:flex-initial"
                                >
                                  <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
                                  <span className="sm:hidden">Delete</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Improved Pagination */}
                      {products.length > productsPerPage && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
                          {/* Mobile pagination controls */}
                          <div className="flex items-center gap-2 sm:hidden w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className="flex-1"
                            >
                              <PaginationPrevious className="h-4 w-4" />
                              Previous
                            </Button>
                            <div className="flex items-center gap-2 px-4">
                              <span className="text-sm font-medium">
                                {currentPage} of{" "}
                                {Math.ceil(products.length / productsPerPage)}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(
                                    prev + 1,
                                    Math.ceil(products.length / productsPerPage)
                                  )
                                )
                              }
                              disabled={
                                currentPage ===
                                Math.ceil(products.length / productsPerPage)
                              }
                              className="flex-1"
                            >
                              Next
                              <PaginationNext className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Desktop pagination */}
                          <div className="hidden sm:flex">
                            <Pagination>
                              <PaginationContent className="flex-wrap">
                                <PaginationItem>
                                  <PaginationPrevious
                                    onClick={() =>
                                      setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1)
                                      )
                                    }
                                    className={
                                      currentPage === 1
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                    }
                                  />
                                </PaginationItem>

                                {/* Smart pagination with ellipsis */}
                                {(() => {
                                  const totalPages = Math.ceil(
                                    products.length / productsPerPage
                                  );
                                  const maxVisiblePages = 5;
                                  let startPage = Math.max(
                                    1,
                                    currentPage -
                                      Math.floor(maxVisiblePages / 2)
                                  );
                                  let endPage = Math.min(
                                    totalPages,
                                    startPage + maxVisiblePages - 1
                                  );

                                  if (
                                    endPage - startPage <
                                    maxVisiblePages - 1
                                  ) {
                                    startPage = Math.max(
                                      1,
                                      endPage - maxVisiblePages + 1
                                    );
                                  }

                                  const pages = [];

                                  // First page + ellipsis
                                  if (startPage > 1) {
                                    pages.push(1);
                                    if (startPage > 2) pages.push("...");
                                  }

                                  // Visible pages
                                  for (let i = startPage; i <= endPage; i++) {
                                    pages.push(i);
                                  }

                                  // Ellipsis + last page
                                  if (endPage < totalPages) {
                                    if (endPage < totalPages - 1)
                                      pages.push("...");
                                    pages.push(totalPages);
                                  }

                                  return pages.map((page, index) => (
                                    <PaginationItem key={index}>
                                      {page === "..." ? (
                                        <span className="px-3 py-2 text-muted-foreground">
                                          ...
                                        </span>
                                      ) : (
                                        <PaginationLink
                                          onClick={() =>
                                            setCurrentPage(page as number)
                                          }
                                          isActive={currentPage === page}
                                          className="cursor-pointer"
                                        >
                                          {page}
                                        </PaginationLink>
                                      )}
                                    </PaginationItem>
                                  ));
                                })()}

                                <PaginationItem>
                                  <PaginationNext
                                    onClick={() =>
                                      setCurrentPage((prev) =>
                                        Math.min(
                                          prev + 1,
                                          Math.ceil(
                                            products.length / productsPerPage
                                          )
                                        )
                                      )
                                    }
                                    className={
                                      currentPage ===
                                      Math.ceil(
                                        products.length / productsPerPage
                                      )
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                    }
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        </div>
                      )}

                      {/* Products Summary */}
                      <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                        Showing {(currentPage - 1) * productsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * productsPerPage,
                          products.length
                        )}{" "}
                        of {products.length} products
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>
                  Upload a new product to your catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProductSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={newProduct.slug}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, slug: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        value={newProduct.brand}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            brand: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) =>
                          setNewProduct({ ...newProduct, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productCode">Product Code</Label>
                      <Input
                        id="productCode"
                        value={newProduct.productCode}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            productCode: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Input
                        id="size"
                        value={newProduct.size}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, size: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stock: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price *</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        value={newProduct.costPrice}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            costPrice: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={newProduct.keywords}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          keywords: e.target.value,
                        })
                      }
                      placeholder="Comma separated keywords"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video">Video URL (YouTube/Vimeo)</Label>
                    <Input
                      id="video"
                      value={newProduct.video}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, video: e.target.value })
                      }
                      placeholder="https://youtube.com/embed/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Product Images *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors group"
                          onClick={handleImageClick}
                        >
                          {uploadedImageUrls[i - 1] ? (
                            <div className="relative">
                              <img
                                src={uploadedImageUrls[i - 1]}
                                alt={`Product ${i}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(i - 1);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="group-hover:scale-105 transition-transform">
                              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {i === 1 ? "Main Image" : `Image ${i}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Click to upload
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.jfif"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length + uploadedImageUrls.length > 4) {
                          toast({
                            title: "Too Many Images",
                            description: "Maximum 4 images allowed per product",
                            variant: "destructive",
                          });
                          return;
                        }
                        handleImageUpload(files);
                      }}
                    />

                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        {uploadedImageUrls.length}/4 images uploaded
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleImageClick}
                        disabled={uploadedImageUrls.length >= 4}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Add Images
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Package className="h-4 w-4 mr-2" />
                    {loading ? "Adding Product..." : "Add Product"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Fulfillment</CardTitle>
                <CardDescription>
                  Manage customer orders for your products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pending Orders</h3>
                  {[1, 2, 3].map((order) => (
                    <div
                      key={order}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Order #SUP00{order}</p>
                        <p className="text-sm text-muted-foreground">
                          COSRX Advanced Snail Cream
                        </p>
                        <p className="text-sm">
                          Qty: 2 | Customer: customer{order}@email.com
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ordered: 2 hours ago
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Paid</Badge>
                        <Button
                          size="sm"
                          onClick={() =>
                            alert(`Order #SUP00${order} marked as fulfilled!`)
                          }
                        >
                          Mark Fulfilled
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Upload</CardTitle>
                <CardDescription>
                  Upload multiple products via CSV/Excel file or bulk images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bulk Product Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Product Data Upload
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create and download CSV template with all fields
                          const csvContent = `product_id,name,slug,brand,category,description,keywords,product_code,size,stock_quantity,cost_price,selling_price,discount_percentage,is_featured,is_active,weight,ingredients,how_to_use,benefits,skin_type,age_group,gender,country_of_origin,manufacturing_date,expiry_date,safety_information,tags,seo_title,seo_description,image_url_1,image_url_2,image_url_3,image_url_4
"COSRX-001","COSRX Advanced Snail 96 Mucin Power Essence","cosrx-advanced-snail-essence","COSRX","Skin Care","Lightweight essence containing snail secretion filtrate to hydrate and repair damaged skin","korean skincare hydrating serum snail mucin","COSRX-001","100ml",50,1199,1599,20,true,true,0.1,"Snail Secretion Filtrate 96%, Sodium Hyaluronate","Apply 2-3 drops to clean face and pat gently","Hydrates, repairs, and soothes damaged skin","Dry,Sensitive,Normal","Adult","Unisex","South Korea","2024-01-15","2026-01-15","For external use only. Patch test recommended.","essence,snail,hydrating,korean","COSRX Advanced Snail 96 Mucin Power Essence - Korean Skincare","Premium Korean snail essence for deep hydration and skin repair","download.webp","download (1).webp","download (2).webp","download (3).webp"
"LANEIGE-001","LANEIGE Water Bank Blue Hyaluronic Cream","laneige-water-bank-cream","LANEIGE","Skin Care","Intensive moisturizing cream with blue hyaluronic acid","moisturizer hyaluronic acid korean skincare","LANEIGE-001","50ml",30,2499,3299,0,true,true,0.08,"Blue Hyaluronic Acid, Quinoa Seed Extract","Apply morning and evening as final step","Provides 24-hour hydration and strengthens skin barrier","Dry,Normal","Adult","Unisex","South Korea","2024-02-01","2026-02-01","Avoid contact with eyes","moisturizer,hyaluronic,korean,hydrating","LANEIGE Water Bank Blue Hyaluronic Cream","Intensive hydrating cream with blue hyaluronic acid","download (4).webp","download (5).webp","download (6).webp","download (7).webp"`;

                          const blob = new Blob([csvContent], {
                            type: "text/csv",
                          });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.style.display = "none";
                          a.href = url;
                          a.download = "bulk-upload-template.csv";
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);

                          toast({
                            title: "CSV Template Downloaded",
                            description: "CSV template downloaded successfully",
                          });
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV Template
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create Excel template with tab-separated values and all fields
                          const excelContent = `product_id\tname\tslug\tbrand\tcategory\tdescription\tkeywords\tproduct_code\tsize\tstock_quantity\tcost_price\tselling_price\tdiscount_percentage\tis_featured\tis_active\tweight\tingredients\thow_to_use\tbenefits\tskin_type\tage_group\tgender\tcountry_of_origin\tmanufacturing_date\texpiry_date\tsafety_information\ttags\tseo_title\tseo_description\timage_url_1\timage_url_2\timage_url_3\timage_url_4
COSRX-001\tCOSRX Advanced Snail 96 Mucin Power Essence\tcosrx-advanced-snail-essence\tCOSRX\tSkin Care\tLightweight essence containing snail secretion filtrate to hydrate and repair damaged skin\tkorean skincare hydrating serum snail mucin\tCOSRX-001\t100ml\t50\t1199\t1599\t20\ttrue\ttrue\t0.1\tSnail Secretion Filtrate 96%, Sodium Hyaluronate\tApply 2-3 drops to clean face and pat gently\tHydrates, repairs, and soothes damaged skin\tDry,Sensitive,Normal\tAdult\tUnisex\tSouth Korea\t2024-01-15\t2026-01-15\tFor external use only. Patch test recommended.\tessence,snail,hydrating,korean\tCOSRX Advanced Snail 96 Mucin Power Essence - Korean Skincare\tPremium Korean snail essence for deep hydration and skin repair\tdownload.webp\tdownload (1).webp\tdownload (2).webp\tdownload (3).webp
LANEIGE-001\tLANEIGE Water Bank Blue Hyaluronic Cream\tlaneige-water-bank-cream\tLANEIGE\tSkin Care\tIntensive moisturizing cream with blue hyaluronic acid\tmoisturizer hyaluronic acid korean skincare\tLANEIGE-001\t50ml\t30\t2499\t3299\t0\ttrue\ttrue\t0.08\tBlue Hyaluronic Acid, Quinoa Seed Extract\tApply morning and evening as final step\tProvides 24-hour hydration and strengthens skin barrier\tDry,Normal\tAdult\tUnisex\tSouth Korea\t2024-02-01\t2026-02-01\tAvoid contact with eyes\tmoisturizer,hyaluronic,korean,hydrating\tLANEIGE Water Bank Blue Hyaluronic Cream\tIntensive hydrating cream with blue hyaluronic acid\tdownload (4).webp\tdownload (5).webp\tdownload (6).webp\tdownload (7).webp`;

                          const blob = new Blob([excelContent], {
                            type: "application/vnd.ms-excel",
                          });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.style.display = "none";
                          a.href = url;
                          a.download = "bulk-upload-template.xls";
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);

                          toast({
                            title: "Excel Template Downloaded",
                            description:
                              "Excel-compatible template downloaded successfully",
                          });
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Excel Template
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">
                      Supported File Formats:
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>CSV Files (.csv)</strong> - Comma-separated
                        values
                      </p>
                      <p>
                        <strong>Excel Files (.xlsx)</strong> - Microsoft Excel
                        format
                      </p>
                      <p>
                        <strong>Required:</strong> name, brand, category,
                        cost_price, stock_quantity
                      </p>
                      <p>
                        <strong>Optional:</strong> description, size,
                        product_code, keywords, images
                      </p>
                    </div>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                      <p>
                        <strong>Note:</strong> Product ID is auto-generated.
                        Images should reference filenames from the media
                        library.
                      </p>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">Upload CSV File</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a CSV (.csv) file with your product data. Excel
                      files are not currently supported.
                    </p>
                    <div className="mb-4 p-3 bg-muted rounded text-xs">
                      <strong>CSV Template Headers:</strong>
                      <br />
                      <code className="text-xs">
                        name,brand,category,description,cost_price,stock_quantity,size,product_code,keywords,image_url_1,image_url_2,image_url_3,image_url_4
                      </code>
                    </div>
                    <input
                      ref={bulkFileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          setLoading(true);

                          // Upload file to storage
                          const fileExt = file.name.split(".").pop();
                          const fileName = `bulk-upload-${Date.now()}.${fileExt}`;

                          const { data, error } = await supabase.storage
                            .from("bulk-uploads")
                            .upload(fileName, file);

                          if (error) throw error;

                          toast({
                            title: "File Uploaded! 📊",
                            description: `Processing ${file.name}...`,
                          });

                          // Process the uploaded file
                          console.log("Processing bulk file:", fileName);

                          // Get current user ID
                          const { data: userData } =
                            await supabase.auth.getUser();

                          const { data: processData, error: processError } =
                            await supabase.functions.invoke(
                              "process-bulk-upload",
                              {
                                body: {
                                  fileName,
                                  userId: userData.user?.id,
                                },
                              }
                            );

                          if (processError) {
                            throw processError;
                          }

                          console.log("Bulk upload result:", processData);

                          toast({
                            title: "Bulk Upload Complete! 🎉",
                            description: `Successfully processed ${
                              processData.processed || "multiple"
                            } products from ${
                              file.name
                            }. The UI will refresh automatically.`,
                          });

                          // Refresh products list and stats
                          await fetchProducts();
                          await fetchStats();

                          // Force refresh of the page to ensure all components update
                          setTimeout(() => {
                            window.location.reload();
                          }, 2000);
                        } catch (error) {
                          console.error("Error processing bulk upload:", error);
                          toast({
                            title: "Upload Error",
                            description: `Failed to process bulk file: ${error.message}`,
                            variant: "destructive",
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                    <Button
                      onClick={() => bulkFileInputRef.current?.click()}
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {loading ? "Uploading..." : "Choose File"}
                    </Button>
                  </div>
                </div>

                {/* Bulk Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bulk Image Upload</h3>
                  <div className="border-2 border-dashed border-primary/25 rounded-lg p-8 text-center bg-primary/5">
                    <ImageIcon className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h4 className="font-medium mb-2">
                      Upload Multiple Product Images
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select multiple images to upload for your products
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.jfif"
                      className="hidden"
                      id="bulk-image-upload"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;

                        try {
                          setLoading(true);
                          const uploadedUrls: string[] = [];

                          for (const file of files) {
                            const fileExt = file.name.split(".").pop();
                            const fileName = `bulk-${Date.now()}-${Math.random()
                              .toString(36)
                              .substring(2)}.${fileExt}`;

                            const { data, error } = await supabase.storage
                              .from("product-images")
                              .upload(fileName, file);

                            if (error) throw error;

                            const {
                              data: { publicUrl },
                            } = supabase.storage
                              .from("product-images")
                              .getPublicUrl(fileName);

                            uploadedUrls.push(publicUrl);
                          }

                          toast({
                            title: "Bulk Images Uploaded! 📸",
                            description: `${files.length} images uploaded successfully`,
                          });

                          console.log("Bulk images uploaded:", uploadedUrls);
                        } catch (error) {
                          console.error("Error uploading bulk images:", error);
                          toast({
                            title: "Upload Error",
                            description:
                              "Failed to upload some images. Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                    <Button
                      onClick={() =>
                        document.getElementById("bulk-image-upload")?.click()
                      }
                      disabled={loading}
                      className="mr-4"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {loading ? "Uploading..." : "Upload Images"}
                    </Button>
                  </div>
                </div>

                {/* Templates and Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Create comprehensive CSV template for bulk upload
                        const csvContent = `product_id,name,slug,brand,category,description,keywords,product_code,size,stock_quantity,cost_price,selling_price,discount_percentage,is_featured,is_active,weight,ingredients,how_to_use,benefits,skin_type,age_group,gender,country_of_origin,manufacturing_date,expiry_date,safety_information,tags,seo_title,seo_description,image_url_1,image_url_2,image_url_3,image_url_4
"COSRX-001","COSRX Advanced Snail 96 Mucin Power Essence","cosrx-advanced-snail-essence","COSRX","Skin Care","Lightweight essence containing snail secretion filtrate to hydrate and repair damaged skin","korean skincare hydrating serum snail mucin","COSRX-001","100ml",50,1199,1599,20,true,true,0.1,"Snail Secretion Filtrate 96%, Sodium Hyaluronate","Apply 2-3 drops to clean face and pat gently","Hydrates, repairs, and soothes damaged skin","Dry,Sensitive,Normal","Adult","Unisex","South Korea","2024-01-15","2026-01-15","For external use only. Patch test recommended.","essence,snail,hydrating,korean","COSRX Advanced Snail 96 Mucin Power Essence - Korean Skincare","Premium Korean snail essence for deep hydration and skin repair","download.webp","download (1).webp","download (2).webp","download (3).webp"
"LANEIGE-001","LANEIGE Water Bank Blue Hyaluronic Cream","laneige-water-bank-cream","LANEIGE","Skin Care","Intensive moisturizing cream with blue hyaluronic acid","moisturizer hyaluronic acid korean skincare","LANEIGE-001","50ml",30,2499,3299,0,true,true,0.08,"Blue Hyaluronic Acid, Quinoa Seed Extract","Apply morning and evening as final step","Provides 24-hour hydration and strengthens skin barrier","Dry,Normal","Adult","Unisex","South Korea","2024-02-01","2026-02-01","Avoid contact with eyes","moisturizer,hyaluronic,korean,hydrating","LANEIGE Water Bank Blue Hyaluronic Cream","Intensive hydrating cream with blue hyaluronic acid","download (4).webp","download (5).webp","download (6).webp","download (7).webp"
"INNISFREE-001","INNISFREE Green Tea Hydrating Amino Acid Cleansing Foam","innisfree-green-tea-cleanser","INNISFREE","Skin Care","Gentle cleansing foam enriched with green tea from Jeju Island","cleanser green tea foam jeju island korean","INNISFREE-001","150ml",25,699,999,0,false,true,0.15,"Green Tea Extract, Amino Acids","Lather with water and massage onto face, rinse thoroughly","Gently cleanses while maintaining skin moisture","All","Adult","Unisex","South Korea","2024-03-01","2026-03-01","Rinse immediately if contact with eyes","cleanser,green tea,gentle,korean","INNISFREE Green Tea Hydrating Amino Acid Cleansing Foam","Gentle green tea cleanser from Jeju Island","download (8).webp","download (9).webp","download (10).webp","download (11).webp"`;

                        const blob = new Blob([csvContent], {
                          type: "text/csv",
                        });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "bulk-upload-template.csv";
                        a.click();
                        window.URL.revokeObjectURL(url);

                        toast({
                          title: "Template Downloaded! 📋",
                          description: "Use this CSV format for bulk uploads",
                        });
                      }}
                    >
                      <File className="h-4 w-4 mr-2" />
                      Download Enhanced CSV Template
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Supported formats & features:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="outline">CSV</Badge>
                      <Badge variant="outline">XLSX</Badge>
                      <Badge variant="outline">Product ID Mapping</Badge>
                      <Badge variant="outline">Multiple Images</Badge>
                      <Badge variant="outline">Video URLs</Badge>
                      <Badge variant="outline">Auto Media Sync</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
