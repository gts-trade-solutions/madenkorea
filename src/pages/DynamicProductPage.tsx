// src/pages/DynamicProductPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductContent from "@/components/product/ProductContent";
import { DbProduct, ProductMedia, slugify, toPublicUrl } from "@/lib/product-utils";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  onNotFound: () => void;
};

export default function DynamicProductPage({ onNotFound }: Props) {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const keyRaw = slug ?? id ?? "";
  const key = decodeURIComponent(keyRaw).toLowerCase();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setProduct(null);
      setImages([]);

      const sel =
        "*, product_media(media_url, media_type, is_primary, position)";
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const base = key.replace(/-\d+(?:-\d+)*$/, "");
      const candidates = Array.from(
        new Set([key, base, slugify(key), slugify(base)])
      ).filter(Boolean);

      const tryOne = async (b: any) => {
        const { data } = await b.eq("is_active", true).limit(1).maybeSingle();
        return (data ?? null) as DbProduct | null;
      };

      let hit: DbProduct | null = null;

      if (uuidRe.test(keyRaw)) {
        hit = await tryOne(
          supabase.from("products").select(sel).eq("product_id", keyRaw)
        );
      }
      if (!hit) {
        for (const c of candidates) {
          hit = await tryOne(
            supabase.from("products").select(sel).ilike("slug", c)
          );
          if (hit) break;
        }
      }
      if (!hit) {
        for (const c of candidates) {
          hit = await tryOne(
            supabase.from("products").select(sel).ilike("slug", `${c}%`)
          );
          if (hit) break;
        }
      }

      if (!hit) {
        setLoading(false);
        onNotFound();
        return;
      }

      const medias = [...(hit.product_media ?? [])].sort((a: ProductMedia, b: ProductMedia) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        const pa = a.position ?? 9999;
        const pb = b.position ?? 9999;
        if (pa !== pb) return pa - pb;
        return (a.media_url || "").localeCompare(b.media_url || "");
      });

      const resolved = await Promise.all(medias.map(m => toPublicUrl(m.media_url)));
      const unique = Array.from(new Set(resolved.filter((u): u is string => !!u)));

      setProduct(hit);
      setImages(unique);
      setLoading(false);
    })();
  }, [keyRaw, key, onNotFound]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-6">
            <div className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square rounded bg-muted animate-pulse" />
              ))}
            </div>
          </div>
          <div className="md:col-span-6 space-y-4">
            <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-32 w-full bg-muted rounded animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null; // will fall back

  return <ProductContent product={product} images={images} />;
}
