import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newest, setNewest] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("featured", true).limit(6).then(({ data }) => setFeatured((data as unknown as Product[]) ?? []));
    supabase.from("products").select("*").order("created_at", { ascending: false }).limit(8).then(({ data }) => setNewest((data as unknown as Product[]) ?? []));
    supabase.from("categories").select("*").then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--color-primary)_35%,transparent),transparent_60%)]" />
        <div className="container-x relative py-16 md:py-24 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> New Collection 2026
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight">
              Smart Shopping,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Better Living.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
              Discover a curated selection of premium electronics, fashion, and home essentials — delivered anywhere in Pakistan with Cash on Delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02]">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/categories" className="inline-flex items-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-secondary">
                Browse Categories
              </Link>
            </div>
          </div>
          <div className="relative aspect-square max-w-md ml-auto w-full">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/30 via-accent/10 to-transparent blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
              alt="Featured product"
              className="relative w-full h-full object-cover rounded-[2rem] border border-border shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <p className="text-sm text-muted-foreground mt-1">Find what you need across our curated collections</p>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ cat: c.slug, q: undefined }}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card"
            >
              {c.image_url && <img src={c.image_url} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
              <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-sm font-semibold text-brand-foreground">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container-x py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-brand p-10 md:p-14 text-primary-foreground">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/40 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-3">Exclusive Offer</p>
            <h3 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">Free Delivery on Orders Over Rs. 5,000</h3>
            <p className="text-primary-foreground/80 mb-6">Shop your favourites and get them shipped straight to your doorstep, on us.</p>
            <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground hover:brightness-110">
              Shop the Sale <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-x py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked essentials, loved by our customers</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-x py-14 border-t border-border">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">New Arrivals</h2>
            <p className="text-sm text-muted-foreground mt-1">Freshly dropped this week</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newest.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Trust badges */}
      <section className="container-x py-14 border-t border-border">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { Icon: Truck, title: "Fast Delivery", desc: "Nationwide shipping with tracked deliveries." },
            { Icon: ShieldCheck, title: "Secure Checkout", desc: "Cash on Delivery, EasyPaisa & JazzCash." },
            { Icon: Headphones, title: "24/7 Support", desc: "Reach us on WhatsApp any time." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 rounded-2xl border border-border bg-card">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{title}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
