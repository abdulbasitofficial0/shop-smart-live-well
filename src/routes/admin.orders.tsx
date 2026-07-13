import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPKR, type Order } from "@/lib/types";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminShell><OrdersAdmin /></AdminShell>,
});

const STATUSES = ["Pending", "Processing", "Completed", "Cancelled"] as const;

function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
  };

  const filtered = orders
    .filter((o) => filter === "all" || o.status === filter)
    .filter((o) => !q || o.full_name.toLowerCase().includes(q.toLowerCase()) || o.phone.includes(q) || o.id.includes(q));

  const statusColor = (s: string) => ({
    Pending: "bg-yellow-500/15 text-yellow-500",
    Processing: "bg-blue-500/15 text-blue-500",
    Completed: "bg-green-500/15 text-green-500",
    Cancelled: "bg-red-500/15 text-red-500",
  }[s] ?? "bg-muted");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, id..." className="rounded-lg border border-border bg-background px-3 py-2 text-sm min-w-64" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-start">
              <div>
                <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                <p className="font-semibold mt-1">{o.full_name}</p>
                <p className="text-xs text-muted-foreground">{o.phone}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">{o.city}</p>
                <p className="text-xs">{o.address}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">{o.payment_method}</p>
                <p className="font-bold">{formatPKR(Number(o.grand_total))}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(o.status)}`}>{o.status}</span>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="text-xs text-primary">
                  {expanded === o.id ? "Hide" : "View items"}
                </button>
              </div>
            </div>
            {expanded === o.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                {o.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.name} × {it.quantity} {Object.keys(it.variant ?? {}).length > 0 && <span className="text-muted-foreground text-xs">({Object.entries(it.variant).map(([k, v]) => `${k}: ${v}`).join(", ")})</span>}</span>
                    <span>{formatPKR(it.price * it.quantity)}</span>
                  </div>
                ))}
                {o.notes && <p className="text-xs text-muted-foreground pt-2">Notes: {o.notes}</p>}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-16 text-muted-foreground">No orders match.</p>}
      </div>
    </div>
  );
}
