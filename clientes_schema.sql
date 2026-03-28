-- =====================================================
-- Script de Creación de Tablas: Sistema de Clientes
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. Tabla de Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    notas TEXT,
    categoria TEXT DEFAULT 'mayorista',
    fecha_alta DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Productos precargados por cliente
CREATE TABLE IF NOT EXISTS public.cliente_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad_kg NUMERIC NOT NULL DEFAULT 1,
    margen_personalizado NUMERIC,
    precio_fijo NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Agregar columna cliente_id a ventas existentes (nullable para no romper ventas anteriores)
ALTER TABLE public.ventas ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL;

-- =====================================================
-- Habilitar RLS
-- =====================================================
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_productos ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Permitir lectura publica de clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de cliente_productos" ON public.cliente_productos FOR SELECT USING (true);

-- Políticas de acceso completo (temporales, como las demás tablas)
CREATE POLICY "Permitir todo a clientes" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Permitir todo a cliente_productos" ON public.cliente_productos FOR ALL USING (true);
