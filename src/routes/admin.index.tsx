import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPKR } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — NexaStore" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminShell><Dashboard /></AdminShell>,
});

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0, revenue: 0, users: 0 });
  useEffect(() => {
    (async () => {
      const [pr, or, pen, us, revData] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("grand_total").eq("status", "Completed"),
      ]);
      const rev = (revData.data ?? []).reduce((s, r: any) => s + Number(r.grand_total), 0);
      setStats({
        products: pr.count ?? 0,
        orders: or.count ?? 0,
        pending: pen.count ?? 0,
        revenue: rev,
        users: us.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, Icon: Package, color: "text-blue-500 bg-blue-500/10" },
    { label: "Total Orders", value: stats.orders, Icon: ShoppingCart, color: "text-purple-500 bg-purple-500/10" },
    { label: "Pending Orders", value: stats.pending, Icon: ShoppingCart, color: "text-yellow-500 bg-yellow-500/10" },
    { label: "Total Users", value: stats.users, Icon: Users, color: "text-green-500 bg-green-500/10" },
    { label: "Revenue (Completed)", value: formatPKR(stats.revenue), Icon: DollarSign, color: "text-accent bg-accent/10" },
  ];
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Overview of your store</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-6">
            <div className={`grid h-11 w-11 place-items-center rounded-full ${color} mb-4`}><Icon className="h-5 w-5" /></div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
