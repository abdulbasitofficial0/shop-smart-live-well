import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Star, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Category, Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/$id")({
  head: () => ({ meta: [{ title: "Edit Product — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminShell><ProductForm /></AdminShell>,
});

function ProductForm() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: 0, category_id: "", stock: 0, featured: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [variants, setVariants] = useState<{ name: string; values: string[] }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => setCats((data as Category[]) ?? []));
    if (!isNew) {
      supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => {
        const p = data as unknown as Product | null;
        if (p) {
          setForm({
            name: p.name, slug: p.slug, description: p.description ?? "", price: Number(p.price),
            category_id: p.category_id ?? "", stock: p.stock, featured: p.featured,
          });
          setImages(p.images ?? []);
          setVariants(p.variants ?? []);
        }
      });
    }
  }, [id, isNew]);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const addImageUrl = () => {
    if (!imageInput.trim()) return;
    setImages((prev) => [...prev, imageInput.trim()]);
    setImageInput("");
  };
  const uploadImages = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("products").upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      setImages((prev) => [...prev, data.publicUrl]);
    }
    toast.success("Uploaded");
  };
  const setFeaturedImage = (idx: number) => {
    setImages((prev) => [prev[idx], ...prev.filter((_, i) => i !== idx)]);
  };
  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const addVariantGroup = () => setVariants((v) => [...v, { name: "", values: [] }]);
  const updateVariant = (idx: number, patch: Partial<{ name: string; values: string[] }>) =>
    setVariants((v) => v.map((g, i) => i === idx ? { ...g, ...patch } : g));
  const removeVariantGroup = (idx: number) => setVariants((v) => v.filter((_, i) => i !== idx));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      images,
      variants: variants.filter((v) => v.name && v.values.length > 0),
      category_id: form.category_id || null,
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload as any)
      : await supabase.from("products").update(payload as any).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Product created" : "Product updated");
    navigate({ to: "/admin/products" });
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{isNew ? "Add Product" : "Edit Product"}</h1>
      <form onSubmit={submit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="text-sm font-medium">Name *</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          </label>
          <label className="block"><span className="text-sm font-medium">Slug *</span>
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono" />
          </label>
          <label className="block"><span className="text-sm font-medium">Category</span>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
              <option value="">— Select —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-sm font-medium">Price (Rs.) *</span>
            <input required type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          </label>
          <label className="block"><span className="text-sm font-medium">Stock *</span>
            <input required type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          </label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium">Description</span>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          </label>
          <label className="inline-flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-primary" />
            <span className="text-sm">Featured product (show on homepage)</span>
          </label>
        </div>

        {/* Images */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Images ({images.length})</h3>
            <p className="text-xs text-muted-foreground">First image is the featured image</p>
          </div>
          <div className="flex gap-2 mb-3">
            <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Paste image URL" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button type="button" onClick={addImageUrl} className="rounded-lg bg-secondary px-4 text-sm font-semibold">Add URL</button>
            <label className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground cursor-pointer">
              <Upload className="h-4 w-4" /> Upload
              <input type="file" multiple accept="image/*" onChange={(e) => uploadImages(e.target.files)} className="hidden" />
            </label>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((url, i) => (
                <div key={i} className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${i === 0 ? "border-primary" : "border-border"}`}>
                  <img src={url} className="h-full w-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    {i !== 0 && <button type="button" onClick={() => setFeaturedImage(i)} className="p-1.5 bg-white/10 rounded-full text-white" title="Set featured"><Star className="h-3 w-3" /></button>}
                    <button type="button" onClick={() => removeImage(i)} className="p-1.5 bg-white/10 rounded-full text-white"><X className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold">Variant Options</h3>
              <p className="text-xs text-muted-foreground">Examples: Color · Size · Storage · Material</p>
            </div>
            <button type="button" onClick={addVariantGroup} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold"><Plus className="h-3 w-3" /> Add Group</button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[200px_1fr_auto] p-3 rounded-lg border border-border">
                <input value={v.name} onChange={(e) => updateVariant(i, { name: e.target.value })} placeholder="Group name (e.g. Color)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <input value={v.values.join(", ")} onChange={(e) => updateVariant(i, { values: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Values comma-separated (e.g. Black, White, Blue)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <button type="button" onClick={() => removeVariantGroup(i)} className="text-destructive text-sm px-3">Remove</button>
              </div>
            ))}
            {variants.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No variants. Click "Add Group" to add unlimited options.</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving..." : "Save Product"}</button>
          <button type="button" onClick={() => navigate({ to: "/admin/products" })} className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold">Cancel</button>
        </div>
      </form>
    </div>
  );
}
