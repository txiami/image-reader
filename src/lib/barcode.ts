import 'tesseract.js'

export async function scanBarcodeFromImage(
  imageData: string,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const keys: string[] = []
  
  console.log('[BARCODE] Tentando detectar códigos de barras...')
  onProgress?.(0)

  // Verificar se BarcodeDetector está disponível
  const hasBarcodeDetector = 'BarcodeDetector' in window
  
  console.log('[BARCODE] BarcodeDetector disponível:', hasBarcodeDetector)

  if (!hasBarcodeDetector) {
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
    
    // Criar detector
    const detector = new window.BarcodeDetector({
      formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf']
    })
    
    // Detectar
    const results = await detector.detect(img)
    onProgress?.(80)
    
    console.log('[BARCODE] Códigos encontrados:', results.length)
    
    for (const result of results) {
      console.log('[BARCODE] Código:', result.rawValue)
      
      const digits = result.rawValue.replace(/\D/g, '')
      
      // Se tem 44 dígitos exatos
      if (digits.length === 44 && !keys.includes(digits)) {
        keys.push(digits)
        console.log('[BARCODE] ✓ Chave 44d encontrada')
      }
    }
    
  } catch (error) {
    console.log('[BARCODE] Erro:', error)
  }

  onProgress?.(100)
  console.log('[BARCODE] Resultado:', keys.length, 'chaves')
  return keys
}