import { validateAccessKey } from './validation'

export function extractAccessKeys(text: string, seedKey?: string): string[] {
  const keys: string[] = []
  
  console.log('[REGEX] seedKey informado:', seedKey)

  // Normalização agressiva para OCR: as vezes troca 0 por O, ou 1 por I/l/|
  const normalizedText = text
    .replace(/[Oo]/g, '0')
    .replace(/[Il|]/g, '1')
    .replace(/[Ss]/g, '5') // OCR as vezes troca 5 por S
    .replace(/[G]/g, '6')  // OCR as vezes troca 6 por G
    .replace(/[B]/g, '8')  // OCR as vezes troca 8 por B
  
  // Primeiro: tenta encontrar com seedKey
  if (seedKey && seedKey.length >= 4) {
    const seedPattern = new RegExp(seedKey + '[\\d\\s.\\-/]{35,65}', 'g')
    const seedMatches = normalizedText.match(seedPattern)
    if (seedMatches) {
      for (const match of seedMatches) {
        const cleanDigits = match.replace(/[^\d]/g, '')
        processCandidate(cleanDigits, keys)
      }
    }
  }
  
  // Segundo: tenta encontrar chaves formatadas
  const formattedPattern = /\d{2}[.\s]?\d{2}[.\s]?\d{2}[.\s]?\d{2}[.\s]?\d{2,3}[.\s]?\d{3,4}[.\s/]?\d{2,4}[.\s-]?\d{2,3}[.\s-]?\d{2,3}[.\s-]?\d{2,3}[.\s-]?\d{2,3}[.\s-]?\d{2,3}[.\s-]?\d/g
  const formattedMatches = normalizedText.match(formattedPattern)
  if (formattedMatches) {
    for (const match of formattedMatches) {
      const cleanDigits = match.replace(/[^\d]/g, '')
      processCandidate(cleanDigits, keys)
    }
  }
  
  // Terceira tentativa: procurar no texto completo extraindo todos os dígitos
  const allDigits = normalizedText.replace(/[^\d]/g, '')
  console.log('[REGEX] Total de dígitos no texto:', allDigits.length)
  
  if (allDigits.length >= 43) {
    for (let i = 0; i <= allDigits.length - 43; i++) {
      // Tentamos primeiro 44 dígitos
      const candidate44 = allDigits.substring(i, i + 44)
      if (processCandidate(candidate44, keys)) {
        i += 40
        continue
      }

      // Se não deu, tentamos 43 dígitos (caso o último tenha sido perdido)
      const candidate43 = allDigits.substring(i, i + 43)
      if (processCandidate(candidate43, keys)) {
        i += 39
        continue
      }
    }
  }

  console.log('[REGEX] Total de chaves encontradas:', keys.length, keys)
  return keys
}

/**
 * Processa um candidato a chave (pode ter 43 ou 44 dígitos)
 * Se tiver 43 e for válido estruturalmente, calcula o 44º.
 */
function processCandidate(candidate: string, keys: string[]): boolean {
  if (candidate.length < 43) return false
  
  // Se tem mais de 44, pega os primeiros 44
  let key = candidate.substring(0, 44)
  
  // Se tem 43, tenta completar
  if (key.length === 43) {
    if (isLikelyNFKey(key)) {
      const completedKey = completeCheckDigit(key)
      if (!keys.includes(completedKey)) {
        keys.push(completedKey)
        console.log('[REGEX] Chave de 43d completada e adicionada:', completedKey)
        return true
      }
    }
    return false
  }

  // Se tem 44
  if (isLikelyNFKey(key)) {
    if (validateAccessKey(key)) {
      if (!keys.includes(key)) {
        keys.push(key)
        console.log('[REGEX] Chave de 44d válida encontrada:', key)
        return true
      }
    } else {
      // Se falhou na validação matemática mas a estrutura é perfeita,
      // talvez o último dígito (DV) esteja errado no OCR. Tentamos corrigir.
      const correctedKey = completeCheckDigit(key.substring(0, 43))
      if (!keys.includes(correctedKey)) {
        keys.push(correctedKey)
        console.log('[REGEX] Chave de 44d com DV corrigido:', correctedKey)
        return true
      }
    }
  }
  
  return false
}

/**
 * Verifica se uma string de 43 ou 44 dígitos tem a estrutura básica de uma NF-e/NFC-e
 */
function isLikelyNFKey(key: string): boolean {
  if (key.length < 43) return false

  // 1. UF (0-1): 11 a 53
  const uf = parseInt(key.substring(0, 2), 10)
  if (uf < 11 || uf > 53) return false

  // 2. Mês (4-5): 01 a 12
  const month = parseInt(key.substring(4, 6), 10)
  if (month < 1 || month > 12) return false

  // 3. Modelo (20-21): 55 (NF-e) ou 65 (NFC-e)
  const model = key.substring(20, 22)
  if (model !== '55' && model !== '65') return false

  return true
}

/**
 * Calcula o dígito verificador para uma chave de 43 dígitos e retorna a chave completa de 44
 */
function completeCheckDigit(base43: string): string {
  let sum = 0
  let weight = 2
  
  for (let i = 42; i >= 0; i--) {
    sum += parseInt(base43.charAt(i), 10) * weight
    weight++
    if (weight > 9) weight = 2
  }

  const remainder = sum % 11
  const dv = (remainder === 0 || remainder === 1) ? 0 : 11 - remainder
  
  return base43 + dv.toString()
}

export function extractAccessKey(text: string, seedKey?: string): string | null {
  const keys = extractAccessKeys(text, seedKey)
  return keys.length > 0 ? keys[0] : null
}