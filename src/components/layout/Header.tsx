import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const [logoClicks, setLogoClicks] = useState(0);
  const [q, setQ] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (logoClicks === 0) return;
    const t = setTimeout(() => setLogoClicks(0), 1500);
    if (logoClicks >= 5) {
      setLogoClicks(0);
      navigate({ to: "/admin/login" });
    }
    return () => clearTimeout(t);
  }, [logoClicks, navigate]);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    let cancel = false;
    const load = async () => {
      const { data } = await supabase.from("cart_items").select("quantity").eq("user_id", user.id);
      if (!cancel) setCartCount((data ?? []).reduce((a, r) => a + r.quantity, 0));
    };
    load();
    const ch = supabase
      .channel("cart-header")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => {
      cancel = true;
      supabase.removeChannel(ch);
    };
  }, [user]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/products", search: { q: q.trim(), cat: undefined } });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="border-b border-border/60 bg-brand text-brand-foreground">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <span className="tracking-wide">Free delivery on orders over Rs. 5,000 · Cash on Delivery available</span>
          <span className="hidden sm:inline opacity-70">Smart Shopping, Better Living</span>
        </div>
      </div>
      <div className="container-x flex h-16 items-center gap-4 sm:gap-6">
        <button
          onClick={() => setLogoClicks((c) => c + 1)}
          className="shrink-0 font-display text-xl font-extrabold tracking-tight text-primary"
          aria-label="NexaStore home"
        >
          <Link to="/" className="cursor-pointer">NEXA<span className="text-foreground">STORE</span></Link>
        </button>
        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
            />
          </div>
        </form>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>Home</Link>
          <Link to="/categories" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Categories</Link>
          <Link to="/products" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Products</Link>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={toggle} className="p-2 rounded-full hover:bg-secondary" aria-label="Theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link to="/wishlist" className="p-2 rounded-full hover:bg-secondary hidden sm:inline-flex" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-secondary" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/account" className="p-2 rounded-full hover:bg-secondary" aria-label="Account">
                <UserIcon className="h-5 w-5" />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
                  Admin
                </Link>
              )}
              <button
                onClick={async () => {
                  await signOut();
                  router.invalidate();
                  navigate({ to: "/" });
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="hidden sm:inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              Sign in
            </Link>
          )}
          <button onClick={() => setMobileOpen((o) => !o)} className="lg:hidden p-2 rounded-full hover:bg-secondary">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-border">
          <div className="container-x py-4 space-y-3">
            <form onSubmit={submitSearch} className="md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-sm outline-none"
                />
              </div>
            </form>
            <nav className="grid gap-1 text-sm">
              <Link onClick={() => setMobileOpen(false)} to="/" className="py-2">Home</Link>
              <Link onClick={() => setMobileOpen(false)} to="/categories" className="py-2">Categories</Link>
              <Link onClick={() => setMobileOpen(false)} to="/products" className="py-2">Products</Link>
              <Link onClick={() => setMobileOpen(false)} to="/wishlist" className="py-2">Wishlist</Link>
              <Link onClick={() => setMobileOpen(false)} to="/account" className="py-2">My Account</Link>
              {!user && (
                <Link onClick={() => setMobileOpen(false)} to="/auth" className="py-2 text-primary font-semibold">Sign in</Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
