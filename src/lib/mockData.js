// MOCK DATA — Solo para demo local cuando Supabase está inactivo
// Productos reales de AGIAPURR Distribuidora

export const mockProductos = [
  // El Colono
  { id: 'p1',  nombre: 'El Colono — Yerba Mate 500g',                   margen_ganancia: 25, costo_referencia: 2200, unidad: 'paquete', visible_catalogo: true },
  { id: 'p2',  nombre: 'El Colono — Yerba Mate 1kg',                    margen_ganancia: 25, costo_referencia: 4000, unidad: 'paquete', visible_catalogo: true },
  // Flor de Jardín — Yerba
  { id: 'p3',  nombre: 'Flor de Jardín — Yerba Mate 500g',              margen_ganancia: 25, costo_referencia: 2400, unidad: 'paquete', visible_catalogo: true },
  { id: 'p4',  nombre: 'Flor de Jardín — Yerba Mate 1kg',               margen_ganancia: 25, costo_referencia: 4300, unidad: 'paquete', visible_catalogo: true },
  // Flor de Jardín — Conservas
  { id: 'p5',  nombre: 'Flor de Jardín — Pepinillos Agridulces 660g',   margen_ganancia: 35, costo_referencia: 3200, unidad: 'unidad',  visible_catalogo: true },
  { id: 'p6',  nombre: 'Flor de Jardín — Chucrut 660g',                 margen_ganancia: 35, costo_referencia: 3000, unidad: 'unidad',  visible_catalogo: true },
  { id: 'p7',  nombre: 'Flor de Jardín — Chimichurri 200g',             margen_ganancia: 35, costo_referencia: 1800, unidad: 'unidad',  visible_catalogo: true },
  // Tucanguá
  { id: 'p8',  nombre: 'Tucanguá — Yerba Mate Orgánica 1kg',            margen_ganancia: 30, costo_referencia: 5200, unidad: 'paquete', visible_catalogo: true },
  // Las Tunas
  { id: 'p9',  nombre: 'Las Tunas — Yerba Mate con Palo 1kg',           margen_ganancia: 25, costo_referencia: 3900, unidad: 'paquete', visible_catalogo: true },
  // Titrayju
  { id: 'p10', nombre: 'Titrayju — Yerba Mate 500g',                    margen_ganancia: 25, costo_referencia: 2600, unidad: 'paquete', visible_catalogo: true },
  // Chamarra
  { id: 'p11', nombre: 'Chamarra — Yerba Mate Agroecológica 500g',      margen_ganancia: 28, costo_referencia: 2900, unidad: 'paquete', visible_catalogo: true },
  { id: 'p12', nombre: 'Chamarra — Yerba Mate Agroecológica 1kg',       margen_ganancia: 28, costo_referencia: 5400, unidad: 'paquete', visible_catalogo: true },
  // Picada Vieja
  { id: 'p13', nombre: 'Picada Vieja — Yerba Mate 500g',                margen_ganancia: 25, costo_referencia: 2200, unidad: 'paquete', visible_catalogo: true },
  // Taihang
  { id: 'p14', nombre: 'Taihang — Yerba Mate Orgánica 500g',            margen_ganancia: 30, costo_referencia: 4500, unidad: 'paquete', visible_catalogo: true },
  // Granja Suiza
  { id: 'p15', nombre: 'Granja Suiza — Dulce de Leche 450g',            margen_ganancia: 30, costo_referencia: 3500, unidad: 'unidad',  visible_catalogo: true },
  { id: 'p16', nombre: 'Granja Suiza — Queso Crema 250g',               margen_ganancia: 30, costo_referencia: 2800, unidad: 'unidad',  visible_catalogo: true },
];

