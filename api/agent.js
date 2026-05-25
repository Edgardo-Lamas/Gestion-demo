import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const SYSTEM_PROMPT = `Sos "Agi", el asistente de gestión de AGIAPURR Distribuidora — una distribuidora de yerba mate orgánica y productos naturales de Misiones, Argentina.

Ayudás a Gladis y al equipo a entender el negocio y ejecutar acciones sobre el sistema.

CAPACIDADES:
1. ANÁLISIS: consultás ventas, stock, compras, gastos, clientes y generás resúmenes
2. ACCIONES: verificás alertas de stock bajo y generás el resumen diario

REGLAS:
- Respondé siempre en español rioplatense (vos, ustedes)
- Usá formato argentino de números: puntos para miles, comas para decimales (ej: $1.234,56)
- Sé conciso y directo — Gladis está trabajando, no tiene tiempo
- Si necesitás datos para responder, usá las herramientas antes de contestar
- Cuando hay múltiples datos, usá listas cortas
- Los montos siempre con signo $`;

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
        dias: {
          type: 'number',
          description: 'Cuántos días hacia atrás consultar (default: 7)'
        }
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
    description: 'Obtiene la lista de clientes activos del sistema',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'verificar_stock_bajo',
    description: 'Retorna los productos cuyo stock está por debajo del umbral indicado',
    input_schema: {
      type: 'object',
      properties: {
        umbral: {
          type: 'number',
          description: 'Stock mínimo en unidades (default: 10)'
        }
      }
    }
  },
  {
    name: 'resumen_diario',
    description: 'Genera un resumen completo de la actividad del día: ventas, gastos, ganancia y alertas de stock',
    input_schema: { type: 'object', properties: {} }
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
        supabase.from('productos').select('id, nombre, unidad, precio_catalogo, margen').order('nombre'),
        supabase.from('compras').select('producto_id, cantidad_disponible')
      ]);
      const stock = calcularStock(compras);
      return productos?.map(p => ({
        nombre: p.nombre,
        unidad: p.unidad,
        precio_catalogo: p.precio_catalogo,
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
        cantidad: v.cantidad,
        precio_unitario: v.precio_unitario,
        total: v.total,
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
        cantidad_total: c.cantidad_total,
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
        .select('nombre, telefono, email, created_at')
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
        supabase.from('ventas').select('total, ganancia, cantidad').gte('fecha', today),
        supabase.from('gastos').select('monto, descripcion, categoria').gte('fecha', today),
        supabase.from('productos').select('id, nombre, unidad'),
        supabase.from('compras').select('producto_id, cantidad_disponible')
      ]);

      const stock = calcularStock(compras);
      const totalVentas = ventasHoy?.reduce((s, v) => s + (Number(v.total) || 0), 0) ?? 0;
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
        max_tokens: 1024,
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
