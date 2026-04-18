export interface Milestone {
  id: string;
  label: string;
  bookId: string;
  chapters: number[];
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  milestones: Milestone[];
}

const BIBLE_BOOKS = [
  { id: 'gen', name: 'Gênesis', chapters: 50 },
  { id: 'exo', name: 'Êxodo', chapters: 40 },
  { id: 'lev', name: 'Levítico', chapters: 27 },
  { id: 'num', name: 'Números', chapters: 36 },
  { id: 'deu', name: 'Deuteronômio', chapters: 34 },
  { id: 'jos', name: 'Josué', chapters: 24 },
  { id: 'jdg', name: 'Juízes', chapters: 21 },
  { id: 'rut', name: 'Rute', chapters: 4 },
  { id: '1sa', name: '1 Samuel', chapters: 31 },
  { id: '2sa', name: '2 Samuel', chapters: 24 },
  { id: '1ki', name: '1 Reis', chapters: 22 },
  { id: '2ki', name: '2 Reis', chapters: 25 },
  { id: '1ch', name: '1 Crônicas', chapters: 29 },
  { id: '2ch', name: '2 Crônicas', chapters: 36 },
  { id: 'ezr', name: 'Esdras', chapters: 10 },
  { id: 'neh', name: 'Neemias', chapters: 13 },
  { id: 'est', name: 'Ester', chapters: 10 },
  { id: 'job', name: 'Jó', chapters: 42 },
  { id: 'psa', name: 'Salmos', chapters: 150 },
  { id: 'pro', name: 'Provérbios', chapters: 31 },
  { id: 'ecc', name: 'Eclesiastes', chapters: 12 },
  { id: 'sng', name: 'Cânticos', chapters: 8 },
  { id: 'isa', name: 'Isaías', chapters: 66 },
  { id: 'jer', name: 'Jeremias', chapters: 52 },
  { id: 'lam', name: 'Lamentações', chapters: 5 },
  { id: 'ezk', name: 'Ezequiel', chapters: 48 },
  { id: 'dan', name: 'Daniel', chapters: 12 },
  { id: 'hos', name: 'Oséias', chapters: 14 },
  { id: 'jol', name: 'Joel', chapters: 3 },
  { id: 'amo', name: 'Amós', chapters: 9 },
  { id: 'oba', name: 'Obadias', chapters: 1 },
  { id: 'jon', name: 'Jonas', chapters: 4 },
  { id: 'mic', name: 'Miquéias', chapters: 7 },
  { id: 'nam', name: 'Naum', chapters: 3 },
  { id: 'hab', name: 'Habacuque', chapters: 3 },
  { id: 'zep', name: 'Sofonias', chapters: 3 },
  { id: 'hag', name: 'Ageu', chapters: 2 },
  { id: 'zec', name: 'Zacarias', chapters: 14 },
  { id: 'mal', name: 'Malaquias', chapters: 4 },
  { id: 'mat', name: 'Mateus', chapters: 28 },
  { id: 'mrk', name: 'Marcos', chapters: 16 },
  { id: 'luk', name: 'Lucas', chapters: 24 },
  { id: 'jhn', name: 'João', chapters: 21 },
  { id: 'act', name: 'Atos', chapters: 28 },
  { id: 'rom', name: 'Romanos', chapters: 16 },
  { id: '1co', name: '1 Coríntios', chapters: 16 },
  { id: '2co', name: '2 Coríntios', chapters: 13 },
  { id: 'gal', name: 'Gálatas', chapters: 6 },
  { id: 'eph', name: 'Efésios', chapters: 6 },
  { id: 'php', name: 'Filipenses', chapters: 4 },
  { id: 'col', name: 'Colossenses', chapters: 4 },
  { id: '1th', name: '1 Tessalonicenses', chapters: 5 },
  { id: '2th', name: '2 Tessalonicenses', chapters: 3 },
  { id: '1ti', name: '1 Timóteo', chapters: 6 },
  { id: '2ti', name: '2 Timóteo', chapters: 4 },
  { id: 'tit', name: 'Tito', chapters: 3 },
  { id: 'phm', name: 'Filemom', chapters: 1 },
  { id: 'heb', name: 'Hebreus', chapters: 13 },
  { id: 'jas', name: 'Tiago', chapters: 5 },
  { id: '1pe', name: '1 Pedro', chapters: 5 },
  { id: '2pe', name: '2 Pedro', chapters: 3 },
  { id: '1jn', name: '1 João', chapters: 5 },
  { id: '2jn', name: '2 João', chapters: 1 },
  { id: '3jn', name: '3 João', chapters: 1 },
  { id: 'jud', name: 'Judas', chapters: 1 },
  { id: 'rev', name: 'Apocalipse', chapters: 22 }
];

