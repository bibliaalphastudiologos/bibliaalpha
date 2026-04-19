/**
 * apiBible.ts
 * Gerencia traduções bíblicas a partir de múltiplas fontes:
 *   - bible.helloao.org  (open source, sem chave, 1256+ traduções)
 *   - bible-api.com      (livre, Almeida JFA)
 *
 * Para adicionar uma nova tradução HelloAO, basta incluir uma entrada
 * em AVAILABLE_TRANSLATIONS com o ID correspondente.
 * Lista completa: https://bible.helloao.org/api/available_translations.json
 */

const HELLOAO_BASE = 'https://bible.helloao.org/api';

export interface ApiBibleTranslation {
  id: string;
  name: string;
  language: 'pt' | 'en';
}

export const AVAILABLE_TRANSLATIONS: ApiBibleTranslation[] = [
  // ── Português ──────────────────────────────────────────────────────────────
  { id: 'almeida',   name: 'Almeida Revista e Corrigida (ARC)',        language: 'pt' },
  { id: 'por_blj',   name: 'Bíblia Livre (BL)',                        language: 'pt' },
  { id: 'por_blt',   name: 'Bíblia Livre Para Todos (BLPT)',           language: 'pt' },
  { id: 'por_bsl',   name: 'Bíblia Portuguesa Mundial (BSL)',          language: 'pt' },
  { id: 'por_onbv',  name: 'Nova Bíblia Viva (NBV)',                   language: 'pt' },
  { id: 'por_tft',   name: 'Tradução para Tradutores (TFT)',           language: 'pt' },

  // ── English ─────────────────────────────────────────────────────────────────
  { id: 'eng_kjv',   name: 'King James Version (KJV)',                 language: 'en' },
  { id: 'eng_web',   name: 'World English Bible (WEB)',                language: 'en' },
  { id: 'eng_asv',   name: 'American Standard Version (ASV)',          language: 'en' },
  { id: 'eng_bbe',   name: 'Bible in Basic English (BBE)',             language: 'en' },
  { id: 'BSB',       name: 'Berean Standard Bible (BSB)',              language: 'en' },
];

function extractTextFromContent(content: any[]): string {
  return content
    .filter((c: any) => typeof c === 'string')
    .join('')
    .trim();
}

/**
 * Busca um capítulo completo de uma tradução.
 * Retorna array de objetos { type, number, content } compatível com ReadingArea.
 */
export async function getChapterFromApiBible(
  translationId: string,
  bookId: string,
  chapter: number
): Promise<any[]> {
  // Almeida via bible-api.com (a única sem CORS no HelloAO)
  if (translationId === 'almeida') {
    try {
      const res = await fetch(
        `https://bible-api.com/${bookId}+${chapter}?translation=almeida`
      );
      if (!res.ok) throw new Error('bible-api.com falhou');
      const data = await res.json();
      return data.verses.map((v: any) => ({
        type: 'verse',
        number: v.verse,
        content: [v.text.trim()],
      }));
    } catch (e) {
      console.error('[apiBible] Almeida fallback error:', e);
      return [{ type: 'verse', number: 1, content: ['Erro ao carregar. Tente outra tradução.'] }];
    }
  }

  // Todas as outras via HelloAO
  try {
    const res = await fetch(
      `${HELLOAO_BASE}/${translationId}/${bookId}/${chapter}.json`
    );
    if (!res.ok) throw new Error(`HelloAO retornou ${res.status} para ${translationId}`);
    const data = await res.json();

    return data.chapter.content
      .filter((item: any) => item.type === 'verse')
      .map((item: any) => ({
        type: 'verse',
        number: item.number,
        content: [extractTextFromContent(item.content)],
      }));
  } catch (e) {
    console.error(`[apiBible] Erro na tradução ${translationId}:`, e);
    return [{ type: 'verse', number: 1, content: ['Erro ao carregar tradução. Tente novamente.'] }];
  }
}

/**
 * Busca o texto de um versículo específico em uma tradução.
 */
export async function getVerseTranslation(
  bibleId: string,
  bookId: string,
  chapter: number,
  verseNumber: number
): Promise<string> {
  if (bibleId === 'almeida') {
    const res = await fetch(
      `https://bible-api.com/${bookId}+${chapter}:${verseNumber}?translation=almeida`
    );
    const data = await res.json();
    return data.text?.trim() || '';
  }

  const res = await fetch(
    `${HELLOAO_BASE}/${bibleId}/${bookId}/${chapter}.json`
  );
  if (!res.ok) throw new Error('Falha ao buscar versículo');
  const data = await res.json();
  const verse = data.chapter.content.find(
    (v: any) => v.type === 'verse' && v.number === verseNumber
  );
  return verse ? extractTextFromContent(verse.content) : '';
}
