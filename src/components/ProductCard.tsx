import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatPKR, type Product } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const [wished, setWished] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle()
      .then(({ data }) => setWished(!!data));
  }, [user, product.id]);

  const toggleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save to wishlist");
      return;
    }
    if (wished) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
      setWished(false);
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
      setWished(true);
      toast.success("Added to wishlist");
    }
  };

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
        )}
        {product.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Featured
          </span>
        )}
        <button
          onClick={toggleWish}
          className={`absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition-colors ${
            wished ? "text-destructive" : "text-foreground hover:text-primary"
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-semibold line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
        <p className="mt-2 font-display text-lg font-bold text-primary">{formatPKR(product.price)}</p>
      </div>
    </Link>
  );
}
