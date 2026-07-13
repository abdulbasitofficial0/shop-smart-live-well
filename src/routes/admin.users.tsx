import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPKR } from "@/lib/types";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminShell><UsersAdmin /></AdminShell>,
});

type Row = { id: string; full_name: string | null; phone: string | null; city: string | null; created_at: string; orderCount: number; totalSpent: number };

function UsersAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: orders } = await supabase.from("orders").select("user_id, grand_total, status");
      const map = new Map<string, { count: number; sum: number }>();
      (orders ?? []).forEach((o: any) => {
        const cur = map.get(o.user_id) ?? { count: 0, sum: 0 };
        cur.count += 1;
        if (o.status === "Completed") cur.sum += Number(o.grand_total);
        map.set(o.user_id, cur);
      });
      setRows(
        (profiles ?? []).map((p: any) => ({
          id: p.id,
          full_name: p.full_name,
          phone: p.phone,
          city: p.city,
          created_at: p.created_at,
          orderCount: map.get(p.id)?.count ?? 0,
          totalSpent: map.get(p.id)?.sum ?? 0,
        }))
      );
    })();
  }, []);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Users ({rows.length})</h1>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Orders</th>
              <th className="text-left px-4 py-3">Spent</th>
              <th className="text-left px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.full_name || "—"}</td>
                <td className="px-4 py-3">{r.phone || "—"}</td>
                <td className="px-4 py-3">{r.city || "—"}</td>
                <td className="px-4 py-3">{r.orderCount}</td>
                <td className="px-4 py-3">{formatPKR(r.totalSpent)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