export const mockCompras = [
  { id: 'c1',  producto_id: 'p1',  cantidad_kg: 100, cantidad_disponible: 80,  costo_unitario: 2200, fecha: '2026-05-01', creado_en: 1 },
  { id: 'c2',  producto_id: 'p2',  cantidad_kg: 60,  cantidad_disponible: 50,  costo_unitario: 4000, fecha: '2026-05-01', creado_en: 2 },
  { id: 'c3',  producto_id: 'p8',  cantidad_kg: 40,  cantidad_disponible: 35,  costo_unitario: 5200, fecha: '2026-05-03', creado_en: 3 },
  { id: 'c4',  producto_id: 'p9',  cantidad_kg: 50,  cantidad_disponible: 45,  costo_unitario: 3900, fecha: '2026-05-03', creado_en: 4 },
  { id: 'c5',  producto_id: 'p4',  cantidad_kg: 80,  cantidad_disponible: 70,  costo_unitario: 4300, fecha: '2026-05-05', creado_en: 5 },
  { id: 'c6',  producto_id: 'p14', cantidad_kg: 30,  cantidad_disponible: 28,  costo_unitario: 4500, fecha: '2026-05-05', creado_en: 6 },
  { id: 'c7',  producto_id: 'p5',  cantidad_kg: 24,  cantidad_disponible: 20,  costo_unitario: 3200, fecha: '2026-05-08', creado_en: 7 },
  { id: 'c8',  producto_id: 'p15', cantidad_kg: 36,  cantidad_disponible: 30,  costo_unitario: 3500, fecha: '2026-05-08', creado_en: 8 },
];

export const mockClientes = [
  { id: 'cl1', nombre: 'Almacén Don Ramón',        telefono: '376-4501234', direccion: 'Av. San Martín 450, Posadas',         notas: 'Retira los lunes y jueves. Paga efectivo.', categoria: 'minorista',    fecha_alta: '2026-02-10' },
  { id: 'cl2', nombre: 'Dietética Vida Natural',   telefono: '376-4523300', direccion: 'Colón 1280, Posadas',                 notas: 'Prefiere orgánicos. Pide factura.',          categoria: 'minorista',    fecha_alta: '2026-02-20' },
  { id: 'cl3', nombre: 'Distribuidora Nordeste',   telefono: '376-4478800', direccion: 'Ruta 12 Km 8, Garupá',               notas: 'Mayorista grande. Paga a 15 días.',          categoria: 'mayorista',    fecha_alta: '2026-03-01' },
  { id: 'cl4', nombre: 'Supermercado El Progreso', telefono: '376-4412200', direccion: 'Mitre 890, Oberá',                   notas: 'Entrega los miércoles. Precio fijo.',        categoria: 'supermercado', fecha_alta: '2026-03-15' },
  { id: 'cl5', nombre: 'Kiosco La Esquina',        telefono: '376-4495500', direccion: 'Corrientes 340, Posadas',            notas: 'Pide poco pero frecuente.',                 categoria: 'minorista',    fecha_alta: '2026-04-01' },
];

export const mockClienteProductos = [
  // Don Ramón — margen personalizado bajo por volumen
  { id: 'cp1', cliente_id: 'cl1', producto_id: 'p1',  cantidad_kg: 20, margen_personalizado: 20, precio_fijo: null },
  { id: 'cp2', cliente_id: 'cl1', producto_id: 'p2',  cantidad_kg: 10, margen_personalizado: 20, precio_fijo: null },
  { id: 'cp3', cliente_id: 'cl1', producto_id: 'p15', cantidad_kg: 12, margen_personalizado: 25, precio_fijo: null },

  // Dietética — precio fijo en orgánicos
  { id: 'cp4', cliente_id: 'cl2', producto_id: 'p8',  cantidad_kg: 15, margen_personalizado: null, precio_fijo: 7200 },
  { id: 'cp5', cliente_id: 'cl2', producto_id: 'p14', cantidad_kg: 10, margen_personalizado: null, precio_fijo: 6200 },
  { id: 'cp6', cliente_id: 'cl2', producto_id: 'p5',  cantidad_kg: 8,  margen_personalizado: null, precio_fijo: 4500 },

  // Distribuidora Nordeste — margen muy bajo, gran volumen
  { id: 'cp7', cliente_id: 'cl3', producto_id: 'p2',  cantidad_kg: 40, margen_personalizado: 15, precio_fijo: null },
  { id: 'cp8', cliente_id: 'cl3', producto_id: 'p4',  cantidad_kg: 30, margen_personalizado: 15, precio_fijo: null },
  { id: 'cp9', cliente_id: 'cl3', producto_id: 'p9',  cantidad_kg: 25, margen_personalizado: 15, precio_fijo: null },

  // Supermercado El Progreso — precio fijo
  { id: 'cp10', cliente_id: 'cl4', producto_id: 'p4',  cantidad_kg: 20, margen_personalizado: null, precio_fijo: 5800 },
  { id: 'cp11', cliente_id: 'cl4', producto_id: 'p9',  cantidad_kg: 15, margen_personalizado: null, precio_fijo: 5200 },
  { id: 'cp12', cliente_id: 'cl4', producto_id: 'p15', cantidad_kg: 12, margen_personalizado: null, precio_fijo: 4800 },
];

