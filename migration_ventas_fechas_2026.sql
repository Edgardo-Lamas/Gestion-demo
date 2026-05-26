-- ============================================================
-- Actualiza las fechas de las ventas demo al mes actual (mayo 2026)
-- Para que el agente Agi pueda consultar "ventas de esta semana/mes"
-- 
-- INSTRUCCIONES:
--   1. Abrir Supabase → SQL Editor
--   2. Copiar y ejecutar este script
-- ============================================================

-- Ver qué fechas hay actualmente (opcional, para diagnosticar)
-- SELECT fecha, COUNT(*) FROM ventas GROUP BY fecha ORDER BY fecha DESC;

-- Actualizar todas las ventas ajustando el año a 2026
-- (preserva mes y día, solo cambia el año)
UPDATE public.ventas
SET fecha = (fecha + (EXTRACT(YEAR FROM CURRENT_DATE)::INT - EXTRACT(YEAR FROM fecha)::INT) * INTERVAL '1 year')::DATE
WHERE EXTRACT(YEAR FROM fecha) < EXTRACT(YEAR FROM CURRENT_DATE);

-- Verificar resultado
SELECT fecha, COUNT(*) as cantidad
FROM ventas
GROUP BY fecha
ORDER BY fecha DESC
LIMIT 20;
