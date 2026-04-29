declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => {
      detect(image: HTMLImageElement | ImageBitmap | HTMLCanvasElement): Promise<Array<{ rawValue: string }>>;
    };
  }
}

export async function scanBarcodeFromImage(
  imageData: string,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const keys: string[] = []
  
  console.log('[BARCODE] Tentando detectar códigos de barras...')
  onProgress?.(0)

  // Verificar se BarcodeDetector está disponível
  if (!('BarcodeDetector' in window)) {
    console.log('[BARCODE] API não disponível. O código de barras requer Chrome 90+ ou navegador com suporte')
    onProgress?.(100)
    return keys
  }

  try {
    onProgress?.(30)
    
    // Carregar imagem
    const img = new window.Image()
    img.src = imageData
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
    })
    
    onProgress?.(50)
    
    // Verificar formatos suportados
    // @ts-ignore
    const supportedFormats = await window.BarcodeDetector.getSupportedFormats()
    console.log('[BARCODE] Formatos suportados:', supportedFormats)

    const requestedFormats = ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'qr_code']
    const formatsToUse = requestedFormats.filter(f => supportedFormats.includes(f))

    if (formatsToUse.length === 0) {
      console.warn('[BARCODE] Nenhum formato desejado é suportado por este navegador.')
      onProgress?.(100)
      return keys
    }
    
    // Criar detector
    const detector = new window.BarcodeDetector!({
      formats: formatsToUse
    })
    
    // Detectar
    const results = await detector.detect(img)
    onProgress?.(80)
    
    console.log('[BARCODE] Códigos encontrados:', results.length)
    
    for (const result of results) {
      const rawValue = result.rawValue
      console.log('[BARCODE] Valor bruto detectado:', rawValue)
      
      // Caso 1: Valor direto é a chave (44 dígitos)
      const directDigits = rawValue.replace(/\D/g, '')
      if (directDigits.length === 44 && !keys.includes(directDigits)) {
        keys.push(directDigits)
        console.log('[BARCODE] ✓ Chave 44d encontrada diretamente')
        continue
      }

      // Caso 2: É uma URL (comum em QR Codes de NFC-e)
      if (rawValue.includes('http')) {
        // Tenta extrair parâmetro 'p' ou 'chNFe' ou 'chave'
        const urlMatch = rawValue.match(/(?:p|chNFe|chave)=([0-9]{44})/)
        if (urlMatch && !keys.includes(urlMatch[1])) {
          keys.push(urlMatch[1])
          console.log('[BARCODE] ✓ Chave 44d extraída da URL:', urlMatch[1])
          continue
        }

        // Tenta pegar qualquer sequência de 44 dígitos na URL
        const genericMatch = rawValue.match(/[0-9]{44}/)
        if (genericMatch && !keys.includes(genericMatch[0])) {
          keys.push(genericMatch[0])
          console.log('[BARCODE] ✓ Chave 44d encontrada na URL (genérico):', genericMatch[0])
          continue
        }
      }
    }
    
  } catch (error) {
    console.error('[BARCODE] Erro durante detecção:', error)
  }

  onProgress?.(100)
  console.log('[BARCODE] Resultado final:', keys.length, 'chaves')
  return keys
}