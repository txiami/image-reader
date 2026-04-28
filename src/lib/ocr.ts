import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

export interface ProgressCallback {
  (status: string, progress: number): void
}

export async function performOCR(
  imageData: string,
  onProgress?: ProgressCallback
): Promise<OCRResult> {
  console.log('[OCR] Iniciando OCR com imagem base64...')
  console.log('[OCR] Tamanho da string base64:', imageData.length)
  
  onProgress?.('Iniciando OCR...', 0)

  try {
    console.log('[OCR] Chamando Tesseract.recognize...')
    
    const result = await Tesseract.recognize(imageData, 'por+eng', {
      logger: (m) => {
        console.log('[OCR] Logger:', m.status, m.progress)
        if (m.status === 'recognizing text') {
          onProgress?.(`Processando: ${Math.round(m.progress * 100)}%`, m.progress * 100)
        }
      },
    })

    console.log('[OCR] Resultado completo:', result.data)
    console.log('[OCR] Texto extraído:', result.data.text)
    console.log('[OCR] Confiança:', result.data.confidence)

    onProgress?.('OCR concluído!', 100)

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    }
  } catch (error) {
    console.error('[OCR] Erro durante OCR:', error)
    throw error
  }
}

export function getWorkerStatus(): string {
  return 'ready'
}