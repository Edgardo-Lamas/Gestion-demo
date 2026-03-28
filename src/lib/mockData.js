// MOCK DATA — Solo para demo local cuando Supabase está inactivo
// Se carga automáticamente en fetchData si Supabase falla

export const mockProductos = [
  { id: 'p1', nombre: 'Asado', margen_ganancia: 35, precio_catalogo: null, oculto_catalogo: false },
  { id: 'p2', nombre: 'Vacío', margen_ganancia: 30, precio_catalogo: null, oculto_catalogo: false },
  { id: 'p3', nombre: 'Costillas', margen_ganancia: 25, precio_catalogo: null, oculto_catalogo: false },
  { id: 'p4', nombre: 'Paleta', margen_ganancia: 28, precio_catalogo: null, oculto_catalogo: false },
  { id: 'p5', nombre: 'Matambre', margen_ganancia: 40, precio_catalogo: null, oculto_catalogo: false },
];

export const mockCompras = [
  { id: 'c1', producto_id: 'p1', cantidad_kg: 150, cantidad_disponible: 120, costo_unitario: 3200, fecha: '2026-03-01', creado_en: 1 },
  { id: 'c2', producto_id: 'p1', cantidad_kg: 80, cantidad_disponible: 60, costo_unitario: 3350, fecha: '2026-03-10', creado_en: 2 },
  { id: 'c3', producto_id: 'p2', cantidad_kg: 100, cantidad_disponible: 85, costo_unitario: 2900, fecha: '2026-03-05', creado_en: 3 },
  { id: 'c4', producto_id: 'p3', cantidad_kg: 90, cantidad_disponible: 70, costo_unitario: 2500, fecha: '2026-03-08', creado_en: 4 },
  { id: 'c5', producto_id: 'p4', cantidad_kg: 60, cantidad_disponible: 55, costo_unitario: 2200, fecha: '2026-03-12', creado_en: 5 },
  { id: 'c6', producto_id: 'p5', cantidad_kg: 40, cantidad_disponible: 38, costo_unitario: 3800, fecha: '2026-03-15', creado_en: 6 },
];

export const mockClientes = [
  { id: 'cl1', nombre: 'Carnicería Don Pedro', telefono: '11-4523-8900', direccion: 'Av. San Martín 1520, CABA', notas: 'Retira los jueves. Prefiere cortes grandes.', categoria: 'carniceria', fecha_alta: '2026-01-10' },
  { id: 'cl2', nombre: 'Restaurante La Parrilla', telefono: '11-3341-2200', direccion: 'Belgrano 780, Palermo', notas: 'Entrega a domicilio. Factura A.', categoria: 'restaurante', fecha_alta: '2026-01-25' },
  { id: 'cl3', nombre: 'Distribuidora Norte', telefono: '11-6678-4400', direccion: 'Ruta 8 Km 12, GBA Norte', notas: 'Mayorista grande. Paga a 30 días.', categoria: 'mayorista', fecha_alta: '2026-02-05' },
  { id: 'cl4', nombre: 'Supermercado Central', telefono: '11-5512-9900', direccion: 'Corrientes 3300, CABA', notas: '', categoria: 'minorista', fecha_alta: '2026-02-18' },
];

export const mockClienteProductos = [
  // Don Pedro — margen personalizado
  { id: 'cp1', cliente_id: 'cl1', producto_id: 'p1', cantidad_kg: 50, margen_personalizado: 30, precio_fijo: null },
  { id: 'cp2', cliente_id: 'cl1', producto_id: 'p3', cantidad_kg: 30, margen_personalizado: 22, precio_fijo: null },
  { id: 'cp3', cliente_id: 'cl1', producto_id: 'p4', cantidad_kg: 20, margen_personalizado: 25, precio_fijo: null },

  // La Parrilla — precio fijo
  { id: 'cp4', cliente_id: 'cl2', producto_id: 'p1', cantidad_kg: 25, margen_personalizado: null, precio_fijo: 4500 },
  { id: 'cp5', cliente_id: 'cl2', producto_id: 'p2', cantidad_kg: 20, margen_personalizado: null, precio_fijo: 4000 },
  { id: 'cp6', cliente_id: 'cl2', producto_id: 'p5', cantidad_kg: 10, margen_personalizado: null, precio_fijo: 5800 },

  // Distribuidora Norte — margen personalizado más bajo por volumen
  { id: 'cp7', cliente_id: 'cl3', producto_id: 'p1', cantidad_kg: 80, margen_personalizado: 18, precio_fijo: null },
  { id: 'cp8', cliente_id: 'cl3', producto_id: 'p2', cantidad_kg: 60, margen_personalizado: 15, precio_fijo: null },
  { id: 'cp9', cliente_id: 'cl3', producto_id: 'p3', cantidad_kg: 40, margen_personalizado: 12, precio_fijo: null },

  // Supermercado Central — precio fijo
  { id: 'cp10', cliente_id: 'cl4', producto_id: 'p2', cantidad_kg: 15, margen_personalizado: null, precio_fijo: 3800 },
  { id: 'cp11', cliente_id: 'cl4', producto_id: 'p5', cantidad_kg: 8, margen_personalizado: null, precio_fijo: 5500 },
];

