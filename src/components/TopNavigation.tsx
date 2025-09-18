import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Heart,
  Sun,
  Droplets,
  Zap,
  Shield,
  Star,
  Crown,
  Award,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DynamicSearch } from "./DynamicSearch";

export const TopNavigation = () => {
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBanner, setActiveBanner] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<any[]>(
    []
  );
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");

  const totalItems = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear search input
    }
  };

  useEffect(() => {
    const fetchActiveBanner = async () => {
      // Add timestamp to prevent caching
      const { data } = await supabase
        .from("homepage_banners")
        .select("*")
        .eq("is_active", true)
        .eq("banner_type", "promotional")
        .order("position")
        .limit(1);

      if (data && data.length > 0) {
        setActiveBanner(data[0]);
      }
    };

    const fetchBrands = async () => {
      const { data } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("position");

      if (data) {
        setBrands(data);
      }
    };

    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("level, position, name");

      if (data) {
        setCategories(data);

        // Create hierarchical structure
        const hierarchy = data
          .filter((cat) => cat.level === 0)
          .map((parentCat) => ({
            ...parentCat,
            children: data
              .filter(
                (cat) => cat.parent_id === parentCat.slug && cat.level === 1
              )
              .map((childCat) => ({
                ...childCat,
                children: data.filter(
                  (cat) => cat.parent_id === childCat.slug && cat.level === 2
                ),
              })),
          }));

        setHierarchicalCategories(hierarchy);
      }
    };

    const fetchLogo = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "main_logo")
        .single();

      if (data?.setting_value) {
        setLogoUrl(data.setting_value);
      }
    };

    fetchActiveBanner();
    fetchBrands();
    fetchCategories();
    fetchLogo();

    // Set up real-time subscription for banners
    const bannerSubscription = supabase
      .channel("homepage_banners_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_banners" },
        () => {
          fetchActiveBanner();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      bannerSubscription.unsubscribe();
    };
  }, []);

  const handleCategoryHover = (category: any) => {
    if (category.has_children) {
      setActiveCategory(category);
    }
  };

  const handleCategoryClick = (category: any) => {
    navigate(`/products?category=${category.slug}`);
    setActiveCategory(null);
  };

  return (
    <div className="w-full bg-background border-b border-border sticky top-0 z-50">
      {/* Promotional Banner */}
      {activeBanner && (
        <div
          className="w-full py-2 text-center text-sm font-medium overflow-hidden relative"
          style={{
            backgroundColor: activeBanner.background_color,
            color: activeBanner.text_color,
          }}
        >
          <div className="container mx-auto px-4">
            <div className="animate-scroll whitespace-nowrap">
              <span className="inline-block px-4">{activeBanner.title}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Logo - Far Left */}
          <div
            className="flex-shrink-0 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src={
                logoUrl ||
                "/lovable-uploads/908a6451-2aaf-44eb-bb13-5823b663f442.png"
              }
              alt="Consumer Innovations Store"
              className="h-20 w-auto object-contain hover:scale-105 transition-all duration-300"
            />
          </div>

          {/* Search - Center */}
          <div className="flex-1 max-w-2xl px-8">
            <DynamicSearch
              onSelect={(result) =>
                navigate(`/search?q=${encodeURIComponent(result.title)}`)
              }
              placeholder="Search for Consumer Innovations products, brands, or categories..."
              className="w-full"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden md:inline">Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel>Shop by Category</DropdownMenuLabel>
                <div className="p-2">
                  {hierarchicalCategories.map((category) => (
                    <div key={category.id} className="mb-2">
                      <div
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-all duration-200"
                        onClick={() => handleCategoryClick(category)}
                        onMouseEnter={() => handleCategoryHover(category)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: category.color_theme + "20",
                            }}
                          >
                            {category.icon_name === "Droplets" && (
                              <Droplets
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                            {category.icon_name === "Sparkles" && (
                              <Sparkles
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                            {category.icon_name === "Star" && (
                              <Star
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                            {category.icon_name === "Heart" && (
                              <Heart
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                            {category.icon_name === "Shield" && (
                              <Shield
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                            {category.icon_name === "Zap" && (
                              <Zap
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                            {category.icon_name === "Sun" && (
                              <Sun
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                            {category.icon_name === "Crown" && (
                              <Crown
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                            {category.icon_name === "Award" && (
                              <Award
                                className="h-4 w-4"
                                style={{ color: category.color_theme }}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {category.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        {category.children && category.children.length > 0 && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Brands Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span className="hidden md:inline">Brands</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Shop by Brand</DropdownMenuLabel>
                <div className="space-y-1">
                  {brands.map((brand) => (
                    <DropdownMenuItem
                      key={brand.id}
                      onClick={() =>
                        navigate(
                          `/search?brand=${brand.name
                            .replace(/\s+/g, "-")
                            .toUpperCase()}`
                        )
                      }
                      className="group px-3 py-3 rounded-lg hover:bg-accent transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {brand.name
                                .split(" ")
                                .map((word: string) => word[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{brand.name}</p>
                          {brand.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {brand.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin/Supplier Links */}
            {user && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/supplier")}
                >
                  Supplier
                </Button>
              </>
            )}

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* Shopping Cart */}
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* User Menu or Sign In */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
