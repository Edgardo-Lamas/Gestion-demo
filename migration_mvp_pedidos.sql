-- =====================================================
-- MIGRACIÓN MVP — Sistema de Pedidos AGIAPURR
-- Ejecutar en: Supabase → SQL Editor → New query
-- =====================================================

-- 1. AJUSTES A TABLAS EXISTENTES

-- Agregar campo unidad a productos (kg, unidad, paquete, etc.)
ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS unidad TEXT DEFAULT 'unidad';

-- Agregar email a clientes
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. TABLA PEDIDOS
CREATE TABLE IF NOT EXISTS public.pedidos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  estado        TEXT NOT NULL DEFAULT 'pendiente',
  -- estados: pendiente | aprobado | armando | despachado | entregado | cancelado
  origen        TEXT NOT NULL DEFAULT 'portal',
  -- origen: portal | whatsapp | manual
  observaciones TEXT,
  total         NUMERIC DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. TABLA PEDIDO_ITEMS
CREATE TABLE IF NOT EXISTS public.pedido_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  producto_id     UUID REFERENCES public.productos(id) ON DELETE SET NULL,
  producto_nombre TEXT,
  cantidad        NUMERIC NOT NULL,
  precio_unitario NUMERIC NOT NULL,
  subtotal        NUMERIC NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 4. TABLA ENTREGAS
CREATE TABLE IF NOT EXISTS public.entregas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id     UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  repartidor    TEXT,
  estado        TEXT NOT NULL DEFAULT 'pendiente',
  -- estados: pendiente | en_camino | entregado | fallido
  observaciones TEXT,
  hora_entrega  TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 5. FUNCIÓN: actualizar updated_at automáticamente en pedidos
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. RLS
ALTER TABLE public.pedidos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total pedidos"       ON public.pedidos      FOR ALL USING (true);
CREATE POLICY "Acceso total pedido_items"  ON public.pedido_items FOR ALL USING (true);
CREATE POLICY "Acceso total entregas"      ON public.entregas     FOR ALL USING (true);

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