export const mockVentas = [
  { id: 'v1', producto_id: 'p1', producto_nombre: 'Asado', fecha: '2026-03-05', cantidad_vendida: 30, precio_venta_unitario: 4160, ingreso_total: 124800, costo_calculado: 96000, ganancia: 28800, cliente_id: 'cl1' },
  { id: 'v2', producto_id: 'p3', producto_nombre: 'Costillas', fecha: '2026-03-05', cantidad_vendida: 20, precio_venta_unitario: 3125, ingreso_total: 62500, costo_calculado: 50000, ganancia: 12500, cliente_id: 'cl1' },
  { id: 'v3', producto_id: 'p1', producto_nombre: 'Asado', fecha: '2026-03-10', cantidad_vendida: 25, precio_venta_unitario: 4500, ingreso_total: 112500, costo_calculado: 80000, ganancia: 32500, cliente_id: 'cl2' },
  { id: 'v4', producto_id: 'p2', producto_nombre: 'Vacío', fecha: '2026-03-10', cantidad_vendida: 15, precio_venta_unitario: 4000, ingreso_total: 60000, costo_calculado: 43500, ganancia: 16500, cliente_id: 'cl2' },
  { id: 'v5', producto_id: 'p1', producto_nombre: 'Asado', fecha: '2026-03-15', cantidad_vendida: 60, precio_venta_unitario: 3776, ingreso_total: 226560, costo_calculado: 192000, ganancia: 34560, cliente_id: 'cl3' },
  { id: 'v6', producto_id: 'p2', producto_nombre: 'Vacío', fecha: '2026-03-15', cantidad_vendida: 40, precio_venta_unitario: 3335, ingreso_total: 133400, costo_calculado: 116000, ganancia: 17400, cliente_id: 'cl3' },
  { id: 'v7', producto_id: 'p2', producto_nombre: 'Vacío', fecha: '2026-03-18', cantidad_vendida: 12, precio_venta_unitario: 3800, ingreso_total: 45600, costo_calculado: 34800, ganancia: 10800, cliente_id: 'cl4' },
  { id: 'v8', producto_id: 'p5', producto_nombre: 'Matambre', fecha: '2026-03-20', cantidad_vendida: 2, precio_venta_unitario: 5800, ingreso_total: 11600, costo_calculado: 7600, ganancia: 4000, cliente_id: null },
];

export const mockGastos = [
  { id: 'g1', descripcion: 'Alquiler depósito', monto: 85000, fecha: '2026-03-01', categoria: 'alquiler' },
  { id: 'g2', descripcion: 'Combustible reparto', monto: 22000, fecha: '2026-03-08', categoria: 'combustible' },
  { id: 'g3', descripcion: 'Mantenimiento cámara frigorífica', monto: 35000, fecha: '2026-03-14', categoria: 'mantenimiento' },
  { id: 'g4', descripcion: 'Sueldos empleados', monto: 240000, fecha: '2026-03-20', categoria: 'sueldos' },
];

export const mockDistribuciones = [
  { id: 'd1', producto_id: 'p1', producto_nombre: 'Asado', empleado: 'Carlos', cantidad_kg: 20, costo_unitario: 3200, costo_total: 64000, fecha: '2026-03-18' },
  { id: 'd2', producto_id: 'p3', producto_nombre: 'Costillas', empleado: 'Miguel', cantidad_kg: 15, costo_unitario: 2500, costo_total: 37500, fecha: '2026-03-18' },
];
