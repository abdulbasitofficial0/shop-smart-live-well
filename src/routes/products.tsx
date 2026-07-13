import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

const searchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "All Products — NexaStore" }, { name: "description", content: "Browse all NexaStore products with search and category filters." }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { q, cat } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => setCats((data as Category[]) ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("products").select("*, categories!inner(slug)").order("created_at", { ascending: false });
    if (cat) query = query.eq("categories.slug", cat);
    if (q) query = query.ilike("name", `%${q}%`);
    query.then(({ data }) => {
      setProducts((data as unknown as Product[]) ?? []);
      setLoading(false);
    });
  }, [q, cat]);

  const activeCat = useMemo(() => cats.find((c) => c.slug === cat), [cats, cat]);

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-bold mb-2">{activeCat ? activeCat.name : q ? `Search: "${q}"` : "All Products"}</h1>
      <p className="text-muted-foreground mb-8">{products.length} products found</p>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => navigate({ search: { q, cat: undefined } })}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!cat ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary"}`}
              >All Products</button>
              {cats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate({ search: { q, cat: c.slug } })}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${cat === c.slug ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary"}`}
                >{c.name}</button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