export const mockVentas = [
  { id: 'v1', producto_id: 'p2',  producto_nombre: 'El Colono — Yerba Mate 1kg',          fecha: '2026-05-05', cantidad_vendida: 20, precio_venta_unitario: 5000, ingreso_total: 100000, costo_calculado: 80000,  ganancia: 20000, cliente_id: 'cl3' },
  { id: 'v2', producto_id: 'p4',  producto_nombre: 'Flor de Jardín — Yerba Mate 1kg',      fecha: '2026-05-05', cantidad_vendida: 18, precio_venta_unitario: 5375, ingreso_total: 96750,  costo_calculado: 77400,  ganancia: 19350, cliente_id: 'cl3' },
  { id: 'v3', producto_id: 'p8',  producto_nombre: 'Tucanguá — Yerba Mate Orgánica 1kg',   fecha: '2026-05-08', cantidad_vendida: 10, precio_venta_unitario: 7200, ingreso_total: 72000,  costo_calculado: 52000,  ganancia: 20000, cliente_id: 'cl2' },
  { id: 'v4', producto_id: 'p14', producto_nombre: 'Taihang — Yerba Mate Orgánica 500g',   fecha: '2026-05-08', cantidad_vendida: 8,  precio_venta_unitario: 6200, ingreso_total: 49600,  costo_calculado: 36000,  ganancia: 13600, cliente_id: 'cl2' },
  { id: 'v5', producto_id: 'p1',  producto_nombre: 'El Colono — Yerba Mate 500g',          fecha: '2026-05-12', cantidad_vendida: 15, precio_venta_unitario: 2750, ingreso_total: 41250,  costo_calculado: 33000,  ganancia: 8250,  cliente_id: 'cl1' },
  { id: 'v6', producto_id: 'p15', producto_nombre: 'Granja Suiza — Dulce de Leche 450g',   fecha: '2026-05-12', cantidad_vendida: 12, precio_venta_unitario: 4800, ingreso_total: 57600,  costo_calculado: 42000,  ganancia: 15600, cliente_id: 'cl1' },
  { id: 'v7', producto_id: 'p4',  producto_nombre: 'Flor de Jardín — Yerba Mate 1kg',      fecha: '2026-05-15', cantidad_vendida: 20, precio_venta_unitario: 5800, ingreso_total: 116000, costo_calculado: 86000,  ganancia: 30000, cliente_id: 'cl4' },
  { id: 'v8', producto_id: 'p9',  producto_nombre: 'Las Tunas — Yerba Mate con Palo 1kg',  fecha: '2026-05-15', cantidad_vendida: 15, precio_venta_unitario: 5200, ingreso_total: 78000,  costo_calculado: 58500,  ganancia: 19500, cliente_id: 'cl4' },
];

export const mockGastos = [
  { id: 'g1', descripcion: 'Combustible reparto',        monto: 45000,  fecha: '2026-05-05', categoria: 'combustible' },
  { id: 'g2', descripcion: 'Alquiler depósito',          monto: 120000, fecha: '2026-05-01', categoria: 'alquiler'    },
  { id: 'g3', descripcion: 'Sueldo repartidor',          monto: 280000, fecha: '2026-05-20', categoria: 'sueldos'     },
  { id: 'g4', descripcion: 'Packaging y bolsas',         monto: 18000,  fecha: '2026-05-10', categoria: 'insumos'     },
  { id: 'g5', descripcion: 'Mantenimiento camioneta',    monto: 55000,  fecha: '2026-05-14', categoria: 'mantenimiento' },
];

export const mockDistribuciones = [
  { id: 'd1', producto_id: 'p1', producto_nombre: 'El Colono — Yerba Mate 500g', empleado: 'Repartidor', cantidad_kg: 5, costo_unitario: 2200, costo_total: 11000, fecha: '2026-05-18' },
  { id: 'd2', producto_id: 'p5', producto_nombre: 'Flor de Jardín — Pepinillos Agridulces 660g', empleado: 'Repartidor', cantidad_kg: 3, costo_unitario: 3200, costo_total: 9600, fecha: '2026-05-18' },
];
