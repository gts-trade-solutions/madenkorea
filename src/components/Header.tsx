import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Star,
  Crown,
  Menu,
  Languages,
  Check,
  Heart,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DynamicSearch } from "./DynamicSearch";
import { US, IN, KR, JP, SA } from "country-flag-icons/react/3x2";

/** Lightweight wishlist count hook (localStorage + event sync) */
const useWishlistCount = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("wishlist:v1");
        setCount(
          raw
            ? (JSON.parse(raw) as { id: string; addedAt: number }[]).length
            : 0
        );
      } catch {
        setCount(0);
      }
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "wishlist:v1") read();
    };
    const onCustom = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("wishlist-updated", onCustom as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wishlist-updated", onCustom as any);
    };
  }, []);
  return count;
};

const LANGUAGES = [
  {
    code: "en",
    label: "English",
    flag: <US title="United States" height={15} />,
  },
  { code: "ko", label: "한국어", flag: <KR title="Korea" height={15} /> },
  { code: "hi", label: "हिन्दी", flag: <IN title="India" height={15} /> },
  { code: "ja", label: "日本語", flag: <JP title="Japan" height={15} /> },
  {
    code: "ar",
    label: "العربية",
    flag: <SA title="Saudi Arabia" height={15} />,
  },
];

export const Header = () => {
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const [activeBanner, setActiveBanner] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<any[]>(
    []
  );
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<string>("en");

  const totalItems = getTotalItems();
  const wishlistCount = useWishlistCount();

  // anchor inside Sheet to scroll to “Categories”
  const mobileCatsAnchorRef = useRef<HTMLDivElement | null>(null);

  // Normalize -> route mapping
  const normalize = (v: string) =>
    v
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");

  const categoryPathMap: Record<string, string> = {
    "skin care": "/Skincare",
    "make up": "/Makeup",
    "hair care": "/",
    "body care": "/",
    "men care": "/",
    "beauty tools": "/",
    "health and personal care": "/",
    "perfume and deodorant": "/",
    "life and home": "/life",
    baby: "/baby",
    "food and beverages": "/FoodAndBeverages",
    others: "/Others",
    "k pop": "/",
    exclusive: "/Exclusive",
  };

  const handleCategoryClick = (category: { name?: string } | string) => {
    const name = typeof category === "string" ? category : category?.name ?? "";
    const key = normalize(name);
    const path = categoryPathMap[key];
    if (path) return navigate(path);
    return navigate(`/search?category=${encodeURIComponent(name)}`);
  };

  const changeLanguage = (code: string) => {
    setLang(code);
    try {
      localStorage.setItem("lang", code);
    } catch {}
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved) setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: bannerData } = await supabase
          .from("homepage_banners")
          .select("*")
          .eq("is_active", true)
          .eq("banner_type", "promotional")
          .order("position")
          .limit(1);
        if (bannerData?.length) setActiveBanner(bannerData[0]);

        const { data: brandsData } = await supabase
          .from("brands")
          .select("*")
          .eq("is_active", true)
          .order("position");
        if (brandsData) setBrands(brandsData);

        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("level, position, name");
        if (categoriesData) {
          const buildHierarchy = (
            cats: any[],
            parentId: string | null = null,
            level = 0
          ) =>
            cats
              .filter((c) => c.parent_id === parentId && c.level === level)
              .map((c) => ({
                ...c,
                children: c.has_children
                  ? buildHierarchy(
                      cats,
                      c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
                      level + 1
                    )
                  : [],
              }));
          setHierarchicalCategories(buildHierarchy(categoriesData));
        }

        const { data: logoData } = await supabase
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "main_logo")
          .single();
        if (logoData?.setting_value) setLogoUrl(logoData.setting_value);
      } catch (error) {
        console.error("Header fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const openSheetAndFocusCategories = () => {
    setMobileMenuOpen(true);
    setTimeout(() => {
      mobileCatsAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const PRIORITY = ["Skin Care", "Baby", "Life & Home"];
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const priorityIndex = (name: string) => {
    const i = PRIORITY.map(norm).indexOf(norm(name));
    return i === -1 ? Number.MAX_SAFE_INTEGER : i; // non-priority go to the end
  };
  const isEnabledCategory = (name: string) =>
    PRIORITY.map(norm).includes(norm(name));

  // inside your component (before the return)
  const sortedCategories = [...hierarchicalCategories].sort((a, b) => {
    const ai = priorityIndex(a.name);
    const bi = priorityIndex(b.name);
    if (ai !== bi) return ai - bi; // priority order first
    if (ai === Number.MAX_SAFE_INTEGER && bi === Number.MAX_SAFE_INTEGER) {
      // the rest alphabetically
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }
    return 0;
  });

  return (
    <header
      className="
        w-full sticky top-0 z-[70] border-b border-border overflow-visible isolate
        bg-background/95 supports-[backdrop-filter]:bg-background/75 backdrop-blur
        pt-[env(safe-area-inset-top)]
      "
    >
      {/* inline CSS helpers */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none;}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
      `}</style>

      {/* Banner */}
      {activeBanner && (
        <div className="border-b border-border/50 overflow-hidden">
          <div
            className="text-center py-2 px-3 text-xs font-bold overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)", // fallback gradient
              color: "#ffffff",
            }}
          >
            <div
              className="animate-marquee whitespace-nowrap relative z-10 uppercase"
              style={{
                animationDuration: `${activeBanner.animation_speed || 30}s`,
                letterSpacing: "0.05em",
              }}
            >
              🎉 {activeBanner.title}
              {activeBanner.subtitle && (
                <span className="mx-4 text-yellow-300">
                  | {activeBanner.subtitle}
                </span>
              )}{" "}
              🎉
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 max-w-full">
        {/* =============== MOBILE ROW (visible < md) =============== */}
        <div className="flex lg:hidden h-14 items-center justify-between w-full gap-1">
          {/* Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="p-0 -ml-1 h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg"
                aria-label="Open menu"
              >
                <Menu className="h-7 w-7" strokeWidth={2.5} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="
                z-[100] w-[92vw] sm:w-80 p-0
                h-[100dvh] max-h-[100dvh]
                pt-[env(safe-area-inset-top)]
                pb-[env(safe-area-inset-bottom)]
                overflow-y-auto overscroll-contain
                bg-background
              "
            >
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>

              {/* quick actions */}
              <div className="px-4 pt-4 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  className="rounded-full text-xs font-semibold"
                  onClick={() => {
                    navigate("/business-to-business");
                    setMobileMenuOpen(false);
                  }}
                >
                  B2B
                </Button>

                {/* Language quick switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full h-9 px-3 text-xs"
                    >
                      <Languages className="h-4 w-4 mr-1" />
                      <span className="mr-1">
                        {LANGUAGES.find((l) => l.code === lang)?.flag}
                      </span>
                      <span className="uppercase">{lang}</span>
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 z-[110]">
                    <DropdownMenuLabel>Language</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {LANGUAGES.map((l) => (
                      <DropdownMenuItem
                        key={l.code}
                        onClick={() => changeLanguage(l.code)}
                        className="flex items-center gap-2"
                      >
                        <span className="text-base">{l.flag}</span>
                        <span className="flex-1">{l.label}</span>
                        {lang === l.code && (
                          <Check className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="py-4">
                {/* Search in sheet */}
                <div className="px-4 mb-6">
                  <DynamicSearch
                    placeholder="Search products..."
                    className="
                      relative z-[105] w-full text-[16px] min-h-10 rounded-md
                      [&_input]:h-11
                      [&_input]:border [&_input]:border-[#f26666]
                      [&_input]:bg-background
                      [&_input]:focus:ring-2 [&_input]:focus:ring-[#f26666]/30
                      [&_input]:focus:border-[#f26666]
                      [&_svg]:text-[#f26666]
                    "
                  />
                </div>

                {/* Categories (anchor for scroll) */}
                <div ref={mobileCatsAnchorRef} className="px-4 mb-2">
                  <h3 className="font-semibold mb-3 text-foreground">
                    Categories
                  </h3>
                </div>

                <div className="px-4 mb-6 space-y-2">
                  {sortedCategories.map((category) => {
                    const enabled = isEnabledCategory(category.name);
                    return (
                      <Button
                        key={category.id}
                        variant="ghost"
                        disabled={!enabled}
                        aria-disabled={!enabled}
                        className={`w-full justify-start h-12 px-3 ${
                          enabled
                            ? ""
                            : "opacity-50 cursor-not-allowed pointer-events-none"
                        }`}
                        onClick={() => {
                          if (!enabled) return;
                          handleCategoryClick(category);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: `${
                                category.color_theme || "#000000"
                              }20`,
                            }}
                          >
                            <Star
                              className="h-5 w-5"
                              style={{
                                color: category.color_theme || "#000000",
                              }}
                            />
                          </div>

                          <span className="text-sm font-medium truncate">
                            {category.name}
                          </span>

                          {enabled && category.children?.length > 0 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* User actions */}
                <div className="px-4 border-t pt-4">
                  {user ? (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => {
                          navigate("/account");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <User className="mr-3 h-5 w-5" strokeWidth={3} />
                        My Account
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-3 h-5 w-5" strokeWidth={3} />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full h-12"
                        onClick={() => {
                          navigate("/auth");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogIn className="mr-2 h-5 w-5" strokeWidth={3} />
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-full h-14 flex items-center justify-center">
                <img
                  src={logoUrl || "/lovable-uploads/log.png"}
                  alt="Consumer Innovations Store"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5">
            {user && (
              <span className="[&_svg]:[stroke-width:3]">
                <NotificationBell />
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/wishlist")}
              className="relative p-2 h-11 w-11 min-h-[44px] min-w-[44px]"
              aria-label="Wishlist"
            >
              <Heart className="h-6 w-6" strokeWidth={3} />
              {wishlistCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cart")}
              className="relative p-2 h-11 w-11 min-h-[44px] min-w-[44px]"
            >
              <ShoppingCart className="h-7 w-7" strokeWidth={3} />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* ✅ MOBILE TOGGLE BAR (chips) */}
        <div className="lg:hidden border-t border-border bg-background">
          <div
            className="flex gap-2 px-3 py-2 overflow-x-auto"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {/* hide webkit scrollbar inline via class defined above */}
            <div className="flex gap-2 no-scrollbar">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-4 w-4 mr-2" /> Menu
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9"
                onClick={() => setMobileMenuOpen(true)} // search is at top of the sheet
              >
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9"
                onClick={openSheetAndFocusCategories}
              >
                <Star className="h-4 w-4 mr-2" /> Categories
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9"
                // onClick={() => navigate("/search?tab=brands")}
              >
                <Crown className="h-4 w-4 mr-2" /> Brands
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9"
                onClick={() => navigate("/wishlist")}
              >
                <Heart className="h-4 w-4 mr-2" /> Wishlist
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="h-4 w-4 mr-2" /> Cart
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9"
                onClick={() => navigate(user ? "/account" : "/auth")}
              >
                <User className="h-4 w-4 mr-2" /> {user ? "Account" : "Sign In"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-9"
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    {LANGUAGES.find((l) => l.code === lang)?.flag}{" "}
                    {lang.toUpperCase()}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuLabel>Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {LANGUAGES.map((l) => (
                    <DropdownMenuItem
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                    >
                      <span className="mr-2">{l.flag}</span> {l.label}
                      {lang === l.code && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* =============== DESKTOP ROW (hidden < md) =============== */}
        <div className="hidden lg:flex items-center justify-between gap-8">
          {/* Logo */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="h-24 flex items-center py-2">
              <img
                src={logoUrl || "/lovable-uploads/log.png"}
                alt="Consumer Innovations Store"
                className="h-16 w-auto object-contain hover:scale-105 transition-all duration-300 ms-7"
              />
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <DynamicSearch
              placeholder="Search for Consumer Innovations products..."
              className="
                relative z-[80] w-full rounded-md
                text-[#f26666] placeholder-[#f26666]/70
                [&_input]:h-11
                [&_input]:border [&_input]:border-[#f26666] [&_input]:rounded-md
                [&_input]:bg-background
                [&_input]:text-[#f26666] [&_input]:placeholder-[#f26666]/70
                [&_input]:outline-none [&_input]:shadow-none
                [&_input]:focus:border-[#f26666]
                [&_input]:focus:ring-2 [&_input]:focus:ring-[#f26666]/30
                [&_svg]:text-[#f26666]
                [&_[data-radix-popper-content-wrapper]]:z-[95]
              "
            />
          </div>

          {/* Right nav */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button
              variant="outline"
              className="hidden md:inline-flex rounded-full text-sm border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate("/business-to-business")}
            >
              B2B
            </Button>

            {/* Language dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-lg hover:bg-accent/50 transition-colors group"
                  aria-label="Select language"
                >
                  {/* <Languages className="mr-2 h-4 w-4" /> */}
                  <span className="mr-1">
                    {LANGUAGES.find((l) => l.code === lang)?.flag}
                  </span>
                  <span className="uppercase">{lang}</span>
                  <ChevronDown className="ml-1 h-4 w-4 group-data-[state=open]:rotate-180 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-background border border-border shadow-lg rounded-lg p-2 z-[85]"
              >
                <DropdownMenuLabel className="px-2 py-1.5">
                  Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 mb-1" />
                {LANGUAGES.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className="flex items-center gap-2 rounded-md cursor-pointer"
                  >
                    {l.flag}
                    <span className="flex-1">{l.label}</span>
                    {lang === l.code && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Categories */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-lg hover:bg-accent/50 transition-colors group"
                >
                  Categories
                  <ChevronDown className="ml-1 h-4 w-4 group-data-[state=open]:rotate-180 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[600px] bg-background border border-border shadow-lg rounded-lg p-0 z-[85]"
              >
                <div className="flex">
                  <div className="w-1/2 border-r border-border">
                    <DropdownMenuLabel className="text-sm font-semibold text-foreground px-4 py-3 border-b border-border">
                      Shop by Category
                    </DropdownMenuLabel>
                    <div className="p-2">
                      {sortedCategories.map((category) => {
                        const enabled = isEnabledCategory(category.name);

                        return (
                          <DropdownMenuItem
                            key={category.id}
                            disabled={!enabled} // shadcn prop disables interactions
                            onMouseEnter={
                              enabled
                                ? () => setActiveCategory(category)
                                : undefined
                            }
                            onClick={
                              enabled
                                ? () => handleCategoryClick(category)
                                : undefined
                            }
                            className={`group px-3 py-2 rounded-lg transition-colors
        ${
          enabled
            ? "hover:bg-accent cursor-pointer"
            : "opacity-50 cursor-not-allowed pointer-events-none"
        }`}
                            aria-disabled={!enabled}
                            tabIndex={enabled ? 0 : -1}
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor: `${
                                    category.color_theme || "#000000"
                                  }20`,
                                }}
                              >
                                <Star
                                  className="h-4 w-4"
                                  style={{
                                    color: category.color_theme || "#000000",
                                  }}
                                />
                              </div>

                              <div className="flex-1">
                                <div className="font-medium text-sm text-foreground">
                                  {category.name}
                                </div>
                              </div>

                              {enabled && category.children?.length > 0 && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </div>

                  {/* <div className="w-1/2">
                    <DropdownMenuLabel className="text-sm font-semibold text-foreground px-4 py-3 border-b border-border">
                      {activeCategory
                        ? activeCategory.name
                        : "Select a category"}
                    </DropdownMenuLabel>
                    <div className="p-2">
                      {activeCategory?.children?.length ? (
                        activeCategory.children.map((subcategory: any) => (
                          <DropdownMenuItem
                            key={subcategory.id}
                            onClick={() => handleCategoryClick(subcategory)}
                            className="group px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <div className="w-6 h-6 rounded flex items-center justify-center bg-muted">
                                <Star className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm text-foreground">
                                  {subcategory.name}
                                </div>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center text-muted-foreground text-sm">
                          {activeCategory
                            ? "No subcategories available"
                            : "Hover over a category to see subcategories"}
                        </div>
                      )}
                    </div>
                  </div> */}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Brands */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-lg hover:bg-accent/50 transition-colors group"
                >
                  <Crown className="mr-2 h-4 w-4 text-primary" />
                  Brands
                  {/* <ChevronDown className="ml-1 h-4 w-4 group-data-[state=open]:rotate-180 transition-transform" /> */}
                </Button>
              </DropdownMenuTrigger>
              {/* <DropdownMenuContent
                align="start"
                className="w-72 maxHeight-96 overflow-y-auto bg-background border border-border shadow-lg rounded-lg p-2 z-[85]"
                style={{ maxHeight: 384 }}
              >
                <DropdownMenuLabel className="text-sm font-semibold text-foreground px-2 py-2 mb-1">
                  Consumer Innovations Brands
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 mb-2" />
                <div className="space-y-1">
                  {brands.map((brand) => (
                    <DropdownMenuItem
                      key={brand.id}
                      // onClick={() =>
                      //   navigate(
                      //     `/search?brand=${brand.name
                      //       .replace(/\s+/g, "-")
                      //       .toUpperCase()}`
                      //   )
                      // }
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
                                .map((w: string) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {brand.name}
                          </div>
                          {brand.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {brand.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent> */}
            </DropdownMenu>

            {user && (
              <span className="[&_svg]:[stroke-width:3]">
                <NotificationBell />
              </span>
            )}

            {/* Wishlist */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/wishlist")}
              aria-label="Wishlist"
            >
              <Heart className="h-7 w-7" strokeWidth={3} />
              {wishlistCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Button> */}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-8 w-8" strokeWidth={3} />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" strokeWidth={3} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background border border-border shadow-lg z-[85]"
                >
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.email}
                  </div>
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
                  <LogIn className="mr-2 h-4 w-4" strokeWidth={3} />
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  <UserPlus className="mr-2 h-4 w-4" strokeWidth={3} />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
