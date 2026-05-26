-- ============================================================
-- CAJA DIARIA — AGIAPURR Gestión
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Una caja por día
CREATE TABLE IF NOT EXISTS cajas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha       DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  monto_inicial DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado      TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Movimientos de cada caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_id     UUID NOT NULL REFERENCES cajas(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  medio_pago  TEXT NOT NULL DEFAULT 'efectivo' CHECK (medio_pago IN ('efectivo', 'transferencia', 'cheque', 'otro')),
  concepto    TEXT NOT NULL,
  monto       DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  descripcion TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sin RLS para demo (igual que el resto de tablas)
ALTER TABLE cajas DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja DISABLE ROW LEVEL SECURITY;
