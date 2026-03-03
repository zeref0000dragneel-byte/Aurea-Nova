'use client'

import { useState } from 'react'
import { UserPlus, Key } from 'lucide-react'
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
import { FormCrearEmpleado } from './form-crear-empleado'
import { FormDarAccesoCliente } from './form-dar-acceso-cliente'
import { BotonToggleUsuario } from './boton-toggle-usuario'
import type { ClienteOption } from './form-dar-acceso-cliente'

export type EmpleadoRow = {
  id: string
  full_name: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  email: string
}

export type ClienteAccesoRow = {
  id: string
  full_name: string | null
  is_active: boolean
  created_at: string
  email: string
  business_name: string
}

export function UsuariosContent({
  empleados,
  clientesAcceso,
  clientesParaSelect,
}: {
  empleados: EmpleadoRow[]
  clientesAcceso: ClienteAccesoRow[]
  clientesParaSelect: ClienteOption[]
}) {
  const [formEmpleadoVisible, setFormEmpleadoVisible] = useState(false)
  const [formClienteVisible, setFormClienteVisible] = useState(false)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-gray-500">
          Empleados y clientes con acceso al sistema
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-amber-200 text-amber-800 hover:bg-amber-50"
          onClick={() => {
            setFormEmpleadoVisible((v) => !v)
            setFormClienteVisible(false)
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Empleado
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-amber-200 text-amber-800 hover:bg-amber-50"
          onClick={() => {
            setFormClienteVisible((v) => !v)
            setFormEmpleadoVisible(false)
          }}
        >
          <Key className="mr-2 h-4 w-4" />
          Dar Acceso a Cliente
        </Button>
      </div>

      <div className="mb-10 space-y-6">
        <FormCrearEmpleado visible={formEmpleadoVisible} />
        <FormDarAccesoCliente visible={formClienteVisible} clientes={clientesParaSelect} />
      </div>

      {/* Sección Empleados */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Empleados</h2>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="h-11 font-semibold text-gray-700">Nombre completo</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Teléfono</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Estado</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Fecha de creación</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {empleados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    No hay empleados registrados
                  </TableCell>
                </TableRow>
              ) : (
                empleados.map((e) => (
                  <TableRow key={e.id} className="border-gray-100 hover:bg-muted/30">
                    <TableCell className="font-medium text-gray-900">
                      {e.full_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-600">{e.phone ?? '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={e.is_active ? 'default' : 'secondary'}
                        className={
                          e.is_active
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }
                      >
                        {e.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {e.created_at
                        ? new Date(e.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <BotonToggleUsuario
                        userId={e.id}
                        isActive={e.is_active}
                        role="empleado"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Sección Clientes con acceso */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Clientes con acceso</h2>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="h-11 font-semibold text-gray-700">Nombre completo</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Email</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Cliente vinculado</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700">Estado</TableHead>
                <TableHead className="h-11 font-semibold text-gray-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {clientesAcceso.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    No hay clientes con acceso
                  </TableCell>
                </TableRow>
              ) : (
                clientesAcceso.map((c) => (
                  <TableRow key={c.id} className="border-gray-100 hover:bg-muted/30">
                    <TableCell className="font-medium text-gray-900">
                      {c.full_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-600">{c.email}</TableCell>
                    <TableCell className="text-gray-600">{c.business_name}</TableCell>
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
                      <BotonToggleUsuario
                        userId={c.id}
                        isActive={c.is_active}
                        role="cliente"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
