import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? (process.env.SUPABASE_URL || 'https://gnrzfzzrdwwvusyvcudw.supabase.co')
    : 'https://gnrzfzzrdwwvusyvcudw.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImducnpmenpyZHd3dnVzeXZjdWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzMwODcsImV4cCI6MjA5NTI0OTA4N30.ue7RbMWRFqv4LC5WBpt5O0p3ZIkODUsBaZyTaPU33nY';
  return createClient(url, key);
}

const SYSTEM_PROMPT = `Sos "Agi", el asesor comercial y estratégico de AGIAPURR Distribuidora — una distribuidora especializada en yerba mate artesanal, orgánica y natural de Misiones, Argentina. También distribuyen conservas y lácteos selectos.

Gladys y Alonso son dueños del negocio — Gladys es segunda generación en el rubro. Cuando preguntan algo técnico del rubro, responden con la profundidad que merecen. No explicar lo obvio ni dar clases de lo que ellos ya saben.

════════════════════════════════════════
CONOCIMIENTO DEL PRODUCTO CORE: YERBA MATE
════════════════════════════════════════

TIPOS Y CARACTERÍSTICAS:
• Con palo: incluye ramitas del arbusto. Sabor suave y dulce, amargor moderado, color claro. La más consumida en Argentina (~70% del mercado). Cura bien el mate, dura más la cebada. Marcas del catálogo: El Colono, Flor de Jardín, Las Tunas, Titrayju, Picada Vieja.
• Sin palo (despalada): solo la hoja. Sabor intenso y amargo, corte fino, se cierra más rápido. Preferida en Uruguay y por materos intensos. AGIAPURR no la distribuye actualmente — potencial nicho urbano.
• Orgánica certificada: sin agroquímicos, certificación SENASA u organismos internacionales reconocidos. Segmento en crecimiento +15% anual. Precio premium justificado por trazabilidad y certificación. Marcas del catálogo: Tucanguá, Taihang.
• Agroecológica: prácticas naturales sin certificación formal. Puente entre convencional y orgánica. Precio intermedio, muy bien posicionada en el discurso de "lo natural sin el precio del orgánico". Marca del catálogo: Chamarra.
• Con hierbas (compuesta): blends con menta, boldo, cedrón, peperina. Nicho fiel y creciente. AGIAPURR no la distribuye — oportunidad a evaluar.

PARÁMETROS DE CALIDAD:
• Humedad óptima: 3-5%. Más seca = polvo y amarga; más húmeda = se apelotona y se congela en invierno.
• Color: verde amarillento brillante = fresca y bien procesada. Marrón/opaco = vieja o mal almacenada.
• Granulometría: corte grueso = sabor suave, dura más la cebada. Corte fino = más intenso, se cierra rápido.
• Curado del mate: con yerba con palo el proceso es más gradual y amigable para el mate nuevo.
• Almacenamiento en depósito: lugar fresco, seco, alejado de olores fuertes (jabón, combustible). No apilar más de 10-12 bultos. La yerba "respira" y absorbe olores.

ORIGEN Y GEOGRAFÍA:
• Misiones produce ~90% de la yerba argentina. Zonas clave: Apóstoles (capital nacional de la yerba), Oberá, Jardín América, Eldorado, San Ignacio.
• Corrientes produce ~10%, generalmente más liviana y suave.
• Las marcas pequeñas/artesanales de Misiones tienen historia trazable y diferenciación real frente a las industriales (Taragüi, Amanda, Cruz de Malta). Eso es un argumento de venta concreto.
• La producción artesanal implica lotes más pequeños → stock limitado → urgencia para el comprador fidelizado.

ESTACIONALIDAD — CRÍTICA PARA EL NEGOCIO:
• Temporada alta: mayo a agosto. Pico máximo junio-julio. Demanda sube 30-40% respecto al promedio anual.
• Temporada baja: diciembre a febrero. Cae el mate caliente. Sube el tereré (mate frío con jugo cítrico), popular en NEA.
• Pico secundario: Semana Santa, vacaciones de julio (familia en casa = más mate).
• Estrategia de compra: abastecerse fuerte en marzo-abril antes del invierno. El que llega a junio sin stock pierde clientes.
• Verano: rotar hacia conservas (Flor de Jardín) y dulce de leche (Granja Suiza) para sostener facturación.

════════════════════════════════════════
CATÁLOGO AGIAPURR — CONOCIMIENTO DETALLADO
════════════════════════════════════════

YERBAS — LÍNEA TRADICIONAL (con palo):
• El Colono 500g / 1kg — Marca histórica misionera, excelente relación precio-calidad. Canal fuerte: almacenes, autoservicios, maxikioscos. Margen ~25%. Cliente tipo: comprador habitual de precio accesible.
• Flor de Jardín 500g / 1kg — Marca regional reconocida en NEA. Sinergia natural con su línea de conservas (mismo nombre → crosselling). Margen ~25%.
• Las Tunas con Palo 1kg — Solo formato 1kg. Más orientada a canal mayorista y distribuidores secundarios. Margen ~25%.
• Titrayju 500g — Presentación chica. Buena rotación en kioscos y almacenes de barrio. Margen ~25%.
• Picada Vieja 500g — Tradicional, formato 500g. Margen ~25%.

YERBAS — LÍNEA PREMIUM (orgánica/agroecológica):
• Chamarra Agroecológica 500g / 1kg — Producción con prácticas naturales. Precio intermedio entre convencional y orgánica. Ideal para consumidor que quiere "lo natural" sin pagar orgánico certificado. Margen ~28%. Canal: dietéticas, ferias de productores, tiendas naturistas, consumidor consciente.
• Tucanguá Orgánica 1kg — Certificada orgánica. Precio premium. Menor volumen, mejor margen. Canal: dietéticas, mercados orgánicos, consumidor health-conscious urbano. Margen ~30%.
• Taihang Orgánica 500g — Orgánica certificada en formato 500g. Más accesible en precio de entrada que Tucanguá 1kg. Margen ~30%. Perfil similar a Tucanguá.

CONSERVAS (Flor de Jardín):
• Pepinillos Agridulces 660g — Margen ~35%. Canal: almacenes, dietéticas, restaurants, casas de delicatessen.
• Chucrut 660g — Margen ~35%. Producto nicho pero fiel. Creció con la tendencia fermentados/probióticos.
• Chimichurri 200g — Margen ~35%. Alta rotación en verano/asado. Argumento de venta: artesanal misionero vs. industriales.
→ Las conservas tienen el mayor margen del catálogo (~35%) y son ideales para completar pedidos y subir ticket.

LÁCTEOS (Granja Suiza):
• Dulce de Leche 450g — Margen ~30%. Rotación constante. Temporada alta: verano/fiestas.
• Queso Crema 250g — Margen ~30%. Canal: almacenes, dietéticas, supermercados.
→ Son productos de alta frecuencia de compra — anclan la visita del cliente y facilitan el pedido de yerba al mismo tiempo.

════════════════════════════════════════
SEGMENTOS, CANALES Y ESTRATEGIA
════════════════════════════════════════

MINORISTAS (almacenes, kioscos, maxikioscos, drugstores):
- Alta frecuencia, volumen bajo-medio. Formato 500g domina.
- Valoran: precio competitivo, entrega puntual, atención personal.
- Oportunidad de fidelización alta. Son la base de la pirámide.
- Argumento: "tu cliente no cambia de yerba si vos no cambiás de proveedor".

DIETÉTICAS Y TIENDAS NATURISTAS:
- Canal natural para Chamarra, Tucanguá, Taihang y conservas Flor de Jardín.
- Valoran: historia del producto, trazabilidad, diferenciación de lo industrial.
- Compran con criterio. Si convencés al dueño, fidelizás por años.
- Contenido que funciona con ellos: origen de la yerba, proceso agroecológico, productores detrás de la marca.

MAYORISTAS Y DISTRIBUIDORES SECUNDARIOS:
- Volumen alto, margen fino. Generan caja y cashflow.
- Valoran: precio, consistencia de stock, cumplimiento.
- No requieren tanto conocimiento del producto — requieren confiabilidad operativa.

SUPERMERCADOS E HIPERMERCADOS:
- Condiciones más formales: remito, factura, plazos de pago (15-30 días).
- Piso de precio más bajo pero volumen importante.
- Puerta de entrada para marcas nuevas si hay reputación de proveedor.

GASTRONOMÍA (canal a desarrollar):
- Restaurantes y parrillas: consumen chimichurri y pepinillos Flor de Jardín.
- Bares y cafés que ofrecen mate o tereré: pueden convertirse en clientes estables.
- Requiere visita comercial dedicada — no llegan solos.

════════════════════════════════════════
NICHOS Y OPORTUNIDADES DE MERCADO (Misiones 2026)
════════════════════════════════════════

POR ZONA:
• Posadas capital: mayor poder adquisitivo, más dietéticas, más receptiva a orgánicos y premium. Prioridad para Chamarra, Tucanguá, Taihang.
• Oberá: zona yerbatera tradicional, consumo fuerte, competencia también fuerte. Diferenciarse por precio y frescura.
• Eldorado, Puerto Iguazú: menor cobertura de distribuidoras artesanales regionales — oportunidad de entrada.
• Interior (Apóstoles, San Ignacio): fidelidad a marcas locales, pero receptivos si el precio y la relación son buenos.
• Encarnación (Paraguay): frontera activa, alto consumo de mate — oportunidad exportación informal.

POR TENDENCIA:
• Orgánico/agroecológico: creciendo sostenidamente. Consumidor urbano de 25-45 años, nivel educativo medio-alto.
• Tereré: gana popularidad fuera del NEA. Posible pack especial con yerba fina + hierbas.
• "Mate consciente": origen trazable, pequeños productores, historia detrás de la marca. Funciona en redes sociales.
• Inflación: el mate es el último hábito en caer. El consumidor baja volumen o busca 500g en vez de 1kg, pero no deja el mate.
• Fermentados: el chucrut Flor de Jardín se beneficia del auge de probióticos/salud intestinal.

════════════════════════════════════════
CAPACIDADES DE AGI
════════════════════════════════════════

1. ANÁLISIS DE DATOS: consultás ventas, stock, compras, gastos, clientes y pedidos en tiempo real
2. RANKING Y TENDENCIAS: productos más vendidos, clientes más activos, períodos comparados
3. ALERTAS: stock bajo, clientes inactivos, productos sin movimiento
4. ESTRATEGIA COMERCIAL: identificás oportunidades por producto, zona, temporada, cliente
5. MARKETING Y CONTENIDO: generás ideas de post para Instagram/Facebook, textos para WhatsApp comercial, argumentos de venta por segmento
6. TEMPORADA: alertás qué hay que hacer hoy en función del momento del año

════════════════════════════════════════
REGLAS
════════════════════════════════════════
- Respondé siempre en español rioplatense (vos, ustedes)
- Formato argentino: $1.234,56 (punto = miles, coma = decimales)
- Si la pregunta es de datos del negocio → usá herramientas primero, luego respondé
- Si la pregunta es de conocimiento del rubro → respondé directo con autoridad
- Gladys y Alonso saben del rubro — no explicar lo básico, ir al punto
- Señalá oportunidades con → OPORTUNIDAD
- Señalá riesgos o urgencias con → ATENCIÓN
- Respuestas en listas cuando hay múltiples puntos. Nunca párrafos largos innecesarios.
- Los montos siempre con $`;

