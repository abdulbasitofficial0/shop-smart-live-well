import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin — NexaStore" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); return toast.error(error.message); }
    if (data.user) {
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        setBusy(false);
        return toast.error("This account does not have admin access.");
      }
      toast.success("Welcome, admin");
      navigate({ to: "/admin" });
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-brand text-brand-foreground px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-8 text-card-foreground shadow-2xl">
        <div className="text-center mb-6">
          <div className="font-display font-extrabold text-2xl text-primary">NEXA<span className="text-foreground">ADMIN</span></div>
          <p className="text-sm text-muted-foreground mt-2">Authorized personnel only</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <button disabled={busy} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Need admin? Sign up as a normal user, then grant yourself the <code className="font-mono bg-secondary px-1 rounded">admin</code> role in Cloud → user_roles.
        </p>
      </div>
    </div>
  );
}
