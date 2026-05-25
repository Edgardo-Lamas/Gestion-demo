# CLAUDE.md — Sistema de Gestión AGIAPURR
**Studio Lamas · Desarrollo Digital**
Última actualización: mayo 2026

---

## 1. Contexto del Proyecto

### Origen
Este proyecto nació del análisis del sistema GDS Sistemas (gdsweb.ar) — un software de gestión POS/ERP para comercios minoristas argentinos. El objetivo es replicar y superar sus capacidades con tecnología moderna, código propio y sin costos de licencia.

### Cliente final
**AGIAPURR Distribuidora**
- Instagram: @agiapurr_distrib
- Rubro: Distribuidora de productos naturales/orgánicos de Misiones (yerba mate principalmente)
- Marcas que distribuye: El Colono, Flor de Jardín, Tucangua, Las Tunas, Granja Suiza, Picada Vieja, Taihang, Chamarra y otros
- Modelo de negocio: Ventas mayoristas + distribuidores + consumidor final + reparto a domicilio
- Equipo: Gladis (administración/recepción de pedidos), equipo de armado, repartidor
- Proceso actual: manual y en papel — pedidos por WhatsApp/teléfono, impresión, armado físico, reparto sin ruta optimizada

### Developer
Edgardo Lamas — Studio Lamas · Desarrollo Digital
- Junior developer (<2 años de experiencia)
- Stack principal: React + Supabase + Vercel
- Sistemas previos: Gestión Sabri (producción) y Gestión Académica U9 (producción)

---

## 2. Estado Actual del Proyecto

### Repositorio
- GitHub: https://github.com/Edgardo-Lamas/Gestion-demo
- Deploy: https://gestion-demo-xi.vercel.app
- Base: clon de Gestión Sabri con nombre genérico "Sistema Demo"

### Infraestructura
- Frontend: React 19 + Vite — desplegado en Vercel
- Base de datos: Supabase (PostgreSQL)
  - URL: https://gnrzfzzrdwwvusyvcudw.supabase.co
  - 10 tablas: productos, compras, ventas, gastos, distribuciones, clientes, cliente_productos, **pedidos, pedido_items, entregas**
- Variables de entorno en Vercel: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
- Auth: deshabilitada temporalmente para demo (acceso libre)
- Deploy: automático desde GitHub main → Vercel

### Sistemas de referencia (misma cuenta GitHub)
| Sistema | URL producción | Descripción |
|---|---|---|
| Gestión Sabri | https://gestion-sabri.vercel.app | Distribuidora de carne — en producción, cliente pendiente ajustes |
| Gestión Académica U9 | https://Edgardo-Lamas.github.io/Coordinaci-n-Acad-mica-U9/ | UP N°9 La Plata — en producción |

---

## 3. Módulos Existentes (heredados de Sabri)

| Módulo | Estado | Descripción |
|---|---|---|
| Dashboard | ✅ Funciona | Gráficos financieros — ingresos, gastos, ganancia, stock valorizado |
| Compras | ✅ Funciona | Ingreso de lotes con costo unitario — base del algoritmo FIFO |
| Ventas | ✅ Funciona | Registro con cálculo automático de ganancia real |
| Gastos | ✅ Funciona | Gastos operativos categorizados |
| Stock/Inventario | ✅ Funciona | Vista de stock con costo promedio ponderado en tiempo real |
| Distribución | ✅ Funciona | Entrega a empleados con trazabilidad (renombrar para AGIAPURR) |
| Clientes | ✅ Funciona | ABM + precios personalizados por producto |
| Productos | ✅ Funciona | Catálogo con margen y precio catálogo |
| Catálogo B2B | ✅ Funciona | Portal público para clientes mayoristas con carrito → WhatsApp |
| Documento Entrega | ✅ Funciona | Vista pública con contraseña para el repartidor |
| Login | ⏸ Deshabilitado | Desactivado para el demo — reactivar en producción |
| **Pedidos (Recepción)** | ✅ Nuevo | Panel Gladys: lista pedidos, filtros por estado, aprobar/cancelar, crear manual. Notificación browser + sonido al recibir pedido nuevo |
| **Panel Armado** | ✅ Nuevo | Checklist por pedido, botón Despachar habilitado al completar todos los items, crea registro en entregas |
| **Panel Repartidor** | ✅ Nuevo | Hoja de ruta, botón Ver mapa (Google Maps), confirmar entrega con observaciones, historial |
| **Portal Clientes (PWA)** | ✅ Nuevo | Link único por cliente `?view=pedido&cliente=ID`, catálogo con stock real, carrito, pantalla de confirmación |
| **Agente IA "Agi"** | ✅ Construido | api/agent.js — Claude Sonnet, 7 herramientas (ventas, stock, compras, gastos, clientes, stock bajo, resumen diario). Pendiente: prueba en producción |

