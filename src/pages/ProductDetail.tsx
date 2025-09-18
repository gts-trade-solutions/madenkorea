import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`product_id.eq.${id},slug.eq.${id}`) // works with slug or id
        .single();
      if (!error) setProduct(data);
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.brand}</p>
          <div className="mt-4 text-xl font-semibold text-primary">
            ₹{product.cost_price}
          </div>
          {product.selling_price && (
            <div className="line-through text-sm text-muted-foreground">
              ₹{product.selling_price}
            </div>
          )}
          <p className="mt-4">{product.description}</p>

          <div className="mt-6 flex gap-3">
            <Button>Add to Cart</Button>
            <Button variant="outline">Wishlist</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
