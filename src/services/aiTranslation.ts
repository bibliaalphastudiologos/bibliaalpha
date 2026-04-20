/**
 * aiTranslation.ts
 * Traduz comentários bíblicos do inglês para o português usando:
 *   - MyMemory API (gratuita, sem chave de API, 1000 req/dia por IP)
 *   - Fallback: retorna o texto original se a API falhar
 *
 * Remove dependência do Gemini API (que requer chave paga).
 */

import { translateToPortuguese } from './knowledgeApi';

export async function translateChapterText(
  _bookId: string,
  _chapter: number,
  verses: any[]
): Promise<any[]> {
  // Capítulos já chegam em PT pelas traduções selecionadas — sem necessidade de tradução
  return verses;
}

export async function translateCommentaries(
  _bookId: string,
  _chapter: number,
  _verseNumber: number,
  commentaries: any[]
): Promise<any[]> {
  if (commentaries.length === 0) return commentaries;

  // Traduz cada comentário em paralelo com fallback individual
  const translated = await Promise.allSettled(
    commentaries.map(async (comment) => {
      try {
        const results = await Promise.allSettled(
          comment.texts.map((t: string) => translateToPortuguese(t))
        );
        const texts = results.map((r, i) =>
          r.status === 'fulfilled' ? r.value : comment.texts[i]
        );
        return { ...comment, texts };
      } catch {
        return comment;
      }
    })
  );

  return translated.map((r, i) =>
    r.status === 'fulfilled' ? r.value : commentaries[i]
  );
}
