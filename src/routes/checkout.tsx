import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatPKR, DELIVERY_PER_UNIT, COD_FEE, type CartItem, type Product } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — NexaStore" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<(CartItem & { product: Product })[]>([]);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "", notes: "" });
  const [payment, setPayment] = useState<"COD" | "EasyPaisa" | "JazzCash">("COD");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("cart_items").select("*, product:products(*)").eq("user_id", user.id).then(({ data }) => setItems((data as any) ?? []));
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm((f) => ({ ...f, full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "", city: data.city ?? "" }));
    });
  }, [user]);

  if (loading) return <div className="container-x py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="container-x py-24 max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-3">Please login to place an order.</h1>
        <p className="text-muted-foreground mb-6">You need an account before you can check out.</p>
        <Link to="/auth" search={{ redirect: "/checkout" }} className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const productTotal = items.reduce((s, i) => s + i.quantity * Number(i.product.price), 0);
  const delivery = totalQty * DELIVERY_PER_UNIT;
  const cod = payment === "COD" ? COD_FEE : 0;
  const grand = productTotal + delivery + cod;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!form.full_name || !form.phone || !form.address || !form.city) return toast.error("Please fill all required fields");
    setPlacing(true);
    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      price: Number(i.product.price),
      quantity: i.quantity,
      variant: i.variant,
      image: i.product.images?.[0],
    }));
    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      full_name: form.full_name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      notes: form.notes || null,
      payment_method: payment,
      items: orderItems,
      product_total: productTotal,
      delivery_charges: delivery,
      cod_charges: cod,
      grand_total: grand,
      status: "Pending",
    }).select("id").single();
    if (error) {
      setPlacing(false);
      return toast.error(error.message);
    }
    await supabase.from("profiles").update({ full_name: form.full_name, phone: form.phone, address: form.address, city: form.city }).eq("id", user.id);
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    toast.success("Order placed successfully!");
    navigate({ to: "/account" });
  };

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold mb-4">Delivery Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium">Full Name *</span>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Phone *</span>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">City *</span>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium">Address *</span>
                <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium">Notes (optional)</span>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold mb-4">Payment Method</h3>
            <div className="grid gap-3">
              {[
                { id: "COD", label: "Cash on Delivery", desc: `Pay when you receive your order. Rs. ${COD_FEE} COD fee applies.` },
                { id: "EasyPaisa", label: "EasyPaisa", desc: "Send payment to 03225305296" },
                { id: "JazzCash", label: "JazzCash", desc: "Send payment to 03219965754" },
              ].map((opt) => (
                <label key={opt.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${payment === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <input type="radio" name="pay" checked={payment === opt.id} onChange={() => setPayment(opt.id as any)} className="mt-1 accent-primary" />
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 sticky top-24">
          <h3 className="text-lg font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="line-clamp-1 pr-2">{i.product.name} × {i.quantity}</span>
                <span className="shrink-0">{formatPKR(i.quantity * Number(i.product.price))}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPKR(productTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery (Rs. 170 × {totalQty})</span><span>{formatPKR(delivery)}</span></div>
            {cod > 0 && <div className="flex justify-between"><span className="text-muted-foreground">COD Fee</span><span>{formatPKR(cod)}</span></div>}
          </div>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Grand Total</span>
            <span>{formatPKR(grand)}</span>
          </div>
          <button type="submit" disabled={placing || items.length === 0} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {placing ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
