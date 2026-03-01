import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

const statusLabel: Record<string, string> = {
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
  cancelado: 'destructive',
}

type PedidoRow = {
  id: string
  order_number: string
  status: string
  delivery_date: string | null
  customers: { business_name: string } | null
}

export default async function EmpleadoPedidosPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = await createClient()
  const filtroStatus = searchParams.status || 'todos'

  let query = supabase
    .from('orders')
    .select(`
      id, order_number, status, delivery_date, created_at,
      customers(business_name)
    `)
    .order('created_at', { ascending: false })

  // Empleado no ve borradores: excluir si no hay filtro de estado
  if (filtroStatus !== 'todos') {
    query = query.eq('status', filtroStatus)
  } else {
    query = query.neq('status', 'borrador')
  }

  const { data: pedidosData } = await query
  const pedidos = (pedidosData ?? []) as unknown as PedidoRow[]

  const tabs = [
    { key: 'todos', label: 'Todos' },
    { key: 'confirmado', label: 'Confirmados' },
    { key: 'en_preparacion', label: 'En Preparación' },
    { key: 'listo', label: 'Listos' },
    { key: 'entregado', label: 'Entregados' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos Asignados</h1>
        <p className="text-muted-foreground text-sm">
          {pedidos?.length ?? 0} pedido{pedidos?.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <Link key={tab.key} href={`/empleado/pedidos?status=${tab.key}`}>
            <Button
              variant={filtroStatus === tab.key ? 'default' : 'outline'}
              size="sm"
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

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
                <th className="text-left p-3 font-medium">Fecha entrega</th>
                <th className="text-left p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pedidos.map((pedido: PedidoRow) => (
                <tr key={pedido.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs font-medium">
                    {pedido.order_number}
                  </td>
                  <td className="p-3">
                    {pedido.customers?.business_name ?? '—'}
                  </td>
                  <td className="p-3">
                    <Badge variant={statusColor[pedido.status]}>
                      {statusLabel[pedido.status] ?? pedido.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {pedido.delivery_date
                      ? new Date(pedido.delivery_date + 'T00:00:00').toLocaleDateString('es-MX')
                      : '—'}
                  </td>
                  <td className="p-3">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/empleado/pedidos/${pedido.id}`}>Ver</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
