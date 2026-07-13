import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatPKR, type Order } from "@/lib/types";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — NexaStore" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<"profile" | "orders">("profile");
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "", city: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "", city: data.city ?? "" });
    });
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setOrders((data as Order[]) ?? []));
  }, [user]);

  if (loading) return <div className="container-x py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="container-x py-24 max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-3">My Account</h1>
        <p className="text-muted-foreground mb-6">Please sign in to view your account.</p>
        <Link to="/auth" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  const statusColor = (s: string) => ({
    Pending: "bg-yellow-500/15 text-yellow-500",
    Processing: "bg-blue-500/15 text-blue-500",
    Completed: "bg-green-500/15 text-green-500",
    Cancelled: "bg-red-500/15 text-red-500",
  }[s] ?? "bg-muted text-muted-foreground");

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-bold mb-2">My Account</h1>
      <p className="text-muted-foreground mb-8">{user.email}</p>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          {[
            { id: "profile", label: "Profile" },
            { id: "orders", label: `Orders (${orders.length})` },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm ${tab === t.id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary"}`}>{t.label}</button>
          ))}
          <Link to="/wishlist" className="block w-full text-left px-4 py-2.5 rounded-lg text-sm hover:bg-secondary">Wishlist</Link>
          <button onClick={signOut} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-secondary">Sign out</button>
        </aside>

        <div>
          {tab === "profile" && (
            <div className="rounded-2xl border border-border bg-card p-6 max-w-2xl">
              <h3 className="text-lg font-bold mb-4">Profile Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="text-sm font-medium">Full Name</span>
                  <input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block"><span className="text-sm font-medium">Phone</span>
                  <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block"><span className="text-sm font-medium">City</span>
                  <input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block sm:col-span-2"><span className="text-sm font-medium">Address</span>
                  <textarea rows={3} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
              </div>
              <button onClick={saveProfile} disabled={saving} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
            </div>
          )}
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No orders yet.</div>
              ) : orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="line-clamp-1 pr-2">{it.name} × {it.quantity}</span>
                        <span>{formatPKR(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">{o.payment_method}</span>
                    <span className="font-bold text-base">{formatPKR(Number(o.grand_total))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
