-- Migración: renombrar columnas para_sabri / flete_sabri → nombres AGIAPURR
-- Tabla afectada: productos
-- Ejecutar en Supabase SQL Editor ANTES de hacer el push del código

ALTER TABLE productos RENAME COLUMN para_sabri TO para_catalogo;
ALTER TABLE productos RENAME COLUMN flete_sabri TO flete_catalogo;
