import { Ebook } from '../data/ebooks';

// Fontes abertas integradas (verificadas diretamente em cada repositório/API):
//  - Open English Bible         github.com/openenglishbible/Open-English-Bible
//  - Sefaria Project            github.com/Sefaria/Sefaria-Project
//  - Commentaries-Database      github.com/HistoricalChristianFaith/Commentaries-Database
//  - Awesome Bible Dev Res.     github.com/biblenerd/awesome-bible-developer-resources
//  - Study Bible MCP            github.com/djayatillake/studybible-mcp
//  - Open Siddur Project        github.com/opensiddur/opensiddur
//  - TheologAI                  github.com/TJ-Frederick/TheologAI

const OEB_BASE = 'https://raw.githubusercontent.com/openenglishbible/Open-English-Bible/master/artifacts/us-release';
const OEB_HTML = `${OEB_BASE}/OEB-2025.6-US_html`;
const OEB_REPO = 'https://github.com/openenglishbible/Open-English-Bible';

const OEB_BOOKS: { file: string; title: string }[] = [
  { file: 'b001', title: 'Genesis' },
  { file: 'b006', title: 'Joshua' },
  { file: 'b008', title: 'Ruth' },
  { file: 'b017', title: 'Esther' },
  { file: 'b019', title: 'Psalms' },
  { file: 'b028', title: 'Hosea' },
  { file: 'b029', title: 'Joel' },
  { file: 'b030', title: 'Amos' },
  { file: 'b031', title: 'Obadiah' },
  { file: 'b032', title: 'Jonah' },
  { file: 'b033', title: 'Micah' },
  { file: 'b034', title: 'Nahum' },
  { file: 'b035', title: 'Habakkuk' },
  { file: 'b036', title: 'Zephaniah' },
  { file: 'b037', title: 'Haggai' },
  { file: 'b038', title: 'Zechariah' },
  { file: 'b039', title: 'Malachi' },
  { file: 'b040', title: 'Matthew' },
  { file: 'b041', title: 'Mark' },
  { file: 'b042', title: 'Luke' },
  { file: 'b043', title: 'John' },
  { file: 'b044', title: 'Acts' },
  { file: 'b045', title: 'Romans' },
  { file: 'b046', title: '1 Corinthians' },
  { file: 'b047', title: '2 Corinthians' },
  { file: 'b048', title: 'Galatians' },
  { file: 'b049', title: 'Ephesians' },
  { file: 'b050', title: 'Philippians' },
  { file: 'b051', title: 'Colossians' },
  { file: 'b052', title: '1 Thessalonians' },
  { file: 'b053', title: '2 Thessalonians' },
  { file: 'b054', title: '1 Timothy' },
  { file: 'b055', title: '2 Timothy' },
  { file: 'b056', title: 'Titus' },
  { file: 'b057', title: 'Philemon' },
  { file: 'b058', title: 'Hebrews' },
  { file: 'b059', title: 'James' },
  { file: 'b060', title: '1 Peter' },
  { file: 'b061', title: '2 Peter' },
  { file: 'b062', title: '1 John' },
  { file: 'b063', title: '2 John' },
  { file: 'b064', title: '3 John' },
  { file: 'b065', title: 'Jude' },
  { file: 'b066', title: 'Revelation' },
];

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const oebEntries: Ebook[] = OEB_BOOKS.map(b => ({
  slug: `oeb-${b.file}-${slugify(b.title)}`,
  titulo: `Open English Bible — ${b.title}`,
  autor: 'Open English Bible Project',
  categoria: 'Bíblia & Textos Sagrados',
  idioma: 'Inglês',
  fonte: 'OEB · GitHub · HTML',
  url: `${OEB_HTML}/${b.file}.html`,
  urlOriginal: OEB_REPO,
}));

oebEntries.push(
  {
    slug: 'oeb-complete-pdf',
    titulo: 'Open English Bible — Bíblia Completa (PDF)',
    autor: 'Open English Bible Project',
    categoria: 'Bíblia & Textos Sagrados',
    idioma: 'Inglês',
    fonte: 'OEB · GitHub · PDF',
    url: `${OEB_BASE}/OEB-2025.6-US.pdf`,
    urlOriginal: OEB_REPO,
  },
  {
    slug: 'oeb-complete-epub',
    titulo: 'Open English Bible — Bíblia Completa (EPUB)',
    autor: 'Open English Bible Project',
    categoria: 'Bíblia & Textos Sagrados',
    idioma: 'Inglês',
    fonte: 'OEB · GitHub · EPUB',
    url: `${OEB_BASE}/OEB-2025.6-US.epub`,
    urlOriginal: OEB_REPO,
  },
);

