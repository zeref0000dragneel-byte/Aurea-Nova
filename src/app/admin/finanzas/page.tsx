import { createClient } from '@/lib/supabase/server'
import { DashboardFinanciero } from './dashboard-financiero'

const now = new Date()
const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

export default async function FinanzasPage() {
  const supabase = await createClient()

  const [
    { data: ordersMesActual },
    { data: ordersMesAnterior },
    { data: paymentsMesActual },
    { data: ordersConDeuda },
    { data: ultimosPedidos },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total')
      .neq('status', 'cancelado')
      .gte('created_at', inicioMesActual),
    supabase
      .from('orders')
      .select('id, total')
      .neq('status', 'cancelado')
      .gte('created_at', inicioMesAnterior)
      .lte('created_at', finMesAnterior),
    supabase
      .from('payments')
      .select('amount')
      .gte('created_at', inicioMesActual),
    supabase
      .from('orders')
      .select('id, total, paid_amount, customer_id, payment_status, customers(business_name)')
      .neq('payment_status', 'pagado')
      .neq('status', 'cancelado'),
    supabase
      .from('orders')
      .select('order_number, status, payment_status, total, paid_amount, created_at, customers(business_name)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const idsPedidosMesActual = (ordersMesActual ?? []).map((o) => o.id)
  const { data: orderItemsConOrdenProducto } =
    idsPedidosMesActual.length > 0
      ? await supabase
          .from('order_items')
          .select('product_id, quantity, subtotal')
          .in('order_id', idsPedidosMesActual)
      : { data: [] }

  // ─── Métricas de ventas ───────────────────────────────────────────────────
  const ventasMesActual = (ordersMesActual ?? []).reduce((sum, o) => sum + Number(o.total), 0)
  const ventasMesAnterior = (ordersMesAnterior ?? []).reduce((sum, o) => sum + Number(o.total), 0)
  const pedidosMesActual = (ordersMesActual ?? []).length
  const ticketPromedio = pedidosMesActual > 0 ? ventasMesActual / pedidosMesActual : 0

  // ─── Métricas de cobranza ─────────────────────────────────────────────────
  const totalCobrado = (paymentsMesActual ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
  const ordersConDeudaList = (ordersConDeuda ?? []) as unknown as Array<{
    total: number
    paid_amount: number
    payment_status: string
    customers: { business_name: string } | null
    customer_id: string
  }>
  const deudaTotal = ordersConDeudaList.reduce(
    (sum, o) => sum + (Number(o.total) - Number(o.paid_amount)),
    0
  )
  const pedidosPendientesPago = ordersConDeudaList.filter((o) => o.payment_status === 'pendiente').length

  // ─── Deuda por cliente (top 5) ─────────────────────────────────────────────
  const deudaPorClienteMap = new Map<string, { business_name: string; deuda: number }>()
  for (const o of ordersConDeudaList) {
    const name = (o.customers as { business_name: string } | null)?.business_name ?? 'Sin nombre'
    const deuda = Number(o.total) - Number(o.paid_amount)
    const current = deudaPorClienteMap.get(o.customer_id)
    if (current) {
      current.deuda += deuda
    } else {
      deudaPorClienteMap.set(o.customer_id, { business_name: name, deuda })
    }
  }
  const deudaPorCliente = Array.from(deudaPorClienteMap.values())
    .sort((a, b) => b.deuda - a.deuda)
    .slice(0, 5)

  // ─── Productos más vendidos del mes (top 5) ───────────────────────────────
  const itemsDelMes = (orderItemsConOrdenProducto ?? []) as Array<{
    product_id: string
    quantity: number
    subtotal: number
  }>
  const productIds = Array.from(new Set(itemsDelMes.map((i) => i.product_id)))
  const { data: productsData } =
    productIds.length > 0
      ? await supabase.from('products').select('id, name, unit').in('id', productIds)
      : { data: [] }

  const productMap = new Map(
    (productsData ?? []).map((p) => [p.id, { name: p.name, unit: p.unit }])
  )

  const productosAgrupados = new Map<
    string,
    { quantity: number; subtotal: number; name: string; unit: string }
  >()
  for (const i of itemsDelMes) {
    const info = productMap.get(i.product_id) ?? { name: 'Desconocido', unit: 'pza' }
    const current = productosAgrupados.get(i.product_id)
    if (current) {
      current.quantity += Number(i.quantity)
      current.subtotal += Number(i.subtotal)
    } else {
      productosAgrupados.set(i.product_id, {
        quantity: Number(i.quantity),
        subtotal: Number(i.subtotal),
        name: info.name,
        unit: info.unit,
      })
    }
  }
  const productosMasVendidos = Array.from(productosAgrupados.entries())
    .map(([product_id, v]) => ({ product_id, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // ─── Últimos 8 pedidos ───────────────────────────────────────────────────
  type PedidoRow = {
    order_number: string
    status: string
    payment_status: string
    total: number
    paid_amount: number
    created_at: string
    customers: { business_name: string } | null
  }
  const pedidosRecientes = (ultimosPedidos ?? []) as unknown as PedidoRow[]

  return (
    <DashboardFinanciero
      ventasMesActual={ventasMesActual}
      ventasMesAnterior={ventasMesAnterior}
      pedidosMesActual={pedidosMesActual}
      ticketPromedio={ticketPromedio}
      totalCobrado={totalCobrado}
      deudaTotal={deudaTotal}
      pedidosPendientesPago={pedidosPendientesPago}
      deudaPorCliente={deudaPorCliente}
      productosMasVendidos={productosMasVendidos}
      pedidosRecientes={pedidosRecientes}
    />
  )
}
