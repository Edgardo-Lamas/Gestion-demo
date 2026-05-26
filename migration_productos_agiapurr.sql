-- ============================================================
-- PRODUCTOS REALES — AGIAPURR Distribuidora
-- Studio Lamas · Mayo 2026
--
-- Instrucciones:
--   1. Abrir Supabase → SQL Editor
--   2. Ejecutar primero el bloque DELETE (limpia datos demo de Sabri)
--   3. Ejecutar el bloque INSERT
-- ============================================================

-- PASO 1: Limpiar productos demo (de Gestión Sabri)
-- ⚠️ Solo correr si querés reemplazar todos los productos actuales
DELETE FROM public.pedido_items;
DELETE FROM public.pedidos;
DELETE FROM public.distribuciones;
DELETE FROM public.ventas;
DELETE FROM public.compras;
DELETE FROM public.cliente_productos;
DELETE FROM public.productos;

-- PASO 2: Insertar productos reales de AGIAPURR
-- Campos: nombre, margen_ganancia, visible_catalogo, costo_referencia, unidad
-- Los precios son de referencia para el demo (en ARS, mayo 2026)

INSERT INTO public.productos (nombre, margen_ganancia, visible_catalogo, costo_referencia, unidad) VALUES

  -- ── EL COLONO ──────────────────────────────────────────
  ('El Colono — Yerba Mate 500g',          25, true,  2200, 'paquete'),
  ('El Colono — Yerba Mate 1kg',           25, true,  4000, 'paquete'),

  -- ── FLOR DE JARDÍN — Yerba Mate ───────────────────────
  ('Flor de Jardín — Yerba Mate 500g',     25, true,  2400, 'paquete'),
  ('Flor de Jardín — Yerba Mate 1kg',      25, true,  4300, 'paquete'),

  -- ── FLOR DE JARDÍN — Conservas ────────────────────────
  ('Flor de Jardín — Pepinillos Agridulces 660g', 35, true, 3200, 'unidad'),
  ('Flor de Jardín — Chucrut 660g',        35, true,  3000, 'unidad'),
  ('Flor de Jardín — Chimichurri 200g',    35, true,  1800, 'unidad'),

  -- ── TUCANGUÁ ──────────────────────────────────────────
  ('Tucanguá — Yerba Mate Orgánica 1kg',   30, true,  5200, 'paquete'),

  -- ── LAS TUNAS ─────────────────────────────────────────
  ('Las Tunas — Yerba Mate con Palo 1kg',  25, true,  3900, 'paquete'),

  -- ── TITRAYJU ──────────────────────────────────────────
  ('Titrayju — Yerba Mate 500g',           25, true,  2600, 'paquete'),

  -- ── CHAMARRA ──────────────────────────────────────────
  ('Chamarra — Yerba Mate Agroecológica 500g', 28, true, 2900, 'paquete'),
  ('Chamarra — Yerba Mate Agroecológica 1kg',  28, true, 5400, 'paquete'),

  -- ── PICADA VIEJA ──────────────────────────────────────
  ('Picada Vieja — Yerba Mate 500g',       25, true,  2200, 'paquete'),

  -- ── TAIHANG ───────────────────────────────────────────
  ('Taihang — Yerba Mate Orgánica 500g',   30, true,  4500, 'paquete'),

  -- ── GRANJA SUIZA ──────────────────────────────────────
  ('Granja Suiza — Dulce de Leche 450g',   30, true,  3500, 'unidad'),
  ('Granja Suiza — Queso Crema 250g',      30, true,  2800, 'unidad');

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT nombre, margen_ganancia, costo_referencia, unidad
FROM public.productos
ORDER BY nombre;
