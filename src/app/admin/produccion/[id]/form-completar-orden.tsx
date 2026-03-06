'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { completarOrden } from '@/app/admin/produccion/actions'

export function FormCompletarOrden({
  ordenId,
  hasConsumos = true,
}: {
  ordenId: string
  hasConsumos?: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const archivoSeleccionado = !!selectedFile
  const puedeSubmit = !isUploading && (!archivoSeleccionado || uploadComplete)

  const handleSubmit = async () => {
    if (!formRef.current || isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const fd = new FormData(formRef.current)

    const hiddenInput = document.getElementById('waste_photo_url_hidden') as HTMLInputElement
    const photoUrl = hiddenInput?.value ?? ''
    fd.set('waste_photo_url', photoUrl)

    console.log('Enviando waste_photo_url:', photoUrl)

    const result = await completarOrden(null, fd)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.size === 0) {
      setSelectedFile(null)
      setUploadComplete(false)
      setUploadProgress(0)
      const hiddenInput = document.getElementById('waste_photo_url_hidden') as HTMLInputElement
      if (hiddenInput) hiddenInput.value = ''
      return
    }
    setSelectedFile(file)
    setUploadComplete(false)
    const supabase = createClient()
    setIsUploading(true)
    setUploadProgress(10)

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${ordenId}/${Date.now()}.${ext}`

    setUploadProgress(40)

    const { data, error } = await supabase.storage
      .from('mermas')
      .upload(path, file, { upsert: true })

    setUploadProgress(80)

    if (error) {
      console.error('Error subida:', error)
      setSelectedFile(null)
      setIsUploading(false)
      setUploadProgress(0)
      const hiddenInput = document.getElementById('waste_photo_url_hidden') as HTMLInputElement
      if (hiddenInput) hiddenInput.value = ''
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('mermas')
      .getPublicUrl(data.path)

    setUploadProgress(100)

    const hiddenInput = document.getElementById('waste_photo_url_hidden') as HTMLInputElement
    if (hiddenInput) hiddenInput.value = publicUrl
    console.log('URL guardada:', publicUrl)

    setUploadComplete(true)
    setIsUploading(false)
  }

  return (
    <form
      ref={formRef}
      encType="multipart/form-data"
      className="space-y-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <input type="hidden" name="orden_id" value={ordenId} />
      <input
        type="hidden"
        name="waste_photo_url"
        id="waste_photo_url_hidden"
        defaultValue=""
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
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
          <Label htmlFor="waste_photo_file">Foto merma</Label>
          <Input
            id="waste_photo_file"
            name="waste_photo_file"
            type="file"
            accept="image/*"
            className="border-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-800"
            onChange={handleFileChange}
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
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!puedeSubmit || isUploading || isSubmitting}
        className="bg-emerald-600 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isUploading ? 'Subiendo imagen...' : isSubmitting ? 'Completando…' : 'Completar Orden'}
      </Button>
    </form>
  )
}
