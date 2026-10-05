-- ==========================================
-- SCRIPT DE INYECCIÓN DE STICKERS DE PRUEBA
-- Ejecuta este código en el SQL Editor de Supabase
-- ==========================================

INSERT INTO public.stickers (nombre, descripcion, precio, imagen_url, stock)
VALUES 
(
  'Holográfico Cyberpunk', 
  'Diseño futurista con brillos holográficos y luces de neón estilo cyberpunk.', 
  9.99, 
  'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=800', 
  150
),
(
  'Galaxia Profunda', 
  'Un vistazo al cosmos. Estrellas y nebulosas para darle un toque espacial a tu tarjeta.', 
  8.50, 
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800', 
  200
),
(
  'Minimalista Mate Black', 
  'Elegancia pura. Negro mate con un sutil acabado premium para los que prefieren discreción.', 
  7.00, 
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800', 
  500
),
(
  'Anime Vibes (Sakura)', 
  'Arte estilo anime con flores de cerezo (Sakura) cayendo suavemente. Perfecto para fans de la cultura pop.', 
  12.00, 
  'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80&w=800', 
  75
),
(
  'Street Art Graffiti', 
  'Colores vibrantes y trazos salvajes inspirados en el arte urbano y la cultura skate.', 
  10.50, 
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800', 
  110
);
