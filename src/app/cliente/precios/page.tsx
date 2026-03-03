import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type ProductRow = {
  id: string
  name: string
  sku: string | null
  unit: string
  base_price: number
  is_active: boolean
}

type CustomerPriceRow = {
  product_id: string
  fixed_price: number | null
  discount_pct: number | null
  is_active: boolean
}

export default async function ClientePreciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user.email)
    .eq('is_active', true)
    .maybeSingle()

  if (!customer) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <p className="text-muted-foreground font-medium">
          Tu cuenta no está vinculada a ningún cliente. Contacta al administrador.
        </p>
      </div>
    )
  }

  const [
    { data: preciosCliente },
    { data: productos },
  ] = await Promise.all([
    supabase
      .from('customer_prices')
      .select('product_id, fixed_price, discount_pct, is_active')
      .eq('customer_id', customer.id)
      .eq('is_active', true),
    supabase
      .from('products')
      .select('id, name, sku, unit, base_price, is_active')
      .eq('is_active', true)
      .order('name'),
  ])

  const preciosMap = new Map<string, CustomerPriceRow>()
  for (const p of preciosCliente ?? []) {
    preciosMap.set(p.product_id, p as CustomerPriceRow)
  }

  const productosList = (productos ?? []) as unknown as ProductRow[]
  const items: Array<{
    id: string
    name: string
    sku: string | null
    unit: string
    basePrice: number
    finalPrice: number
    hasPersonalizado: boolean
    discountPct: number | null
  }> = []

  for (const prod of productosList) {
    const cp = preciosMap.get(prod.id)
    let finalPrice = Number(prod.base_price)
    let hasPersonalizado = false
    let discountPct: number | null = null

    if (cp) {
      hasPersonalizado = true
      if (cp.fixed_price != null && cp.fixed_price > 0) {
        finalPrice = Number(cp.fixed_price)
      } else if (cp.discount_pct != null && cp.discount_pct > 0) {
        discountPct = Number(cp.discount_pct)
        finalPrice = Number(prod.base_price) * (1 - discountPct / 100)
      }
    }

    items.push({
      id: prod.id,
      name: prod.name,
      sku: prod.sku,
      unit: prod.unit,
      basePrice: Number(prod.base_price),
      finalPrice,
      hasPersonalizado,
      discountPct,
    })
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Precios</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Precios personalizados para tu cuenta
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-gray-900">{item.name}</h2>
                  {item.sku && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.sku}</p>
                  )}
                  <p className="text-xs text-muted-foreground uppercase mt-0.5">{item.unit}</p>
                </div>
                {item.hasPersonalizado ? (
                  <Badge className="bg-green-600 hover:bg-green-600">Precio especial</Badge>
                ) : (
                  <Badge variant="secondary">Precio estándar</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-baseline gap-2">
                {item.discountPct != null && item.discountPct > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${item.basePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                )}
                <span className="text-xl font-bold text-gray-900">
                  ${item.finalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                {item.discountPct != null && item.discountPct > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {item.discountPct}% desc.
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          No hay productos activos para mostrar.
        </p>
      )}
    </div>
  )
}
