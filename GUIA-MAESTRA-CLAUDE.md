# Guía maestra del proyecto Aurea Flow (visión para asistente)

Este documento da una visión general del proyecto para que un asistente (p. ej. Claude) sepa **qué es el proyecto**, **dónde está cada cosa** y **cómo está organizado**. No contiene código: solo descripciones, rutas de archivos y convenciones. El código real está en el repositorio; no se debe asumir que fragmentos en otros contextos representan el estado actual del proyecto.

---

## 1. Qué es el proyecto

- **Nombre:** Aurea Flow.
- **Tipo:** Aplicación web de gestión (ERP / negocio): productos, inventario de materias primas y producto terminado (lotes), clientes mayoristas, pedidos, producción.
- **Stack:** Next.js (App Router), React, TypeScript, Supabase (BD y auth), Tailwind CSS, componentes UI (shadcn/ui).
- **Roles de usuario:** admin, empleado, cliente. Cada rol tiene un segmento de rutas y un layout propio.

---

## 2. Segmentos de la aplicación y dónde viven

- **Raíz y auth:** En `src/app`: layout global, página raíz (redirige por rol o a login). En `src/app/(auth)/login`: página de login y acciones de autenticación. El middleware y la lógica de sesión/redirección por rol están en `src/middleware.ts` y en `src/lib/supabase` (server, client, middleware).
- **Admin:** Todo bajo `src/app/admin`: layout con menú lateral (Dashboard, Finanzas, Productos, Inventario, **Compras**, Producción, Clientes, Usuarios, Pedidos, Configuración). Dashboard operativo con métricas, resumen financiero (deuda proveedores, por cobrar clientes) y alertas operativas. Inventario incluye materias primas y, en `/admin/inventario/lotes`, inventario de producto terminado (lotes FIFO). **Compras:** listado de compras a proveedores (recepción, pagos, cancelación). Producción: listado de órdenes, nueva orden, detalle por id con consumos de MP y completar orden.
- **Empleado:** En `src/app/empleado`: layout, pedidos, producción (listado y detalle de órdenes, poner en proceso, agregar consumos, completar orden; reutiliza componentes y actions de admin).
- **Cliente:** En `src/app/cliente`: layout, dashboard; pedidos y precios son placeholders.

Los **componentes reutilizables** están en `src/components`: `ui/` (shadcn), `admin/` (botones de eliminar por entidad), y carpetas placeholder para empleado, cliente y shared.

---

## 3. Dónde buscar cada cosa (por tema)

