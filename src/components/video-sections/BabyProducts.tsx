// pages/BestSellersShowcase.tsx
import React from "react";
import { Heart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ⬇️ use your shared static JSON
import StaticProductsData, { StaticProduct as StaticItem } from "@/pages/Productlist";

/* ============== Types & Utils ============== */
type Product = {
  id: string | number;
  slug?: string;        // ⬅️ for linking
  name: string;
  description?: string;
  image: string;
  alt: string;

  brand?: string;
  price?: number;       // current price (₹)
  mrp?: number | null;  // original MRP (₹)
  rating?: number;      // e.g. 4.5
  reviewCount?: number; // e.g. 0
  inStock?: boolean;
  shipsFast?: boolean;
};

const formatINR = (v?: number) =>
  typeof v === "number"
    ? v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    : "—";

const percentOff = (price?: number, mrp?: number | null) =>
  price && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

const Stars: React.FC<{ value?: number }> = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg key={i} viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
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

const Chip: React.FC<{ tone?: "ok" | "info"; children: React.ReactNode }> = ({
  tone = "ok",
  children,
}) => (
  <span
    className={[
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
      tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700",
    ].join(" ")}
  >
    {children}
  </span>
);

/* ============== Card ============== */
const ProductCard: React.FC<{ p: Product; onOpen: (p: Product) => void }> = ({ p, onOpen }) => {
  const off = percentOff(p.price, p.mrp);

  return (
    <div
      className="
        group h-full flex flex-col rounded-3xl border border-gray-100 bg-white
        p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition
      "
    >
      {/* Image area */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gray-50 cursor-pointer"
        onClick={() => onOpen(p)}
        role="button"
        aria-label={`Open ${p.name}`}
      >
        {off > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-rose-600 text-white text-xs font-bold px-2.5 py-1">
            {off}% OFF
          </span>
        )}

        {/* action bubbles */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            className="grid place-items-center h-9 w-9 rounded-full bg-white/90 border border-black/10 shadow hover:bg-white transition"
            aria-label="Add to wishlist"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            className="grid place-items-center h-9 w-9 rounded-full bg-white/90 border border-black/10 shadow hover:bg-white transition"
            aria-label="Quick view"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(p);
            }}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <img
          src={p.image}
          alt={p.alt}
          className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Text area */}
      <div className="mt-4 flex-1 flex flex-col">
        {p.brand && (
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {p.brand}
          </div>
        )}

        <h3
          className="text-[15px] md:text-base font-semibold leading-snug line-clamp-2 hover:underline cursor-pointer"
          onClick={() => onOpen(p)}
        >
          {p.name}
        </h3>

        {p.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{p.description}</p>
        )}

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Stars value={p.rating ?? 4.5} />
          <span className="text-gray-500">
            {(p.rating ?? 4.5).toFixed(1)} ({p.reviewCount ?? 0})
          </span>
        </div>

        {/* Price + MRP */}
        <div className="mt-3 flex items-center gap-2">
          <div className="text-xl font-extrabold">{formatINR(p.price)}</div>
          {p.mrp && p.mrp > (p.price ?? 0) && (
            <div className="text-sm text-gray-400 line-through">{formatINR(p.mrp)}</div>
          )}
        </div>

        {/* Chips — tighter on mobile, pinned on md+ */}
        <div className="mt-3 md:mt-auto md:pt-3 flex flex-wrap gap-2">
          {p.inStock && <Chip tone="ok">In Stock</Chip>}
          {p.shipsFast && (
            <Chip tone="info">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M3 7h11v7h2.5l1.5-3h3v6h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3V7Z" fill="currentColor" />
              </svg>
              Ships in 24 hrs
            </Chip>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============== Build from the shared static JSON ============== */
// Flatten your array-of-arrays
const ALL_STATIC: StaticItem[] = Array.isArray(StaticProductsData)
  ? (StaticProductsData as StaticItem[][]).flat()
  : [];

// Only Baby category (adjust or remove the filter if you want everything)
const BABY: Product[] = ALL_STATIC
  .filter((p) => (p.category ?? "").toLowerCase() === "baby")
  .map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    mrp: p.mrp ?? null,
    image: p.image,
    alt: p.alt ?? p.name,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    shipsFast: p.shipsFast,
  }));

/* ============== Page ============== */
export default function BabyProducts() {
  const navigate = useNavigate();

  const openStatic = (p: Product) => {
    // Works with your StaticProductPage (supports slug OR id)
    navigate(`/product-s/${p.slug ?? p.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-4">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Baby Products</h2>
        <p className="text-gray-500 mt-1">Our steady favorites you keep coming back to</p>
      </header>

      {/* Mobile: 2-column grid */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-3 items-start content-start">
          {BABY.map((p) => (
            <ProductCard key={String(p.id)} p={p} onOpen={openStatic} />
          ))}
        </div>
      </div>

      {/* Tablet/Desktop: responsive grid */}
      <div className="hidden md:grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {BABY.map((p) => (
          <ProductCard key={String(p.id)} p={p} onOpen={openStatic} />
        ))}
      </div>
    </div>
  );
}
