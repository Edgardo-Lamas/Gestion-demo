-- ============================================================
-- GASTOS DEMO — AGIAPURR Mayo 2026
-- Gastos operativos realistas para probar el agente Agi
--
-- Ejecutar en: Supabase → SQL Editor → Run
-- ============================================================

INSERT INTO public.gastos (fecha, descripcion, categoria, monto)
VALUES
  -- Semana 1
  (CURRENT_DATE - 22, 'Combustible reparto — recorrido Posadas zona norte',   'combustible',   18500),
  (CURRENT_DATE - 21, 'Materiales de empaque — cajas y cinta',                'materiales',    12000),

  -- Semana 2
  (CURRENT_DATE - 19, 'Combustible reparto — zona Oberá',                     'combustible',   22000),
  (CURRENT_DATE - 18, 'Servicio teléfono + internet Gladys (mayo)',            'servicios',      8500),
  (CURRENT_DATE - 17, 'Publicidad Instagram — promoción yerbas orgánicas',     'marketing',      5000),

  -- Semana 3
  (CURRENT_DATE - 15, 'Combustible reparto — zona Apóstoles',                 'combustible',   25000),
  (CURRENT_DATE - 14, 'Mantenimiento vehículo — revisión aceite y filtros',    'vehiculo',      15000),
  (CURRENT_DATE - 13, 'Materiales de empaque — bolsas y etiquetas',            'materiales',     9500),

  -- Semana 4
  (CURRENT_DATE - 12, 'Combustible reparto — Posadas zona sur',               'combustible',   19000),
  (CURRENT_DATE -  8, 'Bolsas isotérmicas para lácteos Granja Suiza',         'materiales',    11000),
  (CURRENT_DATE -  7, 'Publicidad Instagram — temporada invierno mate caliente', 'marketing',   7500),

  -- Esta semana
  (CURRENT_DATE -  3, 'Combustible reparto',                                  'combustible',   17000),
  (CURRENT_DATE -  2, 'Alquiler depósito (mayo)',                              'alquiler',      45000),
  (CURRENT_DATE -  1, 'Materiales varios — descarte y reposición',            'materiales',     6000);

-- Verificación
SELECT
  categoria,
  COUNT(*) AS operaciones,
  SUM(monto) AS total
FROM gastos
GROUP BY categoria
ORDER BY total DESC;
