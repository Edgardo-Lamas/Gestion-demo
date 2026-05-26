-- ============================================================
-- PEDIDOS A PROVEEDORES
-- Studio Lamas · Mayo 2026
-- ============================================================

CREATE TABLE IF NOT EXISTS pedidos_proveedor (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor    TEXT    NOT NULL,
  estado       TEXT    NOT NULL DEFAULT 'borrador'
               CHECK (estado IN ('borrador', 'enviado', 'recibido')),
  observaciones TEXT   DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos_proveedor_items (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       UUID    NOT NULL REFERENCES pedidos_proveedor(id) ON DELETE CASCADE,
  producto_id     UUID    REFERENCES productos(id),
  producto_nombre TEXT    NOT NULL,
  cantidad_final  NUMERIC NOT NULL DEFAULT 0,
  costo_unitario  NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pedidos_proveedor       DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_proveedor_items DISABLE ROW LEVEL SECURITY;
