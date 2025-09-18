// pages/BestSellersShowcase.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingCart } from "lucide-react";

/* ============== Types & Utils ============== */
type Product = {
  id: string | number;
  name: string;
  description?: string;
  image: string;
  alt: string;
  href?: string;
  brand?: string;
  price?: number;       // current price
  mrp?: number;         // original/MRP
  rating?: number;      // 0..5
  reviewCount?: number; // # of reviews
  inStock?: boolean;
  shipsFast?: boolean;  // "Ships in 24 hrs"
  isNew?: boolean;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

const formatINR = (v?: number) =>
  typeof v === "number"
    ? v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    : "—";

const percentOff = (price?: number, mrp?: number) =>
  price && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

const saveAmount = (price?: number, mrp?: number) =>
  price && mrp && mrp > price ? mrp - price : 0;

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

const ActionBubble: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className = "", onClick, ...rest }) => (
  <button
    {...rest}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.(e);
    }}
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
      tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700",
    ].join(" ")}
  >
    {children}
  </span>
);

/* ============== Card ============== */
const ProductCard: React.FC<{ p: Product }> = ({ p }) => {
  const to = p.href ?? `/product-s/${slugify(p.name)}`;
  const off = percentOff(p.price, p.mrp);
  const save = saveAmount(p.price, p.mrp);

  return (
    <Link
      to={to}
      className="group h-full min-h-[460px] sm:min-h-[470px] md:min-h-0
                 flex flex-col rounded-3xl border border-gray-100 bg-white p-5 pb-8 md:p-6 md:pb-10
                 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
      aria-label={`View details for ${p.name}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gray-50">
        {/* Discount badge */}
        {off > 0 && (
          <div className="absolute left-3 top-3 z-20">
            <span className="rounded-full bg-rose-600 text-white text-xs font-bold px-2.5 py-1">
              {off}% OFF
            </span>
          </div>
        )}

        {/* Action bubbles */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <ActionBubble aria-label="Add to wishlist">
            <Heart className="h-4 w-4" />
          </ActionBubble>
          <ActionBubble aria-label="Quick view">
            <Eye className="h-4 w-4" />
          </ActionBubble>
          <ActionBubble aria-label="Add to cart">
            <ShoppingCart className="h-4 w-4" />
          </ActionBubble>
        </div>

        <img
          src={p.image}
          alt={p.alt}
          className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Text */}
      <div className="mt-4 flex-1 flex flex-col">
        {p.brand && (
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {p.brand}
          </div>
        )}

        <h3 className="text-base md:text-lg font-semibold leading-snug line-clamp-2">
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

        {/* Price + (MRP + Save) */}
        <div className="mt-3 flex items-center gap-3">
          <div className="text-xl font-bold">{formatINR(p.price)}</div>
          {p.mrp && p.mrp > (p.price ?? 0) && (
            <>
              <div className="text-sm text-gray-400 line-through">{formatINR(p.mrp)}</div>
              {/* 👇 Hide save pill on mobile; show from md+ */}
              <span className="hidden md:inline-flex rounded-full bg-rose-50 text-rose-700 text-xs font-semibold px-2 py-1">
                Save {formatINR(save)}
              </span>
            </>
          )}
        </div>

        {/* Chips */}
        <div className="mt-auto pt-3 flex flex-wrap gap-2">
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
    </Link>
  );
};

/* ============== Demo Data ============== */
const images: Product[] = [
  {
    id: 1,
    name: "Skin Barrier Glow Cover Cushion",
    brand: "CLIO",
    description: "Moisture-charging emulsion for healthy, vibrant skin.",
    price: 1200,
    mrp: 1500,
    image: "/images/m-product-1.jpg",
    alt: "Skin Barrier Glow Cover Cushion",
    reviews: 4,
    rating: 4.5,
    inStock: true,
    shipsFast: true,
    href: "/product-s/skin-barrier-glow-cover-cushion",
  },
  {
    id: 2,
    name: "DOUBLE LONGWEAR COVER CONCEALER",
    brand: "CLIO",
    description: "13% pure Vitamin C — gentle yet visibly effective.",
    price: 424,
    mrp: 599,
    image: "/images/m-product-2.jpg",
    alt: "Double Longwear Cover Concealer",
    reviews: 25,
    rating: 4.5,
    isNew: true,
    inStock: true,
    shipsFast: true,
    href: "/product-s/double-longwear-cover-concealer",
  },
  {
    id: 3,
    name: "M Perfect Cover BB Cream SPF42/PA+++ 20ml",
    brand: "MISSHA",
    description: "Premium anti-aging care for sensitive, mature skin.",
    price: 520,
    mrp: 699,
    image: "/images/m-product-3.jpg",
    alt: "M Perfect Cover BB Cream",
    reviews: 2,
    rating: 4.5,
    inStock: true,
    shipsFast: true,
    href: "/product-s/m-perfect-cover-bb-cream-spf42-pa-20ml",
  },
  {
    id: 4,
    name: "Radiance Perfect-fit Cushion Foundation",
    brand: "HERA",
    description: "Hydrate, soothe and repair tired, rough skin.",
    price: 1152,
    mrp: 1499,
    image: "/images/m-product-4.jpg",
    alt: "Radiance Perfect-fit Cushion Foundation",
    reviews: 30,
    rating: 4.5,
    inStock: true,
    shipsFast: true,
    href: "/product-s/radiance-perfect-fit-cushion-foundation",
  },
  {
    id: 5,
    name: "SYRUPY TOK CHEEK",
    brand: "PERIPERA",
    description: "Bright, cushiony cheek color.",
    price: 1140,
    mrp: 1399,
    image: "/images/m-product-5.jpg",
    alt: "SYRUPY TOK CHEEK",
    reviews: 4,
    rating: 4.5,
    inStock: true,
    shipsFast: true,
    href: "/product-s/syrupy-tok-cheek",
  },
  {
    id: 6,
    name: "ARTCLASS BY RODIN BLUSHER DE MAUVE",
    brand: "TOO COOL FOR SCHOOL",
    description: "Soft, natural-looking blush.",
    price: 1200,
    mrp: 1490,
    image: "/images/m-product-6.jpg",
    alt: "ARTCLASS BY RODIN BLUSHER DE MAUVE",
    reviews: 25,
    rating: 4.6,
    isNew: true,
    inStock: true,
    shipsFast: true,
    href: "/product-s/artclass-by-rodin-blusher-de-mauve",
  },
  {
    id: 7,
    name: "KILL COVER MESH GLOW CUSHION MINI SPF50+ PA++++",
    brand: "CLIO",
    description: "Glowy, buildable coverage in a mini.",
    price: 1170,
    mrp: 1490,
    image: "/images/m-product-7.jpg",
    alt: "KILL COVER MESH GLOW CUSHION MINI",
    reviews: 2,
    rating: 4.4,
    inStock: true,
    shipsFast: true,
    href: "/product-s/kill-cover-mesh-glow-cushion-mini-spf50-pa",
  },
  {
    id: 8,
    name: "PURE BLUSHED SUNSHINE CHEEK TTEOK RECIPE Collection",
    brand: "ROM&ND",
    description: "Soft-focus blush collection.",
    price: 520,
    mrp: 699,
    image: "/images/m-product-8.jpg",
    alt: "PURE BLUSHED SUNSHINE CHEEK TTEOK RECIPE Collection",
    reviews: 30,
    rating: 4.5,
    inStock: true,
    shipsFast: true,
    href: "/product-s/pure-blushed-sunshine-cheek-tteok-recipe",
  },
];

/* ============== Page ============== */
export default function BestSellersShowcase() {
  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-2">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Korean Authentic MakeUp Products
        </h2>
        <p className="text-gray-500 mt-1">Our steady favorites you keep coming back to</p>
      </header>

      {/* Mobile: 2-column grid with stretched, equal-height cards */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-4 items-stretch content-start">
          {images.map((p, i) => (
            <div key={`${p.id}-${i}`} className="h-full">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet/Desktop: responsive grid */}
      <div className="hidden md:grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 md:mt-0">
        {images.map((p, i) => (
          <ProductCard key={`${p.id}-${i}`} p={p} />
        ))}
      </div>
    </div>
  );
}