- **Autenticación y redirección por rol:** `src/app/(auth)/login/` (página y actions), `src/middleware.ts`, `src/lib/supabase/server.ts` y `middleware.ts` para sesión.
- **Productos (catálogo):** Listado en `src/app/admin/productos/page.tsx`; crear en `nuevo/` con form; editar en `[id]/editar/` con form; actions en `src/app/admin/productos/actions.ts`. Eliminar: `src/components/admin/boton-eliminar-producto.tsx`.
- **Inventario (materias primas):** Listado en `src/app/admin/inventario/page.tsx`; link "Ver Lotes" a `/admin/inventario/lotes`; crear/editar en `nuevo/` y `[id]/editar/` con forms; actions en `src/app/admin/inventario/actions.ts`. Eliminar: `src/components/admin/boton-eliminar-materia-prima.tsx`.
- **Inventario de producto terminado (lotes):** Página en `src/app/admin/inventario/lotes/page.tsx`; query `inventory_lots` con `products(name, unit)`; orden FIFO por `production_date`; filtro por producto vía searchParams; componente cliente `form-filter-producto-lotes.tsx`. Estados: Disponible (current_quantity > 0), Agotado (≤ 0), Por vencer (expiry_date en próximos 30 días).
- **Producción (órdenes):** Listado en `src/app/admin/produccion/page.tsx` (filtros todos/pendientes/en proceso; query con `products(name)`, `assigned_profile:profiles!production_orders_assigned_to_fkey(full_name)`). Nueva orden en `nuevo/` con `form-nueva-orden.tsx`; actions en `src/app/admin/produccion/actions.ts` (crearOrdenProduccion con order_number, actualizarEstadoOrden, completarOrden, agregarConsumoMP, eliminarConsumoMP). Detalle en `[id]/page.tsx`: cabecera (order_number, producto, status, cantidad planificada, asignado, fecha, notas); tabla consumos de MP (`production_raw_material_usage` con `planned_quantity`, `raw_materials(name, unit)`); botón eliminar consumo (`boton-eliminar-consumo-mp.tsx`); formulario agregar consumo (`form-agregar-consumo-mp.tsx`); completar orden (`form-completar-orden.tsx`) o resumen si ya completada. Completar orden: descuenta stock de materias primas según consumos, crea lote en `inventory_lots` (lot_number, sin production_order_id ni is_active), inserta en `inventory_movements` (movement_type `entrada`, product_id), actualiza orden a completada.
- **Dashboard admin:** `src/app/admin/dashboard/page.tsx`. Usa `createAdminClient()` para queries de deuda y por cobrar. Queries: órdenes pendientes/en proceso (count); materias primas activas filtradas en JS por current_stock ≤ min_stock; lotes con expiry_date en próximos 30 días y current_quantity > 0; count lotes con current_quantity > 0; **deuda proveedores** (purchases con payment_status en ['pendiente','parcial']); **por cobrar clientes** (orders payment_status != 'pagado', status != 'cancelado'); **compras del mes** (purchases created_at >= inicio mes). UI: 4 cards operativas + **Resumen Financiero** (Deuda con Proveedores, Por Cobrar a Clientes) + **Alertas Operativas** (deuda proveedores, MP bajo mínimo, lotes vencen en 7 días); tablas MP en alerta y lotes por vencer; links Ver Producción, Ver Inventario, Compras.
- **Compras (purchases):** Listado en `src/app/admin/compras/page.tsx` con **createAdminClient()** (RLS no aplica). Query única a `purchases` con JOIN `raw_materials(name, unit)`; filtro por `reception_status` vía searchParams (Todas, Pendientes de recibir, Recibidas, Canceladas). Cálculo de deuda: solo compras con `payment_status === 'pendiente' || payment_status === 'parcial'` (excluye pagado y cancelado). Cards: Total comprado este mes, Deuda con proveedores, Compras este mes, Pendientes de recibir (count reception_status = pendiente). Tabla con columna Recepción (badges: pendiente, recibido_completo, recibido_parcial, cancelado). Sección "Deuda por Proveedor" agrupada en JS; mensaje "Sin deuda con proveedores" si no hay. Nueva compra en `nuevo/page.tsx` (carga materias primas activas) + `form-nueva-compra.tsx` (useFormState, registrarCompra); detalle en `[id]/page.tsx` (createAdminClient, compra + purchase_payments) + `detalle-compra.tsx` (cabecera con payment_status y reception_status; detalle compra con cantidad pedida/recibida; card Recepción de Mercancía según reception_status; historial pagos; resumen financiero; registrar pago si no pagado ni cancelado; cancelar compra si no cancelado ni recibido_completo). Actions en `src/app/admin/compras/actions.ts`: **registrarCompra** (insert purchases, opcional purchase_payments, UPDATE raw_materials current_stock; no insert en inventory_movements); **registrarPagoProveedor** (insert purchase_payments, recalcula paid_amount y payment_status en purchases); **registrarRecepcion** (received_quantity, reception_notes; ajuste stock según diferencia con received_quantity anterior; total = received_quantity * unit_cost; reception_status recibido_completo/parcial; recalcula payment_status); **cancelarCompra** (si no cancelado ni recibido_completo: revertir stock por received_quantity, UPDATE reception_status y payment_status a 'cancelado'); **actualizarNotasRecepcion** (solo reception_notes). Tablas: `purchases` (received_quantity, reception_notes, reception_status; payment_status incluye 'cancelado' al cancelar), `purchase_payments`.
- **Clientes:** Listado en `src/app/admin/clientes/page.tsx`; crear/editar en `nuevo/` y `[id]/editar/` con forms; actions en `src/app/admin/clientes/actions.ts`. Eliminar: `src/components/admin/boton-eliminar-cliente.tsx`.
- **Configuración (categorías):** Página en `src/app/admin/configuracion/page.tsx`; formulario inline crear categoría; editar en `categorias/[id]/editar/` (page + form); actions en `src/app/admin/configuracion/actions.ts`. Eliminar: `src/components/admin/boton-eliminar-categoria.tsx`.
- **Empleado producción:** Listado en `src/app/empleado/produccion/page.tsx`; detalle en `[id]/page.tsx` (mismo flujo que admin: consumos, agregar, completar); `boton-poner-en-proceso.tsx` para cambiar estado a en_proceso. Usa actions y componentes de `@/app/admin/produccion/` (FormAgregarConsumoMP, FormCompletarOrden).
- **Tipos y modelos de datos:** `src/types/database.ts` (Profile, Customer, Product, ProductCategory, Order, etc.). Compras: tipos locales en página y detalle (PurchaseRow, PurchaseData con payment_status, reception_status, received_quantity, reception_notes).
- **Acceso a datos en servidor:** Lectura con cliente Supabase de servidor en `src/lib/supabase/server.ts`. Mutaciones (insert, update, delete) desde Server Actions usando `src/lib/supabase/admin.ts` (createAdminClient, service role).
- **Estilos y tema:** `src/app/globals.css`, `tailwind.config.ts`; componentes base en `src/components/ui/`.