### Capacidades técnicas destacadas (ventajas vs GDS)
- Algoritmo FIFO real por lote de compra
- Costo promedio ponderado calculado en tiempo real
- Ganancia real calculada por venta
- Precios personalizados por cliente y por producto
- PWA — instalable en celular como app nativa
- Deploy cloud sin instalación
- Modo demo offline con mock data

---

## 4. Roadmap — Lo que hay que construir

### FASE 1: Personalización para AGIAPURR
- [ ] Cambiar nombre "Sistema Demo" → "AGIAPURR Gestión"
- [ ] Logo e identidad visual del negocio
- [ ] Adaptar unidades: kg puede quedar, pero también paquetes/unidades según producto
- [ ] Renombrar módulo "Distribución" según necesidad real del negocio
- [ ] Cargar productos reales (yerbas y otros) como datos demo

### FASE 2: Módulo de Pedidos y Reparto (NUEVO — core del proyecto)

#### 2A. Flujo digital de pedidos
```
Cliente hace pedido (PWA) → Recepción (Gladis) → Armado → Despacho → Entregado
```

**Panel Recepción (Gladis)**
- Ver pedidos entrantes en tiempo real (Supabase Realtime)
- Aprobar/rechazar con un click
- Sin carga manual si el cliente usa el portal

**Panel Armado** *(tablet en depósito)*
- Cola de pedidos pendientes ordenados por prioridad
- Checklist por pedido: producto + cantidad
- Botón "Listo" → notifica al repartidor

**Panel Repartidor** *(mobile-first)*
- Hoja de ruta del día
- Mapa con Google Maps API — recorrido optimizado con todos los puntos
- Por parada: cliente, dirección, productos, monto a cobrar
- Botón "Entregado" + observaciones
- Navegación directa a cada punto con un tap

#### 2B. Portal de pedidos para clientes (PWA)
- Cada cliente tiene link único: `?cliente=ID`
- Productos habituales precargados con cantidades de la última vez
- Precios personalizados según categoría
- Stock en tiempo real — no puede pedir lo que no hay
- "Confirmar Pedido" → va directo a Supabase, Gladis lo ve al instante
- **Instalable como app** (PWA) — ícono en el celular del cliente
- Notificación WhatsApp automática al cliente cuando sale a reparto

#### 2C. Tablas nuevas en Supabase
```sql
pedidos        (id, cliente_id, estado, fecha, observaciones, created_at)
pedido_items   (id, pedido_id, producto_id, cantidad, precio_unitario)
entregas       (id, pedido_id, repartidor_id, estado, coordenadas, hora_entrega, observaciones)
```

### FASE 3: Seguridad y Roles
- [ ] Reactivar autenticación
- [ ] Sistema de roles: admin (Gladis), armado, repartidor, cliente
- [ ] RLS en Supabase según rol — cada uno ve y hace solo lo que le corresponde
- [ ] Soft delete en todas las tablas (columna `activo BOOLEAN DEFAULT true`)
- [ ] Log de auditoría — quién hizo qué y cuándo
- [ ] Confirmación doble para acciones destructivas

### FASE 4: Facturación Electrónica ARCA/AFIP
⚠️ *Solo si el proyecto es aprobado por el cliente*
- [ ] Integración con API de ARCA (ex-AFIP)
- [ ] Emisión de facturas tipo A, B, C
- [ ] Comprobantes electrónicos desde el panel de ventas
- [ ] Historial de facturas emitidas
- [ ] Nota: diseñar schema de ventas/pedidos con campo `factura_id` desde ahora para no romper nada al integrar

### FASE 4B: Sistema de Pagos
⚠️ *Solo si el proyecto es aprobado por el cliente*
- [ ] Integración con MercadoPago o similar
- [ ] Link de pago por pedido
- [ ] Estado de pago en panel de Recepción (pendiente / pagado)
- [ ] Nota: tabla `pedidos` ya tiene campo `total` — agregar `estado_pago` y `pago_id` cuando llegue esta fase

