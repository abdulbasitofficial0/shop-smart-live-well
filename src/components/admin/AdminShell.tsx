import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/admin/login" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  const nav = [
    { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", Icon: Package },
    { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
    { to: "/admin/users", label: "Users", Icon: Users },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-border bg-card p-4 flex flex-col">
        <div className="font-display font-extrabold text-lg text-primary mb-8 px-2">
          NEXA<span className="text-foreground">ADMIN</span>
        </div>
        <nav className="space-y-1 flex-1">
          {nav.map(({ to, label, Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${active ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary"}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-border pt-3">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary"><Home className="h-4 w-4" /> Storefront</Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-secondary"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
