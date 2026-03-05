# Estructura del proyecto Aurea Flow (Colmena-OS)

Estructura actual del proyecto. Raíz: repositorio Colmena-OS. Excluye `node_modules/`, `.next/`, `.git/`. Las rutas de admin incluyen listados, formularios nuevo/editar y Server Actions donde aplica.

```
(raíz Colmena-OS)/
├── .env.local
├── .eslintrc.json
├── .gitignore
├── components.json
├── ESTRUCTURA-PROYECTO.md
├── GUIA-MAESTRA-CLAUDE.md
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
│
└── src/
    ├── middleware.ts
    │
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── fonts/
    │   │   ├── GeistMonoVF.woff
    │   │   └── GeistVF.woff
    │   │
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   └── login/
    │   │       ├── actions.ts
    │   │       └── page.tsx
    │   │
    │   ├── admin/
    │   │   ├── layout.tsx
    │   │   ├── loading.tsx
    │   │   ├── dashboard/
    │   │   │   └── page.tsx          # Dashboard operativo (métricas, alertas, links)
    │   │   ├── finanzas/
    │   │   │   ├── page.tsx
    │   │   │   └── dashboard-financiero.tsx
    │   │   ├── productos/
    │   │   │   ├── page.tsx
    │   │   │   ├── actions.ts
    │   │   │   ├── nuevo/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── form-producto-nuevo.tsx
    │   │   │   └── [id]/
    │   │   │       └── editar/
    │   │   │           ├── page.tsx
    │   │   │           └── form-producto-editar.tsx
    │   │   ├── inventario/
    │   │   │   ├── page.tsx          # Materias primas; link "Ver Lotes"
    │   │   │   ├── actions.ts
    │   │   │   ├── nuevo/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── form-materia-prima-nuevo.tsx
    │   │   │   ├── [id]/
    │   │   │   │   └── editar/
    │   │   │   │       ├── page.tsx
    │   │   │   │       └── form-materia-prima-editar.tsx
    │   │   │   └── lotes/
    │   │   │       ├── page.tsx      # Inventario producto terminado (FIFO, filtro producto)
    │   │   │       └── form-filter-producto-lotes.tsx
    │   │   ├── compras/
    │   │   │   ├── page.tsx
    │   │   │   ├── actions.ts
    │   │   │   ├── nuevo/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── form-nueva-compra.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx
    │   │   │       └── detalle-compra.tsx
    │   │   ├── clientes/
    │   │   │   ├── page.tsx
    │   │   │   ├── actions.ts
    │   │   │   ├── nuevo/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── form-cliente-nuevo.tsx
    │   │   │   └── [id]/
    │   │   │       ├── editar/
    │   │   │       │   ├── page.tsx
    │   │   │       │   └── form-cliente-editar.tsx
    │   │   │       └── precios/
    │   │   │           ├── page.tsx
    │   │   │           ├── actions.ts
    │   │   │           ├── form-agregar-precio.tsx
    │   │   │           └── tarjeta-precio.tsx
    │   │   ├── usuarios/
    │   │   │   ├── page.tsx
    │   │   │   ├── actions.ts
    │   │   │   ├── usuarios-content.tsx
    │   │   │   ├── form-crear-empleado.tsx
    │   │   │   ├── form-dar-acceso-cliente.tsx
    │   │   │   └── boton-toggle-usuario.tsx
    │   │   ├── pedidos/
    │   │   │   ├── page.tsx          # Listado pedidos
    │   │   │   ├── actions.ts
    │   │   │   ├── nuevo/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── form-nuevo-pedido.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx      # Detalle pedido
    │   │   │       └── detalle-pedido.tsx
    │   │   ├── configuracion/
    │   │   │   ├── page.tsx
    │   │   │   ├── actions.ts
    │   │   │   ├── form-crear-categoria-inline.tsx
    │   │   │   ├── categorias/
    │   │   │   │   └── [id]/
    │   │   │   │       └── editar/
    │   │   │   │           ├── page.tsx
    │   │   │   │           └── form-categoria-editar.tsx
    │   │   │   └── telegram/
    │   │   │       ├── page.tsx
    │   │   │       ├── actions.ts
    │   │   │       └── boton-test-telegram.tsx
    │   │   └── produccion/
    │   │       ├── page.tsx
    │   │       ├── actions.ts
    │   │       ├── nuevo/
    │   │       │   ├── page.tsx
    │   │       │   └── form-nueva-orden.tsx
    │   │       └── [id]/
    │   │           ├── page.tsx
    │   │           ├── boton-eliminar-consumo-mp.tsx
    │   │           ├── form-agregar-consumo-mp.tsx
    │   │           └── form-completar-orden.tsx
    │   │
    │   ├── empleado/
    │   │   ├── layout.tsx
    │   │   ├── pedidos/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx
    │   │   │       ├── actions.ts
    │   │   │       └── detalle-pedido-empleado.tsx
    │   │   └── produccion/
    │   │       ├── page.tsx
    │   │       └── [id]/
    │   │           ├── page.tsx
    │   │           └── boton-poner-en-proceso.tsx
    │   │
    │   ├── cliente/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/
    │   │   │   └── page.tsx
    │   │   ├── pedidos/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx
    │   │   │       ├── actions.ts
    │   │   │       └── detalle-pedido-cliente.tsx
    │   │   └── precios/
    │   │       └── page.tsx
    │   │
    │   └── api/
    │       └── alertas-stock/
    │           └── route.ts
    │
    ├── components/
    │   ├── ui/
    │   │   ├── badge.tsx
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── form.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── table.tsx
    │   │   ├── textarea.tsx
    │   │   ├── toast.tsx
    │   │   ├── toaster.tsx
    │   │   └── tooltip.tsx
    │   ├── admin/
    │   │   ├── admin-sidebar.tsx
    │   │   ├── admin-page-transition.tsx
    │   │   ├── table-skeleton.tsx
    │   │   ├── cards-skeleton.tsx
    │   │   ├── empty-state.tsx
    │   │   ├── boton-eliminar-producto.tsx
    │   │   ├── boton-eliminar-categoria.tsx
    │   │   ├── boton-eliminar-cliente.tsx
    │   │   └── boton-eliminar-materia-prima.tsx
    │   ├── boton-cerrar-sesion.tsx
    │   ├── empleado/
    │   │   └── .gitkeep
    │   ├── cliente/
    │   │   └── .gitkeep
    │   └── shared/
    │       └── .gitkeep
    │
    ├── lib/
    │   ├── utils.ts
    │   ├── telegram.ts
    │   ├── rls-pedidos.sql
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   ├── admin.ts
    │   │   └── middleware.ts
    │   ├── utils/
    │   │   └── .gitkeep
    │   └── validations/
    │       └── .gitkeep
    │
    ├── hooks/
    │   ├── use-toast.ts
    │   └── .gitkeep
    │
    ├── types/
    │   └── database.ts
    │
    └── constants/
        └── .gitkeep
```

