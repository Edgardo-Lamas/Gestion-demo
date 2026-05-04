-- Agrega precio de costo de referencia manual por producto
-- Se usa como fallback cuando no hay compras cargadas para ese producto
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS costo_referencia NUMERIC DEFAULT 0;
