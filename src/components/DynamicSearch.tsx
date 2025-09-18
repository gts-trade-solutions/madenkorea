import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, Clock, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  type: "product" | "category" | "brand";
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  brand?: string;
  isPopular?: boolean;
}

interface DynamicSearchProps {
  placeholder?: string;
  className?: string;
  onSelect?: (result: SearchResult) => void;
  autoFocus?: boolean;
}

export const DynamicSearch = ({
  placeholder = "Search for Consumer Innovations products...",
  className = "",
  onSelect,
  autoFocus = false,
}: DynamicSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<SearchResult[]>(
    []
  );

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch popular categories and trending products
  useEffect(() => {
    const fetchPopularData = async () => {
      try {
        // Fetch popular categories
        const { data: categories } = await supabase
          .from("categories")
          .select("name, slug, color_theme")
          .eq("is_active", true)
          .order("position")
          .limit(6);

        if (categories) {
          const categoryResults: SearchResult[] = categories.map((cat) => ({
            id: cat.slug,
            type: "category",
            title: cat.name,
            subtitle: "Category",
            isPopular: true,
          }));
          setPopularCategories(categoryResults);
        }
      } catch (error) {
        console.error("Error fetching popular data:", error);
      }
    };

    fetchPopularData();
  }, []);

  // Auto-focus if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchTerm = searchQuery.toLowerCase().trim();

      // Search products
      const { data: products } = await supabase
        .from("products")
        .select(
          `
          product_id,
          name,
          brand,
          category,
          selling_price,
          cost_price,
          product_media (
            media_url,
            is_primary
          )
        `
        )
        .eq("is_active", true)
        .or(
          `name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
        )
        .limit(6);

      // Search categories
      const { data: categories } = await supabase
        .from("categories")
        .select("name, slug, description")
        .eq("is_active", true)
        .ilike("name", `%${searchTerm}%`)
        .limit(4);

      // Search brands
      const { data: brands } = await supabase
        .from("brands")
        .select("name, description")
        .eq("is_active", true)
        .ilike("name", `%${searchTerm}%`)
        .limit(4);

      const searchResults: SearchResult[] = [];

      // Add product results
      if (products) {
        products.forEach((product) => {
          const primaryImage = product.product_media?.find(
            (media) => media.is_primary
          );
          searchResults.push({
            id: product.product_id,
            type: "product",
            title: product.name,
            subtitle: `${product.brand} • ${product.category}`,
            image: primaryImage?.media_url,
            price: Number(product.selling_price || product.cost_price),
            originalPrice: Number(product.cost_price),
            brand: product.brand,
            category: product.category,
          });
        });
      }

      // Add category results
      if (categories) {
        categories.forEach((category) => {
          searchResults.push({
            id: category.slug,
            type: "category",
            title: category.name,
            subtitle: `Category • ${category.description || "Browse products"}`,
          });
        });
      }

      // Add brand results
      if (brands) {
        brands.forEach((brand) => {
          searchResults.push({
            id: brand.name,
            type: "brand",
            title: brand.name,
            subtitle: `Brand • ${brand.description || "View all products"}`,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, performSearch]);

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const updatedRecent = [
      result.title,
      ...recentSearches.filter((item) => item !== result.title),
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

    // Navigate based on result type
    switch (result.type) {
      case "product":
        navigate(`/product/${result.id}`);
        break;
      case "category":
        navigate(`/search?category=${encodeURIComponent(result.title)}`);
        break;
      case "brand":
        navigate(`/search?brand=${encodeURIComponent(result.title)}`);
        break;
    }

    // Call optional callback
    onSelect?.(result);
    setIsOpen(false);
    setQuery("");
  };

  // Handle recent search selection
  const handleRecentSearch = (search: string) => {
    setQuery(search);
    navigate(`/search?q=${encodeURIComponent(search)}`);
    setIsOpen(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const updatedRecent = [
        query,
        ...recentSearches.filter((item) => item !== query),
      ].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const showDropdown =
    isOpen &&
    (query.length > 0 ||
      recentSearches.length > 0 ||
      popularCategories.length > 0);

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-10 w-full"
          autoComplete="off"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearQuery}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Search Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden shadow-lg border">
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {/* Loading State */}
              {isLoading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Searching...
                  </p>
                </div>
              )}

              {/* Search Results */}
              {!isLoading && query && results.length > 0 && (
                <div className="p-2">
                  <div className="text-sm font-medium text-muted-foreground px-2 py-1 mb-2">
                    Search Results
                  </div>
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleSelect(result)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                    >
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      {result.price && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold">
                            ₹{result.price}
                          </p>
                          {result.originalPrice &&
                            result.originalPrice > result.price && (
                              <p className="text-xs text-muted-foreground line-through">
                                ₹{result.originalPrice}
                              </p>
                            )}
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!isLoading && query && results.length === 0 && (
                <div className="p-4 text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-sm text-muted-foreground">
                    No results found for "{query}"
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() =>
                      navigate(`/search?q=${encodeURIComponent(query)}`)
                    }
                    className="mt-2"
                  >
                    Search all products
                  </Button>
                </div>
              )}

              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <>
                  <div className="p-2">
                    <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Recent Searches
                      </span>
                    </div>
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => handleRecentSearch(search)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm flex-1">{search}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </>
              )}

              {/* Popular Categories */}
              {!query && popularCategories.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Popular Categories
                    </span>
                  </div>
                  {popularCategories.map((category, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelect(category)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{category.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
