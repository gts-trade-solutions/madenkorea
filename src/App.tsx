import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import SearchPage from "./pages/SearchPage";
import ProductsPage from "./pages/ProductsPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import SupplierPortal from "./components/supplier/SupplierPortal";
import SupplierRegistrationPage from "./pages/SupplierRegistrationPage";
import StaticPage from "./pages/StaticPage";
import NotFound from "./pages/NotFound";
import WholesaleProcessPage from "./pages/B2bPage";
import SmartSwiper from "./pages/SkincarePage";
import { ProductDetail } from "./pages/ProductDetail";
import MakeupSection from "./pages/MakeupPage";
import BabyPage from "./pages/BabyPage";
import Lifeandhome from "./pages/Life&HomePage";
import StaticProductPage from "./pages/StaticProductPage";
import ScrollToTop from "./ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster position="top-right" />
              <Sonner />
              <BrowserRouter>
               <ScrollToTop>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route
                    path="/product-s/:id"
                    element={<StaticProductPage />}
                  />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route
                    path="/order-confirmation"
                    element={<OrderConfirmationPage />}
                  />
                  <Route
                    path="/payment-success"
                    element={<PaymentSuccessPage />}
                  />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/supplier" element={<SupplierPortal />} />
                  <Route
                    path="/supplier/register"
                    element={<SupplierRegistrationPage />}
                  />
                  <Route
                    path="/business-to-business"
                    element={<WholesaleProcessPage />}
                  />
                  <Route path="/Skincare" element={<SmartSwiper />} />
                  <Route path="/Makeup" element={<MakeupSection />} />
                  <Route path="/baby" element={<BabyPage />} />
                  <Route path="/life" element={<Lifeandhome />} />
                  <Route path="/page/:slug" element={<StaticPage />} />
                  {/* Category and Brand routes */}
                  <Route path="/category/:category" element={<SearchPage />} />
                  <Route path="/brand/:brand" element={<SearchPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </ScrollToTop>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
