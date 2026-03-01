'use client'

import { useFormState } from 'react-dom'
import { crearPedido } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface Producto {
  id: string
  name: string
  unit: string
  base_price: number
  sku: string
}

interface Cliente {
  id: string
  business_name: string
  contact_name: string
}

interface CartItem {
  product_id: string
  name: string
  unit: string
  quantity: number
  base_price: number
}

export default function FormNuevoPedido({
  clientes,
  productos,
}: {
  clientes: Cliente[]
  productos: Producto[]
}) {
  const [state, formAction] = useFormState(crearPedido, null)
  const [clienteId, setClienteId] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('')

  const agregarProducto = () => {
    const prod = productos.find(p => p.id === productoId)
    if (!prod || !cantidad || Number(cantidad) <= 0) return

    const existe = cart.find(i => i.product_id === productoId)
    if (existe) {
      setCart(cart.map(i =>
        i.product_id === productoId
          ? { ...i, quantity: i.quantity + Number(cantidad) }
          : i
      ))
    } else {
      setCart([...cart, {
        product_id: prod.id,
        name: prod.name,
        unit: prod.unit,
        quantity: Number(cantidad),
        base_price: Number(prod.base_price),
      }])
    }
    setCantidad('')
    setProductoId('')
  }

  const quitarProducto = (product_id: string) => {
    setCart(cart.filter(i => i.product_id !== product_id))
  }

  const subtotalEstimado = cart.reduce((acc, i) => acc + i.base_price * i.quantity, 0)

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="customer_id" value={clienteId} />
      <input type="hidden" name="items" value={JSON.stringify(
        cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      )} />

      {state?.error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-md border border-destructive/20">
          {state.error}
        </div>
      )}

      {/* Cliente */}
      <div className="space-y-2">
        <Label htmlFor="customer_id">Cliente *</Label>
        <Select
          value={clienteId}
          onValueChange={setClienteId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un cliente..." />
          </SelectTrigger>
          <SelectContent>
            {clientes.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.business_name}
                {c.contact_name && (
                  <span className="text-muted-foreground ml-2 text-xs">({c.contact_name})</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Los precios personalizados se aplicarán automáticamente al guardar
        </p>
      </div>

      {/* Agregar productos al carrito */}
      <div className="space-y-3">
        <Label>Productos *</Label>
        <div className="flex gap-2">
          <Select value={productoId} onValueChange={setProductoId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecciona un producto..." />
            </SelectTrigger>
            <SelectContent>
              {productos.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                  <span className="text-muted-foreground ml-2 text-xs">
                    ${Number(p.base_price).toLocaleString('es-MX')} / {p.unit}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Cant."
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                agregarProducto()
              }
            }}
            className="w-24"
            min="0.001"
            step="0.001"
          />
          <Button
            type="button"
            variant={productoId && cantidad && Number(cantidad) > 0 ? 'default' : 'outline'}
            onClick={agregarProducto}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Carrito */}
        {cart.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
            <ShoppingCart className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Agrega productos al pedido
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Producto</th>
                  <th className="text-right p-3 font-medium">Cantidad</th>
                  <th className="text-right p-3 font-medium">P. Base</th>
                  <th className="text-right p-3 font-medium">Subtotal est.</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cart.map(item => (
                  <tr key={item.product_id}>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      ${item.base_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-medium">
                      ${(item.base_price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => quitarProducto(item.product_id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 border-t">
                <tr>
                  <td colSpan={3} className="p-3 text-right font-medium">
                    Subtotal estimado (precio base):
                  </td>
                  <td className="p-3 text-right font-bold">
                    ${subtotalEstimado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            <p className="text-xs text-muted-foreground px-3 pb-3">
              * El precio final puede variar si el cliente tiene precios personalizados
            </p>
          </div>
        )}
      </div>

      {/* Datos de entrega */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="delivery_date">Fecha de entrega</Label>
          <Input type="date" name="delivery_date" id="delivery_date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="delivery_address">Dirección de entrega</Label>
          <Input
            name="delivery_address"
            id="delivery_address"
            placeholder="Opcional — usa la del cliente si se deja vacío"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas del pedido</Label>
        <Textarea
          name="notes"
          id="notes"
          placeholder="Indicaciones especiales, referencias, etc."
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={cart.length === 0 || !clienteId}>
          Crear Pedido
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/pedidos">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
