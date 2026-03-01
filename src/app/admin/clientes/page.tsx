import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Users, Pencil, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BotonEliminarCliente } from '@/components/admin/boton-eliminar-cliente'

export default async function AdminClientesPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('business_name')

  const customerList = customers ?? []
  const hasCustomers = customerList.length > 0

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Clientes
          </h1>
          <p className="text-sm text-gray-500">
            Gestión de clientes mayoristas
          </p>
        </div>
        <Button
          asChild
          className="mt-2 shrink-0 bg-amber-500 font-medium text-white hover:bg-amber-600 sm:mt-0"
        >
          <Link href="/admin/clientes/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {hasCustomers ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="h-11 font-semibold text-gray-700">Empresa</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Contacto</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Email</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Teléfono</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Días de Crédito</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Límite de Crédito</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Estado</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {customerList.map((c) => (
                <TableRow key={c.id} className="border-gray-100 hover:bg-muted/30">
                  <TableCell className="font-medium text-gray-900">
                    {c.business_name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {c.contact_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {c.email ?? '—'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {c.phone ?? '—'}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {c.credit_days}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    ${Number(c.credit_limit).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.is_active ? 'default' : 'secondary'}
                      className={
                        c.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }
                    >
                      {c.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                        asChild
                      >
                        <Link
                          href={`/admin/clientes/${c.id}/precios`}
                          title="Precios"
                        >
                          <Tag className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                        asChild
                      >
                        <Link href={`/admin/clientes/${c.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <BotonEliminarCliente customerId={c.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-7 w-7 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            No hay clientes registrados
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Agrega el primer cliente con el botón superior
          </p>
        </div>
      )}
    </div>
  )
}