const SEFARIA_SEED: { title: string; categoria: string }[] = [
  { title: 'Genesis', categoria: 'Tanakh' },
  { title: 'Exodus', categoria: 'Tanakh' },
  { title: 'Leviticus', categoria: 'Tanakh' },
  { title: 'Numbers', categoria: 'Tanakh' },
  { title: 'Deuteronomy', categoria: 'Tanakh' },
  { title: 'Psalms', categoria: 'Tanakh' },
  { title: 'Proverbs', categoria: 'Tanakh' },
  { title: 'Isaiah', categoria: 'Tanakh' },
  { title: 'Rashi on Genesis', categoria: 'Comentários Judaicos' },
  { title: 'Rashi on Exodus', categoria: 'Comentários Judaicos' },
  { title: 'Ibn Ezra on Genesis', categoria: 'Comentários Judaicos' },
  { title: 'Ramban on Genesis', categoria: 'Comentários Judaicos' },
  { title: 'Mishneh Torah, Foundations of the Torah', categoria: 'Filosofia Religiosa' },
  { title: 'Guide for the Perplexed', categoria: 'Filosofia Religiosa' },
  { title: 'Kuzari', categoria: 'Filosofia Religiosa' },
];

const sefariaEntries: Ebook[] = SEFARIA_SEED.map(s => ({
  slug: `sefaria-${slugify(s.title)}`,
  titulo: `Sefaria — ${s.title}`,
  autor: 'Sefaria Project',
  categoria: s.categoria,
  idioma: 'Inglês / Hebraico',
  fonte: 'Sefaria · Web',
  url: `https://www.sefaria.org/${s.title.replace(/,/g, '').replace(/\s+/g, '_')}?lang=bi`,
  urlOriginal: 'https://github.com/Sefaria/Sefaria-Project',
}));

const recursos: Ebook[] = [
  {
    slug: 'commentaries-database-hcf',
    titulo: 'Commentaries Database — Comentários Patrísticos e Reformados',
    autor: 'Historical Christian Faith',
    categoria: 'Comentários Bíblicos',
    idioma: 'Inglês',
    fonte: 'GitHub · Database',
    url: 'https://github.com/HistoricalChristianFaith/Commentaries-Database',
    urlOriginal: 'https://github.com/HistoricalChristianFaith/Commentaries-Database',
  },
  {
    slug: 'awesome-bible-dev-resources',
    titulo: 'Awesome Bible Developer Resources — Compêndio de Bíblias e Datasets',
    autor: 'biblenerd (comunidade)',
    categoria: 'Recursos & Ferramentas',
    idioma: 'Inglês',
    fonte: 'GitHub · Curadoria',
    url: 'https://github.com/biblenerd/awesome-bible-developer-resources',
    urlOriginal: 'https://github.com/biblenerd/awesome-bible-developer-resources',
  },
  {
    slug: 'studybible-mcp',
    titulo: 'Study Bible MCP — Léxicos e Contexto Cultural',
    autor: 'djayatillake',
    categoria: 'Recursos & Ferramentas',
    idioma: 'Inglês',
    fonte: 'GitHub · MCP Server',
    url: 'https://github.com/djayatillake/studybible-mcp',
    urlOriginal: 'https://github.com/djayatillake/studybible-mcp',
  },
  {
    slug: 'opensiddur',
    titulo: 'Open Siddur Project — Textos Litúrgicos de Domínio Público',
    autor: 'Open Siddur Project',
    categoria: 'Liturgia',
    idioma: 'Hebraico / Inglês',
    fonte: 'GitHub · Textos',
    url: 'https://github.com/opensiddur/opensiddur',
    urlOriginal: 'https://github.com/opensiddur/opensiddur',
  },
  {
    slug: 'theolog-ai',
    titulo: 'TheologAI — Servidor de Estudo Teológico',
    autor: 'TJ-Frederick',
    categoria: 'Recursos & Ferramentas',
    idioma: 'Inglês',
    fonte: 'GitHub · Servidor',
    url: 'https://github.com/TJ-Frederick/TheologAI',
    urlOriginal: 'https://github.com/TJ-Frederick/TheologAI',
  },
];

export const openSourceEbooks: Ebook[] = [...oebEntries, ...sefariaEntries, ...recursos];