## Rutas (URLs)

| Ruta | Descripción |
|------|-------------|
| `/` | Página raíz; redirige por rol o a login |
| `/login` | Login (layout auth) |
| `/admin/dashboard` | Dashboard operativo: métricas, Resumen Financiero, Alertas Operativas; links Ver Producción / Ver Inventario / Compras |
| `/admin/finanzas` | Dashboard financiero |
| `/admin/productos` | Lista productos; nuevo en `/admin/productos/nuevo`; editar en `/admin/productos/[id]/editar` |
| `/admin/inventario` | Lista materias primas; link "Ver Lotes"; nuevo/editar en subrutas |
| `/admin/inventario/lotes` | Inventario de producto terminado (lotes FIFO, filtro por producto) |
| `/admin/compras` | Listado compras; nueva en `/admin/compras/nuevo`; detalle en `/admin/compras/[id]` |
| `/admin/clientes` | Lista clientes; nuevo/editar; precios por cliente en `/admin/clientes/[id]/precios` |
| `/admin/usuarios` | Gestión de usuarios (empleados, dar acceso cliente, toggle activo) |
| `/admin/pedidos` | Listado pedidos; nuevo en `/admin/pedidos/nuevo`; detalle en `/admin/pedidos/[id]` |
| `/admin/configuracion` | Configuración (categorías); editar en `/admin/configuracion/categorias/[id]/editar` |
| `/admin/configuracion/telegram` | Configuración Telegram (notificaciones) |
| `/admin/produccion` | Listado órdenes de producción; nueva en `/admin/produccion/nuevo`; detalle en `/admin/produccion/[id]` |
| `/empleado/pedidos` | Listado pedidos empleado; detalle en `/empleado/pedidos/[id]` |
| `/empleado/produccion` | Listado órdenes producción empleado; detalle en `/empleado/produccion/[id]` |
| `/cliente/dashboard` | Dashboard cliente |
| `/cliente/pedidos` | Listado pedidos del cliente; detalle en `/cliente/pedidos/[id]` |
| `/cliente/precios` | Precios para el cliente |

## Resumen por área

| Área | Contenido principal |
|------|---------------------|
| `app/(auth)/login` | Login, actions para autenticar y redirigir por rol |
| `app/admin/dashboard` | Métricas, Resumen Financiero, Alertas Operativas; links Producción, Inventario, Compras |
| `app/admin/finanzas` | Dashboard financiero |
| `app/admin/productos` | CRUD productos |
| `app/admin/inventario` | CRUD materias primas; lotes = inventario producto terminado (FIFO) |
| `app/admin/compras` | Listado, nueva compra, detalle (recepción, pagos, cancelar) |
| `app/admin/clientes` | CRUD clientes; precios por cliente en `[id]/precios` |
| `app/admin/usuarios` | Usuarios: crear empleado, dar acceso cliente, activar/desactivar |
| `app/admin/pedidos` | Listado, nuevo pedido, detalle |
| `app/admin/configuracion` | Categorías; subruta `telegram` para notificaciones |
| `app/admin/produccion` | Órdenes de producción (listado, nueva, detalle con consumos MP, completar) |
| `app/empleado/pedidos` | Listado y detalle pedidos |
| `app/empleado/produccion` | Listado y detalle órdenes; poner en proceso; consumos y completar |
| `app/cliente` | Dashboard; pedidos (listado y detalle); precios |
| `app/api/alertas-stock` | API route para alertas de stock |
| `components/ui` | Componentes shadcn (incluye tooltip) |
| `components/admin` | Sidebar, skeletons, empty-state, botones eliminar |
| `lib/supabase` | client, server, admin, middleware |
| `lib/telegram.ts` | Integración Telegram |
| `types` | database.ts |
