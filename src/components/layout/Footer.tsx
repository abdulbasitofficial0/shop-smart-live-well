import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-x py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-xl font-extrabold tracking-tight text-primary mb-4">
            NEXA<span className="text-foreground">STORE</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Smart Shopping, Better Living. Curated products for the modern lifestyle, delivered across Pakistan.
          </p>
          <div className="flex gap-3 mt-6">
            <a href="#" className="p-2 rounded-full bg-background border border-border hover:border-primary" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="p-2 rounded-full bg-background border border-border hover:border-primary" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="p-2 rounded-full bg-background border border-border hover:border-primary" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/products" className="hover:text-primary">All Products</Link></li>
            <li><Link to="/categories" className="hover:text-primary">Categories</Link></li>
            <li><Link to="/wishlist" className="hover:text-primary">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-primary">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Company</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 shrink-0 mt-0.5" /> +92 322 5305296</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 shrink-0 mt-0.5" /> hello@nexastore.pk</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> Karachi, Pakistan</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NexaStore. All rights reserved.</p>
          <p>Smart Shopping, Better Living.</p>
        </div>
      </div>
    </footer>
  );
}
