-- Agrega columna para marcar un cliente como "genérico" (ventas sin cliente registrado)
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS es_generico BOOLEAN DEFAULT FALSE;
