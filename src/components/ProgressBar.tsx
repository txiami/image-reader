interface ProgressBarProps {
  progress: number
  status: string
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{status}</span>
        <span className="text-slate-400">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}