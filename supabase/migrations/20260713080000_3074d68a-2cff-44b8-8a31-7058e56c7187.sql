
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  images TEXT[] NOT NULL DEFAULT '{}',
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Cart
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  variant JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wishlist
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlist FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT NOT NULL,
  items JSONB NOT NULL,
  product_total NUMERIC(10,2) NOT NULL,
  delivery_charges NUMERIC(10,2) NOT NULL,
  cod_charges NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed categories
INSERT INTO public.categories (name, slug, image_url) VALUES
  ('Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600'),
  ('Fashion', 'fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600'),
  ('Home', 'home', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'),
  ('Beauty', 'beauty', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'),
  ('Sports', 'sports', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600'),
  ('Toys', 'toys', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600');

-- Seed a few products
WITH cats AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (name, slug, description, price, category_id, stock, featured, images, variants) VALUES
  ('Apex Pro Wireless Headphones', 'apex-pro-headphones', 'Studio-grade noise cancellation with 40hr battery.', 34500, (SELECT id FROM cats WHERE slug='electronics'), 25, true,
    ARRAY['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800','https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
    '[{"name":"Color","values":["Black","Silver","Navy"]}]'::jsonb),
  ('Lumix Mirrorless Camera', 'lumix-mirrorless', 'Full-frame hybrid camera for creators.', 320000, (SELECT id FROM cats WHERE slug='electronics'), 8, true,
    ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'], '[]'::jsonb),
  ('Tactile V2 Mechanical Keyboard', 'tactile-v2-keyboard', 'Hot-swap 65% board with PBT keycaps.', 18500, (SELECT id FROM cats WHERE slug='electronics'), 40, true,
    ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'],
    '[{"name":"Switch","values":["Brown","Blue","Red"]},{"name":"Layout","values":["ANSI","ISO"]}]'::jsonb),
  ('Cotton Twill Overshirt', 'cotton-overshirt', 'Heavyweight cotton twill, perfect boxy fit.', 8900, (SELECT id FROM cats WHERE slug='fashion'), 60, true,
    ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    '[{"name":"Size","values":["S","M","L","XL"]},{"name":"Color","values":["Black","Sand","Olive"]}]'::jsonb),
  ('Smart Ceramic Kettle', 'smart-kettle', 'Precision-temp ceramic kettle with app control.', 12500, (SELECT id FROM cats WHERE slug='home'), 30, true,
    ARRAY['https://images.unsplash.com/photo-1594213114663-d99a9dad21f9?w=800'], '[]'::jsonb),
  ('Recovery Face Serum 30ml', 'recovery-face-serum', 'Overnight peptide + niacinamide serum.', 4200, (SELECT id FROM cats WHERE slug='beauty'), 100, false,
    ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'], '[]'::jsonb),
  ('Carbon Pro Cycling Helmet', 'carbon-pro-helmet', 'Aero road helmet with MIPS liner.', 18700, (SELECT id FROM cats WHERE slug='sports'), 15, false,
    ARRAY['https://images.unsplash.com/photo-1557687650-2b1c60c07f04?w=800'],
    '[{"name":"Size","values":["S","M","L"]}]'::jsonb),
  ('Wooden Play Building Set', 'wooden-play-set', '120-piece FSC-certified wooden blocks.', 6300, (SELECT id FROM cats WHERE slug='toys'), 50, false,
    ARRAY['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800'], '[]'::jsonb),
  ('Steel Insulated Bottle 750ml', 'steel-bottle', 'Double-wall vacuum steel, keeps cold 24h.', 2800, (SELECT id FROM cats WHERE slug='home'), 200, false,
    ARRAY['https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800'],
    '[{"name":"Color","values":["Matte Black","Sand","Ocean"]}]'::jsonb),
  ('Wool Throw Blanket', 'wool-throw', 'Organic merino wool throw, hand-loomed.', 14000, (SELECT id FROM cats WHERE slug='home'), 20, false,
    ARRAY['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800'], '[]'::jsonb),
  ('Resistance Band Training Set', 'resistance-bands', '5-piece set with door anchor and handles.', 5500, (SELECT id FROM cats WHERE slug='sports'), 80, false,
    ARRAY['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800'], '[]'::jsonb),
  ('Apex Watch Ultra', 'apex-watch-ultra', 'Titanium smartwatch with health suite.', 45999, (SELECT id FROM cats WHERE slug='electronics'), 22, true,
    ARRAY['https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800'],
    '[{"name":"Band","values":["Sport","Leather","Metal"]}]'::jsonb);
