import { Badge } from '@/components/ui/badge'
import { BotonTestTelegram } from './boton-test-telegram'

export default function AdminConfiguracionTelegramPage() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID ?? ''
  const lastFour = chatId.length >= 4 ? chatId.slice(-4) : ''
  const displayChatId = chatId ? `****${lastFour}` : '—'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Configuración Telegram
        </h1>
        <p className="text-sm text-gray-500">
          Estado del bot y envío de mensajes de prueba
        </p>
      </div>

      <div className="space-y-6 max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Bot:</span>
          {token ? (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              Bot configurado
            </Badge>
          ) : (
            <Badge variant="destructive">No configurado</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Chat ID:</span>
          <span className="text-sm text-gray-600 font-mono">{displayChatId}</span>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Mensaje de prueba
          </p>
          <BotonTestTelegram />
        </div>
      </div>
    </div>
  )
}
