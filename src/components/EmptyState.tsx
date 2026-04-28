import { ScanLine } from 'lucide-react'

interface EmptyStateProps {
  onUpload: () => void
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="text-center space-y-4 py-12">
      <div className="inline-flex p-4 bg-slate-800/50 rounded-full">
        <ScanLine className="w-10 h-10 text-slate-500" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-slate-300">
          Nenhuma imagem processada
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Faça upload de uma foto da nota fiscal para extrair a chave de acesso
        </p>
      </div>
      <button
        onClick={onUpload}
        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
      >
        Selecionar imagem →
      </button>
    </div>
  )
}