import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ShoppingCart } from 'lucide-react'

const statusLabel: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  borrador: 'secondary',
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
  cancelado: 'destructive',
}

const paymentColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendiente: 'destructive',
  parcial: 'secondary',
  pagado: 'default',
}

type PedidoRow = {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  paid_amount: number
  delivery_date: string | null
  created_at: string
  customers: { business_name: string } | null
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = await createClient()
  const filtroStatus = searchParams.status || 'todos'

  let query = supabase
    .from('orders')
    .select(`
      id, order_number, status, payment_status,
      total, paid_amount, delivery_date, created_at,
      customers(business_name)
    `)
    .order('created_at', { ascending: false })

  if (filtroStatus !== 'todos') {
    query = query.eq('status', filtroStatus)
  }

  const { data: pedidosData } = await query
  const pedidos = (pedidosData ?? []) as unknown as PedidoRow[]

  const tabs = [
    { key: 'todos', label: 'Todos' },
    { key: 'borrador', label: 'Borrador' },
    { key: 'confirmado', label: 'Confirmados' },
    { key: 'en_preparacion', label: 'En Preparación' },
    { key: 'listo', label: 'Listos' },
    { key: 'entregado', label: 'Entregados' },
    { key: 'cancelado', label: 'Cancelados' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground text-sm">
            {pedidos?.length ?? 0} pedido{pedidos?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pedidos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Pedido
          </Link>
        </Button>
      </div>

      {/* Tabs de filtro */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <Link key={tab.key} href={`/admin/pedidos?status=${tab.key}`}>
            <Button
              variant={filtroStatus === tab.key ? 'default' : 'outline'}
              size="sm"
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Tabla */}
      {!pedidos || pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <ShoppingCart className="w-10 h-10" />
          <p>No hay pedidos en esta categoría</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Pedido</th>
                <th className="text-left p-3 font-medium">Cliente</th>
                <th className="text-left p-3 font-medium">Estado</th>
                <th className="text-left p-3 font-medium">Pago</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-right p-3 font-medium">Por cobrar</th>
                <th className="text-left p-3 font-medium">Entrega</th>
                <th className="text-left p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pedidos.map((pedido: PedidoRow) => {
                return (
                  <tr key={pedido.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs font-medium">
                      {pedido.order_number}
                    </td>
                    <td className="p-3">
                      {pedido.customers?.business_name ?? '—'}
                    </td>
                    <td className="p-3">
                      <Badge variant={statusColor[pedido.status]}>
                        {statusLabel[pedido.status]}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={paymentColor[pedido.payment_status]}>
                        {pedido.payment_status.charAt(0).toUpperCase() + pedido.payment_status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-medium">
                      ${Number(pedido.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right">
                      {pedido.status === 'cancelado' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : pedido.payment_status === 'pagado' ? (
                        <span className="text-green-600 font-medium">Pagado</span>
                      ) : (
                        <span className="text-destructive font-medium">
                          ${(Number(pedido.total) - Number(pedido.paid_amount)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {pedido.delivery_date
                        ? new Date(pedido.delivery_date + 'T00:00:00').toLocaleDateString('es-MX')
                        : '—'}
                    </td>
                    <td className="p-3">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/pedidos/${pedido.id}`}>Ver</Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
