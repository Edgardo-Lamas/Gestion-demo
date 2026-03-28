-- =====================================================
-- SCHEMA COMPLETO — Sistema Gestión Sabri
-- Ejecutar en: Supabase → SQL Editor → New query
-- =====================================================

-- 1. PRODUCTOS
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    margen_ganancia NUMERIC DEFAULT 0,
    precio_catalogo NUMERIC,
    oculto_catalogo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. COMPRAS (lotes de stock)
CREATE TABLE IF NOT EXISTS public.compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad_kg NUMERIC NOT NULL,
    cantidad_disponible NUMERIC NOT NULL,
    costo_unitario NUMERIC NOT NULL,
    fecha DATE NOT NULL,
    creado_en BIGINT DEFAULT extract(epoch from now())::BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. VENTAS
CREATE TABLE IF NOT EXISTS public.ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
    producto_nombre TEXT,
    fecha DATE NOT NULL,
    cantidad_vendida NUMERIC NOT NULL,
    precio_venta_unitario NUMERIC NOT NULL,
    ingreso_total NUMERIC NOT NULL,
    costo_calculado NUMERIC NOT NULL,
    ganancia NUMERIC NOT NULL,
    cliente_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. GASTOS
CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    fecha DATE NOT NULL,
    categoria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. DISTRIBUCIONES
CREATE TABLE IF NOT EXISTS public.distribuciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
    producto_nombre TEXT,
    empleado TEXT NOT NULL,
    cantidad_kg NUMERIC NOT NULL,
    costo_unitario NUMERIC NOT NULL,
    costo_total NUMERIC NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CLIENTES
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

-- 7. CLIENTE_PRODUCTOS (productos precargados por cliente)
CREATE TABLE IF NOT EXISTS public.cliente_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad_kg NUMERIC NOT NULL DEFAULT 1,
    margen_personalizado NUMERIC,
    precio_fijo NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FK de ventas → clientes (se agrega después de crear clientes)
ALTER TABLE public.ventas ADD CONSTRAINT ventas_cliente_id_fkey
    FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL
    NOT VALID;

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

-- Políticas: acceso completo (el login de la app controla el acceso)
CREATE POLICY "Acceso total productos" ON public.productos FOR ALL USING (true);
CREATE POLICY "Acceso total compras" ON public.compras FOR ALL USING (true);
CREATE POLICY "Acceso total ventas" ON public.ventas FOR ALL USING (true);
CREATE POLICY "Acceso total gastos" ON public.gastos FOR ALL USING (true);
CREATE POLICY "Acceso total distribuciones" ON public.distribuciones FOR ALL USING (true);
CREATE POLICY "Acceso total clientes" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Acceso total cliente_productos" ON public.cliente_productos FOR ALL USING (true);
