import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Shop by Category — NexaStore" }, { name: "description", content: "Browse all NexaStore product categories." }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => setCats((data as Category[]) ?? []));
  }, []);
  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-bold mb-2">Shop by Category</h1>
      <p className="text-muted-foreground mb-10">Explore our curated collections.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {cats.map((c) => (
          <Link key={c.id} to="/products" search={{ cat: c.slug, q: undefined }} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border">
            {c.image_url && <img src={c.image_url} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
            <div className="absolute inset-0 bg-gradient-to-t from-brand/95 via-brand/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="text-xl font-bold text-brand-foreground">{c.name}</h3>
              <p className="text-sm text-brand-foreground/70 mt-1">Explore →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