const tools = [
  {
    name: 'consultar_productos',
    description: 'Obtiene todos los productos con su stock actual calculado',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'consultar_ventas',
    description: 'Obtiene ventas recientes con detalle de productos y clientes',
    input_schema: {
      type: 'object',
      properties: {
        dias: { type: 'number', description: 'Cuántos días hacia atrás consultar (default: 7)' }
      }
    }
  },
  {
    name: 'consultar_compras',
    description: 'Obtiene las últimas compras/ingresos de mercadería',
    input_schema: {
      type: 'object',
      properties: {
        dias: { type: 'number', description: 'Días hacia atrás (default: 30)' }
      }
    }
  },
  {
    name: 'consultar_gastos',
    description: 'Obtiene los gastos operativos por período',
    input_schema: {
      type: 'object',
      properties: {
        dias: { type: 'number', description: 'Días hacia atrás (default: 7)' }
      }
    }
  },
  {
    name: 'consultar_clientes',
    description: 'Obtiene la lista de clientes activos con categoría y datos de contacto',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'verificar_stock_bajo',
    description: 'Retorna los productos cuyo stock está por debajo del umbral indicado',
    input_schema: {
      type: 'object',
      properties: {
        umbral: { type: 'number', description: 'Stock mínimo en unidades (default: 10)' }
      }
    }
  },
  {
    name: 'resumen_diario',
    description: 'Genera un resumen completo de la actividad del día: ventas, gastos, ganancia y alertas',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'productos_mas_vendidos',
    description: 'Ranking de productos por volumen de ventas, ingresos y ganancia en un período',
    input_schema: {
      type: 'object',
      properties: {
        dias: { type: 'number', description: 'Período en días (default: 30)' }
      }
    }
  },
  {
    name: 'ventas_por_cliente',
    description: 'Desglose de ventas agrupadas por cliente en un período — para identificar los clientes más activos',
    input_schema: {
      type: 'object',
      properties: {
        dias: { type: 'number', description: 'Período en días (default: 30)' }
      }
    }
  },
  {
    name: 'clientes_inactivos',
    description: 'Lista clientes que no han realizado pedidos en los últimos X días — para reactivación comercial',
    input_schema: {
      type: 'object',
      properties: {
        dias: { type: 'number', description: 'Días sin actividad para considerar inactivo (default: 15)' }
      }
    }
  }
];

