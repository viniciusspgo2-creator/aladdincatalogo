/** Normaliza texto para busca: minúsculo, sem acentos, sem pontuação solta. */
export function normalizeSearch(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Extrai tokens úteis (>=2 chars, no máx 6) de uma query livre. */
export function tokenizeQuery(q: string): string[] {
  return Array.from(new Set(normalizeSearch(q).split(' ').filter((t) => t.length >= 2))).slice(0, 6)
}

/**
 * Palavras vazias em português que NUNCA devem ser exigidas na busca
 * ("tem papel king size?" não pode falhar por causa da palavra "tem").
 */
const STOPWORDS = new Set([
  'tem', 'têm', 'temos', 'ter', 'vou', 'vai', 'ser', 'esta', 'está', 'sao', 'são',
  'algum', 'alguma', 'quero', 'preciso', 'procura', 'procurando',
  'encontra', 'encontrar', 'ache', 'achar', 'voces', 'vocs', 'aqui',
  'para', 'pra', 'por', 'com', 'sem', 'dos', 'das', 'que', 'qual', 'quais', 'como',
  'onde', 'quando', 'quanto', 'quanta', 'mais', 'menos', 'meu', 'minha', 'seu',
  'sua', 'sobre', 'entre', 'voc', 'ola', 'oi', 'bom', 'boa', 'dia', 'tarde', 'noite',
  'favor', 'obrigado', 'obrigada', 'the', 'and', 'for', 'with',
])

/** Tokens de busca realmente úteis (sem stopwords). */
export function searchTokens(q: string): string[] {
  return tokenizeQuery(q).filter((t) => !STOPWORDS.has(t))
}
