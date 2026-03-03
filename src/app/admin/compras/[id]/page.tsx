import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { DetalleCompra } from './detalle-compra'

type PurchaseData = {
  id: string
  raw_material_id: string
  supplier: string
  quantity: number
  unit_cost: number
  total: number
  paid_amount: number
  payment_status: 'pendiente' | 'parcial' | 'pagado'
  purchase_date: string
  invoice_number: string | null
  notes: string | null
  received_quantity: number | null
  reception_notes: string | null
  reception_status: 'pendiente' | 'recibido_completo' | 'recibido_parcial' | 'cancelado'
  raw_materials: { name: string; unit: string } | null
}

type PaymentRow = {
  id: string
  amount: number
  payment_method: string
  reference: string | null
  notes: string | null
  created_at: string
}

export default async function CompraDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = createAdminClient()

  const [
    { data: purchase, error: purchaseError },
    { data: paymentsData },
  ] = await Promise.all([
    supabase
      .from('purchases')
      .select(`
        id,
        raw_material_id,
        supplier,
        quantity,
        unit_cost,
        total,
        paid_amount,
        payment_status,
        purchase_date,
        invoice_number,
        notes,
        received_quantity,
        reception_notes,
        reception_status,
        raw_materials(name, unit)
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('purchase_payments')
      .select('id, amount, payment_method, reference, notes, created_at')
      .eq('purchase_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (purchaseError || !purchase) {
    notFound()
  }

  const compra = purchase as unknown as PurchaseData
  const pagos = (paymentsData ?? []) as unknown as PaymentRow[]

  return (
    <div className="p-8">
      <DetalleCompra compra={compra} pagos={pagos} />
    </div>
  )
}