function calcularStock(compras) {
  const stock = {};
  compras?.forEach(c => {
    if (!stock[c.producto_id]) stock[c.producto_id] = 0;
    stock[c.producto_id] += Number(c.cantidad_disponible) || 0;
  });
  return stock;
}

function fechaDesde(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().split('T')[0];
}

async function executeTool(name, input, supabase) {
  const today = new Date().toISOString().split('T')[0];

  switch (name) {
    case 'consultar_productos': {
      const [{ data: productos }, { data: compras }] = await Promise.all([
        supabase.from('productos').select('id, nombre, unidad, precio_catalogo, margen_ganancia, costo_referencia').order('nombre'),
        supabase.from('compras').select('producto_id, cantidad_disponible')
      ]);
      const stock = calcularStock(compras);
      return productos?.map(p => ({
        nombre: p.nombre,
        unidad: p.unidad,
        precio_catalogo: p.precio_catalogo,
        costo_referencia: p.costo_referencia,
        margen: p.margen_ganancia,
        stock_actual: stock[p.id] || 0
      })) ?? [];
    }

    case 'consultar_ventas': {
      const dias = input.dias || 7;
      const [{ data: ventas }, { data: productos }, { data: clientes }] = await Promise.all([
        supabase.from('ventas').select('*').gte('fecha', fechaDesde(dias)).order('fecha', { ascending: false }),
        supabase.from('productos').select('id, nombre'),
        supabase.from('clientes').select('id, nombre')
      ]);
      const prodMap = Object.fromEntries(productos?.map(p => [p.id, p.nombre]) ?? []);
      const cliMap = Object.fromEntries(clientes?.map(c => [c.id, c.nombre]) ?? []);
      return ventas?.map(v => ({
        fecha: v.fecha,
        producto: prodMap[v.producto_id] || v.producto_id,
        cliente: v.cliente_id ? cliMap[v.cliente_id] : 'Mostrador',
        cantidad: v.cantidad_vendida,
        precio_unitario: v.precio_venta_unitario,
        total: v.ingreso_total,
        ganancia: v.ganancia
      })) ?? [];
    }

    case 'consultar_compras': {
      const dias = input.dias || 30;
      const [{ data: compras }, { data: productos }] = await Promise.all([
        supabase.from('compras').select('*').gte('fecha', fechaDesde(dias)).order('fecha', { ascending: false }),
        supabase.from('productos').select('id, nombre')
      ]);
      const prodMap = Object.fromEntries(productos?.map(p => [p.id, p.nombre]) ?? []);
      return compras?.map(c => ({
        fecha: c.fecha,
        producto: prodMap[c.producto_id] || c.producto_id,
        cantidad_total: c.cantidad_kg,
        cantidad_disponible: c.cantidad_disponible,
        costo_unitario: c.costo_unitario
      })) ?? [];
    }

    case 'consultar_gastos': {
      const dias = input.dias || 7;
      const { data: gastos } = await supabase
        .from('gastos')
        .select('*')
        .gte('fecha', fechaDesde(dias))
        .order('fecha', { ascending: false });
      return gastos?.map(g => ({
        fecha: g.fecha,
        descripcion: g.descripcion,
        categoria: g.categoria,
        monto: g.monto
      })) ?? [];
    }

    case 'consultar_clientes': {
      const { data: clientes } = await supabase
        .from('clientes')
        .select('nombre, telefono, email, direccion, categoria, notas, fecha_alta')
        .order('nombre');
      return clientes ?? [];
    }

    case 'verificar_stock_bajo': {
      const umbral = input.umbral || 10;
      const [{ data: productos }, { data: compras }] = await Promise.all([
        supabase.from('productos').select('id, nombre, unidad'),
        supabase.from('compras').select('producto_id, cantidad_disponible')
      ]);
      const stock = calcularStock(compras);
      return productos
        ?.filter(p => (stock[p.id] || 0) < umbral)
        .map(p => ({ nombre: p.nombre, unidad: p.unidad, stock_actual: stock[p.id] || 0, umbral }))
        ?? [];
    }

    case 'resumen_diario': {
      const [
        { data: ventasHoy },
        { data: gastosHoy },
        { data: productos },
        { data: compras }
      ] = await Promise.all([
        supabase.from('ventas').select('ingreso_total, ganancia, cantidad_vendida').gte('fecha', today),
        supabase.from('gastos').select('monto, descripcion, categoria').gte('fecha', today),
        supabase.from('productos').select('id, nombre, unidad'),
        supabase.from('compras').select('producto_id, cantidad_disponible')
      ]);

      const stock = calcularStock(compras);
      const totalVentas = ventasHoy?.reduce((s, v) => s + (Number(v.ingreso_total) || 0), 0) ?? 0;
      const totalGanancia = ventasHoy?.reduce((s, v) => s + (Number(v.ganancia) || 0), 0) ?? 0;
      const totalGastos = gastosHoy?.reduce((s, g) => s + (Number(g.monto) || 0), 0) ?? 0;
      const stockBajo = productos?.filter(p => (stock[p.id] || 0) < 10)
        .map(p => ({ nombre: p.nombre, stock: stock[p.id] || 0 })) ?? [];

      return {
        fecha: today,
        ventas: { cantidad_operaciones: ventasHoy?.length ?? 0, total: totalVentas, ganancia: totalGanancia },
        gastos: { cantidad: gastosHoy?.length ?? 0, total: totalGastos },
        balance_dia: totalVentas - totalGastos,
        alertas_stock_bajo: stockBajo
      };
    }

    case 'productos_mas_vendidos': {
      const dias = input.dias || 30;
      const [{ data: ventas }, { data: productos }] = await Promise.all([
        supabase.from('ventas').select('producto_id, cantidad_vendida, ingreso_total, ganancia').gte('fecha', fechaDesde(dias)),
        supabase.from('productos').select('id, nombre, unidad, margen_ganancia')
      ]);
      const prodMap = Object.fromEntries(productos?.map(p => [p.id, p]) ?? []);
      const ranking = {};
      ventas?.forEach(v => {
        if (!ranking[v.producto_id]) {
          ranking[v.producto_id] = { producto: prodMap[v.producto_id]?.nombre || v.producto_id, unidad: prodMap[v.producto_id]?.unidad, cantidad_total: 0, ingreso_total: 0, ganancia_total: 0, operaciones: 0 };
        }
        ranking[v.producto_id].cantidad_total += Number(v.cantidad_vendida) || 0;
        ranking[v.producto_id].ingreso_total += Number(v.ingreso_total) || 0;
        ranking[v.producto_id].ganancia_total += Number(v.ganancia) || 0;
        ranking[v.producto_id].operaciones += 1;
      });
      return Object.values(ranking).sort((a, b) => b.ingreso_total - a.ingreso_total);
    }

    case 'ventas_por_cliente': {
      const dias = input.dias || 30;
      const [{ data: ventas }, { data: clientes }, { data: productos }] = await Promise.all([
        supabase.from('ventas').select('cliente_id, producto_id, cantidad_vendida, ingreso_total, ganancia, fecha').gte('fecha', fechaDesde(dias)),
        supabase.from('clientes').select('id, nombre, categoria, direccion'),
        supabase.from('productos').select('id, nombre')
      ]);
      const cliMap = Object.fromEntries(clientes?.map(c => [c.id, c]) ?? []);
      const prodMap = Object.fromEntries(productos?.map(p => [p.id, p.nombre]) ?? []);
      const resumen = {};
      ventas?.forEach(v => {
        const key = v.cliente_id || 'mostrador';
        if (!resumen[key]) {
          const cli = cliMap[v.cliente_id];
          resumen[key] = { cliente: cli?.nombre || 'Mostrador', categoria: cli?.categoria || '-', direccion: cli?.direccion || '-', total_comprado: 0, ganancia_generada: 0, operaciones: 0, productos: [] };
        }
        resumen[key].total_comprado += Number(v.ingreso_total) || 0;
        resumen[key].ganancia_generada += Number(v.ganancia) || 0;
        resumen[key].operaciones += 1;
        const nombreProd = prodMap[v.producto_id];
        if (nombreProd && !resumen[key].productos.includes(nombreProd)) {
          resumen[key].productos.push(nombreProd);
        }
      });
      return Object.values(resumen).sort((a, b) => b.total_comprado - a.total_comprado);
    }

    case 'clientes_inactivos': {
      const dias = input.dias || 15;
      const corte = fechaDesde(dias);
      const [{ data: clientes }, { data: ventas }, { data: pedidos }] = await Promise.all([
        supabase.from('clientes').select('id, nombre, telefono, categoria, direccion, notas'),
        supabase.from('ventas').select('cliente_id, fecha').gte('fecha', corte),
        supabase.from('pedidos').select('cliente_id, created_at').gte('created_at', corte + 'T00:00:00')
      ]);
      const activos = new Set([
        ...(ventas?.map(v => v.cliente_id) ?? []),
        ...(pedidos?.map(p => p.cliente_id) ?? [])
      ]);
      return clientes
        ?.filter(c => !activos.has(c.id))
        .map(c => ({ nombre: c.nombre, categoria: c.categoria, telefono: c.telefono, direccion: c.direccion, notas: c.notas, dias_sin_actividad: `más de ${dias} días` }))
        ?? [];
    }

    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Se requiere un array de messages' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada' });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const supabase = getSupabase();
  let currentMessages = [...messages];
  const toolsUsed = [];

  try {
    while (true) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools,
        messages: currentMessages
      });

      if (response.stop_reason !== 'tool_use') {
        const text = response.content.find(b => b.type === 'text')?.text ?? '';
        return res.status(200).json({ response: text, toolsUsed: [...new Set(toolsUsed)] });
      }

      const toolResults = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          toolsUsed.push(block.name);
          const result = await executeTool(block.name, block.input, supabase);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
        }
      }

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults }
      ];
    }
  } catch (err) {
    console.error('Agent error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del agente' });
  }
}
