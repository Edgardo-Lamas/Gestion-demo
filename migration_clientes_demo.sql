-- ============================================================
-- CLIENTES DEMO — AGIAPURR
-- Clientes mayoristas y minoristas para probar el agente Agi
--
-- Ejecutar en: Supabase → SQL Editor → Run
-- ============================================================

INSERT INTO public.clientes (nombre, telefono, direccion, categoria, notas, fecha_alta, activo)
VALUES
  ('Almacén Don Ramón',         '+54 376 4521890', 'Av. San Martín 450, Posadas',      'mayorista',  'Cliente histórico. Paga puntual. Prefiere El Colono y Flor de Jardín.', CURRENT_DATE - 60, true),
  ('Dietética Naturalmente',    '+54 376 4208734', 'Belgrano 1120, Posadas',            'mayorista',  'Consume orgánicas y agroecológicas. Interesada en Chamarra y Tucanguá.', CURRENT_DATE - 45, true),
  ('Maxikiosco El Central',     '+54 376 4631205', 'San Lorenzo 780, Posadas',          'minorista',  'Alta rotación de 500g. Pide quincenalmente.', CURRENT_DATE - 30, true),
  ('Autoservicio La Familia',   '+54 376 4789023', 'Rivadavia 230, Oberá',              'mayorista',  'Canal Oberá. Le interesan los formatos 1kg para maximizar margen.', CURRENT_DATE - 50, true),
  ('Tienda Verde Misiones',     '+54 376 4902145', 'Córdoba 567, Posadas',              'mayorista',  'Especializada en productos naturales. Buen canal para Granja Suiza y conservas.', CURRENT_DATE - 20, true),
  ('Almacén La Esquina',        '+54 376 4415678', 'Paraguay 890, Apóstoles',           'minorista',  'Cliente nuevo — zona Apóstoles. Pedidos pequeños pero frecuentes.', CURRENT_DATE - 10, true)
ON CONFLICT DO NOTHING;

-- Verificación
SELECT nombre, categoria, telefono, fecha_alta
FROM public.clientes
ORDER BY fecha_alta DESC;
