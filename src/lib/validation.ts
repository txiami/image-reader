export function validateAccessKey(key: string): boolean {
  const cleanKey = key.replace(/\D/g, '')
  
  if (cleanKey.length !== 44) {
    return false
  }

  const base = cleanKey.substring(0, 43)
  const checkDigit = parseInt(cleanKey.charAt(43), 10)

  const multipliers = [4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1]

  let sum = 0
  for (let i = 0; i < 43; i++) {
    sum += parseInt(base.charAt(i), 10) * multipliers[i]
  }

  const remainder = sum % 11
  const calculatedDigit = remainder === 0 ? 0 : 11 - remainder

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