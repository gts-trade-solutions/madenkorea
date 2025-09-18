import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import StaticProducts, { StaticProduct } from "@/pages/Productlist";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { Heart, RotateCcw, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
/* =========================
   Helpers
========================= */

const toSlug = (s: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

// 👇 Set your preferred USD→INR rate here
const USD_INR_RATE = 84.5;
const usdToInr = (usd: number) => round2(usd * USD_INR_RATE);

// Your JSON is an array-of-arrays, flatten it once.
const ALL_STATIC: StaticProduct[] = Array.isArray(StaticProducts)
  ? (StaticProducts as StaticProduct[][]).flat()
  : [];

/* =========================
   Local "view" model
========================= */
type ProductView = {
  product_id: string;
  name: string;
  brand?: string;
  description?: string;
  cost_price: number; // current price
  selling_price?: number; // MRP (optional)
  stock_quantity: number; // derived from inStock
  product_media: {
    media_url: string;
    media_type: "image";
    is_primary: boolean;
    position: number | null;
  }[];
};

/* =========================
   Variant config per product (by slug/name)
========================= */
type VariantOption = { key: string; label: string; priceINR: number };

const normalizeKey = (s?: string) =>
  (s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const VARIANTS: Record<string, VariantOption[]> = {
  // ampoule gold: 2ml $110, 5ml $70
  ampoule_gold: [
    { key: "2ml_x20", label: "2ml • 20 nos", priceINR: usdToInr(110) },
    { key: "5ml_x1", label: "5ml • 1 nos", priceINR: usdToInr(15) },
    { key: "5ml_x5", label: "5ml • 5 nos", priceINR: usdToInr(70) }
  ],

  // ampoule white: 5ml 1nos $10, 5ml 5nos $46
  ampoule_white: [
    { key: "5ml_x1", label: "5ml • 1 nos", priceINR: usdToInr(10) },
    { key: "5ml_x5", label: "5ml • 5 nos", priceINR: usdToInr(46) },
  ],
};

export default function StaticProductPage() {

  
  // Support /product-static/:slug | :id | :handle
  const params = useParams<{ slug?: string; id?: string; handle?: string }>();
  const handleParam = params.slug ?? params.id ?? params.handle;

  const { toast } = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductView | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);

  async function ensureStaticProductInDB(opts: {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  image?: string;
  price: number;      // cost_price (current price you charge)
  mrp?: number | null; // optional strike
  inStock?: boolean;
  slug?: string;
}) {
  const {
    id,
    name,
    brand,
    category,
    description,
    image,
    price,
    mrp,
    inStock,
    slug
  } = opts;

  // 1) Upsert minimal product row
  const productPayload: any = {
    product_id: id,
    name,
    slug: slug || toSlug(name),
    brand: brand ?? null,
    category: category ?? "misc",
    description: description ?? "",
    cost_price: Number(price) || 0,
    selling_price: mrp == null ? null : Number(mrp),
    discount_percentage:
      mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    stock_quantity: inStock === false ? 0 : 99,
    is_active: true,
    tags: [], // keep it simple
  };

  // Check existence
  const { data: exists, error: chkErr } = await supabase
    .from("products")
    .select("product_id")
    .eq("product_id", id)
    .limit(1);

  if (chkErr) {
    console.error("check products failed", chkErr);
  }

  if (!exists || exists.length === 0) {
    const { error: upErr } = await supabase.from("products").upsert(productPayload, {
      onConflict: "product_id",
    });
    if (upErr) {
      console.error("upsert product failed", upErr);
      throw upErr;
    }
  } else {
    // Optional: keep details fresh (safe no-op if you’d rather not)
    await supabase.from("products").update(productPayload).eq("product_id", id);
  }

  // 2) Ensure at least one media row
  if (image) {
    const { data: mExists, error: mChkErr } = await supabase
      .from("product_media")
      .select("product_id")
      .eq("product_id", id)
      .limit(1);

    if (mChkErr) {
      console.error("check media failed", mChkErr);
    }
    if (!mExists || mExists.length === 0) {
      const mediaRow = {
        product_id: id,
        media_url: image,
        media_type: "image",
        position: 0,
        is_primary: true,
      };
      const { error: mInsErr } = await supabase.from("product_media").insert([mediaRow]);
      if (mInsErr) {
        console.error("insert media failed", mInsErr);
        // do not throw; the cart will still render name/price, just no image
      }
    }
  }
}

  // Find the source static item by slug OR id
  const source = useMemo(() => {
    if (!handleParam) return undefined;
    return ALL_STATIC.find((p) => p.slug === handleParam || p.id === handleParam);
  }, [handleParam]);

  // Which variant set applies?
  const variantKey = useMemo(
    () => normalizeKey(source?.slug || source?.name),
    [source]
  );
  const variants = useMemo<VariantOption[]>(
    () => VARIANTS[variantKey] || [],
    [variantKey]
  );
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);

  // Map the static record to the same shape the dynamic page used
  useEffect(() => {
    if (!source) {
      setProduct(null);
      setSelectedVariantKey(null);
      return;
    }
    const pv: ProductView = {
      product_id: source.id,
      name: source.name,
      brand: source.brand,
      description: "", // static JSON has no long description
      cost_price: round2(source.price ?? 0),
      selling_price:
        source.mrp === null || source.mrp === undefined ? undefined : round2(source.mrp),
      stock_quantity: source.inStock === false ? 0 : 99, // treat as in stock unless explicitly false
      product_media: [
        {
          media_url: source.image,
          media_type: "image",
          is_primary: true,
          position: 0,
        },
      ],
    };
    setProduct(pv);
    setActiveImg(0);
    // default to first variant if available
    setSelectedVariantKey((VARIANTS[normalizeKey(source.slug || source.name)] || [])[0]?.key ?? null);
  }, [source]);

  // Derived values
  const images = product?.product_media?.map((m) => m.media_url) ?? [];

  // Override price by selected variant if present
  const selectedVariant = variants.find((v) => v.key === selectedVariantKey) || null;
  const price = round2(selectedVariant?.priceINR ?? product?.cost_price ?? 0);
  const mrp = round2(product?.selling_price ?? 0);
  const showMrp = !!product?.selling_price && mrp > price;
  const youSave = showMrp ? round2(mrp - price) : 0;
  const discountPct = showMrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = (product?.stock_quantity ?? 0) > 0;

const handleAddToCart = async () => {
  if (!product || !source) return;
  try {
    setAdding(true);

    // Persist static product into DB so the cart can hydrate it
    await ensureStaticProductInDB({
      id: product.product_id,               // e.g., "prod_010"
      name: product.name,
      brand: source.brand,
      category: source.category,
      description: source.alt,              // short desc from static JSON
      image: source.image,
      price: round2(
        (variants.find(v => v.key === selectedVariantKey)?.priceINR) ??
        product.cost_price ??
        0
      ),
      mrp: product.selling_price ?? null,   // optional strike-through
      inStock: source.inStock !== false,
      slug: source.slug,
    });

    // Now your existing cart call works as-is
    await addToCart(product.product_id, qty);

    toast({
      title: "Added to Cart 🛒",
      description: `${product.name}${
        selectedVariant ? ` • ${selectedVariant.label}` : ""
      } × ${qty} added to your cart.`,
    });
  } catch (e) {
    console.error(e);
    toast({
      title: "Error",
      description: "Could not add to cart. Please try again.",
      variant: "destructive",
    });
  } finally {
    setTimeout(() => setAdding(false), 320);
  }
};

  if (!source || !product) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <p className="text-muted-foreground">Please check the URL or pick another product.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-4">
          <span className="hover:text-foreground">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-foreground">{source.category ?? "Products"}</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-12 gap-8">
          {/* LEFT: sticky gallery */}
          <div className="md:col-span-6">
            <div className="md:sticky md:top-24">
              <div className="aspect-[4/5] bg-white rounded-xl border overflow-hidden flex items-center justify-center">
                {images[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={source.alt || product.name}
                    className="max-h-full max-w-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`aspect-square rounded-lg border overflow-hidden bg-white ${
                        i === activeImg ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/40"
                      }`}
                      aria-label={`Thumbnail ${i + 1}`}
                    >
                      <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: info */}
          <div className="md:col-span-6 space-y-5">
            {/* Brand */}
            {source.brand && (
              <div className="text-xs tracking-wide text-primary/90 font-medium">{source.brand}</div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>

            {/* Badges / rating */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                AUTHENTIC
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">
                KOREAN BEAUTY
              </span>
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 text-sm">
                <Star className="h-4 w-4 fill-amber-500" />
                {source.rating ?? 4.5}
                <span className="text-muted-foreground">({source.reviewCount ?? 123})</span>
              </span>
            </div>

            {/* Variant selector (shown when a product has variants) */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Size / Pack</div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const active = selectedVariantKey === v.key;
                    return (
                      <button
                        key={v.key}
                        onClick={() => setSelectedVariantKey(v.key)}
                        className={[
                          "px-3 py-1.5 rounded-full border text-sm",
                          active
                            ? "border-primary text-primary bg-primary/10"
                            : "border-muted-foreground/30 hover:border-primary/50",
                        ].join(" ")}
                        aria-pressed={active}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
                {/* <div className="text-xs text-muted-foreground">
                  Prices converted from USD at ₹{USD_INR_RATE.toFixed(2)} / $.
                </div> */}
              </div>
            )}

            {/* Price block */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold">{formatINR(price)}</span>
              {showMrp && (
                <>
                  <span className="text-sm line-through text-muted-foreground">{formatINR(mrp)}</span>
                  <span className="rounded-full bg-rose-100 text-rose-600 px-2 py-0.5 text-xs">
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </div>
            {youSave > 0 && <div className="text-sm text-emerald-600">You save {formatINR(youSave)}</div>}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span className="text-sm">{inStock ? "In Stock" : "Out of Stock"}</span>
            </div>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-md border">
                <button
                  className="px-3 py-1 text-lg"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-3 py-1 min-w-[2.5rem] text-center">{qty}</span>
                <button
                  className="px-3 py-1 text-lg"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <Button onClick={handleAddToCart} className={`inline-flex gap-2 ${adding ? "scale-[0.98]" : ""}`}>
                <ShoppingCart className="h-4 w-4" />
                {adding ? "Adding..." : "Add to Cart"}
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    title: "Added to Wishlist ❤️",
                    description: `${product.name}${
                      selectedVariant ? ` • ${selectedVariant.label}` : ""
                    } saved to your wishlist.`,
                  })
                }
              >
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </Button>
            </div>

            {/* Trust rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-md border p-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs">100% Authentic</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-xs">Ships in 24 hrs</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RotateCcw className="h-4 w-4 text-rose-600" />
                <span className="text-xs">Easy Returns</span>
              </div>
            </div>

            {/* Description (optional for static) */}
            {source.alt && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">Description</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{source.alt}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
