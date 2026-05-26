-- ============================================================
-- COMPRAS DEMO — AGIAPURR Mayo 2026
-- Lotes de compra para alimentar el stock widget y FIFO
--
-- Ejecutar en: Supabase → SQL Editor → Run
-- Requiere: productos cargados (migration_productos_agiapurr.sql)
-- ============================================================
-- Nota: cantidad_disponible = cantidad_kg - lo vendido hasta hoy
-- Se cargan 2 lotes por producto para que el FIFO tenga sentido
-- ============================================================

INSERT INTO public.compras (
  producto_id, cantidad_kg, cantidad_disponible, costo_unitario, fecha, creado_en
)
SELECT
  p.id,
  c.cantidad_kg,
  c.cantidad_disponible,
  c.costo_unitario,
  c.fecha::DATE,
  EXTRACT(EPOCH FROM NOW())::BIGINT
FROM (VALUES
  -- Lote inicial 28/4 — abastecimiento pre-temporada
  ('El Colono — Yerba Mate 1kg',               200, 95,  3800, CURRENT_DATE - 28),
  ('El Colono — Yerba Mate 500g',               80, 43,  2100, CURRENT_DATE - 28),
  ('Flor de Jardín — Yerba Mate 1kg',          150, 74,  4100, CURRENT_DATE - 28),
  ('Flor de Jardín — Yerba Mate 500g',          60, 22,  2300, CURRENT_DATE - 28),
  ('Las Tunas — Yerba Mate con Palo 1kg',       80, 47,  3700, CURRENT_DATE - 28),
  ('Tucanguá — Yerba Mate Orgánica 1kg',        40, 22,  4900, CURRENT_DATE - 28),
  ('Taihang — Yerba Mate Orgánica 500g',        30, 16,  4300, CURRENT_DATE - 28),
  ('Chamarra — Yerba Mate Agroecológica 500g',  25, 15,  2750, CURRENT_DATE - 28),
  ('Chamarra — Yerba Mate Agroecológica 1kg',   20, 15,  5100, CURRENT_DATE - 28),
  ('Titrayju — Yerba Mate 500g',                30, 18,  2500, CURRENT_DATE - 28),
  ('Picada Vieja — Yerba Mate 500g',            25, 16,  2100, CURRENT_DATE - 28),
  ('Flor de Jardín — Pepinillos Agridulces 660g', 40, 22, 3050, CURRENT_DATE - 28),
  ('Flor de Jardín — Chucrut 660g',             20, 13,  2850, CURRENT_DATE - 28),
  ('Flor de Jardín — Chimichurri 200g',         50, 28,  1700, CURRENT_DATE - 28),
  ('Granja Suiza — Dulce de Leche 450g',        50, 23,  3300, CURRENT_DATE - 28),
  ('Granja Suiza — Queso Crema 250g',           30, 17,  2650, CURRENT_DATE - 28),

  -- Lote reposición 12/5 — mitad de mes
  ('El Colono — Yerba Mate 1kg',               100, 100, 3850, CURRENT_DATE - 14),
  ('Flor de Jardín — Yerba Mate 1kg',           80,  80, 4150, CURRENT_DATE - 14),
  ('El Colono — Yerba Mate 500g',               40,  40, 2100, CURRENT_DATE - 14),
  ('Tucanguá — Yerba Mate Orgánica 1kg',        20,  20, 4950, CURRENT_DATE - 14),
  ('Granja Suiza — Dulce de Leche 450g',        30,  30, 3350, CURRENT_DATE - 14),
  ('Chamarra — Yerba Mate Agroecológica 500g',  15,  15, 2800, CURRENT_DATE - 14)

) AS c(nombre, cantidad_kg, cantidad_disponible, costo_unitario, fecha)
JOIN public.productos p ON p.nombre = c.nombre;

-- Verificación
SELECT
  p.nombre,
  SUM(c.cantidad_kg) AS comprado_total,
  SUM(c.cantidad_disponible) AS stock_disponible,
  AVG(c.costo_unitario)::NUMERIC(10,2) AS costo_promedio
FROM compras c
JOIN productos p ON p.id = c.producto_id
GROUP BY p.nombre
ORDER BY stock_disponible DESC;