---

## 4. Responsabilidad de cada módulo (qué hace)

- **Login:** Permite iniciar sesión; según el rol del perfil redirige a dashboard admin, pedidos empleado o dashboard cliente.
- **Admin Dashboard:** Muestra 4 cards métricas (órdenes activas, MP en alerta, lotes en stock, lotes por vencer); Resumen Financiero (Deuda con Proveedores, Por Cobrar a Clientes); Alertas Operativas (deuda proveedores, MP bajo mínimo, lotes vencen en 7 días); tablas de MP en alerta y lotes próximos a vencer; links rápidos a Producción, Inventario (lotes) y Compras.
- **Admin Productos:** Listar productos (con categoría); crear, editar y eliminar producto.
- **Admin Inventario:** Listar materias primas (stock, mínimo, costo, proveedor, estado); alerta cuando stock ≤ mínimo; crear, editar y eliminar. Link "Ver Lotes" a inventario de producto terminado. Página Lotes: listado FIFO, filtro por producto, columnas producto/lote/fecha producción/cantidades/vencimiento/estado (Disponible, Agotado, Por vencer).
- **Admin Producción:** Listar órdenes de producción (filtros); crear orden (order_number, product_id, planned_quantity, notes, assigned_to); en detalle [id]: ver cabecera, listar consumos de MP (planned_quantity), agregar consumo, eliminar consumo, completar orden (cantidad real, merma, notas, foto). Al completar: descuento de stock de MP, creación de lote (inventory_lots) y movimiento (inventory_movements tipo entrada).
- **Admin Clientes:** Listar clientes; crear, editar y eliminar (no si tiene pedidos).
- **Admin Configuración:** Gestionar categorías de productos (listado, crear inline, editar/eliminar en subruta; no eliminar si tiene productos).
- **Admin Compras:** Listar compras a proveedores (materia prima, proveedor, cantidades, total, pagado, estado pago y recepción); filtro por estado de recepción (Todas, Pendientes, Recibidas, Canceladas). Nueva compra (materia prima, proveedor, cantidad, costo unitario, pago inicial completo/parcial/pendiente); al registrar se actualiza stock de la materia prima. Detalle: cabecera, detalle de compra, recepción de mercancía (registrar cantidad recibida o mensaje si completo/cancelado), historial de pagos, resumen financiero, registrar pago (si no pagado ni cancelado), cancelar compra (si no recibido completo ni cancelado; revierte stock). Deuda con proveedores y lista "Deuda por Proveedor" solo consideran compras con payment_status pendiente o parcial (excluyen cancelado y pagado).
- **Empleado Producción:** Listar órdenes; ver detalle; poner en proceso; agregar consumos y completar orden (misma lógica que admin).
- **Cliente Dashboard:** Página de inicio para rol cliente.

---

## 5. Convenciones técnicas (sin código)

- **Server Components por defecto:** Las páginas de listado y las de nuevo/editar/detalle son Server Components; cargan datos con el cliente Supabase de servidor.
- **Client Components solo donde hace falta:** Formularios con `useFormState` o botones que confirman y envían form (forms nuevo/editar, formulario inline categorías, botones eliminar, filtro producto en lotes, form completar orden, form agregar consumo, botón eliminar consumo).
- **Server Actions:** En archivos `actions.ts` dentro del módulo (admin/productos, inventario, clientes, configuracion, **compras**, produccion, (auth)/login). Usan `createAdminClient()` para insert/update/delete. Para listados que deben ignorar RLS (p. ej. compras, dashboard con deuda) usar `createAdminClient()` en la página; para mutaciones siempre `createAdminClient()` en la action.
- **Producción:** Consumos de MP usan columna `planned_quantity` en `production_raw_material_usage` (no quantity_used). Órdenes tienen `order_number` (OP-timestamp). Asignado se obtiene con JOIN a profiles por FK `production_orders_assigned_to_fkey` y campo `full_name`. inventory_lots: lot_number, sin production_order_id ni is_active. inventory_movements: movement_type `entrada`, incluir product_id.
- **Eliminaciones con reglas de negocio:** Categoría: no si tiene productos. Cliente: no si tiene pedidos. Materia prima: no si está en production_raw_material_usage.
- **Formularios:** Acciones vía `useFormState` o action del form. Errores como `{ error: string }` en la misma página.
- **Navegación:** Link de Next.js; botón Volver a la lista del módulo.

