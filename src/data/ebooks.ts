export interface Ebook {
      slug: string;
      titulo: string;
      autor: string;
      categoria: string;
      idioma: string;
      fonte: string;
      url: string;
      capa?: string;
    }

    export const EBOOK_CATEGORIAS = [
      'Patrística',
      'Reforma',
      'Puritanos',
      'Comentários Bíblicos',
      'Teologia Sistemática',
      'Filosofia Cristã',
    ] as const;

    export const EBOOKS_INICIAIS: Ebook[] = [
      {
        slug: 'agostinho-confissoes',
        titulo: 'Confissões',
        autor: 'Agostinho de Hipona',
        categoria: 'Patrística',
        idioma: 'Inglês',
        fonte: 'Internet Archive',
        url: 'https://archive.org/details/confessionsaugus00augu',
        capa: 'https://archive.org/services/img/confessionsaugus00augu',
      },
      {
        slug: 'agostinho-cidade-de-deus',
        titulo: 'A Cidade de Deus',
        autor: 'Agostinho de Hipona',
        categoria: 'Patrística',
        idioma: 'Inglês',
        fonte: 'Internet Archive',
        url: 'https://archive.org/details/cityofgod02augu',
        capa: 'https://archive.org/services/img/cityofgod02augu',
      },
      {
        slug: 'calvino-institutas',
        titulo: 'Institutas da Religião Cristã',
        autor: 'João Calvino',
        categoria: 'Reforma',
        idioma: 'Inglês',
        fonte: 'CCEL',
        url: 'https://www.ccel.org/ccel/calvin/institutes',
      },
      {
        slug: 'lutero-liberdade-crista',
        titulo: 'A Liberdade Cristã',
        autor: 'Martinho Lutero',
        categoria: 'Reforma',
        idioma: 'Inglês',
        fonte: 'CCEL',
        url: 'https://www.ccel.org/ccel/luther/liberty',
      },
      {
        slug: 'bunyan-peregrino',
        titulo: 'O Peregrino',
        autor: 'John Bunyan',
        categoria: 'Puritanos',
        idioma: 'Inglês',
        fonte: 'Internet Archive',
        url: 'https://archive.org/details/pilgrimprogress00bunyrich',
        capa: 'https://archive.org/services/img/pilgrimprogress00bunyrich',
      },
      {
        slug: 'edwards-pecadores',
        titulo: 'Pecadores nas Mãos de um Deus Irado',
        autor: 'Jonathan Edwards',
        categoria: 'Puritanos',
        idioma: 'Inglês',
        fonte: 'CCEL',
        url: 'https://www.ccel.org/ccel/edwards/sermons.sinners',
      },
      {
        slug: 'henry-comentario',
        titulo: 'Comentário Bíblico Completo',
        autor: 'Matthew Henry',
        categoria: 'Comentários Bíblicos',
        idioma: 'Inglês',
        fonte: 'CCEL',
        url: 'https://www.ccel.org/ccel/henry/mhc',
      },
      {
        slug: 'gill-exposicao',
        titulo: 'Exposição da Bíblia',
        autor: 'John Gill',
        categoria: 'Comentários Bíblicos',
        idioma: 'Inglês',
        fonte: 'CCEL',
        url: 'https://www.ccel.org/ccel/gill/exposition',
      },
      {
        slug: 'pink-soberania',
        titulo: 'A Soberania de Deus',
        autor: 'A. W. Pink',
        categoria: 'Teologia Sistemática',
        idioma: 'Inglês',
        fonte: 'Internet Archive',
        url: 'https://archive.org/details/sovereigntyofgod00pink',
        capa: 'https://archive.org/services/img/sovereigntyofgod00pink',
      },
      {
        slug: 'berkhof-sistematica',
        titulo: 'Teologia Sistemática',
        autor: 'Louis Berkhof',
        categoria: 'Teologia Sistemática',
        idioma: 'Inglês',
        fonte: 'Internet Archive',
        url: 'https://archive.org/details/systematictheolo00berk',
        capa: 'https://archive.org/services/img/systematictheolo00berk',
      },
      {
        slug: 'aquino-suma',
        titulo: 'Suma Teológica',
        autor: 'Tomás de Aquino',
        categoria: 'Filosofia Cristã',
        idioma: 'Inglês',
        fonte: 'Internet Archive',
        url: 'https://archive.org/details/summa-theologica',
        capa: 'https://archive.org/services/img/summa-theologica',
      },
    ];
    