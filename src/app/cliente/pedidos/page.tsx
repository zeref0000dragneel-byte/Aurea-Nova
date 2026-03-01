import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShoppingCart } from 'lucide-react'

const statusLabel: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColor: Record<string, string> = {
  borrador: 'secondary',
  confirmado: 'default',
  en_preparacion: 'default',
  listo: 'default',
  entregado: 'default',
  cancelado: 'destructive',
}

const paymentColor: Record<string, string> = {
  pendiente: 'destructive',
  parcial: 'secondary',
  pagado: 'default',
}

export default async function ClientePedidosPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, business_name')
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

  const filtroStatus = searchParams.status ?? 'todos'

  let query = supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, paid_amount, delivery_date, created_at')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  if (filtroStatus === 'activos') {
    query = query.in('status', ['borrador', 'confirmado', 'en_preparacion', 'listo'])
  } else if (filtroStatus === 'entregados') {
    query = query.eq('status', 'entregado')
  } else if (filtroStatus === 'cancelados') {
    query = query.eq('status', 'cancelado')
  }
  // 'todos' → sin filtro adicional

  const { data: pedidos } = await query

  const tabs = [
    { key: 'todos', label: 'Todos' },
    { key: 'activos', label: 'Activos' },
    { key: 'entregados', label: 'Entregados' },
    { key: 'cancelados', label: 'Cancelados' },
  ]

  const list = (pedidos ?? []) as Array<{
    id: string
    order_number: string
    status: string
    payment_status: string
    total: number
    paid_amount: number
    delivery_date: string | null
  }>

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {list.length} pedido{list.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            asChild
            variant={filtroStatus === tab.key ? 'default' : 'outline'}
            size="sm"
          >
            <Link href={`/cliente/pedidos?status=${tab.key}`}>{tab.label}</Link>
          </Button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <ShoppingCart className="w-10 h-10" />
            <p>No hay pedidos en esta categoría</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent bg-muted/50">
                    <TableHead className="font-semibold text-gray-700">Pedido</TableHead>
                    <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                    <TableHead className="font-semibold text-gray-700">Pago</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Total</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Por pagar</TableHead>
                    <TableHead className="font-semibold text-gray-700">Fecha entrega</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((pedido) => {
                    const porPagar = Number(pedido.total) - Number(pedido.paid_amount)
                    return (
                      <TableRow key={pedido.id} className="border-gray-100 hover:bg-muted/30">
                        <TableCell className="font-mono text-sm font-medium">
                          {pedido.order_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor[pedido.status] as 'secondary' | 'default' | 'destructive'}>
                            {statusLabel[pedido.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentColor[pedido.payment_status] as 'secondary' | 'default' | 'destructive'}>
                            {pedido.payment_status.charAt(0).toUpperCase() + pedido.payment_status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(pedido.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          {porPagar > 0 ? (
                            <span className="text-destructive font-medium">
                              ${porPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {pedido.delivery_date
                            ? new Date(pedido.delivery_date + 'T00:00:00').toLocaleDateString('es-MX')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/cliente/pedidos/${pedido.id}`}>Ver detalle</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
