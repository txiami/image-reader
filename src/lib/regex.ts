export function extractAccessKeys(text: string, seedKey?: string): string[] {
  const keys: string[] = []
  
  console.log('[REGEX] seedKey informado:', seedKey)
  
  // Primeiro: tenta encontrar com seedKey (os primeiros dígitos conhecidos)
  if (seedKey && seedKey.length >= 4) {
    const seedPattern = new RegExp(seedKey + '\\d{40}', 'g')
    const seedMatches = text.match(seedPattern)
    if (seedMatches) {
      for (const match of seedMatches) {
        const cleanKey = match.replace(/[^\d]/g, '')
        if (cleanKey.length === 44 && !keys.includes(cleanKey)) {
          keys.push(cleanKey)
          console.log('[REGEX] Chave encontrada (com seed):', cleanKey)
        }
      }
    }
  }
  
  // Segundo: tenta encontrar padrões que começam com "29." (UF São Paulo)
  if (keys.length === 0) {
    const startMatches = text.match(/29\.\d{2}\.\d{2}\.\d{2}\.\d{3}[\/\\-]?\d{4}[\/\\-]?\d{2}[\/\\-]?\d{3}[\/\\-]?\d{3}[\/\\-]?\d{3}[\/\\-]?\d{3}[\/\\-]?\d/g)
    if (startMatches) {
      for (const match of startMatches) {
        const cleanKey = match.replace(/[^\d]/g, '')
        if (cleanKey.length === 44 && !keys.includes(cleanKey)) {
          keys.push(cleanKey)
          console.log('[REGEX] Chave encontrada (padrão 29):', cleanKey)
        }
      }
    }
  }
  
  // Terceira tentativa: procurar no texto completo
  if (keys.length === 0) {
    const allDigits = text.replace(/[^\d]/g, '')
    console.log('[REGEX] Total de dígitos no texto:', allDigits.length)
    
    for (let i = 0; i < allDigits.length - 43; i++) {
      const candidate = allDigits.substring(i, i + 44)
      const uf = parseInt(candidate.substring(0, 2), 10)
      if (uf >= 1 && uf <= 99) {
        const model = parseInt(candidate.substring(20, 22), 10)
        if (model === 55 || model === 65) {
          if (!keys.includes(candidate)) {
            keys.push(candidate)
            console.log('[REGEX] Chave encontrada (44 dígitos):', candidate)
          }
          i += 43
        }
      }
    }
  }

  console.log('[REGEX] Total de chaves encontradas:', keys.length, keys)
  return keys
}

export function extractAccessKey(text: string, seedKey?: string): string | null {
  const keys = extractAccessKeys(text, seedKey)
  return keys.length > 0 ? keys[0] : null
}