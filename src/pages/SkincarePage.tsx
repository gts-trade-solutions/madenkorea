// pages/ShowcaseAllInOne.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BestSellersShowcase from "@/components/video-sections/BestSeller";
import SnapReels from "@/components/video-sections/SkincareVideos";
import SkinConsultPanel from "@/components/video-sections/SkincareBottom";

import StaticProducts, { StaticProduct } from "@/pages/Productlist";

// shadcn/ui for the dropdown
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import MiniVideoSections from "@/components/MiniVideoSections";

/* ========== helpers ========== */
const cls = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(" ");
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

const ALL_PRODUCTS: StaticProduct[] = Array.isArray(StaticProducts)
  ? (StaticProducts as StaticProduct[][]).flat()
  : [];

const slugify = (s?: string) =>
  (s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// remove hyphens so "skin-care" === "skincare"
const loose = (s?: string) => slugify(s).replace(/-/g, "");

/** path segment -> acceptable category variants (raw words; we normalize when comparing) */
const PATH_TO_CATEGORY_VARIANTS: Record<string, string[]> = {
  skincare: ["skin-care", "skincare", "skin care"],
  baby: ["baby", "baby-care", "babycare"],
  life: ["life & home", "life-and-home", "life and home", "life&home"],
};

/** optional pretty label for header */
const PATH_LABEL: Record<string, string> = {
  skincare: "Skin Care",
  baby: "Baby",
  life: "Life & Home",
};

/* ========== tiny card ========== */
const ProductCard: React.FC<{ p: StaticProduct }> = ({ p }) => {
  const price = round2(p.price ?? 0);

  // Always derive MRP from price: +30% => ~23% off vs MRP
  const computedMrp = price > 0 ? round2(price * 1.30) : 0;

  const hasDiscount = computedMrp > price;
  const saveAmt = hasDiscount ? round2(computedMrp - price) : 0;

  const href = `/product-s/${p.slug || p.id}`;

  return (
    <Link
      to={href}
      className="group block rounded-xl border bg-white overflow-hidden hover:shadow transition"
    >
      <div className="relative aspect-[4/5] bg-white grid place-items-center">
        {/* 23% OFF chip */}
        {hasDiscount && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-rose-600 text-white text-xs font-semibold px-2 py-1">
            23% OFF
          </span>
        )}

        {p.image ? (
          <img
            src={p.image}
            alt={p.alt || p.name}
            className="max-h-full max-w-full object-contain p-4"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>

      <div className="p-3">
        {p.brand && (
          <div className="text-[11px] tracking-wide text-primary/90 font-medium mb-1">
            {p.brand}
          </div>
        )}
        <div className="text-sm font-medium line-clamp-2 group-hover:text-primary">
          {p.name}
        </div>

        {/* price + MRP + Save */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold">{formatINR(price)}</span>
          {hasDiscount && (
            <>
              <span className="text-xs line-through text-muted-foreground">
                {formatINR(computedMrp)}
              </span>
              <span className="rounded-full bg-rose-100 text-rose-600 px-2 py-0.5 text-[11px] font-semibold">
                Save {formatINR(saveAmt)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

type Slide = {
  image: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
};

const slides: Slide[] = [
  {
    image: "/images/6.webp",
    alt: "Hydrating skincare serum on acrylic",
    eyebrow: "New Arrival",
    title: "Brightening Creams",
    description: "Glow like glass — clean, simple, effective.",
    cta: { label: "Shop Now", href: "/products" },
  },
  {
    image: "/images/2.jpg",
    alt: "Flatlay of Korean skincare routine",
    eyebrow: "Editor's Pick",
    title: "Build Your Routine",
    description: "Cleanser → Toner → Essence → Moisturizer → SPF.",
    cta: { label: "Explore Sets", href: "/collections/sets" },
  },
  {
    image: "/images/3.jpg",
    alt: "Minimal bottle on soft fabric",
    eyebrow: "Limited",
    title: "Velvet Night Cream",
    description: "Deep hydration for your PM routine.",
    cta: { label: "View Details", href: "/products/velvet-night-cream" },
  },
  {
    image: "/images/7.png",
    alt: "Soothing toner on stone",
    eyebrow: "Trending",
    title: "Soothing Toner",
    description: "Calm, balance, and prep your skin.",
    cta: { label: "See Product", href: "/products/soothing-toner" },
  },
  {
    image: "/images/1.jpg",
    alt: "Soothing toner on stone",
    eyebrow: "Trending",
    title: "Soothing Toner",
    description: "Calm, balance, and prep your skin.",
    cta: { label: "See Product", href: "/products/soothing-toner" },
  },
];

/* ========== page ========== */
export default function ShowcaseAllInOne() {
  const [active, setActive] = useState(0);
  const mainRef = useRef<SwiperType | null>(null);
  const onMainSwiper = (s: SwiperType) => {
    mainRef.current = s;
    setActive(s.realIndex ?? s.activeIndex ?? 0);
  };
  const onMainChange = (s: SwiperType) =>
    setActive(s.realIndex ?? s.activeIndex ?? 0);

  // path parsing
  const location = useLocation();
  const params = useParams<{ category?: string; section?: string; slug?: string }>();
  const firstSeg =
    location.pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)[0] || "";
  const pathKey = (params.category ?? params.section ?? params.slug ?? firstSeg).toLowerCase();

  // derive acceptable category targets for this path
  const targetsLoose = (PATH_TO_CATEGORY_VARIANTS[pathKey] || []).map((t) => loose(t));

  /* ----- BRAND FILTER state ----- */
  const [brandFilter, setBrandFilter] = useState<string>("__ALL__");

  // filter by category; if no mapping, show all
  const filteredByCategory = useMemo(() => {
    if (!targetsLoose.length) return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter((p) => targetsLoose.includes(loose(p.category || "")));
  }, [targetsLoose.join("|")]);

  // brands only from current category
  const allBrands = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of filteredByCategory) {
      const b = (p.brand || "").trim();
      if (!b) continue;
      const key = b.toLowerCase();
      if (!m.has(key)) m.set(key, b);
    }
    return Array.from(m.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [filteredByCategory]);

  // reset selection if brand not present in this category
  useEffect(() => {
    if (brandFilter === "__ALL__") return;
    const has = allBrands.some((b) => b.toLowerCase() === brandFilter.toLowerCase());
    if (!has) setBrandFilter("__ALL__");
  }, [allBrands, brandFilter]);

  // final filtered list (category + brand)
  const filteredProducts = useMemo(() => {
    if (brandFilter === "__ALL__") return filteredByCategory;
    const bf = brandFilter.toLowerCase();
    return filteredByCategory.filter((p) => (p.brand || "").toLowerCase() === bf);
  }, [filteredByCategory, brandFilter]);

  /* ----- pagination over filtered list (8/page) ----- */
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [pathKey, filteredProducts.length, brandFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = useMemo(
    () => filteredProducts.slice(start, end),
    [filteredProducts, start, end]
  );

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const headerLabel = PATH_LABEL[pathKey] || "Browse products";

  return (
    <>
      <Header />

      {/* HERO */}
      <section>
        <div className="relative overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            loop
            autoplay={{ delay: 1500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            onSwiper={onMainSwiper}
            onSlideChange={onMainChange}
            className="h-[60%]"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={i}>
                <div className="relative h-full w-100 aspect-[4/1.4]">
                  <img
                    src={s.image}
                    alt={s.alt}
                    style={{ objectFit: "cover" }}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    decoding="async"
                  />
                  {(s.eyebrow || s.title || s.description || s.cta) && (
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                      <div className="relative text-white">
                        {s.eyebrow && (
                          <span className="text-xs sm:text-sm opacity-90">{s.eyebrow}</span>
                        )}
                        {s.title && (
                          <h2 className="text-xl sm:text-3xl font-semibold mt-1">{s.title}</h2>
                        )}
                        {s.description && <p className="opacity-90 mt-2">{s.description}</p>}
                        {s.cta && (
                          <a
                            href={s.cta.href}
                            className="inline-flex items-center rounded-xl border border-white/70 text-white px-4 py-2 mt-4 hover:bg-white/10"
                          >
                            {s.cta.label}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Filtered + paginated grid */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
          <h3 className="text-xl font-semibold">{headerLabel}</h3>

          {/* BRAND FILTER (Dropdown). Only label is styled; option items use default styles */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="
                    h-9 rounded-md px-3 text-sm
                    border-[#f26666] text-[#f26666]
                    hover:bg-[#f26666]/10
                  "
                  disabled={allBrands.length === 0}
                >
                  <span className="mr-2">Brand</span>
                  <span className="font-semibold">
                    {brandFilter === "__ALL__" ? "All" : brandFilter}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* 🔴 Label styling only (options below remain default) */}
                <DropdownMenuLabel
                  className="
                    flex items-center justify-between px-2 py-1.5
                    border-b border-[#f26666]/40
                  "
                >
                  <span className="text-sm font-semibold">Brand</span>
                  <span
                    className="
                      ml-2 rounded-full border border-[#f26666] text-[#f26666]
                      px-2 py-0.5 text-xs font-semibold
                      whitespace-nowrap
                    "
                  >
                    {brandFilter === "__ALL__" ? "All brands" : brandFilter}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setBrandFilter("__ALL__")}>
                  All brands
                </DropdownMenuItem>
                {allBrands.map((b) => (
                  <DropdownMenuItem key={b} onClick={() => setBrandFilter(b)}>
                    {b}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="text-xs text-muted-foreground">
              {filteredProducts.length > 0 ? (
                <>
                  Showing {start + 1}–{Math.min(end, filteredProducts.length)} of{" "}
                  {filteredProducts.length}
                </>
              ) : (
                <>No products found</>
              )}
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {pageItems.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => canPrev && setPage((x) => x - 1)}
                  disabled={!canPrev}
                  className={cls(
                    "px-3 py-1.5 rounded border",
                    canPrev ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"
                  )}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                  const isActive = n === page;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={cls(
                        "min-w-[2.25rem] px-3 py-1.5 rounded border text-sm",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-accent"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  onClick={() => canNext && setPage((x) => x + 1)}
                  disabled={!canNext}
                  className={cls(
                    "px-3 py-1.5 rounded border",
                    canNext ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"
                  )}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-md border p-6 text-sm text-muted-foreground">
            Try a different brand or category.
          </div>
        )}
      </section>

      {/* your existing sections */}
      <BestSellersShowcase />
      {/* <SnapReels /> */}
      <MiniVideoSections/>
      <SkinConsultPanel />
      <Footer />
    </>
  );
}
