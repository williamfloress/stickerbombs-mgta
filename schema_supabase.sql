-- ==========================================
-- SCRIPT SQL PARA LA BASE DE DATOS DE STICKERBOMB
-- Pega este código en el SQL Editor de Supabase y dale a "Run" (Ejecutar)
-- ==========================================

-- 0. LIMPIEZA DE BARRIDO (Resetear la base de datos)
-- Eliminar triggers y funciones primero
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Eliminar tablas en orden de dependencias
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.stickers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Eliminar usuarios de prueba de auth.users si ya existían (para evitar duplicados en el barrido)
DELETE FROM auth.users WHERE email IN ('admin@stickerbomb.com', 'cliente@stickerbomb.com');

-- ==========================================

-- Habilitar las extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función de seguridad para evitar recursión infinita en las políticas RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT rol INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Tabla de Perfiles de Usuario (Se vincula con Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT,
  email TEXT,
  direccion TEXT,
  rol TEXT DEFAULT 'client' CHECK (rol IN ('admin', 'client')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su propio perfil" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins ven todos los perfiles" ON public.users FOR SELECT USING (public.is_admin());

-- 2. Tabla de Stickers (Catálogo)
CREATE TABLE public.stickers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10, 2) NOT NULL,
  imagen_url TEXT,
  stock INTEGER DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en stickers
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera puede ver los stickers" ON public.stickers FOR SELECT USING (true);
CREATE POLICY "Solo Admins pueden modificar stickers" ON public.stickers FOR ALL USING (public.is_admin());

-- 3. Tabla de Órdenes
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES public.users(id) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagado', 'Procesando', 'Enviado', 'Entregado')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clientes ven sus propias órdenes" ON public.orders FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Clientes pueden crear órdenes" ON public.orders FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Admins gestionan todas las órdenes" ON public.orders FOR ALL USING (public.is_admin());

-- 4. Tabla de Ítems de Órdenes
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  orden_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sticker_id UUID REFERENCES public.stickers(id) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10, 2) NOT NULL
);

-- Habilitar RLS en order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clientes ven sus items a través de su orden" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.orden_id AND usuario_id = auth.uid())
);
CREATE POLICY "Clientes pueden insertar items en su orden" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.orden_id AND usuario_id = auth.uid())
);
CREATE POLICY "Admins gestionan todos los items" ON public.order_items FOR ALL USING (public.is_admin());

-- ==========================================
-- FUNCIÓN Y TRIGGER DE AUTOMATIZACIÓN
-- ==========================================
-- Cuando un usuario se registra en Supabase Auth, se crea su perfil automáticamente aquí.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre, rol)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nombre', 'client');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- NOTA: Para crear los usuarios de prueba, utiliza la página de registro (/register) 
-- de tu aplicación. Esto asegura que Supabase configure correctamente las identidades 
-- y contraseñas.
--
-- Una vez registrado el administrador, ejecuta este comando para darle permisos:
-- UPDATE public.users SET rol = 'admin' WHERE email = 'tu_correo_admin@ejemplo.com';
-- ==========================================
