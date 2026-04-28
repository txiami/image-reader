import { useState, useCallback } from 'react'
import { performOCR, OCRResult } from '../lib/ocr'
import { extractAccessKeys } from '../lib/regex'
import { validateAccessKey } from '../lib/validation'
import { useHistoryStore, ExtractedKey } from '../stores/history'
import { scanBarcodeFromImage } from '../lib/barcode'

export interface UseOCRError {
  message: string
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

    try {
      const allKeys: string[] = []
      
      // Escanear código de barras
      if (enableBarcode) {
        setStatus('Escaneando códigos de barras...')
        setProgress(10)
        
        try {
          const barcodeKeys = await scanBarcodeFromImage(imageData, (p) => {
            setProgress(10 + p * 20)
          })
          
          console.log('[HOOK] Chaves do código de barras:', barcodeKeys.length)
          allKeys.push(...barcodeKeys)
        } catch (e) {
          console.log('[HOOK] Erro no scan de barcode:', e)
        }
      }

      // Se não achou nada com código de barras, usar OCR como fallback
      if (allKeys.length === 0 && enableBarcode && !enableText) {
        console.log('[HOOK] Código de barras não achou, usando OCR como fallback...')
        enableText = true
      }

      // Escanear texto OCR
      if (enableText) {
        setStatus('Reconhecendo texto na imagem...')
        setProgress(40)
        
        const ocrResult: OCRResult = await performOCR(imageData, (s, p) => {
          setStatus(s)
          setProgress(40 + p * 50)
        })

        console.log('[HOOK] OCR texto completo (len):', ocrResult.text.length)
        setOcrText(ocrResult.text)

        setStatus('Extraindo chaves de acesso...')
        setProgress(95)
        
        const extractedKeys = extractAccessKeys(ocrResult.text, seedKey)
        console.log('[HOOK] Chaves do OCR:', extractedKeys.length)
        allKeys.push(...extractedKeys)
      }

      // Remove duplicatas
      const uniqueKeys = [...new Set(allKeys)]
      const validKeys: string[] = []
      
      for (const key of uniqueKeys) {
        if (key.length === 44 && !validKeys.includes(key)) {
          validKeys.push(key)
        }
      }

      if (validKeys.length === 0) {
        console.log('[HOOK] Nenhuma chave extraída!')
        setError({ message: 'Nenhuma chave de acesso de 44 dígitos encontrada.' })
        setIsProcessing(false)
        return []
      }

      console.log('[HOOK] Total de chaves únicas:', validKeys.length)

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

      setStatus(`${results.length} chave(s) encontrada(s)!`)
      setProgress(100)
      setIsProcessing(false)
      return results
    } catch (err) {
      console.error('[HOOK] Erro:', err)
      setError({
        message: err instanceof Error ? err.message : 'Erro ao processar imagem'
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