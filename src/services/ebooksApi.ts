import { Ebook } from '../data/ebooks';
import { openSourceEbooks } from '../data/openSourceEbooks';

const CACHE_KEY = 'bibliaalpha_ebooks_dynamic_v4';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 3;

interface CacheShape { savedAt: number; items: Ebook[]; }

function categorizar(subjects: string[] | undefined, autor: string): string {
  const s = (subjects || []).join(' ').toLowerCase();
  const a = autor.toLowerCase();
  if (a.includes('augustine') || a.includes('agostinho') || a.includes('chrysostom') || a.includes('athanasius') || a.includes('irenaeus') || a.includes('tertullian')) return 'Patrística';
  if (a.includes('calvin') || a.includes('luther') || a.includes('zwingli') || a.includes('melanchthon')) return 'Reforma';
  if (a.includes('bunyan') || a.includes('edwards') || a.includes('owen') || a.includes('baxter') || a.includes('sibbes') || a.includes('henry') || a.includes('spurgeon') || a.includes('ryle') || a.includes('flavel') || a.includes('watson')) return 'Puritanos';
  if (s.includes('commentary') || s.includes('comentário') || s.includes('exposition') || s.includes('sermons')) return 'Comentários Bíblicos';
  if (s.includes('systematic') || s.includes('dogmatic')) return 'Teologia Sistemática';
  if (a.includes('aquinas') || a.includes('aquino') || a.includes('anselm') || a.includes('pascal') || s.includes('philosophy')) return 'Filosofia Cristã';
  return 'Teologia Sistemática';
}

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
}

interface ArchiveDoc {
  identifier: string;
  title?: string;
  creator?: string | string[];
  subject?: string | string[];
  language?: string | string[];
  mediatype?: string;
}

const AUTORES_QUERY: { autor: string; query: string }[] = [
  { autor: 'Agostinho de Hipona', query: 'creator:(Augustine) AND mediatype:texts' },
  { autor: 'João Calvino',        query: 'creator:(Calvin) AND mediatype:texts' },
  { autor: 'Martinho Lutero',     query: 'creator:(Luther) AND mediatype:texts' },
  { autor: 'John Bunyan',         query: 'creator:(Bunyan) AND mediatype:texts' },
  { autor: 'Jonathan Edwards',    query: 'creator:("Jonathan Edwards") AND mediatype:texts' },
  { autor: 'Matthew Henry',       query: 'creator:("Matthew Henry") AND mediatype:texts' },
  { autor: 'John Gill',           query: 'creator:("John Gill") AND mediatype:texts' },
  { autor: 'A. W. Pink',          query: 'creator:("Arthur Pink" OR "A.W. Pink") AND mediatype:texts' },
  { autor: 'Louis Berkhof',       query: 'creator:(Berkhof) AND mediatype:texts' },
  { autor: 'Tomás de Aquino',     query: 'creator:(Aquinas) AND mediatype:texts' },
  { autor: 'Charles Spurgeon',    query: 'creator:("Charles Spurgeon" OR "C. H. Spurgeon") AND mediatype:texts' },
  { autor: 'John Owen',           query: 'creator:("John Owen") AND mediatype:texts' },
  { autor: 'J. C. Ryle',          query: 'creator:("J. C. Ryle") AND mediatype:texts' },
  { autor: 'Thomas Watson',       query: 'creator:("Thomas Watson") AND mediatype:texts' },
  { autor: 'Richard Sibbes',      query: 'creator:("Richard Sibbes") AND mediatype:texts' },
  { autor: 'John Chrysostom',     query: 'creator:(Chrysostom) AND mediatype:texts' },
  { autor: 'B. B. Warfield',      query: 'creator:("Benjamin Warfield" OR "B. B. Warfield") AND mediatype:texts' },
  { autor: 'Herman Bavinck',      query: 'creator:(Bavinck) AND mediatype:texts' },
];

