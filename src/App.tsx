import { useState } from 'react'
import { ScanLine, Copy, Key, ScanBarcode, Type, Camera } from 'lucide-react'
import { ImageUploader } from './components/ImageUploader'
import { ProgressBar } from './components/ProgressBar'
import { ResultDisplay } from './components/ResultDisplay'
import { ErrorDisplay } from './components/ErrorDisplay'
import { History } from './components/History'
import { CameraScanner } from './components/CameraScanner'
import { useOCR } from './hooks/useOCR'
import { ExtractedKey } from './stores/history'

type ScanMode = 'barcode' | 'text' | 'both'

export function App() {
  const [results, setResults] = useState<ExtractedKey[]>([])
  const [seedKey, setSeedKey] = useState('')
  const [scanMode, setScanMode] = useState<ScanMode>('both')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const { extractFromImage, isProcessing, progress, status, error, setError, ocrText } = useOCR()

  const handleImageSelected = async (imageData: string) => {
    setResults([])

    const enableBarcode = scanMode === 'barcode' || scanMode === 'both'
    const enableText = scanMode === 'text' || scanMode === 'both'

    const extracted = await extractFromImage(
      imageData,
      seedKey || undefined,
      enableBarcode,
      enableText
    )
    if (extracted.length > 0) {
      setResults(extracted)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Leitor de Imagem
              </h1>
              <p className="text-xs text-slate-400">
                Extrator de Chave de Acesso NF-e/NFC-e
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="space-y-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-400">
                Selecione uma imagem
              </h2>
              <button
                onClick={() => setIsCameraOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
              >
                <Camera className="w-4 h-4" />
                Abrir Câmera
              </button>
            </div>
            <ImageUploader onImageSelected={handleImageSelected} />
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-medium text-slate-400">
                Chave de Referência (opcional)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Informe os primeiros 4-10 dígitos da chave para ajudar na identificação
            </p>
            <input
              type="text"
              value={seedKey}
              onChange={(e) => setSeedKey(e.target.value.replace(/\D/g, '').substring(0, 10))}
              placeholder="Ex: 2926"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-mono text-lg placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {seedKey.length > 0 && (
              <p className="text-xs text-slate-500">
                Dígitos informados: {seedKey.length}/10
              </p>
            )}
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-400">
              Escolha o método de extração
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${scanMode === 'barcode' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                <input
                  type="radio"
                  name="scanMode"
                  value="barcode"
                  checked={scanMode === 'barcode'}
                  onChange={(e) => setScanMode(e.target.value as ScanMode)}
                  className="w-5 h-5"
                />
                <ScanBarcode className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Apenas Código de Barras
                  </p>
                  <p className="text-xs text-slate-500">
                    Escaneia códigos de barra (CODE128, EAN, etc)
                  </p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${scanMode === 'text' ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                <input
                  type="radio"
                  name="scanMode"
                  value="text"
                  checked={scanMode === 'text'}
                  onChange={(e) => setScanMode(e.target.value as ScanMode)}
                  className="w-5 h-5"
                />
                <Type className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Apenas Texto (OCR)
                  </p>
                  <p className="text-xs text-slate-500">
                    Reconhece texto da imagem
                  </p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${scanMode === 'both' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                <input
                  type="radio"
                  name="scanMode"
                  value="both"
                  checked={scanMode === 'both'}
                  onChange={(e) => setScanMode(e.target.value as ScanMode)}
                  className="w-5 h-5"
                />
                <ScanBarcode className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Ambos
                  </p>
                  <p className="text-xs text-slate-500">
                    Código de barras + Texto
                  </p>
                </div>
              </label>
            </div>
          </div>

          {isProcessing && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <ProgressBar progress={progress} status={status} />
            </div>
          )}

          {error && (
            <ErrorDisplay 
              message={error.message} 
              type={error.type} 
              onDismiss={() => setError(null)} 
            />
          )}

          {results.length > 0 && !isProcessing && (
            <div className="space-y-4">
              {results.map((result) => (
                <ResultDisplay key={result.id} result={result} />
              ))}
            </div>
          )}

          {ocrText && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">
                  Texto Extraído (OCR)
                </h3>
                <button
                  onClick={() => navigator.clipboard.writeText(ocrText)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                {ocrText}
              </pre>
            </div>
          )}

          <History />
        </div>
      </main>

      {isCameraOpen && (
        <CameraScanner
          onScan={handleImageSelected}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      <footer className="border-t border-slate-800 py-4 mt-auto">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">
            100% offline • Processamento local • Privacidade garantida
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App