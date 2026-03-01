import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegram } from '@/lib/telegram'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: materials } = await supabase
    .from('raw_materials')
    .select('id, name, unit, current_stock, min_stock')
    .eq('is_active', true)

  const list = materials ?? []
  const alertas = list.filter(
    (m) => Number(m.current_stock) <= Number(m.min_stock)
  )

  if (alertas.length > 0) {
    const lineas = alertas.map(
      (m) =>
        `• ${m.name}: ${m.current_stock} ${m.unit ?? ''} (mínimo: ${m.min_stock})`
    )
    const mensaje =
      `⚠️ <b>Alerta de Stock Bajo</b>\n` +
      `Las siguientes materias primas están bajo mínimo:\n\n` +
      lineas.join('\n') +
      `\n\n📅 Verificado: ${new Date().toLocaleString('es-MX')}`
    await sendTelegram(mensaje)
  }

  return NextResponse.json({ ok: true, alertas: alertas.length })
}
