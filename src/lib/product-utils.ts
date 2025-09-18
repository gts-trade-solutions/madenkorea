// src/lib/product-utils.ts
import { supabase } from "@/integrations/supabase/client";

export type ProductMedia = {
  media_url: string;
  media_type: string;
  is_primary: boolean;
  position: number | null;
};

export type DbProduct = {
  product_id: string;
  slug?: string | null;
  name: string;
  brand?: string | null;
  cost_price?: number | null;
  selling_price?: number | null;
  description?: string | null;
  is_active?: boolean | null;
  stock_quantity?: number | null;
  product_media?: ProductMedia[];
};

export type StaticProduct = {
  id: string;
  slug?: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  price?: number | null;
  mrp?: number | null;
  image: string;
  alt: string;
  rating?: number | null;
  reviewCount?: number | null;
  inStock?: boolean | null;
  shipsFast?: boolean | null;
};

export const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_PRODUCT_MEDIA_BUCKET || "product_media";

const normalizeObjectPath = (path: string) => {
  let p = path.replace(/^\/+/, "");
  if (p.startsWith("storage/v1/object/public/")) return p;
  if (p.startsWith(`${MEDIA_BUCKET}/`)) p = p.slice(MEDIA_BUCKET.length + 1);
  return p;
};

/** Convert any stored media_url into a browser-usable URL. */
export const toPublicUrl = async (u?: string): Promise<string | null> => {
  if (!u) return null;

  // Absolute URL
  if (/^https?:\/\//i.test(u)) return u;

  // App-relative paths (non-storage) like "/images/..." -> keep as-is
  if (u.startsWith("/") && !u.startsWith("/storage/v1/object/public/")) {
    return u;
  }

  // Public storage path missing origin
  if (u.startsWith("/storage/v1/object/public/")) {
    if (!SUPABASE_URL) return u;
    return `${SUPABASE_URL.replace(/\/$/, "")}${u}`;
  }

  // Treat as object key in bucket
  const objectPath = normalizeObjectPath(u);

  // Public URL
  const pub = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath);
  if (pub.data?.publicUrl) return pub.data.publicUrl;

  // Signed URL (private buckets)
  const signed = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(objectPath, 60 * 60);
  if (signed.data?.signedUrl) return signed.data.signedUrl;

  return null;
};

export const mapStaticToDbProduct = (sp: StaticProduct): DbProduct => ({
  product_id: sp.id,
  slug: sp.slug ?? slugify(sp.name),
  name: sp.name,
  brand: sp.brand ?? null,
  cost_price: sp.price ?? null,
  selling_price: sp.mrp ?? null,
  description: "",
  is_active: true,
  stock_quantity: sp.inStock ? 100 : 0,
  product_media: [
    { media_url: sp.image, media_type: "image", is_primary: true, position: 1 },
  ],
});

export const priceFmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

export const round2 = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;
