-- ==========================================
-- SCRIPT PARA SOLUCIONAR EL ERROR DE RECURSIÓN INFINITA EN RLS
-- Pega este código en el SQL Editor de Supabase y dale a "Run"
-- ==========================================

-- 1. Eliminar las políticas que causan el bucle infinito
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON public.users;
DROP POLICY IF EXISTS "Solo Admins pueden modificar stickers" ON public.stickers;
DROP POLICY IF EXISTS "Admins gestionan todas las órdenes" ON public.orders;
DROP POLICY IF EXISTS "Admins gestionan todos los items" ON public.order_items;

-- 2. Crear una función "SECURITY DEFINER" que lee el rol saltándose las políticas RLS. 
-- Al saltarse las políticas RLS, no vuelve a disparar la verificación, rompiendo el bucle.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Se ejecuta sin restricciones RLS
  SELECT rol INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Volver a crear las políticas utilizando la función segura
CREATE POLICY "Admins ven todos los perfiles" ON public.users 
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Solo Admins pueden modificar stickers" ON public.stickers 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan todas las órdenes" ON public.orders 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan todos los items" ON public.order_items 
  FOR ALL USING (public.is_admin());

-- ¡Listo! Esto soluciona el "infinite recursion" error.
