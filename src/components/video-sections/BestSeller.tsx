// pages/BestSellersShowcase.tsx
import React from "react";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

// ⬇️ static JSON you already have
import StaticProductsData, {
  StaticProduct as StaticItem,
} from "@/pages/Productlist";

/* =========================
   Types & Utilities
========================= */
type Product = {
  id: string | number;
  slug?: string;
  name: string;
  description?: string;
  image: string;
  alt: string;
  brand?: string;
  price?: number;
  mrp?: number | null;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  shipsFast?: boolean;
  isNew?: boolean;
};

const formatINR = (v?: number) =>
  typeof v === "number"
    ? v.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      })
    : "—";

const percentOff = (price?: number, mrp?: number | null) =>
  price && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

const saveAmount = (price?: number, mrp?: number | null) =>
  price && mrp && mrp > price ? mrp - price : 0;

const Stars: React.FC<{ value?: number }> = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg key={i} viewBox="0 0 24 24" className="h-4 w-4">
            <path
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill={filled ? "currentColor" : "rgba(0,0,0,0.15)"}
            />
          </svg>
        );
      })}
    </div>
  );
};

const ActionBubble: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className = "",
  ...rest
}) => (
  <button
    {...rest}
    className={[
      "grid place-items-center h-9 w-9 rounded-full bg-white/90 border border-black/10 shadow",
      "hover:bg-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

const Chip: React.FC<{ tone?: "ok" | "info"; children: React.ReactNode }> = ({
  tone = "ok",
  children,
}) => (
  <span
    className={[
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
      tone === "ok"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-sky-50 text-sky-700",
    ].join(" ")}
  >
    {children}
  </span>
);

/* =========================
   Card
========================= */
const ProductCard: React.FC<{
  p: Product;
  onAddToCart?: (p: Product) => void;
  onOpen?: (p: Product) => void;
  onWishlist?: (p: Product) => void;
}> = ({
  p,
  onAddToCart = () => {},
  onOpen = () => {},
  onWishlist = () => {},
}) => {
  const off = percentOff(p.price, p.mrp ?? null);
  const save = saveAmount(p.price, p.mrp ?? null);

  return (
    <div className="group h-full flex flex-col rounded-3xl border border-gray-100 bg-white p-5 pb-8 md:p-6 md:pb-10 shadow-sm transition hover:shadow-md">
      {/* Image area */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gray-50 cursor-pointer"
        onClick={() => onOpen(p)}
        role="button"
        aria-label={`Open ${p.name}`}
      >
        {off > 0 && (
          <div className="absolute left-3 top-3 z-20">
            <span className="rounded-full bg-rose-600 text-white text-xs font-bold px-2.5 py-1">
              {off}% OFF
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <ActionBubble
            aria-label="Add to wishlist"
            onClick={(e) => {
              e.stopPropagation();
              onWishlist(p);
            }}
          >
            <Heart className="h-4 w-4" />
          </ActionBubble>
          <ActionBubble
            aria-label="Quick view"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(p);
            }}
          >
            <Eye className="h-4 w-4" />
          </ActionBubble>
          <ActionBubble
            aria-label="Add to cart"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(p);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </ActionBubble>
        </div>

        {/* Image */}
        <img
          src={p.image}
          alt={p.alt}
          className="absolute inset-0 h-full w-full object-contain p-6"
          loading="lazy"
        />
      </div>

      {/* Text area */}
      <div className="mt-4 flex-1">
        {p.brand && (
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {p.brand}
          </div>
        )}
        <h3
          className="text-base md:text-lg font-semibold leading-snug hover:underline cursor-pointer"
          onClick={() => onOpen(p)}
        >
          {p.name}
        </h3>
        {p.description && (
          <p className="mt-1 text-sm text-gray-500">{p.description}</p>
        )}

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Stars value={p.rating ?? 4.5} />
          <span className="text-gray-500">
            {(p.rating ?? 4.5).toFixed(1)} ({p.reviewCount ?? 0})
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center gap-3">
          <div className="text-xl font-bold">{formatINR(p.price)}</div>
          {p.mrp && p.mrp > (p.price ?? 0) && (
            <>
              <div className="text-sm text-gray-400 line-through">
                {formatINR(p.mrp ?? undefined)}
              </div>
              <span className="rounded-full bg-rose-50 text-rose-700 text-xs font-semibold px-2 py-1">
                Save {formatINR(save)}
              </span>
            </>
          )}
        </div>

        {/* Availability */}
        <div className="mt-3 flex flex-wrap gap-2">
          {p.inStock && <Chip tone="ok">In Stock</Chip>}
          {p.shipsFast && <Chip tone="info">Ships in 24 hrs</Chip>}
        </div>
      </div>
    </div>
  );
};

/* =========================
   Static Data Setup
========================= */
const ALL_STATIC: StaticItem[] = Array.isArray(StaticProductsData)
  ? (StaticProductsData as StaticItem[][]).flat()
  : [];

const products: Product[] = ALL_STATIC.slice(0, 8).map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  brand: p.brand,
  image: p.image,
  alt: p.alt ?? p.name,
  price: p.price,
  mrp: p.mrp ?? null,
  rating: p.rating,
  reviewCount: p.reviewCount,
  inStock: p.inStock,
  shipsFast: p.shipsFast,
}));

/* =========================
   Page
========================= */
export default function BestSellersShowcase() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (p: Product) => {
    try {
      await addToCart(String(p.id), 1);
      toast({ title: "Added to Cart 🛒", description: p.name });
    } catch (e) {
      toast({
        title: "Couldn’t add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const openStatic = (p: Product) => {
    navigate(`/product-s/${p.slug ?? p.id}`);
  };

  const handleWishlist = (p: Product) => {
    try {
      const key = "wishlist:v1";
      const raw = localStorage.getItem(key);
      const arr = raw
        ? (JSON.parse(raw) as { id: string; addedAt: number }[])
        : [];
      if (!arr.some((it) => String(it.id) === String(p.id))) {
        arr.push({ id: String(p.id), addedAt: Date.now() });
        localStorage.setItem(key, JSON.stringify(arr));
        window.dispatchEvent(new Event("wishlist-updated"));
      }
      toast({ title: "Saved to wishlist ❤️", description: p.name });
    } catch {}
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-2">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Best Sellers
        </h2>
        <p className="text-gray-500 mt-1">
          Our steady favorites you keep coming back to
        </p>
      </header>

      {/* Unified responsive grid */}
      <div
        className="grid gap-3 sm:gap-6
             grid-cols-2          /* ✅ 2 per row on mobile */
             md:grid-cols-3
             lg:grid-cols-4 mt-6"
      >
        {products.map((p, i) => (
          <ProductCard
            key={`${p.id}-${i}`}
            p={p}
            onAddToCart={handleAddToCart}
            onOpen={openStatic}
            onWishlist={handleWishlist}
          />
        ))}
      </div>
    </div>
  );
}
