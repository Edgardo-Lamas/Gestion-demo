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
- Equipo: Gladys (administración/recepción de pedidos), equipo de armado, repartidor

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
- Rama activa: `main` — deploy automático en cada push

### Infraestructura
- Frontend: React 19 + Vite 7 — desplegado en Vercel
- Base de datos: Supabase (PostgreSQL + Auth + Realtime)
  - URL: https://gnrzfzzrdwwvusyvcudw.supabase.co
  - Tablas: productos, compras, ventas, gastos, distribuciones, clientes, cliente_productos, pedidos, pedido_items, entregas, comentarios_pedido, cajas, movimientos_caja, pedidos_proveedor, pedidos_proveedor_items
- Variables de entorno en Vercel (todas activas ✅):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`
  - `VITE_ENTREGA_PASSWORD` — contraseña de acceso al panel del repartidor
- Auth: **ACTIVA** — login requerido para acceder al panel admin
- Deploy: automático desde GitHub main → Vercel

### Credenciales demo (Supabase Auth)
| Campo | Valor |
|---|---|
| Email | `admin@agiapurr.com` |
| Password | `Agiapurr2026!` |
> Cambiar antes de entregar en producción real.

---

## 3. Módulos Actuales — Estado completo

| Módulo | Archivo | Estado | Descripción |
|---|---|---|---|
| Dashboard | Dashboard.jsx | ✅ | KPIs del mes, gráficos, mini calendario, ranking productos |
| Compras | Purchases.jsx | ✅ | Ingreso de lotes — base del FIFO |
| Ventas | Sales.jsx | ✅ | Registro con ganancia real por lote FIFO |
| Gastos | Expenses.jsx | ✅ | Egresos operativos categorizados |
| Stock | Inventory.jsx | ✅ | Costo promedio ponderado en tiempo real |
| Clientes | ClientProfiles.jsx | ✅ | ABM + precios personalizados por producto |
| Productos | Products.jsx | ✅ | Catálogo B2B, margen, precio, visibilidad |
| Caja Diaria | CajaDiaria.jsx | ✅ | Apertura, movimientos por medio de pago, cierre |
| Pedidos Recepción | PedidosRecepcion.jsx | ✅ | Alerta sonora + browser, aprobar/cancelar, crear manual |
| Panel Armado | PanelArmado.jsx | ✅ | Checklist por pedido, Despachar al completar todos |
| Panel Repartidor | PanelRepartidor.jsx | ✅ | Hoja de ruta, Google Maps, confirmar entrega, historial |
| Mensajes internos | ComentariosPedido.jsx | ✅ | Canal por pedido entre Recepción / Armado / Repartidor |
| Pedidos Proveedores | PedidosProveedores.jsx | ✅ | Analiza stock vs ventas 30d, sugiere cantidades, genera orden |
| Portal Clientes (PWA) | PortalPedidos.jsx | ✅ | Link único `?view=pedido&cliente=ID`, precios propios, stock real |
| Catálogo B2B | B2BStoreFront.jsx | ✅ | Vidriera pública, hero FLUX yerba misionera, auto-fetch Supabase |
| Red de Ventas | RedVendedores.jsx | ✅ | Teaser módulo revendedores — próxima fase |
| Agente IA "Agi" | api/agent.js | ✅ | Claude Sonnet 4.6, 10 herramientas, experto yerba + SEO |
| Login | Login.jsx | ✅ | Mesh gradient AGIAPURR, links a Catálogo y Propuesta |
| Propuesta | Propuesta.jsx | ✅ | Documento comercial completo — acceso desde Login |
| Documento Entrega | Entrega.jsx | ✅ | Gate con password, guía de uso para repartidor |

---

## 4. Vistas Públicas (sin login)

| URL | Componente | Descripción |
|---|---|---|
| `?view=storefront` | B2BStoreFront | Catálogo mayorista público — auto-fetch Supabase |
| `?view=entrega` | Entrega | Panel repartidor — requiere password `VITE_ENTREGA_PASSWORD` |
| `?view=propuesta` | Propuesta | Documento comercial — accesible desde botón en Login |
| `?view=pedido&cliente=ID` | PortalPedidos | Portal PWA por cliente |

---

## 5. Seguridad — Estado pre-producción

### Implementado ✅
- Login guard activo: `if (!user) return <Login />`
- Rutas Sabri (`?view=sabri`, `?view=reporte`) eliminadas
- Archivos muertos eliminados: ReporteSabri, ReporteSabriAdmin, SabriPanel, MeatDistribution, MigrationHelper
- ErrorBoundary: pantalla amigable sin stack trace expuesto
- Password del repartidor en variable de entorno Vercel (`VITE_ENTREGA_PASSWORD`)
- Supabase Auth: usuario admin creado y confirmado

### Pendiente para producción real ⚠️
- Renombrar columnas DB `para_sabri`/`flete_sabri` → `para_catalogo`/`flete_catalogo` (requiere migración SQL)
- RLS (Row Level Security) en Supabase por roles (Fase 3 del roadmap)
- Cambiar password del admin antes del lanzamiento
- Favicon AGIAPURR real (actualmente usa vite.svg)

---

## 6. Propuesta Comercial

**Archivo:** `src/components/Propuesta.jsx`
**Acceso:** desde botón "Ver propuesta del sistema" en pantalla de Login → `?view=propuesta`
**Botón volver:** regresa a `/` (login)

**Secciones:**
1. Portada con branding AGIAPURR + Studio Lamas
2. Contexto (GDS → modernización)
3. Comparativa tabla 10 filas vs GDS Sistemas
4. Ventajas cloud inmediatas (datos seguros, sin licencias, celular)
5. **Flujo de pedidos** — 5 pasos con PWA explicada, mensajes internos, pedidos a proveedores
6. 15 módulos actuales con descripciones precisas
7. Roadmap Fase 2 y Fase 3
8. AGI — gestor del negocio + experto yerba mate + SEO y comunicación
9. CTA WhatsApp
10. Footer Studio Lamas

---

## 7. UI/UX — Estado actual

**Paleta AGIAPURR:**
- Verde forestal: `#3B7A57` / hover: `#2d6148`
- Sidebar oscuro: `#1B3A2A`
- Dorado: `#C9A84C`
- Madera: `#8B5E3C`
- Fondo: `#E8E3D9` (arena cálida)
- Surface/cards: `#F0ECE3` (tono tierra suave)

