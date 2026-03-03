import { createClient } from '@/lib/supabase/server'
import FormNuevaCompra from './form-nueva-compra'

export default async function NuevaCompraPage() {
  const supabase = await createClient()

  const { data: materiasPrimasData } = await supabase
    .from('raw_materials')
    .select('id, name, unit, unit_cost, supplier')
    .eq('is_active', true)
    .order('name')

  const materiasPrimas = (materiasPrimasData ?? []).map((r) => ({
    id: (r as { id: string }).id,
    name: (r as { name: string }).name,
    unit: (r as { unit: string }).unit,
    unit_cost: Number((r as { unit_cost: number }).unit_cost ?? 0),
    supplier: (r as { supplier: string | null }).supplier ?? '',
  }))

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900">
        Nueva Compra
      </h1>
      <FormNuevaCompra materiasPrimas={materiasPrimas} />
    </div>
  )
}