const allChapters: { bookId: string; bookName: string; chapter: number }[] = [];
BIBLE_BOOKS.forEach(b => {
  for (let i = 1; i <= b.chapters; i++) {
    allChapters.push({ bookId: b.id, bookName: b.name, chapter: i });
  }
});

const ntIndex = allChapters.findIndex(c => c.bookId === 'mat');
const ntChapters = allChapters.slice(ntIndex);

function createChunkedPlan(id: string, title: string, description: string, chaptersList: any[], days: number): Plan {
  const chunks: Milestone[] = [];
  const chaptersPerChunk = chaptersList.length / days;
  
  for (let i = 0; i < days; i++) {
    const start = Math.floor(i * chaptersPerChunk);
    const end = i === days - 1 ? chaptersList.length : Math.floor((i + 1) * chaptersPerChunk);
    const dayChapters = chaptersList.slice(start, end);
    
    if (dayChapters.length === 0) continue;

    const first = dayChapters[0];
    const last = dayChapters[dayChapters.length - 1];
    
    const label = first.bookId === last.bookId 
      ? `Dia ${i + 1}: ${first.bookName} ${first.chapter}${first.chapter !== last.chapter ? `-${last.chapter}` : ''}`
      : `Dia ${i + 1}: ${first.bookName} ${first.chapter} a ${last.bookName} ${last.chapter}`;
      
    chunks.push({
      id: `${id}-day-${i+1}`,
      label,
      bookId: first.bookId,
      chapters: dayChapters.map(c => c.chapter)
    });
  }
  return { id, title, description, milestones: chunks };
}

export const plan1Year = createChunkedPlan(
  'whole-bible', 
  'Bíblia Toda em 1 Ano', 
  'Uma jornada completa diária cobrindo de Gênesis a Apocalipse de maneira linear (365 dias).', 
  allChapters, 
  365
);

export const planNT30 = createChunkedPlan(
  'new-testament', 
  'Novo Testamento em 30 Dias', 
  'Mergulhe profundamente nos Evangelhos, Atos, Cartas e no Apocalipse em apenas 30 dias.', 
  ntChapters, 
  30
);

export const planGospels = createChunkedPlan(
  'gospels-40',
  'Os Quatro Evangelhos (40 Dias)',
  'Um estudo panorâmico da vida e obra de Jesus descrita pelos quatro evangelistas.',
  allChapters.filter(c => ['mat', 'mrk', 'luk', 'jhn'].includes(c.bookId)),
  40
);

export const planProverbs: Plan = {
  id: 'proverbs-31',
  title: 'Provérbios em 31 Dias',
  description: 'Um mês com um capítulo de Provérbios por dia para alcançar sabedoria e instrução diária.',
  milestones: Array.from({ length: 31 }).map((_, i) => ({
    id: `pro-${i+1}`,
    label: `Dia ${i+1}: Provérbios ${i+1}`,
    bookId: 'pro',
    chapters: [i+1]
  }))
};

export const planDavid: Plan = {
  id: 'characters-david',
  title: 'Personagens: A Vida de Davi',
  description: 'Acompanhe a trajetória de Davi, de pastor de ovelhas ao majestoso trono de Israel.',
  milestones: [
    { id: 'dav-1', label: 'O Escolhido: A Unção (1 Sm 16)', bookId: '1sa', chapters: [16] },
    { id: 'dav-2', label: 'A Coragem: Davi e Golias (1 Sm 17)', bookId: '1sa', chapters: [17] },
    { id: 'dav-3', label: 'A Amizade Feita em Deus (1 Sm 18)', bookId: '1sa', chapters: [18] },
    { id: 'dav-4', label: 'A Fuga de Saul (1 Sm 19)', bookId: '1sa', chapters: [19] },
    { id: 'dav-5', label: 'Pacto em Nobe e a Espada (1 Sm 21)', bookId: '1sa', chapters: [21] },
    { id: 'dav-6', label: 'Os Rejeitados na Caverna (1 Sm 22)', bookId: '1sa', chapters: [22] },
    { id: 'dav-7', label: 'Davi Poupa a Vida do Ungido (1 Sm 24)', bookId: '1sa', chapters: [24] },
    { id: 'dav-8', label: 'Davi Rei de Judá (2 Sm 2)', bookId: '2sa', chapters: [2] },
    { id: 'dav-9', label: 'Rei de Todo o Israel, e Vitória (2 Sm 5)', bookId: '2sa', chapters: [5] },
    { id: 'dav-10', label: 'A Aliança Eterna Prometida (2 Sm 7)', bookId: '2sa', chapters: [7] },
    { id: 'dav-11', label: 'O Trágico Erro (2 Sm 11)', bookId: '2sa', chapters: [11] },
    { id: 'dav-12', label: 'O Peso do Arrependimento e Perdão (2 Sm 12)', bookId: '2sa', chapters: [12] },
    { id: 'dav-13', label: 'Cântico e Salmo de Livramento (2 Sm 22)', bookId: '2sa', chapters: [22] },
    { id: 'dav-14', label: 'As Últimas Palavras do Rei (2 Sm 23)', bookId: '2sa', chapters: [23] },
    { id: 'dav-15', label: 'As Despedidas e Passagem da Coroa (1 Rs 2)', bookId: '1ki', chapters: [2] },
  ]
};

