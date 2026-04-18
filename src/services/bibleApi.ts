const BIBLE_API_BASE = 'https://bible.helloao.org/api';
const TRANSLATION_ID = 'eng-web';
const COMMENTARIES_IDS = ['adam-clarke', 'jamieson-fausset-brown', 'matthew-henry'];

export interface Book {
  id: string;
  name: string;
  commonName: string;
  numberOfChapters: number;
}

export async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${BIBLE_API_BASE}/${TRANSLATION_ID}/books.json`);
  if (!res.ok) throw new Error('Failed to fetch books');
  const data = await res.json();
  return data.books;
}

export async function getChapter(bookId: string, chapter: number): Promise<any[]> {
  const res = await fetch(`${BIBLE_API_BASE}/${TRANSLATION_ID}/${bookId}/${chapter}.json`);
  if (!res.ok) throw new Error('Failed to fetch chapter');
  const data = await res.json();
  return data.chapter.content;
}

export async function getVerseCommentaries(bookId: string, chapter: number, verseNumber: number): Promise<any[]> {
  const promises = COMMENTARIES_IDS.map(async (commentaryId) => {
    try {
      const res = await fetch(`${BIBLE_API_BASE}/c/${commentaryId}/${bookId}/${chapter}.json`);
      if (!res.ok) return null;
      const data = await res.json();
      
      // Find the commentary for the specific verse
      const verseContent = data.chapter.content.find((v: any) => v.type === 'verse' && v.number === verseNumber);
      if (!verseContent || !verseContent.content || verseContent.content.length === 0) return null;

      // Extract text content
      const texts = verseContent.content.filter((c: any) => typeof c === 'string');
      // Limit to 1 main paragraph to meet "Máximo de 3 comentários por versículo" total across 3 authors
      let commentaryName = data.commentary?.name || commentaryId;
      switch(commentaryId) {
        case 'adam-clarke': commentaryName = "Adam Clarke"; break;
        case 'jamieson-fausset-brown': commentaryName = "Jamieson-Fausset-Brown"; break;
        case 'matthew-henry': commentaryName = "Matthew Henry"; break;
      }
      
      if (texts.length === 0) return null;

      return {
        author: commentaryName,
        texts: texts.slice(0, 1), // Take best paragraph
        id: commentaryId
      };
    } catch (e) {
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(Boolean); // removes nulls
}

export async function getChapterCommentMap(bookId: string, chapter: number): Promise<Set<number>> {
  const availableSet = new Set<number>();
  
  const promises = COMMENTARIES_IDS.map(async (commentaryId) => {
    try {
      const res = await fetch(`${BIBLE_API_BASE}/c/${commentaryId}/${bookId}/${chapter}.json`);
      if (!res.ok) return;
      const data = await res.json();
      
      if (data?.chapter?.content) {
        data.chapter.content.forEach((v: any) => {
          if (v.type === 'verse' && v.number && v.content && v.content.length > 0) {
            const hasText = v.content.some((c: any) => typeof c === 'string' && c.trim().length > 0);
            if (hasText) availableSet.add(v.number);
          }
        });
      }
    } catch (e) {}
  });

  await Promise.all(promises);
  return availableSet;
}
