import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatPKR, DELIVERY_PER_UNIT, type CartItem, type Product } from "@/lib/types";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — NexaStore" }] }),
  component: CartPage,
});

function CartPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<(CartItem & { product: Product })[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("cart_items").select("*, product:products(*)").eq("user_id", user.id).order("created_at");
    setItems((data as any) ?? []);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    setBusy(true);
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    await load();
    setBusy(false);
  };
  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    await load();
    toast.success("Removed from cart");
  };

  if (loading) return <div className="container-x py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="container-x py-24 text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-3">Your cart is waiting</h1>
        <p className="text-muted-foreground mb-6">Please login to view your cart and place orders.</p>
        <Link to="/auth" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const productTotal = items.reduce((s, i) => s + i.quantity * Number(i.product.price), 0);
  const delivery = totalQty * DELIVERY_PER_UNIT;

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-6">Your cart is empty.</p>
          <Link to="/products" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-border bg-card">
                <Link to="/products/$slug" params={{ slug: item.product.slug }} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-secondary">
                  {item.product.images?.[0] && <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to="/products/$slug" params={{ slug: item.product.slug }} className="font-semibold hover:text-primary line-clamp-1">{item.product.name}</Link>
                  {Object.keys(item.variant ?? {}).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  )}
                  <p className="text-primary font-bold mt-1">{formatPKR(Number(item.product.price))}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center border border-border rounded-full">
                      <button disabled={busy} onClick={() => updateQty(item.id, item.quantity - 1)} className="p-2 hover:bg-secondary rounded-l-full"><Minus className="h-3 w-3" /></button>
                      <span className="px-4 text-sm font-semibold">{item.quantity}</span>
                      <button disabled={busy} onClick={() => updateQty(item.id, item.quantity + 1)} className="p-2 hover:bg-secondary rounded-r-full"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => remove(item.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="text-right shrink-0 font-semibold">{formatPKR(item.quantity * Number(item.product.price))}</div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({totalQty} items)</span><span>{formatPKR(productTotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery (Rs. 170 × {totalQty})</span><span>{formatPKR(delivery)}</span></div>
              <div className="text-xs text-muted-foreground pt-2">COD fee of Rs. 60 applies if you choose Cash on Delivery.</div>
            </div>
            <div className="border-t border-border my-4" />
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Estimated Total</span>
              <span>{formatPKR(productTotal + delivery)}</span>
            </div>
            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >Proceed to Checkout</button>
          </aside>
        </div>
      )}
    </div>
  );
}