export const planAbraham: Plan = {
  id: 'characters-abraham',
  title: 'Personagens: A Caminhada de Abraão',
  description: 'O pai da fé: seu chamado, desafios e alianças com Deus.',
  milestones: [
    { id: 'abr-1', label: 'O Chamado de Abrão (Gn 12)', bookId: 'gen', chapters: [12] },
    { id: 'abr-2', label: 'A Aliança de Deus (Gn 15)', bookId: 'gen', chapters: [15] },
    { id: 'abr-3', label: 'O Nascimento de Ismael (Gn 16)', bookId: 'gen', chapters: [16] },
    { id: 'abr-4', label: 'A Promessa do Filho (Gn 18)', bookId: 'gen', chapters: [18] },
    { id: 'abr-5', label: 'O Sacrifício de Isaque (Gn 22)', bookId: 'gen', chapters: [22] }
  ]
};

export const planJoseph: Plan = {
  id: 'characters-joseph',
  title: 'Personagens: José do Egito',
  description: 'A prova da fidelidade: do poço ao governo do Egito.',
  milestones: [
    { id: 'jos-1', label: 'Os Sonhos de José (Gn 37)', bookId: 'gen', chapters: [37] },
    { id: 'jos-2', label: 'José e a Mulher de Potifar (Gn 39)', bookId: 'gen', chapters: [39] },
    { id: 'jos-3', label: 'Os Sonhos do Faraó (Gn 41)', bookId: 'gen', chapters: [41] },
    { id: 'jos-4', label: 'O Encontro com os Irmãos (Gn 45)', bookId: 'gen', chapters: [45] },
    { id: 'jos-5', label: 'A Morte de Jacó e o Perdão (Gn 50)', bookId: 'gen', chapters: [50] }
  ]
};

export const planMoses: Plan = {
  id: 'characters-moses',
  title: 'Personagens: O Libertador Moisés',
  description: 'A épica jornada de Moisés para libertar o povo de Israel.',
  milestones: [
    { id: 'mos-1', label: 'O Nascimento e Fuga (Êx 2)', bookId: 'exo', chapters: [2] },
    { id: 'mos-2', label: 'A Sarça Ardente (Êx 3)', bookId: 'exo', chapters: [3] },
    { id: 'mos-3', label: 'As Pragas e a Páscoa (Êx 12)', bookId: 'exo', chapters: [12] },
    { id: 'mos-4', label: 'A Travessia do Mar (Êx 14)', bookId: 'exo', chapters: [14] },
    { id: 'mos-5', label: 'Os Dez Mandamentos (Êx 20)', bookId: 'exo', chapters: [20] }
  ]
};

export const planElijah: Plan = {
  id: 'characters-elijah',
  title: 'Personagens: Elias, o Profeta',
  description: 'A vida de um dos maiores profetas do Antigo Testamento.',
  milestones: [
    { id: 'eli-1', label: 'Elias e os Corvos (1 Rs 17)', bookId: '1ki', chapters: [17] },
    { id: 'eli-2', label: 'O Desafio no Carmelo (1 Rs 18)', bookId: '1ki', chapters: [18] },
    { id: 'eli-3', label: 'Elias em Horebe (1 Rs 19)', bookId: '1ki', chapters: [19] },
    { id: 'eli-4', label: 'A Vinha de Nabote (1 Rs 21)', bookId: '1ki', chapters: [21] },
    { id: 'eli-5', label: 'O Arrebatamento de Elias (2 Rs 2)', bookId: '2ki', chapters: [2] }
  ]
};

export const planEsther: Plan = {
  id: 'characters-esther',
  title: 'Personagens: Rainha Ester',
  description: 'Para uma hora como esta: coragem e livramento de um povo.',
  milestones: [
    { id: 'est-1', label: 'Ester é Coroada (Et 2)', bookId: 'est', chapters: [2] },
    { id: 'est-2', label: 'A Trama de Hamã (Et 3)', bookId: 'est', chapters: [3] },
    { id: 'est-3', label: 'O Jejum de Ester (Et 4)', bookId: 'est', chapters: [4] },
    { id: 'est-4', label: 'A Queda de Hamã (Et 7)', bookId: 'est', chapters: [7] },
    { id: 'est-5', label: 'O Livramento dos Judeus (Et 9)', bookId: 'est', chapters: [9] }
  ]
};

