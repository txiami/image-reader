import { ScanLine } from 'lucide-react'

interface ErrorDisplayProps {
  message: string
  onDismiss: () => void
}

export function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="w-full bg-red-900/20 border border-red-800/50 rounded-xl p-4 flex items-start gap-3">
      <ScanLine className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-300">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-300 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}