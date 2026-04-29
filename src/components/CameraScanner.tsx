import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, X, RefreshCw } from 'lucide-react'

interface CameraScannerProps {
  onScan: (imageData: string) => void
  onClose: () => void
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false)
  const [supportedFormats, setSupportedFormats] = useState<string[]>([])
  const scanIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    const checkSupport = async () => {
      const available = 'BarcodeDetector' in window
      setHasBarcodeDetector(available)
      if (available) {
        try {
          const formats = await (window as any).BarcodeDetector.getSupportedFormats()
          setSupportedFormats(formats)
        } catch (e) {
          console.warn('[CAMERA] Erro ao buscar formatos:', e)
        }
      }
    }
    checkSupport()
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsReady(true)
      }
    } catch (err) {
      console.error('[CAMERA] Erro ao acessar câmera:', err)
      setError('Não foi possível acessar a câmera. Verifique as permissões.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current)
    }
  }, [])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/jpeg', 0.8)
    }
    return null
  }, [])

  const scan = useCallback(async () => {
    if (!videoRef.current || !isReady || !hasBarcodeDetector) return

    try {
      const detector = new (window as any).BarcodeDetector({
        formats: ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e', 'itf']
          .filter(f => supportedFormats.includes(f))
      })

      const results = await detector.detect(videoRef.current)
      if (results.length > 0) {
        console.log('[CAMERA] Código detectado!', results[0].rawValue)
        
        // Vibração se suportado
        if ('vibrate' in navigator) navigator.vibrate(200)

        const imageData = captureFrame()
        if (imageData) {
          onScan(imageData)
          stopCamera()
          onClose()
        }
      }
    } catch (err) {
      // Ignora erros de detecção em tempo real
    }
  }, [captureFrame, hasBarcodeDetector, isReady, onClose, onScan, stopCamera, supportedFormats])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  useEffect(() => {
    if (isReady && hasBarcodeDetector && supportedFormats.length > 0) {
      scanIntervalRef.current = window.setInterval(scan, 300)
    }
    return () => {
      if (scanIntervalRef.current) window.clearInterval(scanIntervalRef.current)
    }
  }, [isReady, hasBarcodeDetector, supportedFormats, scan])

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-medium text-white">Escanear com Câmera</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {!error ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-blue-500/50 rounded-3xl relative">
                <div className="absolute inset-0 border-2 border-blue-500 rounded-3xl animate-pulse" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>
            
            <div className="absolute bottom-10 left-0 right-0 flex justify-center px-6">
              <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 max-w-xs text-center">
                <p className="text-xs text-slate-300">
                  {hasBarcodeDetector 
                    ? "Posicione o código de barras ou QR Code dentro do quadrado."
                    : "Seu navegador não suporta detecção automática. Tire uma foto para processar."}
                </p>
              </div>
            </div>
            
            <div className="absolute bottom-32 left-0 right-0 flex justify-center">
              <button
                onClick={() => {
                  const data = captureFrame()
                  if (data) onScan(data)
                  onClose()
                }}
                className="w-16 h-16 bg-white rounded-full border-4 border-slate-400 shadow-xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-900" />
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="p-4 bg-red-500/10 rounded-full inline-block">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <p className="text-slate-300">{error}</p>
            <button
              onClick={() => {
                setError(null)
                startCamera()
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-128px); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(128px); }
        }
      `}</style>
    </div>
  )
}
