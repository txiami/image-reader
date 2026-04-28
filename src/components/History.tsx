import { useState } from 'react'
import { History as HistoryIcon, ChevronDown, ChevronUp, Trash2, Copy, Check } from 'lucide-react'
import { useHistoryStore } from '../stores/history'
import { formatAccessKey } from '../lib/validation'

interface HistoryItem {
  id: string
  key: string
  timestamp: number
  isValid: boolean
}

export function History() {
  const [isOpen, setIsOpen] = useState(false)
  const { history, removeKey, clearHistory } = useHistoryStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (history.length === 0) return null

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">
            Histórico ({history.length})
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <div className="flex justify-end">
            <button
              onClick={clearHistory}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Limpar tudo
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {history.map((item: HistoryItem) => (
              <div
                key={item.id}
                className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${item.isValid ? 'bg-green-400' : 'bg-amber-400'}`} />
                      <span className="text-xs text-slate-500">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-slate-300 truncate">
                      {formatAccessKey(item.key)}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(item.key, item.id)}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                      title="Copiar"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => removeKey(item.id)}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}