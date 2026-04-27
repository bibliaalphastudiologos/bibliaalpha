/**
 * knowledgeApi.ts
 * APIs gratuitas de conhecimento — sem chave de API obrigatória:
 *
 *   - Wikipedia REST API PT + EN  (resumo, seções completas, artigos relacionados)
 *   - Google Books API             (livros de teologia, sem chave para consultas básicas)
 *   - MyMemory Translation API     (tradução EN→PT, gratuita, sem registro)
 */

const WIKI_PT_REST   = 'https://pt.wikipedia.org/api/rest_v1';
const WIKI_EN_REST   = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_PT_SEARCH = 'https://pt.wikipedia.org/w/api.php';
const WIKI_EN_SEARCH = 'https://en.wikipedia.org/w/api.php';
const GBOOKS_API     = 'https://www.googleapis.com/books/v1/volumes';
const MYMEMORY_API   = 'https://api.mymemory.translated.net/get';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface WikiSummary {
  title: string;
  displayTitle: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  pageUrl: string;
  lang: 'pt' | 'en';
}

export interface WikiSection {
  title: string;
  content: string;
  level: number;
}

export interface WikiRelated {
  title: string;
  description: string;
  thumbnail?: string;
  url: string;
}

export interface WikiSearchResult {
  title: string;
  description: string;
  url: string;
}

export interface GoogleBook {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail?: string;
  previewLink: string;
  publishedDate?: string;
}

export interface KnowledgeGraphEntity {
  name: string;
  description: string;
  detailedDescription?: string;
  imageUrl?: string;
  url?: string;
  types: string[];
}

// ── Wikipedia: Busca ─────────────────────────────────────────────────────────

export async function searchWikipedia(query: string): Promise<WikiSearchResult[]> {
  const p = new URLSearchParams({
    action: 'opensearch', search: query + ' bíblia', limit: '8',
    format: 'json', origin: '*',
  });
  try {
    const res = await fetch(WIKI_PT_SEARCH + '?' + p);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const titles: string[] = data[1] || [];
    const descriptions: string[] = data[2] || [];
    const urls: string[] = data[3] || [];
    if (titles.length > 0) {
      return titles.map((title, i) => ({ title, description: descriptions[i] || '', url: urls[i] || '' }));
    }
  } catch {}

  // Fallback EN sem contexto bíblico forçado
  const p2 = new URLSearchParams({ action: 'opensearch', search: query, limit: '8', format: 'json', origin: '*' });
  try {
    const res = await fetch(WIKI_EN_SEARCH + '?' + p2);
    if (!res.ok) return [];
    const data = await res.json();
    const t: string[] = data[1] || [];
    const d: string[] = data[2] || [];
    const u: string[] = data[3] || [];
    return t.map((title, i) => ({ title, description: d[i] || '', url: u[i] || '' }));
  } catch { return []; }
}

// ── Wikipedia: Resumo ────────────────────────────────────────────────────────

