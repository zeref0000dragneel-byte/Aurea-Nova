/**
 * Envía un mensaje al chat de Telegram configurado.
 * No lanza excepciones: los errores se registran en consola para no interrumpir el flujo principal.
 * @returns true si se envió correctamente, false en caso contrario (config faltante o API error).
 */
export async function sendTelegram(mensaje: string): Promise<void> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (!token || !chatId) return

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
          parse_mode: 'HTML',
        }),
      }
    )
    if (!res.ok) {
      const text = await res.text()
      console.error('Telegram error:', res.status, text)
    }
  } catch (error) {
    console.error('Telegram error:', error)
  }
}
