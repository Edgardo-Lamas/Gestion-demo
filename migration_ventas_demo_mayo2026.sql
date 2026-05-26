-- ============================================================
-- VENTAS DEMO — AGIAPURR Mayo 2026
-- Datos realistas para probar el agente Agi
--
-- Ejecutar en: Supabase → SQL Editor → Run
-- Requiere: productos cargados (migration_productos_agiapurr.sql)
-- ============================================================

INSERT INTO public.ventas (
  producto_id, producto_nombre,
  cantidad_vendida, precio_venta_unitario,
  ingreso_total, costo_calculado, ganancia,
  fecha
)
SELECT
  p.id,
  p.nombre,
  v.cantidad,
  ROUND(p.costo_referencia * (1 + p.margen_ganancia / 100.0), 2),
  ROUND(v.cantidad * p.costo_referencia * (1 + p.margen_ganancia / 100.0), 2),
  ROUND(v.cantidad * p.costo_referencia, 2),
  ROUND(v.cantidad * p.costo_referencia * p.margen_ganancia / 100.0, 2),
  v.fecha::DATE
FROM (VALUES
  -- Semana 1 (4/5 y 5/5)
  ('El Colono — Yerba Mate 1kg',              20, CURRENT_DATE - 22),
  ('El Colono — Yerba Mate 500g',             15, CURRENT_DATE - 22),
  ('Flor de Jardín — Yerba Mate 1kg',         38, CURRENT_DATE - 22),
  ('Granja Suiza — Dulce de Leche 450g',      12, CURRENT_DATE - 22),
  ('Las Tunas — Yerba Mate con Palo 1kg',     15, CURRENT_DATE - 21),
  ('Tucanguá — Yerba Mate Orgánica 1kg',      10, CURRENT_DATE - 21),
  ('Taihang — Yerba Mate Orgánica 500g',       8, CURRENT_DATE - 21),

  -- Semana 2 (7/5 y 9/5)
  ('El Colono — Yerba Mate 1kg',              25, CURRENT_DATE - 19),
  ('Flor de Jardín — Yerba Mate 500g',        18, CURRENT_DATE - 19),
  ('Chamarra — Yerba Mate Agroecológica 500g', 6, CURRENT_DATE - 19),
  ('Flor de Jardín — Pepinillos Agridulces 660g', 10, CURRENT_DATE - 17),
  ('Flor de Jardín — Chimichurri 200g',       14, CURRENT_DATE - 17),
  ('Granja Suiza — Queso Crema 250g',         8,  CURRENT_DATE - 17),

  -- Semana 3 (11/5 y 13/5)
  ('El Colono — Yerba Mate 1kg',              30, CURRENT_DATE - 15),
  ('Flor de Jardín — Yerba Mate 1kg',         22, CURRENT_DATE - 15),
  ('Las Tunas — Yerba Mate con Palo 1kg',     18, CURRENT_DATE - 15),
  ('Titrayju — Yerba Mate 500g',              12, CURRENT_DATE - 13),
  ('Picada Vieja — Yerba Mate 500g',           9, CURRENT_DATE - 13),
  ('Chamarra — Yerba Mate Agroecológica 1kg',  5, CURRENT_DATE - 13),
  ('Flor de Jardín — Chucrut 660g',            7, CURRENT_DATE - 13),

  -- Semana 4 (14/5 y 19/5)
  ('El Colono — Yerba Mate 1kg',              18, CURRENT_DATE - 12),
  ('Tucanguá — Yerba Mate Orgánica 1kg',      8,  CURRENT_DATE - 12),
  ('Flor de Jardín — Yerba Mate 500g',        20, CURRENT_DATE - 12),
  ('Granja Suiza — Dulce de Leche 450g',      15, CURRENT_DATE - 7),
  ('El Colono — Yerba Mate 500g',             22, CURRENT_DATE - 7),
  ('Flor de Jardín — Pepinillos Agridulces 660g', 8, CURRENT_DATE - 7),
  ('Chamarra — Yerba Mate Agroecológica 500g',  4, CURRENT_DATE - 7),

  -- Esta semana (últimos 3 días)
  ('El Colono — Yerba Mate 1kg',              12, CURRENT_DATE - 2),
  ('Flor de Jardín — Yerba Mate 1kg',         16, CURRENT_DATE - 2),
  ('Taihang — Yerba Mate Orgánica 500g',       6, CURRENT_DATE - 2),
  ('Flor de Jardín — Chimichurri 200g',        8, CURRENT_DATE - 1),
  ('Granja Suiza — Queso Crema 250g',          5, CURRENT_DATE - 1)

) AS v(nombre, cantidad, fecha)
JOIN public.productos p ON p.nombre = v.nombre;

-- Verificación
SELECT
  fecha,
  COUNT(*) AS operaciones,
  SUM(ingreso_total) AS ingresos,
  SUM(ganancia) AS ganancia
FROM ventas
GROUP BY fecha
ORDER BY fecha DESC;
