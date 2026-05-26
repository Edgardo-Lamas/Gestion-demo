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
| Dashboard | ✅ Funciona | Gráficos financieros — ingresos, gastos, ganancia, stock valorizado. Datos 100% de Supabase real |
| Compras | ✅ Funciona | Ingreso de lotes con costo unitario — base del algoritmo FIFO |
| Ventas | ✅ Funciona | Registro con cálculo automático de ganancia real |
| Gastos | ✅ Funciona | Gastos operativos categorizados |
| Stock/Inventario | ✅ Funciona | Vista de stock con costo promedio ponderado en tiempo real |
| Distribución | ✅ Funciona | Entrega interna con trazabilidad (pendiente renombrar) |
| Clientes | ✅ Funciona | ABM + precios personalizados por producto |
| Productos | ✅ Funciona | Catálogo con margen y precio catálogo |
| Catálogo B2B | ✅ Funciona | Portal público para clientes mayoristas con carrito → WhatsApp |
| Documento Entrega | ✅ Funciona | Vista pública con contraseña para el repartidor |
| Login | ⏸ Deshabilitado | Desactivado para el demo — reactivar en producción |
| **Pedidos (Recepción)** | ✅ Funciona | Panel Gladys: lista pedidos, filtros por estado, aprobar/cancelar, crear manual. Notificación browser + sonido al recibir pedido nuevo |
| **Panel Armado** | ✅ Funciona | Checklist por pedido, botón Despachar habilitado al completar todos los items, crea registro en entregas |
| **Panel Repartidor** | ✅ Funciona | Hoja de ruta, botón Ver mapa (Google Maps), confirmar entrega con observaciones, historial |
| **Portal Clientes (PWA)** | ✅ Funciona | Link único por cliente `?view=pedido&cliente=ID`, catálogo con stock real, carrito, pantalla de confirmación |
| **Agente IA "Agi"** | ✅ Testeado | api/agent.js — Claude Sonnet 4.6, **10 herramientas** verificadas en producción con datos reales de Supabase |

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

### Completado ✅
- ✅ Agente Agi — 10 herramientas testeadas en producción con datos reales
- ✅ Datos demo completos (productos, compras, ventas, clientes, gastos)
- ✅ Dashboard conectado 100% a Supabase (env vars corregidas en Vercel)
- ✅ Rediseño UI/UX — paleta AGIAPURR, sidebar oscuro, Nunito, sin Sabri

### Siguiente sesión — ver sección 13

---

## 10. Datos Demo Cargados en Supabase

Todos los datos demo están en el proyecto `gnrzfzzrdwwvusyvcudw` (Supabase Gestion-demo).

| Tabla | Registros | Notas |
|---|---|---|
| productos | 16 | Yerbas (con palo, orgánicas, agroec.), conservas, lácteos |
| compras | 22 lotes | 2 oleadas: 28/4 pre-temporada + 12/5 reposición |
| ventas | 32 | Mayo 2026 — fechas CURRENT_DATE - 22 a -1 |
| clientes | 7 | 4 mayoristas + 2 minoristas + 1 genérico |
| gastos | 14 | Combustible, alquiler, materiales, marketing, vehículo |

**Scripts de migración disponibles en raíz del proyecto:**
- `migration_productos_agiapurr.sql`
- `migration_compras_demo_mayo2026.sql`
- `migration_ventas_demo_mayo2026.sql`
- `migration_clientes_demo.sql`
- `migration_gastos_demo_mayo2026.sql`
- `migration_ventas_vincular_clientes.sql`

---

## 11. Agente IA "Agi" — Estado y Herramientas

**Archivo:** `api/agent.js` — serverless Vercel, Claude Sonnet 4.6

**Credenciales:** URL + anon key de Supabase hardcodeadas en el archivo (no depende de env vars para evitar colisión con otros proyectos en la misma cuenta Vercel).

**10 herramientas testeadas en producción:**

| Herramienta | Estado | Descripción |
|---|---|---|
| `consultar_productos` | ✅ | Catálogo con stock calculado desde compras |
| `consultar_ventas` | ✅ | Ventas por período con cliente y producto |
| `consultar_compras` | ✅ | Lotes de compra con disponible |
| `consultar_gastos` | ✅ | Gastos operativos por período |
| `consultar_clientes` | ✅ | Listado de clientes activos |
| `stock_bajo` | ✅ | Productos bajo umbral configurable |
| `resumen_diario` | ✅ | Ventas + gastos + stock bajo del día |
| `productos_mas_vendidos` | ✅ | Ranking por volumen e ingresos |
| `ventas_por_cliente` | ✅ | Desglose de facturación por cliente |
| `clientes_inactivos` | ✅ | Clientes sin actividad en X días |

---

## 12. UI/UX — Estado del Rediseño

**Completado (mayo 2026):**
- Paleta AGIAPURR: verde forestal `#3B7A57`, madera `#8B5E3C`, dorado `#C9A84C`, fondo crema `#F4F1EB`
- Sidebar oscuro `#1B3A2A` con ítems dorados en activo/hover
- Tipografía Nunito (Google Fonts)
- Branding: "AGIAPURR Gestión" + logo 🌿 en sidebar
- Usuario "Gladys" — sin referencias a Sabrina
- Guía de uso actualizada para el rubro

**Pendiente UI/UX (próxima sesión):**
- Revisar componentes individuales — pueden tener naranja residual de Sabri en botones/tables
- AgentChat.jsx — mejorar diseño del botón flotante con nueva paleta
- Renombrar módulo "Distribución" a algo acorde al negocio
- Favicon real AGIAPURR (`/icon-agiapurr.svg` apunta a archivo inexistente)
- Entrega.jsx aún tiene "Sistema Demo" en algunos strings

---

## 13. Próxima Sesión — Por hacer (en orden)

1. **UI/UX continuación** — revisar naranja residual en componentes internos, AgentChat, favicon
2. **Flujo pedidos punta a punta** — crear pedido desde portal, aprobarlo, armarlo, despacharlo, entregarlo
3. **Renombrar "Distribución"** según necesidad real del negocio
4. **Entrega.jsx** — limpiar strings "Sistema Demo" restantes
5. **UX mobile** — verificar que Pedidos/Armado/Reparto funcionan bien en celular

---

*Studio Lamas · Desarrollo Digital · © 2026 Edgardo Lamas*
