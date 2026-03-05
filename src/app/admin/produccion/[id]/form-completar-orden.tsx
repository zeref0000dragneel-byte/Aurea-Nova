'use client'

import { useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { completarOrden } from '@/app/admin/produccion/actions'

function SubmitButton({
  isUploading,
}: {
  isUploading: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={isUploading || pending}
      className="bg-emerald-600 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {isUploading ? 'Subiendo imagen...' : pending ? 'Completando…' : 'Completar Orden'}
    </Button>
  )
}

export function FormCompletarOrden({
  ordenId,
  hasConsumos = true,
}: {
  ordenId: string
  hasConsumos?: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const wastePhotoUrlRef = useRef<HTMLInputElement>(null)

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [state, formAction] = useFormState(completarOrden, null)
  const error = state && typeof state === 'object' && 'error' in state ? (state as { error: string }).error : null

  const subirImagenConProgreso = (file: File, path: string): Promise<string> => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!base || !anonKey) return Promise.reject(new Error('Configuración de Supabase faltante'))

    return new Promise((resolve, reject) => {
      const url = `${base}/storage/v1/object/waste-photos/${path}`
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(pct)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const publicUrl = `${base}/storage/v1/object/public/waste-photos/${path}`
          resolve(publicUrl)
        } else {
          reject(new Error('Error al subir imagen'))
        }
      }

      xhr.onerror = () => reject(new Error('Error de red'))

      xhr.open('POST', url)
      xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`)
      xhr.setRequestHeader('x-upsert', 'true')

      xhr.send(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const fileInput = form.elements.namedItem('waste_photo') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (file && file.size > 0) {
      e.preventDefault()
      setIsUploading(true)
      setUploadProgress(0)
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${ordenId}/${Date.now()}.${ext}`

      try {
        const publicUrl = await subirImagenConProgreso(file, path)
        if (wastePhotoUrlRef.current) wastePhotoUrlRef.current.value = publicUrl
        if (fileInputRef.current) fileInputRef.current.value = ''
        formRef.current?.requestSubmit()
      } catch {
        setUploadProgress(0)
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      encType="multipart/form-data"
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="orden_id" value={ordenId} />
      <input type="hidden" name="waste_photo_url" ref={wastePhotoUrlRef} />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {!hasConsumos && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          No hay materias primas registradas. Agrega al menos un consumo antes de completar la orden.
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="actual_quantity">Cantidad Real *</Label>
          <Input
            id="actual_quantity"
            name="actual_quantity"
            type="number"
            min="0"
            step="1"
            required
            placeholder="0"
            className="border-gray-200"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expiry_date">Fecha de vencimiento del lote (opcional)</Label>
          <Input
            id="expiry_date"
            name="expiry_date"
            type="date"
            className="border-gray-200"
          />
          <p className="text-xs text-muted-foreground">
            Dejar vacío si el producto no tiene fecha de vencimiento
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="waste_quantity">Merma</Label>
          <Input
            id="waste_quantity"
            name="waste_quantity"
            type="number"
            min="0"
            step="any"
            defaultValue="0"
            placeholder="0"
            className="border-gray-200"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="waste_notes">Notas merma</Label>
          <Textarea
            id="waste_notes"
            name="waste_notes"
            placeholder="Opcional"
            rows={2}
            className="resize-none border-gray-200"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="waste_photo">Foto merma</Label>
          <Input
            ref={fileInputRef}
            id="waste_photo"
            name="waste_photo"
            type="file"
            accept="image/*"
            className="border-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-800"
          />
          {isUploading && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Subiendo imagen...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <SubmitButton isUploading={isUploading} />
    </form>
  )
}