**Tipografía:** Nunito (Google Fonts)

**Completado en esta sesión:**
- ✅ Naranja Sabri eliminado de todos los componentes
- ✅ Textos "Sabri" / "carnicería" reemplazados por AGIAPURR
- ✅ Hero B2BStoreFront: imagen FLUX yerba mate al atardecer (public/hero-bg.png)
- ✅ Studio Lamas logo (SVG con 4 rects dorados "E") en Login, Entrega, Sidebar, Propuesta
- ✅ Fondo content: menos blanco (`#E8E3D9` / `#F0ECE3`)
- ✅ "Gladys" en sidebar: blanco puro (era var(--text) oscuro, invisible)
- ✅ Studio Lamas nombre: 80% opacidad blanco (legible sobre sidebar verde)

**Pendiente:**
- Favicon AGIAPURR real
- Columnas DB `flete_sabri`/`para_sabri` — requieren migración SQL coordinada

---

## 8. Agente IA "Agi"

**Archivo:** `api/agent.js` — serverless Vercel, Claude Sonnet 4.6

**Nota:** URL + anon key de Supabase hardcodeadas en el archivo (evita colisión con otros proyectos en la misma cuenta Vercel).

**10 herramientas en producción:**
`consultar_productos`, `consultar_ventas`, `consultar_compras`, `consultar_gastos`, `consultar_clientes`, `stock_bajo`, `resumen_diario`, `productos_mas_vendidos`, `ventas_por_cliente`, `clientes_inactivos`

**Conocimiento especializado:**
- Experto en yerba mate misionera (tipos, calidad, marcas del catálogo, almacenamiento)
- Genera contenido SEO: descripciones, posts Instagram, palabras clave, mensajes WhatsApp

---

## 9. Datos Demo en Supabase

| Tabla | Registros | Notas |
|---|---|---|
| productos | 16 | Yerbas con palo, orgánicas, agroecológicas, conservas, lácteos |
| compras | 22 lotes | 2 oleadas: 28/4 pre-temporada + 12/5 reposición |
| ventas | 32 | Mayo 2026 — CURRENT_DATE -22 a -1 |
| clientes | 7 | 4 mayoristas + 2 minoristas + 1 genérico |
| gastos | 14 | Combustible, alquiler, materiales, marketing, vehículo |

**Scripts SQL en raíz del proyecto:**
`migration_productos_agiapurr.sql`, `migration_compras_demo_mayo2026.sql`, `migration_ventas_demo_mayo2026.sql`, `migration_clientes_demo.sql`, `migration_gastos_demo_mayo2026.sql`, `migration_ventas_vincular_clientes.sql`

---

## 10. Roadmap

### Fase 2 (próxima)
- Facturación ARCA/AFIP (lo que GDS ofrece como módulo pago)
- Red de Revendedores — portales individuales, comisiones automáticas
- App Mobile PWA completa con notificaciones
- Exportación a Excel y PDF

### Fase 3
- WhatsApp Business Bot — pedidos por WhatsApp registrados automáticamente
- Lector QR/barras para recepción de mercadería
- Multi-sucursal
- Impresora fiscal / tickets

### Seguridad pendiente (Fase 3)
- RLS en Supabase por roles: admin, armado, repartidor, cliente
- Soft delete en todas las tablas (`activo BOOLEAN DEFAULT true`)
- Log de auditoría

---

## 11. Próxima Sesión

1. **Demo en vivo con AGIAPURR** — presentar sistema con credenciales `admin@agiapurr.com`
2. **Favicon** — crear `/public/icon-agiapurr.svg` y linkear en `index.html`
3. **Migración DB** — renombrar `para_sabri`/`flete_sabri` → nombres AGIAPURR
4. **UX mobile** — verificar Pedidos/Armado/Reparto en celular
5. **RLS Supabase** — una vez aprobado el proyecto, activar antes de entregar en producción

---

*Studio Lamas · Desarrollo Digital · © 2026 Edgardo Lamas*
