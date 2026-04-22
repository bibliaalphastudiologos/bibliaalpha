import { Ebook } from '../data/ebooks';

    const CACHE_KEY = 'bibliaalpha_ebooks_dynamic_v2';
    const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 3;

    interface CacheShape { savedAt: number; items: Ebook[]; }

    function categorizar(subjects: string[] | undefined, autor: string): string {
      const s = (subjects || []).join(' ').toLowerCase();
      const a = autor.toLowerCase();
      if (a.includes('augustine') || a.includes('agostinho') || a.includes('chrysostom') || a.includes('athanasius')) return 'Patrística';
      if (a.includes('calvin') || a.includes('luther') || a.includes('zwingli')) return 'Reforma';
      if (a.includes('bunyan') || a.includes('edwards') || a.includes('owen') || a.includes('baxter') || a.includes('sibbes') || a.includes('henry')) return 'Puritanos';
      if (s.includes('commentary') || s.includes('comentário')) return 'Comentários Bíblicos';
      if (s.includes('systematic') || s.includes('dogmatic')) return 'Teologia Sistemática';
      if (a.includes('aquinas') || a.includes('aquino') || s.includes('philosophy')) return 'Filosofia Cristã';
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
      { autor: 'João Calvino', query: 'creator:(Calvin) AND mediatype:texts' },
      { autor: 'Martinho Lutero', query: 'creator:(Luther) AND mediatype:texts' },
      { autor: 'John Bunyan', query: 'creator:(Bunyan) AND mediatype:texts' },
      { autor: 'Jonathan Edwards', query: 'creator:("Jonathan Edwards") AND mediatype:texts' },
      { autor: 'Matthew Henry', query: 'creator:("Matthew Henry") AND mediatype:texts' },
      { autor: 'John Gill', query: 'creator:("John Gill") AND mediatype:texts' },
      { autor: 'A. W. Pink', query: 'creator:("Arthur Pink" OR "A.W. Pink") AND mediatype:texts' },
      { autor: 'Louis Berkhof', query: 'creator:(Berkhof) AND mediatype:texts' },
      { autor: 'Tomás de Aquino', query: 'creator:(Aquinas) AND mediatype:texts' },
    ];

    async function buscarArchive(autorLabel: string, q: string): Promise<Ebook[]> {
      const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=subject&fl[]=language&rows=15&output=json`;
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
          const idiomaLabel = /por|portug/i.test(lang) ? 'Português' : /eng|english/i.test(lang) ? 'Inglês' : 'Latim';
          items.push({
            slug: slugify(`${autorLabel}-${d.title}-${d.identifier}`),
            titulo: String(d.title).slice(0, 160),
            autor: autorLabel,
            categoria: categorizar(subjects, autorLabel),
            idioma: idiomaLabel,
            fonte: 'Internet Archive · Texto',
            url: `https://archive.org/stream/${d.identifier}/${d.identifier}_djvu.txt`,
            urlOriginal: `https://archive.org/details/${d.identifier}`,
            capa: `https://archive.org/services/img/${d.identifier}`,
          });
        }
        return items;
      } catch {
        return [];
      }
    }

    export async function expandirEbooks(existentes: Ebook[]): Promise<Ebook[]> {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const c: CacheShape = JSON.parse(raw);
          if (Date.now() - c.savedAt < CACHE_TTL_MS && Array.isArray(c.items)) {
            return c.items;
          }
        }
      } catch { /* ignore */ }

      const baseUrls = new Set(existentes.map(e => e.url));
      const resultados: Ebook[] = [];
      for (const { autor, query } of AUTORES_QUERY) {
        const items = await buscarArchive(autor, query);
        for (const it of items) {
          if (!baseUrls.has(it.url)) {
            baseUrls.add(it.url);
            resultados.push(it);
          }
        }
      }
      const full = [...existentes, ...resultados];
      try {
        const payload: CacheShape = { savedAt: Date.now(), items: full };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch { /* ignore */ }
      return full;
    }
    