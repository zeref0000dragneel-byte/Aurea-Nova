# Estructura del proyecto Aurea Flow

Estructura actual del proyecto. Excluye `node_modules/`, `.next/`, `.git/`. Las rutas de admin incluyen listados, formularios nuevo/editar y Server Actions donde aplica.

```
aurea-flow/
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
│
└── src/
    ├── middleware.ts
    │
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   │
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   └── login/
    │   │       ├── actions.ts
    │   │       └── page.tsx
    │   │
    │   ├── admin/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/
    │   │   │   └── page.tsx          # Dashboard operativo (métricas, alertas, links)
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
    │   │   ├── clientes/
    │   │   │   ├── page.tsx
    │   │   │   ├── actions.ts
    │   │   │   ├── nuevo/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── form-cliente-nuevo.tsx
    │   │   │   └── [id]/
    │   │   │       └── editar/
    │   │   │           ├── page.tsx
    │   │   │           └── form-cliente-editar.tsx
    │   │   ├── configuracion/
    │   │   │   ├── page.tsx
    │   │   │   ├── actions.ts
    │   │   │   ├── form-crear-categoria-inline.tsx
    │   │   │   └── categorias/
    │   │   │       └── [id]/
    │   │   │           └── editar/
    │   │   │               ├── page.tsx
    │   │   │               └── form-categoria-editar.tsx
    │   │   ├── pedidos/
    │   │   │   └── .gitkeep
    │   │   └── produccion/
    │   │       ├── page.tsx          # Listado órdenes (filtros, asignado, productos)
    │   │       ├── actions.ts        # crearOrdenProduccion, actualizarEstadoOrden, completarOrden, agregarConsumoMP, eliminarConsumoMP
    │   │       ├── nuevo/
    │   │       │   ├── page.tsx
    │   │       │   └── form-nueva-orden.tsx
    │   │       └── [id]/
    │   │           ├── page.tsx     # Detalle orden: cabecera, consumos MP, completar/resumen
    │   │           ├── boton-eliminar-consumo-mp.tsx
    │   │           ├── form-agregar-consumo-mp.tsx
    │   │           └── form-completar-orden.tsx
    │   │
    │   ├── empleado/
    │   │   ├── layout.tsx
    │   │   ├── pedidos/
    │   │   │   └── page.tsx
    │   │   └── produccion/
    │   │       ├── page.tsx         # Listado órdenes para empleado
    │   │       └── [id]/
    │   │           ├── page.tsx     # Detalle orden (consumos, completar)
    │   │           └── boton-poner-en-proceso.tsx
    │   │
    │   └── cliente/
    │       ├── layout.tsx
    │       ├── dashboard/
    │       │   └── page.tsx
    │       ├── pedidos/
    │       │   └── .gitkeep
    │       └── precios/
    │           └── .gitkeep
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
    │   │   └── toaster.tsx
    │   ├── admin/
    │   │   ├── boton-eliminar-producto.tsx
    │   │   ├── boton-eliminar-categoria.tsx
    │   │   ├── boton-eliminar-cliente.tsx
    │   │   └── boton-eliminar-materia-prima.tsx
    │   ├── empleado/
    │   │   └── .gitkeep
    │   ├── cliente/
    │   │   └── .gitkeep
    │   └── shared/
    │       └── .gitkeep
    │
    ├── lib/
    │   ├── utils.ts
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
| `/admin/dashboard` | Dashboard operativo: métricas (órdenes activas, MP en alerta, lotes en stock, lotes por vencer), tablas de alerta, links Ver Producción / Ver Inventario |
| `/admin/productos` | Lista productos; nuevo en `/admin/productos/nuevo`; editar en `/admin/productos/[id]/editar` |
| `/admin/inventario` | Lista materias primas; link "Ver Lotes"; nuevo/editar en subrutas |
| `/admin/inventario/lotes` | Inventario de producto terminado (lotes FIFO, filtro por producto, estado Disponible/Agotado/Por vencer) |
| `/admin/clientes` | Lista clientes; nuevo/editar análogos |
| `/admin/configuracion` | Configuración (categorías); editar en `/admin/configuracion/categorias/[id]/editar` |
| `/admin/pedidos` | Placeholder |
| `/admin/produccion` | Listado órdenes de producción (filtros); nueva en `/admin/produccion/nuevo`; detalle en `/admin/produccion/[id]` |
| `/empleado/pedidos` | Pedidos empleado |
| `/empleado/produccion` | Listado órdenes producción empleado; detalle en `/empleado/produccion/[id]` |
| `/cliente/dashboard` | Dashboard cliente |
| `/cliente/pedidos` | Placeholder |
| `/cliente/precios` | Placeholder |

## Resumen por área

| Área | Contenido principal |
|------|---------------------|
| `app/(auth)/login` | Login, actions para autenticar y redirigir por rol |
| `app/admin/dashboard` | 4 cards métricas, tablas MP en alerta y lotes por vencer, links Ver Producción / Ver Inventario |
| `app/admin/productos` | CRUD productos (listado, nuevo, editar, actions, botón eliminar) |
| `app/admin/inventario` | CRUD materias primas; link a lotes; `lotes/` = inventario producto terminado (FIFO, filtro producto) |
| `app/admin/produccion` | Listado órdenes (filtros, products(name), assigned_profile full_name); nueva orden; detalle [id] con consumos MP (planned_quantity), agregar/eliminar consumo, completar orden (inventory_lots, inventory_movements) |
| `app/admin/clientes` | CRUD clientes |
| `app/admin/configuracion` | Categorías: listado, crear inline, editar/eliminar en subruta |
| `app/empleado/produccion` | Listado y detalle órdenes; poner en proceso; agregar consumo y completar (reusa componentes/actions de admin) |
| `app/cliente` | Dashboard; pedidos y precios placeholder |
| `components/ui` | Componentes shadcn (botones, tablas, inputs, cards, etc.) |
| `components/admin` | Botones eliminar (producto, categoría, cliente, materia prima) |
| `lib/supabase` | client (navegador), server (RSC), admin (service role para actions), middleware |
| `types` | database.ts con tipos (Profile, Customer, Product, ProductCategory, Order, production_orders, inventory_lots, etc.) |