---

## 6. Datos: tablas principales y relaciones

- **Perfiles y auth:** Perfil de usuario (rol, full_name, etc.); relación con auth de Supabase.
- **product_categories:** Categorías de productos. Referenciadas por products.
- **products:** Productos (name, SKU, category_id, precios, unit, min_stock, is_active, etc.).
- **customers:** Clientes. orders tiene customer_id.
- **orders:** Pedidos. Un cliente no debe eliminarse si tiene filas aquí.
- **raw_materials:** Materias primas (name, unit, current_stock, min_stock, unit_cost, supplier, is_active). production_raw_material_usage referencia raw_material_id; no eliminar MP si tiene consumos.
- **production_orders:** Órdenes de producción (order_number, product_id, planned_quantity, status, assigned_to, notes, actual_quantity, waste_quantity, waste_notes, waste_photo_url, completed_at). FK a profiles en assigned_to. production_raw_material_usage referencia production_order_id.
- **production_raw_material_usage:** Consumo de MP por orden (production_order_id, raw_material_id, planned_quantity).
- **inventory_lots:** Lotes de producto terminado (product_id, lot_number, production_date, initial_quantity, current_quantity, committed_quantity, expiry_date, notes). Sin production_order_id ni is_active.
- **inventory_movements:** Movimientos (lot_id, product_id, movement_type como `entrada`, quantity, notes). No se usa para compras de materia prima (solo se actualiza raw_materials.current_stock).
- **purchases:** Compras a proveedores (raw_material_id, supplier, quantity, unit_cost, total, paid_amount, payment_status: pendiente/parcial/pagado/**cancelado**; purchase_date, invoice_number, notes; **received_quantity**, **reception_notes**, **reception_status**: pendiente/recibido_completo/recibido_parcial/cancelado; created_by, created_at, updated_at). Al cancelar se setea reception_status y payment_status a 'cancelado'.
- **purchase_payments:** Pagos de una compra (purchase_id, amount, payment_method, reference, notes, created_by, created_at). Registrar pago recalcula paid_amount y payment_status en purchases.

Los nombres exactos de columnas y FKs están en el esquema de Supabase y en `src/types/database.ts`.

---

## 7. Flujos importantes (resumen)

- **Login:** Usuario entra; se valida sesión; redirección por rol a /admin/dashboard, /empleado/pedidos o /cliente/dashboard.
- **Dashboard admin:** Carga 4 cards operativas + Resumen Financiero (deuda proveedores desde purchases payment_status pendiente/parcial, por cobrar clientes desde orders) + Alertas Operativas; tablas condicionales y links a Producción, Inventario/lotes, Compras.
- **Producción:** Listado → Nueva orden (order_number, producto, cantidad, asignado, notas) → Detalle: agregar consumos MP (planned_quantity), eliminar consumo, completar orden (cantidad real, merma, foto) → se descuenta stock MP, se crea lote y movimiento de entrada.
- **Compras:** Listado → Nueva compra (materia prima, proveedor, cantidad, costo, pago inicial) → stock MP se incrementa. Detalle: registrar recepción (cantidad recibida, ajuste stock), registrar pagos (recalcula paid_amount/payment_status), cancelar compra (revierte stock, reception_status y payment_status a cancelado). Deuda solo con payment_status pendiente o parcial.
- **Inventario lotes:** Listado FIFO con filtro producto; estados Disponible/Agotado/Por vencer según current_quantity y expiry_date.
- **CRUD típico en admin:** Listado → Nuevo/Editar (form + Server Action) → Eliminar con validación de referencias.

---

## 8. Archivos de referencia rápida

- **Estructura de carpetas y rutas:** `ESTRUCTURA-PROYECTO.md`.
- **Tipos de datos:** `src/types/database.ts`.
- **Variables de entorno:** `.env.local` (Supabase URL, anon key, service role key); no versionar secretos.
- **Configuración:** next.config.mjs, tailwind.config.ts, tsconfig.json en la raíz.

Al modificar o extender el proyecto, usar esta guía para ubicar el módulo correcto y respetar las convenciones. El código fuente es la fuente de verdad; este documento solo orienta.
