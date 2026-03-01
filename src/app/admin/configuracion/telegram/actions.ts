'use server'

import { sendTelegram } from '@/lib/telegram'

export async function testTelegram(): Promise<{ success: true } | { error: string }> {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return { error: 'Bot o Chat ID no configurados en .env.local' }
  }
  try {
    const fecha = new Date().toLocaleString('es-MX')
    await sendTelegram(
      `🧪 <b>Prueba Colmena OS</b>\nConexión con Telegram funcionando correctamente ✅\n📅 ${fecha}`
    )
    return { success: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido'
    return { error: message }
  }
}
