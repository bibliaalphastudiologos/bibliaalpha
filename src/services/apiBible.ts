const API_BIBLE_BASE = 'https://api.scripture.api.bible/v1';

export interface ApiBibleTranslation {
  id: string;
  name: string;
  nameLocal: string;
}

export const AVAILABLE_TRANSLATIONS = [
  { id: 'almeida', name: 'João Ferreira de Almeida (JFA) - Padrão e Rápido' },
  { id: '90799bb5b996fddc-01', name: 'Almeida Revista e Corrigida (ARC) - Exige Chave API' },
  { id: '8fce9716773a4e93-01', name: 'Nova Versão Internacional (NVI) - Exige Chave API' },
];

export async function getVerseTranslation(bibleId: string, bookId: string, chapter: number, verseNumber: number): Promise<string> {
  const apiKey = import.meta.env.VITE_BIBLE_API_KEY;
  if (!apiKey && bibleId !== 'almeida') {
    throw new Error("Chave API.Bible necessária.");
  }
  
  if (bibleId === 'almeida') {
    const res = await fetch(`https://bible-api.com/${bookId}+${chapter}:${verseNumber}?translation=almeida`);
    const data = await res.json();
    return data.text || '';
  }

  const verseId = `${bookId}.${chapter}.${verseNumber}`;

  const res = await fetch(`${API_BIBLE_BASE}/bibles/${bibleId}/verses/${verseId}?content-type=text`, {
    headers: {
      'api-key': apiKey
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch translation from API.Bible");
  }

  const data = await res.json();
  return data.data.content;
}

export async function getChapterFromApiBible(bibleId: string, bookId: string, chapter: number): Promise<any[]> {
  // If translation is the free quick 'almeida', we bypass api.bible keys and go to bible-api.com
  if (bibleId === 'almeida') {
    try {
      const res = await fetch(`https://bible-api.com/${bookId}+${chapter}?translation=almeida`);
      if (!res.ok) throw new Error("Free API failed");
      const data = await res.json();
      
      return data.verses.map((v: any) => ({
        type: 'verse',
        number: v.verse,
        content: [v.text]
      }));
    } catch(e) {
      console.error(e);
      return [{ type: 'verse', number: 1, content: ['Erro ao carregar o texto bíblico gratuito.'] }];
    }
  }

  const apiKey = import.meta.env.VITE_BIBLE_API_KEY;
  if (!apiKey) {
    throw new Error("API.Bible Key is missing in environment variables. Add VITE_BIBLE_API_KEY.");
  }

  const chapterId = `${bookId}.${chapter}`;
  const res = await fetch(`${API_BIBLE_BASE}/bibles/${bibleId}/chapters/${chapterId}?content-type=json`, {
    headers: {
      'api-key': apiKey
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch chapter from API.Bible");
  }

  const data = await res.json();
  const rawText = data.data.content; 
  
  try {
    const rawAst = JSON.parse(rawText || "[]");
    return flattenApiBibleAst(rawAst);
  } catch(e) {
    return [{ type: 'verse', number: 1, content: ['Conteúdo não formatado.'] }];
  }
}

function flattenApiBibleAst(ast: any[]): any[] {
  let mapped: any[] = [];
  let currentVerseNumber = 0;
  
  function walk(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'tag' && node.name === 'v') {
        currentVerseNumber = parseInt(node.attrs?.number || "1");
        mapped.push({ type: 'verse', number: currentVerseNumber, content: [] });
      } else if (node.type === 'text' && currentVerseNumber > 0) {
        const last = mapped[mapped.length - 1];
        if (last && last.type === 'verse') {
          last.content.push(node.text);
        }
      } else if (node.items) {
        walk(node.items);
      }
    }
  }
  
  walk(ast);
  return mapped;
}
