// src/components/product/ProductContent.tsx
import { useEffect, useState } from "react";
import { Heart, RotateCcw, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DbProduct, priceFmtINR, round2 } from "@/lib/product-utils";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

type Props = {
  product: DbProduct;
  images: string[];
};

export default function ProductContent({ product, images }: Props) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => setActiveImg(0), [images.length]);

  const price = round2(product?.cost_price ?? 0);
  const mrp = round2(product?.selling_price ?? 0);
  const showMrp = mrp > price;
  const youSave = showMrp ? round2(mrp - price) : 0;
  const discountPct = showMrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = (product?.stock_quantity ?? 0) > 0;

  const handleAdd = async () => {
    try {
      setAdding(true);
      await addToCart(product.product_id, qty);
      toast({ title: "Added to Cart 🛒", description: `${product.name} × ${qty} added to your cart.` });
    } catch {
      toast({ title: "Error", description: "Could not add to cart. Please try again.", variant: "destructive" });
    } finally {
      setTimeout(() => setAdding(false), 300);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <span className="hover:text-foreground">Home</span>
        <span className="mx-2">/</span>
        <span className="hover:text-foreground">Products</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-12 gap-8">
        {/* left: gallery */}
        <div className="md:col-span-6">
          <div className="md:sticky md:top-24">
            <div className="aspect-[4/5] bg-white rounded-xl border overflow-hidden flex items-center justify-center">
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={product.name} className="max-h-full max-w-full object-contain p-4" />
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

        {/* right: info */}
        <div className="md:col-span-6 space-y-5">
          {product.brand && (
            <div className="text-xs tracking-wide text-primary/90 font-medium">{product.brand}</div>
          )}

          <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium">AUTHENTIC</span>
            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">KOREAN BEAUTY</span>
            <span className="ml-2 inline-flex items-center gap-1 text-amber-600 text-sm">
              <Star className="h-4 w-4 fill-amber-500" /> 4.5
              <span className="text-muted-foreground">(123)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">{priceFmtINR(price)}</span>
            {showMrp && (
              <>
                <span className="text-sm line-through text-muted-foreground">{priceFmtINR(mrp)}</span>
                <span className="rounded-full bg-rose-100 text-rose-600 px-2 py-0.5 text-xs">{discountPct}% OFF</span>
              </>
            )}
          </div>
          {youSave > 0 && <div className="text-sm text-emerald-600">You save {priceFmtINR(youSave)}</div>}

          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span className="text-sm">{inStock ? "In Stock" : "Out of Stock"}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-md border">
              <button className="px-3 py-1 text-lg" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
              <span className="px-3 py-1 min-w-[2.5rem] text-center">{qty}</span>
              <button className="px-3 py-1 text-lg" onClick={() => setQty(Math.min(99, qty + 1))} aria-label="Increase quantity">+</button>
            </div>

            <Button onClick={handleAdd} className="inline-flex gap-2">
              <ShoppingCart className="h-4 w-4" />
              {adding ? "Adding..." : "Add to Cart"}
            </Button>

            <Button
              variant="outline"
              onClick={() => 
                toast({ title: "Added to Wishlist ❤️", description: `${product.name} saved to your wishlist.` })
              }
            >
              <Heart className="h-4 w-4 mr-2" />
              Wishlist
            </Button>
          </div>

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

          {product.description && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-1">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
