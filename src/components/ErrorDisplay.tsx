import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

interface ErrorDisplayProps {
  message: string
  type?: 'warning' | 'error' | 'info'
  onDismiss: () => void
}

export function ErrorDisplay({ message, type = 'error', onDismiss }: ErrorDisplayProps) {
  const configs = {
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-800/50',
      text: 'text-red-300',
      iconColor: 'text-red-400',
      Icon: AlertCircle
    },
    warning: {
      bg: 'bg-amber-900/20',
      border: 'border-amber-800/50',
      text: 'text-amber-300',
      iconColor: 'text-amber-400',
      Icon: AlertTriangle
    },
    info: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-800/50',
      text: 'text-blue-300',
      iconColor: 'text-blue-400',
      Icon: Info
    }
  }

  const { bg, border, text, iconColor, Icon } = configs[type]

  return (
    <div className={`w-full ${bg} border ${border} rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300`}>
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`text-sm ${text} leading-relaxed`}>{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className={`${iconColor} hover:opacity-70 transition-opacity p-1`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}