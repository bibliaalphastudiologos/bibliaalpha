const HELLOAO_BASE = 'https://bible.helloao.org/api';

    export interface ApiBibleTranslation {
      id: string;
      name: string;
    }

    export const AVAILABLE_TRANSLATIONS: ApiBibleTranslation[] = [
      { id: 'almeida', name: 'João Ferreira de Almeida (JFA)' },
      { id: 'por_blj', name: 'Bíblia Livre (BL)' },
      { id: 'por_bsl', name: 'Bíblia Portuguesa Mundial (BSL)' },
      { id: 'por_onbv', name: 'Nova Bíblia Viva (ONBV)' },
    ];

    function extractTextFromContent(content: any[]): string {
      return content
        .filter((c: any) => typeof c === 'string')
        .join('')
        .trim();
    }

    export async function getChapterFromApiBible(translationId: string, bookId: string, chapter: number): Promise<any[]> {
      if (translationId === 'almeida') {
        try {
          const res = await fetch(`https://bible-api.com/${bookId}+${chapter}?translation=almeida`);
          if (!res.ok) throw new Error("Free API failed");
          const data = await res.json();
      
          return data.verses.map((v: any) => ({
            type: 'verse',
            number: v.verse,
            content: [v.text.trim()]
          }));
        } catch(e) {
          console.error(e);
          return [{ type: 'verse', number: 1, content: ['Erro ao carregar. Tente outra tradução.'] }];
        }
      }

      try {
        const res = await fetch(`${HELLOAO_BASE}/${translationId}/${bookId}/${chapter}.json`);
        if (!res.ok) throw new Error(`Failed to fetch ${translationId}`);
        const data = await res.json();

        return data.chapter.content
          .filter((item: any) => item.type === 'verse')
          .map((item: any) => ({
            type: 'verse',
            number: item.number,
            content: [extractTextFromContent(item.content)]
          }));
      } catch (e) {
        console.error("Translation fetch error:", e);
        return [{ type: 'verse', number: 1, content: ['Erro ao carregar tradução. Tente novamente.'] }];
      }
    }

    export async function getVerseTranslation(bibleId: string, bookId: string, chapter: number, verseNumber: number): Promise<string> {
      if (bibleId === 'almeida') {
        const res = await fetch(`https://bible-api.com/${bookId}+${chapter}:${verseNumber}?translation=almeida`);
        const data = await res.json();
        return data.text || '';
      }

      const res = await fetch(`${HELLOAO_BASE}/${bibleId}/${bookId}/${chapter}.json`);
      if (!res.ok) throw new Error("Failed to fetch verse");
      const data = await res.json();
      const verse = data.chapter.content.find((v: any) => v.type === 'verse' && v.number === verseNumber);
      if (!verse) return '';
      return extractTextFromContent(verse.content);
    }
    