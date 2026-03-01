/**
 * Script para probar la creación del producto "Miel Multifloral 1kg".
 * Carga .env.local, inserta el producto y verifica que aparece en la lista.
 * Ejecutar: node --env-file=.env.local scripts/crear-producto-prueba.mjs
 * (Si Node < 20.6, cargar env manualmente o usar dotenv.)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const envPath = join(root, '.env.local')

if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8')
  content.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

const PRODUCTO = {
  name: 'Miel Multifloral 1kg',
  categoryName: 'Miel en Frascos',
  base_price: 85,
  cost_price: 45,
  unit: 'pza',
  min_stock: 0,
  is_active: true,
}

async function main() {
  console.log('1. Buscando categoría "' + PRODUCTO.categoryName + '"...')
  const { data: categories, error: errCat } = await supabase
    .from('product_categories')
    .select('id')
    .ilike('name', PRODUCTO.categoryName)

  if (errCat) {
    console.error('Error al obtener categorías:', errCat.message)
    process.exit(1)
  }

  let categoryId = categories?.[0]?.id
  if (!categoryId) {
    console.log('   Categoría no existe. Creando...')
    const { data: newCat, error: insCat } = await supabase
      .from('product_categories')
      .insert({ name: PRODUCTO.categoryName, sort_order: 0, is_active: true })
      .select('id')
      .single()
    if (insCat) {
      console.error('Error al crear categoría:', insCat.message)
      process.exit(1)
    }
    categoryId = newCat.id
    console.log('   Categoría creada:', categoryId)
  } else {
    console.log('   Categoría encontrada:', categoryId)
  }

  const sku = 'PROD-' + Date.now()
  console.log('2. Insertando producto:', PRODUCTO.name, 'SKU', sku)
  const { error: errInsert } = await supabase.from('products').insert({
    sku,
    name: PRODUCTO.name,
    description: null,
    category_id: categoryId,
    base_price: PRODUCTO.base_price,
    cost_price: PRODUCTO.cost_price,
    unit: PRODUCTO.unit,
    min_stock: PRODUCTO.min_stock,
    is_active: PRODUCTO.is_active,
  })

  if (errInsert) {
    console.error('Error al insertar producto:', errInsert.message)
    process.exit(1)
  }
  console.log('   Producto insertado correctamente.')

  console.log('3. Verificando que aparece en la lista de productos...')
  const { data: products, error: errList } = await supabase
    .from('products')
    .select('id, name, sku, base_price, unit')
    .order('created_at', { ascending: false })
    .limit(20)

  if (errList) {
    console.error('Error al listar productos:', errList.message)
    process.exit(1)
  }

  const found = products?.find((p) => p.name === PRODUCTO.name)
  if (!found) {
    console.error('   No se encontró el producto en la lista.')
    process.exit(1)
  }

  console.log('   OK: Producto encontrado en la tabla:', found.name, '| SKU:', found.sku, '| Precio:', found.base_price, '| Unidad:', found.unit)
  console.log('')
  console.log('Prueba completada. Al guardar desde el formulario, la app redirige a /admin/productos y este producto aparecerá en la tabla.')
}

main()