export const planPeter: Plan = {
  id: 'characters-peter',
  title: 'Personagens: Pedro, o Apóstolo',
  description: 'A transformação do impulsivo pescador no líder da Igreja primitiva.',
  milestones: [
    { id: 'pet-1', label: 'O Chamado e a Pesca Maravilhosa (Lc 5)', bookId: 'luk', chapters: [5] },
    { id: 'pet-2', label: 'Caminhando Sobre as Águas (Mt 14)', bookId: 'mat', chapters: [14] },
    { id: 'pet-3', label: 'A Negação e o Choro (Lc 22)', bookId: 'luk', chapters: [22] },
    { id: 'pet-4', label: 'A Restauração de Pedro (Jo 21)', bookId: 'jhn', chapters: [21] },
    { id: 'pet-5', label: 'O Discurso de Pentecostes (At 2)', bookId: 'act', chapters: [2] }
  ]
};

export const planPaul: Plan = {
  id: 'characters-paul',
  title: 'Personagens: As Viagens de Paulo',
  description: 'De perseguidor a maior missionário da fé cristã.',
  milestones: [
    { id: 'pau-1', label: 'A Conversão em Damasco (At 9)', bookId: 'act', chapters: [9] },
    { id: 'pau-2', label: 'O Início da Missão (At 13)', bookId: 'act', chapters: [13] },
    { id: 'pau-3', label: 'Paulo na Prisão de Filipos (At 16)', bookId: 'act', chapters: [16] },
    { id: 'pau-4', label: 'O Discurso em Atenas (At 17)', bookId: 'act', chapters: [17] },
    { id: 'pau-5', label: 'O Naufrágio e Roma (At 27)', bookId: 'act', chapters: [27] }
  ]
};

export const planJohnBaptist: Plan = {
  id: 'characters-john-baptist',
  title: 'Personagens: João Batista',
  description: 'A voz do que clama no deserto, preparando o caminho.',
  milestones: [
    { id: 'jbp-1', label: 'O Anúncio do Nascimento (Lc 1)', bookId: 'luk', chapters: [1] },
    { id: 'jbp-2', label: 'A Pregação no Deserto (Mt 3)', bookId: 'mat', chapters: [3] },
    { id: 'jbp-3', label: 'O Testemunho Sobre Jesus (Jo 1)', bookId: 'jhn', chapters: [1] },
    { id: 'jbp-4', label: 'Jesus Elogia João (Mt 11)', bookId: 'mat', chapters: [11] },
    { id: 'jbp-5', label: 'O Martírio de João (Mt 14)', bookId: 'mat', chapters: [14] }
  ]
};

export const planMary: Plan = {
  id: 'characters-mary',
  title: 'Personagens: Maria de Nazaré',
  description: 'A mulher bem-aventurada, escolhida para ser a mãe de Jesus.',
  milestones: [
    { id: 'mar-1', label: 'A Anunciação e o Magnificat (Lc 1)', bookId: 'luk', chapters: [1] },
    { id: 'mar-2', label: 'O Nascimento de Jesus (Lc 2)', bookId: 'luk', chapters: [2] },
    { id: 'mar-3', label: 'As Bodas de Caná (Jo 2)', bookId: 'jhn', chapters: [2] },
    { id: 'mar-4', label: 'Maria aos Pés da Cruz (Jo 19)', bookId: 'jhn', chapters: [19] },
    { id: 'mar-5', label: 'Com os Discípulos no Cenáculo (At 1)', bookId: 'act', chapters: [1] }
  ]
};

export const planStephen: Plan = {
  id: 'characters-stephen',
  title: 'Personagens: Estêvão, o Primeiro Mártir',
  description: 'Fé, poder e a entrega do primeiro mártir cristão.',
  milestones: [
    { id: 'ste-1', label: 'A Escolha dos Sete Diáconos (At 6)', bookId: 'act', chapters: [6] },
    { id: 'ste-2', label: 'O Discurso de Estêvão, Parte 1 (At 7)', bookId: 'act', chapters: [7] },
    { id: 'ste-3', label: 'O Apedrejamento (At 7)', bookId: 'act', chapters: [7] }
  ]
};

export const PLANS: Plan[] = [
  plan1Year,
  planNT30,
  planGospels,
  planProverbs,
  planDavid,
  planAbraham,
  planJoseph,
  planMoses,
  planElijah,
  planEsther,
  planPeter,
  planPaul,
  planJohnBaptist,
  planMary,
  planStephen
];
