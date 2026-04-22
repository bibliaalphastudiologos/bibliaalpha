import { Ebook } from '../data/ebooks';

    const CACHE_KEY = 'bibliaalpha_ebooks_dynamic_v1';
    const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 3;

    interface CacheShape { savedAt: number; items: Ebook[]; }

    function categorizar(subjects: string[] | undefined, autor: string): string {
      const s = (subjects || []).join(' ').toLowerCase();
      const a = autor.toLowerCase();
      if (a.includes('augustine') || a.includes('agostinho') || a.includes('chrysostom') || a.includes('athanasius')) return 'Patrística';
      if (a.includes('calvin') || a.includes('luther') || a.includes('zwingli')) return 'Reforma';
      if (a.includes('bunyan') || a.includes('edwards') || a.includes('owen') || a.includes('baxter') || a.includes('sibbes')) return 'Puritanos';
      if (s.includes('commentary') || s.includes('comentário')) return 'Comentários Bíblicos';
      if (s.includes('systematic') || s.includes('dogmatic')) return 'Teologia Sistemática';
      if (a.includes('aquinas') || a.includes('aquino') || s.includes('philosophy')) return 'Filosofia Cristã';
      return 'Teologia Sistemática';
    }

    function slugify(s: string): string {
      return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
    }

    export async function fetchDynamicEbooks(): Promise<Ebook[]> {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached: CacheShape = JSON.parse(raw);
          if (Date.now() - cached.savedAt < CACHE_TTL_MS && cached.items?.length) {
            return cached.items;
          }
        }
      } catch {}

      const autores = ['Augustine of Hippo', 'John Calvin', 'Martin Luther', 'Jonathan Edwards', 'John Bunyan', 'Thomas Aquinas', 'Charles Spurgeon', 'John Owen', 'Richard Baxter'];
      const results: Ebook[] = [];
      const seen = new Set<string>();

      await Promise.all(autores.map(async (autor) => {
        try {
          const q = encodeURIComponent(autor);
          const url = `https://openlibrary.org/search.json?author=${q}&subject=christianity&has_fulltext=true&limit=8`;
          const resp = await fetch(url);
          if (!resp.ok) return;
          const data = await resp.json();
          const docs = data.docs || [];
          for (const d of docs) {
            if (!d.ia || d.ia.length === 0) continue;
            const iaId = d.ia[0];
            const title: string = d.title || '';
            if (!title || seen.has(iaId)) continue;
            seen.add(iaId);
            const subjects: string[] = d.subject || [];
            const hasChristian = subjects.some(s => /christ|bible|theolog|sermon|religion|puritan|reform/i.test(s)) || /christ|bible|theolog|sermon/i.test(title);
            if (!hasChristian) continue;
            results.push({
              slug: slugify(`${autor}-${title}-${iaId}`),
              titulo: title,
              autor,
              categoria: categorizar(subjects, autor),
              idioma: (d.language && d.language[0] === 'por') ? 'Português' : 'Inglês',
              fonte: 'Internet Archive',
              url: `https://archive.org/details/${iaId}`,
              capa: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : `https://archive.org/services/img/${iaId}`,
            });
          }
        } catch (e) {
          console.warn('[ebooks] falhou autor', autor, e);
        }
      }));

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items: results }));
      } catch {}
      return results;
    }
    