export async function getWikipediaSummary(title: string): Promise<WikiSummary | null> {
  const enc = encodeURIComponent(title.replace(/ /g, '_'));

  for (const [base, lang] of [[WIKI_PT_REST, 'pt'], [WIKI_EN_REST, 'en']] as const) {
    try {
      const res = await fetch(`${base}/page/summary/${enc}`);
      if (!res.ok) continue;
      const d = await res.json();
      if (d.type === 'disambiguation' || !d.extract) continue;
      return {
        title: d.title,
        displayTitle: d.displaytitle,
        extract: d.extract,
        thumbnail: d.thumbnail,
        pageUrl: d.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${enc}`,
        lang,
      };
    } catch {}
  }
  return null;
}

// ── Wikipedia: Seções completas do artigo ────────────────────────────────────

export async function getWikipediaSections(title: string, lang: 'pt' | 'en' = 'pt'): Promise<WikiSection[]> {
  const base = lang === 'pt' ? WIKI_PT_REST : WIKI_EN_REST;
  const enc  = encodeURIComponent(title.replace(/ /g, '_'));
  try {
    const res = await fetch(`${base}/page/mobile-sections/${enc}`);
    if (!res.ok) return [];
    const data = await res.json();
    const sections: WikiSection[] = [];

    // Seção principal (lead)
    if (data.lead?.sections?.length) {
      const lead = data.lead.sections[0];
      if (lead.text) {
        const text = stripHtml(lead.text);
        if (text) sections.push({ title: 'Introdução', content: text, level: 1 });
      }
    }

    // Demais seções
    const remaining = data.remaining?.sections ?? [];
    for (const sec of remaining.slice(0, 6)) {
      if (!sec.text) continue;
      const text = stripHtml(sec.text);
      if (text && text.length > 60) {
        sections.push({ title: sec.line ?? 'Seção', content: text.slice(0, 800), level: sec.toclevel ?? 2 });
      }
    }
    return sections;
  } catch { return []; }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 1000);
}

// ── Wikipedia: Artigos relacionados ─────────────────────────────────────────

export async function getWikipediaRelated(title: string, lang: 'pt' | 'en' = 'pt'): Promise<WikiRelated[]> {
  const base = lang === 'pt' ? WIKI_PT_REST : WIKI_EN_REST;
  const enc  = encodeURIComponent(title.replace(/ /g, '_'));
  try {
    const res = await fetch(`${base}/page/related/${enc}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.pages ?? []).slice(0, 5).map((p: any) => ({
      title: p.title,
      description: p.description ?? p.extract?.slice(0, 100) ?? '',
      thumbnail: p.thumbnail?.source,
      url: p.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`,
    }));
  } catch { return []; }
}

// ── Google Books ─────────────────────────────────────────────────────────────

export async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  try {
    const p = new URLSearchParams({ q: query + ' bíblia teologia', langRestrict: 'pt', maxResults: '5', orderBy: 'relevance', printType: 'books' });
    const res = await fetch(GBOOKS_API + '?' + p);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const items = data.items ?? [];
    if (items.length >= 2) return parseBooks(items);
    // Fallback EN
    const p2 = new URLSearchParams({ q: query + ' bible theology', maxResults: '5', orderBy: 'relevance', printType: 'books' });
    const res2 = await fetch(GBOOKS_API + '?' + p2);
    if (res2.ok) { const d2 = await res2.json(); return parseBooks(d2.items ?? []); }
    return parseBooks(items);
  } catch { return []; }
}

function parseBooks(items: any[]): GoogleBook[] {
  return items.map((item: any) => {
    const info = item.volumeInfo ?? {};
    return {
      id: item.id,
      title: info.title ?? 'Sem título',
      authors: info.authors ?? [],
      description: info.description ? info.description.slice(0, 250) : '',
      thumbnail: info.imageLinks?.thumbnail?.replace('http://', 'https://'),
      previewLink: info.previewLink ?? '',
      publishedDate: info.publishedDate,
    };
  });
}

// ── Tradução EN → PT: Google Translate (sem chave) com fallback MyMemory ──────

const translationCache = new Map<string, string>();

async function translateViaGoogle(text: string): Promise<string> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=' + encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error('google_translate_failed');
  const data = await res.json();
  // Response is [[["translated","original",...],...],...]
  const translated: string = (data[0] as any[][])
    .map((seg: any[]) => seg[0] ?? '')
    .join('')
    .trim();
  if (!translated) throw new Error('empty_response');
  return translated;
}

async function translateViaMyMemory(text: string): Promise<string> {
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|pt-BR`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('mymemory_failed');
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error('mymemory_status');
  return (data.responseData?.translatedText ?? '').replace(/<\/?g[^>]*>/g, '').trim();
}

export async function translateToPortuguese(text: string): Promise<string> {
  if (!text || text.trim().length < 10) return text;
  const key = text.slice(0, 120);
  if (translationCache.has(key)) return translationCache.get(key)!;

  try {
    const result = await translateViaGoogle(text);
    translationCache.set(key, result);
    return result;
  } catch {
    // Fallback: MyMemory
    try {
      const result = await translateViaMyMemory(text);
      translationCache.set(key, result);
      return result;
    } catch {
      return text;
    }
  }
}

// ── Knowledge Graph (opcional — mantido por compatibilidade) ─────────────────

export async function searchKnowledgeGraph(query: string): Promise<KnowledgeGraphEntity[]> {
  const key = (import.meta as any).env?.VITE_GOOGLE_KG_KEY;
  if (!key) return [];
  const params = new URLSearchParams({ query, key, limit: '3', languages: 'pt,en' });
  try {
    const res = await fetch(`https://kgsearch.googleapis.com/v1/entities:search?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.itemListElement ?? []).map((item: any) => {
      const e = item.result ?? {};
      return {
        name: e.name ?? '',
        description: e.description ?? '',
        detailedDescription: e.detailedDescription?.articleBody ?? '',
        imageUrl: e.image?.contentUrl,
        url: e.url ?? e.detailedDescription?.url,
        types: (e['@type'] ?? []) as string[],
      };
    });
  } catch { return []; }
}