async function buscarArchive(autorLabel: string, q: string): Promise<Ebook[]> {
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=subject&fl[]=language&rows=12&output=json`;
  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const j = await r.json();
    const docs: ArchiveDoc[] = j?.response?.docs || [];
    const items: Ebook[] = [];
    for (const d of docs) {
      if (!d.identifier || !d.title) continue;
      const subjects = Array.isArray(d.subject) ? d.subject : d.subject ? [d.subject] : [];
      const lang = Array.isArray(d.language) ? d.language[0] : d.language || 'eng';
      const idiomaLabel = /por|portug/i.test(lang) ? 'Português' : /eng|english/i.test(lang) ? 'Inglês' : /lat/i.test(lang) ? 'Latim' : 'Inglês';
      items.push({
        slug: slugify(`${autorLabel}-${d.title}-${d.identifier}`),
        titulo: String(d.title).slice(0, 160),
        autor: autorLabel,
        categoria: categorizar(subjects, autorLabel),
        idioma: idiomaLabel,
        fonte: 'Internet Archive · Texto',
        url: `https://archive.org/stream/${d.identifier}/${d.identifier}_djvu.txt`,
        urlOriginal: `https://archive.org/details/${d.identifier}`,
      });
    }
    return items;
  } catch {
    return [];
  }
}

interface GutendexBook { id: number; title: string; authors?: { name?: string }[]; subjects?: string[]; languages?: string[]; formats?: Record<string, string>; }
const GUTENDEX_TOPICS = ['theology', 'christianity', 'bible', 'religion', 'sermons', 'apologetics'];

function pickReadUrl(formats: Record<string, string> | undefined): string | null {
  if (!formats) return null;
  const h = Object.keys(formats).find(k => k.startsWith('text/html') && !k.includes('zip'));
  if (h) return formats[h];
  const t = Object.keys(formats).find(k => k.startsWith('text/plain') && !k.includes('zip'));
  return t ? formats[t] : null;
}

async function buscarGutendex(topic: string): Promise<Ebook[]> {
  try {
    const r = await fetch(`https://gutendex.com/books?topic=${encodeURIComponent(topic)}&languages=en&page_size=32`);
    if (!r.ok) return [];
    const j = await r.json();
    const items: Ebook[] = [];
    for (const b of (j?.results || []) as GutendexBook[]) {
      const autor = b.authors?.[0]?.name || 'Desconhecido';
      const leitura = pickReadUrl(b.formats);
      if (!leitura) continue;
      const lang = b.languages?.[0] || 'en';
      const idiomaLabel = /pt/i.test(lang) ? 'Português' : /en/i.test(lang) ? 'Inglês' : /la/i.test(lang) ? 'Latim' : 'Inglês';
      items.push({
        slug: slugify(`gutenberg-${autor}-${b.title}-${b.id}`),
        titulo: String(b.title).slice(0, 160),
        autor: autor.replace(/,\s*(\d{4}.*)?$/, '').trim(),
        categoria: categorizar(b.subjects, autor),
        idioma: idiomaLabel,
        fonte: 'Project Gutenberg · HTML',
        url: leitura,
        urlOriginal: `https://www.gutenberg.org/ebooks/${b.id}`,
      });
    }
    return items;
  } catch { return []; }
}

export async function expandirEbooks(existentes: Ebook[]): Promise<Ebook[]> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const c: CacheShape = JSON.parse(raw);
      if (Date.now() - c.savedAt < CACHE_TTL_MS && Array.isArray(c.items)) return c.items;
    }
  } catch { /* ignore */ }

  const baseUrls = new Set(existentes.map(e => e.url));
  const resultados: Ebook[] = [];

  for (const it of openSourceEbooks) {
    if (!baseUrls.has(it.url)) { baseUrls.add(it.url); resultados.push(it); }
  }

  const archiveBatches = await Promise.all(AUTORES_QUERY.map(q => buscarArchive(q.autor, q.query).catch(() => [] as Ebook[])));
  for (const items of archiveBatches) for (const it of items) { if (!baseUrls.has(it.url)) { baseUrls.add(it.url); resultados.push(it); } }

  const gutendexBatches = await Promise.all(GUTENDEX_TOPICS.map(t => buscarGutendex(t).catch(() => [] as Ebook[])));
  for (const items of gutendexBatches) for (const it of items) { if (!baseUrls.has(it.url)) { baseUrls.add(it.url); resultados.push(it); } }

  const full = [...existentes, ...resultados];
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items: full })); } catch { /* ignore */ }
  return full;
}
