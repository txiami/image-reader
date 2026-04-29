export function validateAccessKey(key: string): boolean {
  const cleanKey = key.replace(/\D/g, '')
  
  if (cleanKey.length !== 44) {
    return false
  }

  const base = cleanKey.substring(0, 43)
  const checkDigit = parseInt(cleanKey.charAt(43), 10)

  // Algoritmo Módulo 11 (Padrão SEFAZ para NF-e/NFC-e)
  // Pesos: 2, 3, 4, 5, 6, 7, 8, 9 (da direita para a esquerda)
  let sum = 0
  let weight = 2
  
  for (let i = 42; i >= 0; i--) {
    sum += parseInt(base.charAt(i), 10) * weight
    weight++
    if (weight > 9) weight = 2
  }

  const remainder = sum % 11
  const calculatedDigit = (remainder === 0 || remainder === 1) ? 0 : 11 - remainder

  return calculatedDigit === checkDigit
}

export function formatAccessKey(key: string): string {
  const cleanKey = key.replace(/\D/g, '')
  if (cleanKey.length !== 44) return key
  
  return cleanKey.match(/.{1,4}/g)?.join(' ') || key
}

export function getAccessKeyInfo(key: string): {
  model: string
  serie: string
  number: string
  emissionDate: string
} | null {
  const cleanKey = key.replace(/\D/g, '')
  if (cleanKey.length !== 44) return null

  const year = parseInt(cleanKey.substring(2, 4), 10)
  const month = parseInt(cleanKey.substring(4, 6), 10)
  const model = cleanKey.substring(20, 22)
  const serie = cleanKey.substring(22, 25)
  const number = cleanKey.substring(25, 34)

  const fullYear = year < 90 ? 2000 + year : 1900 + year

  return {
    model: model === '55' ? 'NF-e' : model === '65' ? 'NFC-e' : model,
    serie: serie,
    number: number,
    emissionDate: `${String(month).padStart(2, '0')}/${fullYear}`,
  }
}