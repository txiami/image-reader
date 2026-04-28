import { useCallback, useState } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelected: (imageData: string) => void
  onOCRComplete?: (text: string) => void
}

export function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    console.log('[UPLOADER] Arquivo selecionado:', file.name, file.type, file.size)
    
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      console.log('[UPLOADER] Imagem convertida para base64, tamanho:', result.length)
      setPreview(result)
      onImageSelected(result)
    }
    reader.onerror = (e) => {
      console.error('[UPLOADER] Erro ao ler arquivo:', e)
    }
    reader.readAsDataURL(file)
  }, [onImageSelected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    console.log('[UPLOADER] Arquivo solto via drag & drop')
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    console.log('[UPLOADER] Click no uploader, abrindo seletor de arquivo')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleFile(file)
    }
    input.click()
  }, [handleFile])

  const clearImage = useCallback(() => {
    console.log('[UPLOADER] Limpando imagem')
    setPreview(null)
  }, [])

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 ease-out
            ${isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
            }
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`
              p-4 rounded-full transition-colors
              ${isDragging ? 'bg-blue-500/20' : 'bg-slate-700/50'}
            `}>
              <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-200">
                Arraste uma imagem aqui
              </p>
              <p className="text-sm text-slate-400 mt-1">
                ou clique para selecionar
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ImageIcon className="w-4 h-4" />
              <span>Suporta: JPG, PNG, WEBP</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700">
          <button
            onClick={(e) => {
              e.stopPropagation()
              clearImage()
            }}
            className="absolute top-3 right-3 z-10 p-2 bg-slate-900/80 hover:bg-slate-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto max-h-[400px] object-contain"
          />
        </div>
      )}
    </div>
  )
}