### FASE 5: Rediseño UI (más profesional)
- [ ] Sistema de diseño unificado (variables CSS, tokens de color/tamaño)
- [ ] Tipografía Inter o similar
- [ ] Paleta nueva — abandonar el naranja de Sabri, identidad propia
- [ ] Sidebar con jerarquía clara
- [ ] Cards y tablas con estados hover y vacíos
- [ ] Modo claro/oscuro

### FASE 6: Mejoras adicionales vs GDS
- [ ] Exportar reportes a PDF/Excel
- [ ] Actualización masiva de precios
- [ ] Multi-sucursal (si el negocio crece)
- [ ] Historial de precios por producto
- [ ] Alertas de stock bajo

---

## 5. Ventajas Competitivas vs GDS Sistemas

| Feature | Nuestro sistema | GDS |
|---|---|---|
| Algoritmo FIFO real | ✅ | ❌ |
| Ganancia real por venta | ✅ | ❌ |
| Portal B2B para clientes | ✅ | ❌ |
| PWA instalable (sin tienda) | ✅ | App separada (paga) |
| Precios por cliente/producto | ✅ | ❌ |
| Flujo pedido→armado→reparto | ✅ (a construir) | ❌ |
| Ruta optimizada con mapa | ✅ (a construir) | ❌ |
| Portal de pedidos para clientes | ✅ (a construir) | ❌ |
| Soft delete + auditoría | ✅ (a construir) | ❌ |
| Factura electrónica ARCA | A construir | ✅ |
| Deploy cloud sin instalación | ✅ gratis | Costo extra |
| Código propio, sin licencia | ✅ | Licencia anual |

---

## 6. Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 7 |
| Estilos | CSS-in-JS (styled jsx) — migrar a sistema de diseño en Fase 5 |
| Íconos | Lucide React |
| Gráficos | Recharts |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime) |
| Maps | Google Maps Directions API (Fase 2) |
| Hosting | Vercel (deploy automático desde GitHub) |
| CI/CD | GitHub → Vercel (automático en push a main) |
| Lenguajes | JavaScript, JSX, SQL |

---

## 7. Decisiones de Arquitectura

- **Sin React Router** — navegación por estado (`currentView` + `activeTab`)
- **Vistas públicas** por query params: `?view=storefront`, `?view=entrega`, `?cliente=ID`
- **Supabase Realtime** para actualizaciones en vivo entre Recepción, Armado y Repartidor
- **Soft delete** en lugar de DELETE real — columna `activo` en todas las tablas
- **Un Supabase por cliente** — datos completamente separados entre proyectos
- **Auth deshabilitada en demo** — reactivar antes de entregar en producción

---

## 8. Problema Conocido — Lección de Proyectos Anteriores

En implementaciones con múltiples usuarios (ej: estudiantes de cursos), se produjo pérdida de datos porque todos compartían el mismo acceso sin restricciones de rol.

**Solución implementada en este proyecto:**
1. Roles diferenciados (admin, armado, repartidor, cliente)
2. RLS en Supabase — permisos a nivel de base de datos
3. Soft delete — nada se borra para siempre
4. Log de auditoría — trazabilidad completa

---

## 9. Próximo Paso Inmediato

### MVP Funcional — completado ✅
- ✅ Schema pedidos, pedido_items, entregas en Supabase
- ✅ Panel Recepción (Gladys) con notificaciones
- ✅ Panel Armado con checklist
- ✅ Panel Repartidor con confirmación de entrega
- ✅ Portal PWA por cliente con pantalla de confirmación
- ✅ Agente IA "Agi" construido y con variables en Vercel

### Siguiente sesión — por hacer (en orden)
1. **Probar el flujo completo de punta a punta** — crear pedido desde portal, aprobarlo, armarlo, despacharlo, entregarlo. Verificar Realtime en vivo.
2. **Probar el Agente "Agi"** — verificar que responde correctamente con el schema corregido (AgentChat.jsx en el panel).
3. **Cargar productos reales de AGIAPURR** — yerbas y marcas reales (El Colono, Flor de Jardín, Tucangua, etc.) con campo `unidad` correcto.
4. **UX/UI para presentación al cliente** — recién después de validar todo lo funcional.

---

*Studio Lamas · Desarrollo Digital · © 2026 Edgardo Lamas*
