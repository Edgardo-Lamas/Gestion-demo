-- =====================================================
-- SETUP COMPLETO — Sistema Demo (base Gestion-Sabri)
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- =====================================================

-- 1. PRODUCTOS
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    margen_ganancia NUMERIC,
    visible_catalogo BOOLEAN DEFAULT true,
    precio_manual NUMERIC,
    imagen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS costo_referencia NUMERIC DEFAULT 0;

-- 2. COMPRAS (lotes de stock — base del FIFO)
CREATE TABLE IF NOT EXISTS public.compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad_kg NUMERIC NOT NULL,
    cantidad_disponible NUMERIC NOT NULL,
    costo_unitario NUMERIC NOT NULL,
    fecha DATE NOT NULL,
    creado_en BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CLIENTES
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

ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS margen_ganancia NUMERIC DEFAULT 0;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS es_generico BOOLEAN DEFAULT FALSE;

-- 4. VENTAS
CREATE TABLE IF NOT EXISTS public.ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    producto_nombre TEXT NOT NULL,
    cantidad_vendida NUMERIC NOT NULL,
    precio_venta_unitario NUMERIC NOT NULL,
    ingreso_total NUMERIC NOT NULL,
    costo_calculado NUMERIC NOT NULL,
    ganancia NUMERIC NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ventas ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL;

-- 5. GASTOS
CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. DISTRIBUCIONES
CREATE TABLE IF NOT EXISTS public.distribuciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    empleado_id TEXT,
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad_kg NUMERIC NOT NULL,
    precio_base NUMERIC,
    shipping_cost NUMERIC,
    precio_venta NUMERIC,
    partner_share_percentage NUMERIC,
    total_cost NUMERIC,
    total_profit NUMERIC,
    partner_profit NUMERIC,
    supplier_profit NUMERIC,
    supplier_total_return NUMERIC,
    total_sale NUMERIC,
    total_partner_profit NUMERIC,
    total_supplier_profit NUMERIC,
    total_supplier_return NUMERIC,
    monto_total NUMERIC,
    pago_entregado NUMERIC DEFAULT 0,
    saldo_pendiente NUMERIC,
    estado_pago TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CLIENTE_PRODUCTOS (precios personalizados por cliente)
CREATE TABLE IF NOT EXISTS public.cliente_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad_kg NUMERIC NOT NULL DEFAULT 1,
    margen_personalizado NUMERIC,
    precio_fijo NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribuciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_productos ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para catálogo B2B)
CREATE POLICY "Lectura publica productos" ON public.productos FOR SELECT USING (true);
CREATE POLICY "Lectura publica compras" ON public.compras FOR SELECT USING (true);
CREATE POLICY "Lectura publica ventas" ON public.ventas FOR SELECT USING (true);
CREATE POLICY "Lectura publica gastos" ON public.gastos FOR SELECT USING (true);
CREATE POLICY "Lectura publica distribuciones" ON public.distribuciones FOR SELECT USING (true);
CREATE POLICY "Lectura publica clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Lectura publica cliente_productos" ON public.cliente_productos FOR SELECT USING (true);

-- Escritura solo para usuarios autenticados
CREATE POLICY "Auth insertar productos" ON public.productos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar productos" ON public.productos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth borrar productos" ON public.productos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insertar compras" ON public.compras FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar compras" ON public.compras FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth borrar compras" ON public.compras FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insertar ventas" ON public.ventas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar ventas" ON public.ventas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth borrar ventas" ON public.ventas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insertar gastos" ON public.gastos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar gastos" ON public.gastos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth borrar gastos" ON public.gastos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insertar distribuciones" ON public.distribuciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar distribuciones" ON public.distribuciones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth borrar distribuciones" ON public.distribuciones FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insertar clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar clientes" ON public.clientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth borrar clientes" ON public.clientes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insertar cliente_productos" ON public.cliente_productos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar cliente_productos" ON public.cliente_productos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth borrar cliente_productos" ON public.cliente_productos FOR DELETE TO authenticated USING (true);
