import { useState, useCallback } from 'react'
import { performOCR, OCRResult } from '../lib/ocr'
import { extractAccessKeys } from '../lib/regex'
import { validateAccessKey } from '../lib/validation'
import { useHistoryStore, ExtractedKey } from '../stores/history'
import { scanBarcodeFromImage } from '../lib/barcode'

export interface UseOCRError {
  message: string
  type?: 'warning' | 'error' | 'info'
}

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<UseOCRError | null>(null)
  const [ocrText, setOcrText] = useState('')
  const { addKey } = useHistoryStore()

  const extractFromImage = useCallback(async (
    imageData: string, 
    seedKey?: string, 
    enableBarcode?: boolean,
    enableText?: boolean
  ): Promise<ExtractedKey[]> => {
    console.log('[HOOK] extractFromImage - barcode:', enableBarcode, 'text:', enableText)
    
    setIsProcessing(true)
    setError(null)
    setProgress(0)
    setStatus('Iniciando...')
    setOcrText('')

    try {
      const allKeys: string[] = []
      let barcodeFound = false
      let ocrConfidence = 0
      
      // 1. Escanear código de barras
      if (enableBarcode) {
        setStatus('Escaneando códigos de barras...')
        setProgress(10)
        
        try {
          const barcodeKeys = await scanBarcodeFromImage(imageData, (p) => {
            setProgress(10 + p * 20)
          })
          
          if (barcodeKeys.length > 0) {
            barcodeFound = true
            allKeys.push(...barcodeKeys)
          }
        } catch (e) {
          console.log('[HOOK] Erro no scan de barcode:', e)
        }
      }

      // Se não achou nada com código de barras, usar OCR como fallback
      if (allKeys.length === 0 && enableBarcode && !enableText) {
        console.log('[HOOK] Código de barras não achou, usando OCR como fallback...')
        enableText = true
      }

      // 2. Escanear texto OCR
      if (enableText) {
        setStatus('Reconhecendo texto na imagem...')
        setProgress(40)
        
        const ocrResult: OCRResult = await performOCR(imageData, (s, p) => {
          setStatus(s)
          setProgress(40 + p * 50)
        })

        ocrConfidence = ocrResult.confidence
        setOcrText(ocrResult.text)

        setStatus('Extraindo chaves de acesso...')
        setProgress(95)
        
        const extractedKeys = extractAccessKeys(ocrResult.text, seedKey)
        allKeys.push(...extractedKeys)
      }

      // Remove duplicatas e valida comprimento (garantia final)
      const uniqueKeys = [...new Set(allKeys)]
      const validKeys: string[] = []
      
      for (const key of uniqueKeys) {
        if (key.length === 44 && !validKeys.includes(key)) {
          validKeys.push(key)
        }
      }

      // 3. Tratamento de Erros e Avisos Personalizados
      if (validKeys.length === 0) {
        let errorMsg = 'Nenhuma chave de acesso de 44 dígitos encontrada.'
        
        if (enableBarcode && !barcodeFound && enableText && ocrConfidence < 50) {
          errorMsg = 'Não detectamos códigos de barra e o texto está muito difícil de ler. Tente uma foto mais nítida ou com melhor iluminação.'
        } else if (enableText && ocrText.length < 50) {
          errorMsg = 'Pouco texto foi detectado na imagem. Certifique-se de que a nota fiscal está bem visível e não há reflexos.'
        } else if (seedKey && ocrText.length > 0) {
          errorMsg = `Nenhuma chave começando com "${seedKey}" foi encontrada, mesmo com a leitura do texto concluída.`
        }

        setError({ message: errorMsg, type: 'warning' })
        setIsProcessing(false)
        return []
      }

      // 4. Sucesso - Processar chaves válidas
      const results: ExtractedKey[] = []
      
      for (const key of validKeys) {
        const isValid = validateAccessKey(key)
        const id = crypto.randomUUID()

        const result: ExtractedKey = {
          id,
          key,
          timestamp: Date.now(),
          isValid,
        }

        addKey(result)
        results.push(result)
      }

      // Aviso se a confiança do OCR foi baixa mesmo tendo achado algo
      if (enableText && ocrConfidence < 60 && results.length > 0) {
        setError({ 
          message: 'As chaves foram encontradas, mas a qualidade da imagem está baixa. Verifique se os números estão corretos.', 
          type: 'info' 
        })
      }

      setStatus(`${results.length} chave(s) encontrada(s)!`)
      setProgress(100)
      setIsProcessing(false)
      return results
    } catch (err) {
      console.error('[HOOK] Erro:', err)
      setError({
        message: err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao processar a imagem.',
        type: 'error'
      })
      setIsProcessing(false)
      return []
    }
  }, [addKey])

  return {
    extractFromImage,
    isProcessing,
    progress,
    status,
    error,
    setError,
    ocrText,
  }
}