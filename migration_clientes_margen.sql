-- =====================================================
-- Migración: Agregar columna margen_ganancia a clientes
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS margen_ganancia NUMERIC DEFAULT 0;
