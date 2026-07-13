import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR, type Product } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("products").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
      const p = data as unknown as Product | null;
      setProduct(p);
      setImgIdx(0);
      setQty(1);
      if (p?.variants) {
        const init: Record<string, string> = {};
        p.variants.forEach((v) => (init[v.name] = v.values[0]));
        setVariant(init);
      }
      if (p?.category_id) {
        supabase.from("products").select("*").eq("category_id", p.category_id).neq("id", p.id).limit(4).then(({ data: r }) => setRelated((r as unknown as Product[]) ?? []));
      }
    });
  }, [slug]);

  const addToCart = async (buyNow = false) => {
    if (!user) {
      toast.error("Please login to add to cart");
      navigate({ to: "/auth" });
      return;
    }
    if (!product) return;
    await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: qty, variant });
    toast.success("Added to cart");
    if (buyNow) navigate({ to: "/cart" });
  };

  if (!product) {
    return <div className="container-x py-24 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="container-x py-8 md:py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary group">
            {product.images[imgIdx] && (
              <img
                src={product.images[imgIdx]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 ${i === imgIdx ? "border-primary" : "border-border"}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
          <p className="font-display text-3xl font-extrabold text-primary mb-6">{formatPKR(product.price)}</p>
          <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

          {product.variants?.map((v) => (
            <div key={v.name} className="mb-6">
              <p className="text-sm font-semibold mb-2">{v.name}: <span className="text-muted-foreground font-normal">{variant[v.name]}</span></p>
              <div className="flex flex-wrap gap-2">
                {v.values.map((val) => (
                  <button
                    key={val}
                    onClick={() => setVariant((prev) => ({ ...prev, [v.name]: val }))}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${variant[v.name] === val ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                  >{val}</button>
                ))}
              </div>
            </div>
          ))}

          <div className="mb-8">
            <p className="text-sm font-semibold mb-2">Quantity</p>
            <div className="inline-flex items-center border border-border rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-secondary rounded-l-full"><Minus className="h-4 w-4" /></button>
              <span className="px-6 font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:bg-secondary rounded-r-full"><Plus className="h-4 w-4" /></button>
            </div>
            <span className="ml-4 text-sm text-muted-foreground">{product.stock} in stock</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => addToCart(false)} className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary/70">
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button onClick={() => addToCart(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
