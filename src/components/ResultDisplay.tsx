import { useState } from 'react'
import { Copy, Check, Share2, FileText } from 'lucide-react'
import { ExtractedKey } from '../stores/history'
import { formatAccessKey, getAccessKeyInfo } from '../lib/validation'

interface ResultDisplayProps {
  result: ExtractedKey
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Chave de Acesso',
        text: result.key,
      })
    }
  }

  const info = getAccessKeyInfo(result.key)

  return (
    <div className="w-full space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className={`w-5 h-5 ${result.isValid ? 'text-green-400' : 'text-amber-400'}`} />
            <span className={`text-sm font-medium ${result.isValid ? 'text-green-400' : 'text-amber-400'}`}>
              {/* {result.isValid ? 'Chave Válida' : 'Chave Inválida'} */}
            </span>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            {showInfo ? 'Ocultar' : 'Ver'} detalhes
          </button>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-2">Chave de Acesso</p>
          <p className="text-xl font-mono text-slate-100 tracking-wider break-all">
            {formatAccessKey(result.key)}
          </p>
        </div>

        {showInfo && info && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900/30 rounded-lg p-3">
              <p className="text-xs text-slate-500">Modelo</p>
              <p className="text-slate-200 font-medium">{info.model}</p>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-3">
              <p className="text-xs text-slate-500">Série</p>
              <p className="text-slate-200 font-medium">{info.serie}</p>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-3">
              <p className="text-xs text-slate-500">Número</p>
              <p className="text-slate-200 font-medium">{info.number}</p>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-3">
              <p className="text-xs text-slate-500">Emissão</p>
              <p className="text-slate-200 font-medium">{info.emissionDate}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Chave
              </>
            )}
          </button>
          <button
            onClick={handleShare}
            className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}