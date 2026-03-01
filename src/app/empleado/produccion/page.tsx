import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Factory, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type OrderStatus = 'pendiente' | 'en_proceso'

type OrderRow = {
  id: string
  planned_quantity: number
  status: OrderStatus
  created_at: string
  products: { name: string } | null
}

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  en_proceso: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
}

export default async function EmpleadoProduccionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('production_orders')
    .select(
      `
      id,
      planned_quantity,
      status,
      created_at,
      products ( name )
    `
    )
    .eq('assigned_to', user.id)
    .in('status', ['pendiente', 'en_proceso'])
    .order('created_at', { ascending: false })

  const orderList = (orders ?? []) as unknown as OrderRow[]
  const hasOrders = orderList.length > 0

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        Mis órdenes de producción
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Órdenes asignadas a ti (pendientes o en proceso)
      </p>

      {hasOrders ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderList.map((row) => {
            const productName = row.products?.name ?? '—'
            const status = (row.status ?? 'pendiente') as OrderStatus
            const createdDate = row.created_at
              ? new Date(row.created_at).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'
            return (
              <Card
                key={row.id}
                className="border-gray-200 transition-shadow hover:shadow-md"
              >
                <CardContent className="p-5">
                  <p className="font-medium text-gray-900">{productName}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Cantidad planificada:{' '}
                    {Number(row.planned_quantity).toLocaleString('es-MX')}
                  </p>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'border font-medium',
                        STATUS_BADGE_CLASS[status]
                      )}
                    >
                      {STATUS_LABEL[status]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{createdDate}</p>
                  <Button
                    asChild
                    className="mt-4 w-full bg-amber-500 text-white hover:bg-amber-600"
                  >
                    <Link href={`/empleado/produccion/${row.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Ver / Trabajar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Factory className="h-7 w-7 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            No tienes órdenes asignadas
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Las órdenes que te asignen aparecerán aquí
          </p>
        </div>
      )}
    </div>
  )
}
