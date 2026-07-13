import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatPKR, type Product } from "@/lib/types";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "My Wishlist — NexaStore" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<{ id: string; product: Product }[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("wishlist").select("id, product:products(*)").eq("user_id", user.id);
    setItems((data as any) ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const remove = async (id: string) => {
    await supabase.from("wishlist").delete().eq("id", id);
    await load();
    toast.success("Removed");
  };
  const moveToCart = async (productId: string, wishId: string) => {
    if (!user) return;
    await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: 1 });
    await supabase.from("wishlist").delete().eq("id", wishId);
    await load();
    toast.success("Moved to cart");
  };

  if (loading) return <div className="container-x py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="container-x py-24 max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-3">Save your favourites</h1>
        <p className="text-muted-foreground mb-6">Login to build your wishlist.</p>
        <Link to="/auth" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map(({ id, product }) => (
            <div key={id} className="flex gap-4 p-4 rounded-2xl border border-border bg-card">
              <Link to="/products/$slug" params={{ slug: product.slug }} className="w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-secondary">
                {product.images?.[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <Link to="/products/$slug" params={{ slug: product.slug }} className="font-semibold line-clamp-1 hover:text-primary">{product.name}</Link>
                <p className="text-primary font-bold mt-1">{formatPKR(Number(product.price))}</p>
                <div className="mt-auto flex gap-2 pt-3">
                  <button onClick={() => moveToCart(product.id, id)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    <ShoppingBag className="h-3 w-3" /> Move to Cart
                  </button>
                  <button onClick={() => remove(id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
