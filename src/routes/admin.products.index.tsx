import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPKR, type Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/")({
  head: () => ({ meta: [{ title: "Products — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminShell><ProductsList /></AdminShell>,
});

function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as unknown as Product[]) ?? []);
  };
  useEffect(() => { load(); }, []);
  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">{products.length} products</p>
        </div>
        <Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Featured</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                      {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover" alt="" />}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{formatPKR(Number(p.price))}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.featured ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  <Link to="/admin/products/$id" params={{ id: p.id }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs mr-2 hover:bg-secondary"><Edit className="h-3 w-3" /> Edit</Link>
                  <button onClick={() => del(p.id)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
