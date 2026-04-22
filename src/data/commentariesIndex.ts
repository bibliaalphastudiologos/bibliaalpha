/**
 * Metadata index for the Historical Christian Faith Commentaries DB.
 * Generated from the upstream SQLite release.
 *
 * The full SQLite (~125 MB, 82k commentaries, 335 fathers) is fetched at
 * build time by scripts/fetch-commentaries.mjs into public/data/commentaries.sqlite
 * and queried at runtime via src/lib/commentaries.ts.
 */
export interface CommentaryBookMeta { book: string; count: number; fathers: number; }
export interface ChurchFather { name: string; year: number | null; wiki: string; }
export interface CommentariesIndex {
  version: string;
  source_release: string;
  sha256: string;
  size_bytes: number;
  total_commentaries: number;
  total_fathers: number;
  books: CommentaryBookMeta[];
  fathers: ChurchFather[];
}

export const COMMENTARIES_INDEX: CommentariesIndex = {
  "version": "latest",
  "source_release": "https://github.com/HistoricalChristianFaith/Commentaries-Database/releases/download/latest/commentaries.sqlite",
  "sha256": "803b89a175a5b1b1f35316e9eda35cc077425ec963384e1d819c0a1ace7fa8c4",
  "size_bytes": 131014656,
  "total_commentaries": 82404,
  "total_fathers": 335,
  "books": [
    {
      "book": "1chronicles",
      "count": 42,
      "fathers": 14
    },
    {
      "book": "1corinthians",
      "count": 3184,
      "fathers": 76
    },
    {
      "book": "1john",
      "count": 914,
      "fathers": 46
    },
    {
      "book": "1kings",
      "count": 286,
      "fathers": 35
    },
    {
      "book": "1maccabees",
      "count": 2,
      "fathers": 1
    },
    {
      "book": "1pet",
      "count": 1,
      "fathers": 1
    },
    {
      "book": "1peter",
      "count": 708,
      "fathers": 65
    },
    {
      "book": "1samuel",
      "count": 1344,
      "fathers": 52
    },
    {
      "book": "1thessalonians",
      "count": 468,
      "fathers": 51
    },
    {
      "book": "1timothy",
      "count": 1049,
      "fathers": 67
    },
    {
      "book": "2chronicles",
      "count": 40,
      "fathers": 17
    },
    {
      "book": "2corinthians",
      "count": 1667,
      "fathers": 58
    },
    {
      "book": "2john",
      "count": 52,
      "fathers": 16
    },
    {
      "book": "2kings",
      "count": 170,
      "fathers": 27
    },
    {
      "book": "2maccabees",
      "count": 21,
      "fathers": 16
    },
    {
      "book": "2pet",
      "count": 1,
      "fathers": 1
    },
    {
      "book": "2peter",
      "count": 314,
      "fathers": 42
    },
    {
      "book": "2samuel",
      "count": 139,
      "fathers": 31
    },
    {
      "book": "2thessalonians",
      "count": 328,
      "fathers": 48
    },
    {
      "book": "2timothy",
      "count": 615,
      "fathers": 50
    },
    {
      "book": "3john",
      "count": 44,
      "fathers": 9
    },
    {
      "book": "acts",
      "count": 3684,
      "fathers": 74
    },
    {
      "book": "amos",
      "count": 163,
      "fathers": 30
    },
    {
      "book": "baruch",
      "count": 67,
      "fathers": 17
    },
    {
      "book": "colossians",
      "count": 611,
      "fathers": 50
    },
    {
      "book": "daniel",
      "count": 795,
      "fathers": 61
    },
    {
      "book": "deuteronomy",
      "count": 248,
      "fathers": 54
    },
    {
      "book": "ecclesiastes",
      "count": 572,
      "fathers": 47
    },
    {
      "book": "ephesians",
      "count": 1286,
      "fathers": 60
    },
    {
      "book": "esther",
      "count": 97,
      "fathers": 9
    },
    {
      "book": "exodus",
      "count": 610,
      "fathers": 61
    },
    {
      "book": "ezekiel",
      "count": 1280,
      "fathers": 61
    },
    {
      "book": "ezra",
      "count": 125,
      "fathers": 10
    },
    {
      "book": "galatians",
      "count": 1372,
      "fathers": 51
    },
    {
      "book": "genesis",
      "count": 2364,
      "fathers": 80
    },
    {
      "book": "habakkuk",
      "count": 131,
      "fathers": 29
    },
    {
      "book": "haggai",
      "count": 43,
      "fathers": 16
    },
    {
      "book": "hebrews",
      "count": 2133,
      "fathers": 63
    },
    {
      "book": "hosea",
      "count": 293,
      "fathers": 40
    },
    {
      "book": "isaiah",
      "count": 4112,
      "fathers": 106
    },
    {
      "book": "james",
      "count": 556,
      "fathers": 49
    },
    {
      "book": "jeremiah",
      "count": 1246,
      "fathers": 64
    },
    {
      "book": "job",
      "count": 2536,
      "fathers": 20
    },
    {
      "book": "joel",
      "count": 98,
      "fathers": 34
    },
    {
      "book": "john",
      "count": 9083,
      "fathers": 120
    },
    {
      "book": "jonah",
      "count": 155,
      "fathers": 29
    },
    {
      "book": "joshua",
      "count": 242,
      "fathers": 41
    },
    {
      "book": "jude",
      "count": 140,
      "fathers": 25
    },
    {
      "book": "judges",
      "count": 210,
      "fathers": 27
    },
    {
      "book": "lamentations",
      "count": 231,
      "fathers": 25
    },
    {
      "book": "leviticus",
      "count": 127,
      "fathers": 35
    },
    {
      "book": "luke",
      "count": 7572,
      "fathers": 87
    },
    {
      "book": "malachi",
      "count": 114,
      "fathers": 37
    },
    {
      "book": "mark",
      "count": 2971,
      "fathers": 86
    },
    {
      "book": "matthew",
      "count": 8692,
      "fathers": 89
    },
    {
      "book": "micah",
      "count": 108,
      "fathers": 28
    },
    {
      "book": "nahum",
      "count": 45,
      "fathers": 11
    },
    {
      "book": "nehemiah",
      "count": 100,
      "fathers": 5
    },
    {
      "book": "numbers",
      "count": 187,
      "fathers": 33
    },
    {
      "book": "obadiah",
      "count": 43,
      "fathers": 9
    },
    {
      "book": "philemon",
      "count": 179,
      "fathers": 18
    },
    {
      "book": "philippians",
      "count": 747,
      "fathers": 57
    },
    {
      "book": "prayerofazariah",
      "count": 40,
      "fathers": 13
    },
    {
      "book": "proverbs",
      "count": 1408,
      "fathers": 70
    },
    {
      "book": "psalm",
      "count": 186,
      "fathers": 7
    },
    {
      "book": "psalms",
      "count": 5716,
      "fathers": 100
    },
    {
      "book": "revelation",
      "count": 2514,
      "fathers": 60
    },
    {
      "book": "romans",
      "count": 3800,
      "fathers": 69
    },
    {
      "book": "ruth",
      "count": 23,
      "fathers": 9
    },
    {
      "book": "sirach",
      "count": 284,
      "fathers": 48
    },
    {
      "book": "songofsolomon",
      "count": 678,
      "fathers": 37
    },
    {
      "book": "titus",
      "count": 329,
      "fathers": 39
    },
    {
      "book": "tobit",
      "count": 89,
      "fathers": 13
    },
    {
      "book": "wisdom",
      "count": 321,
      "fathers": 48
    },
    {
      "book": "zechariah",
      "count": 212,
      "fathers": 39
    },
    {
      "book": "zephaniah",
      "count": 47,
      "fathers": 16
    }
  ],
  "fathers": [
    {
      "name": "Book of Jubilees",
      "year": -100,
      "wiki": "https://en.wikipedia.org/wiki/Book_of_Jubilees"
    },
    {
      "name": "Book of Enoch",
      "year": -300,
      "wiki": "https://en.wikipedia.org/wiki/Book_of_Enoch"
    },
    {
      "name": "Didache",
      "year": 100,
      "wiki": "https://en.wikipedia.org/wiki/Didache"
    },
    {
      "name": "Josephus",
      "year": 100,
      "wiki": "https://en.wikipedia.org/wiki/Josephus"
    },
    {
      "name": "Book of Biblical Antiquities",
      "year": 100,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Philo"
    },
    {
      "name": "Symeon the New Theologian",
      "year": 1022,
      "wiki": "https://en.wikipedia.org/wiki/Symeon_the_New_Theologian"
    },
    {
      "name": "Papias the Lexicographer",
      "year": 1060,
      "wiki": "https://en.wikipedia.org/wiki/Papias_(lexicographer)"
    },
    {
      "name": "Robert of Tombelaine",
      "year": 1078,
      "wiki": "https://it.wikipedia.org/wiki/Roberto_di_Tombalena"
    },
    {
      "name": "Ignatius of Antioch",
      "year": 108,
      "wiki": "https://en.wikipedia.org/wiki/Ignatius_of_Antioch"
    },
    {
      "name": "Lanfranc of Canterbury",
      "year": 1089,
      "wiki": "https://en.wikipedia.org/wiki/Lanfranc"
    },
    {
      "name": "Theophylact of Ohrid",
      "year": 1107,
      "wiki": "https://en.wikipedia.org/wiki/Theophylact_of_Ohrid"
    },
    {
      "name": "Anselm of Canterbury",
      "year": 1109,
      "wiki": "https://en.wikipedia.org/wiki/Anselm_of_Canterbury"
    },
    {
      "name": "Anselm of Laon",
      "year": 1117,
      "wiki": "https://en.wikipedia.org/wiki/Anselm_of_Laon"
    },
    {
      "name": "Petrus Alphonsi",
      "year": 1130,
      "wiki": "https://en.wikipedia.org/wiki/Petrus_Alphonsi"
    },
    {
      "name": "Bernard of Clairvaux",
      "year": 1153,
      "wiki": "https://en.wikipedia.org/wiki/Bernard_of_Clairvaux"
    },
    {
      "name": "Jacob Bar-Salibi",
      "year": 1171,
      "wiki": "https://en.wikipedia.org/wiki/Dionysius_bar_Salibi"
    },
    {
      "name": "Richard of Saint Victor",
      "year": 1173,
      "wiki": "https://en.wikipedia.org/wiki/Richard_of_Saint_Victor"
    },
    {
      "name": "Nerses of Lambron",
      "year": 1198,
      "wiki": "https://en.wikipedia.org/wiki/Nerses_of_Lambron"
    },
    {
      "name": "Odes of Solomon",
      "year": 125,
      "wiki": "https://en.wikipedia.org/wiki/Odes_of_Solomon"
    },
    {
      "name": "Hugh of Saint-Cher",
      "year": 1263,
      "wiki": "https://en.wikipedia.org//wiki/Hugh_of_Saint-Cher"
    },
    {
      "name": "Glossa Ordinaria",
      "year": 1274,
      "wiki": "https://en.wikipedia.org/wiki/Glossa_Ordinaria"
    },
    {
      "name": "Ancient Greek Expositor",
      "year": 1274,
      "wiki": ""
    },
    {
      "name": "Thomas Aquinas",
      "year": 1274,
      "wiki": "https://en.wikipedia.org/wiki/Thomas_Aquinas"
    },
    {
      "name": "Nicholas of Gorran",
      "year": 1295,
      "wiki": "https://en.wikipedia.org/wiki/Nicholas_of_Gorran"
    },
    {
      "name": "Peter Olivi",
      "year": 1298,
      "wiki": "https://en.wikipedia.org/wiki/Peter_John_Olivi"
    },
    {
      "name": "Papias of Hierapolis",
      "year": 130,
      "wiki": "https://en.wikipedia.org/wiki/Papias_of_Hierapolis"
    },
    {
      "name": "John of Cressy",
      "year": 1313,
      "wiki": "https://www.biblicalcyclopedia.com/J/john-the-monk.html"
    },
    {
      "name": "Epistle of Barnabas",
      "year": 132,
      "wiki": "https://en.wikipedia.org//wiki/Epistle_of_Barnabas"
    },
    {
      "name": "Pseudo-Barnabas",
      "year": 132,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_of_Barnabas"
    },
    {
      "name": "Nicholas of Lyra",
      "year": 1349,
      "wiki": "https://en.wikipedia.org/wiki/Nicholas_of_Lyra"
    },
    {
      "name": "Gregory Palamas",
      "year": 1359,
      "wiki": "https://en.wikipedia.org/wiki/Gregory_Palamas"
    },
    {
      "name": "Protoevangelium of James",
      "year": 150,
      "wiki": "https://en.wikipedia.org/wiki/Gospel_of_James"
    },
    {
      "name": "Epistle to Diognetus",
      "year": 150,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_to_Diognetus"
    },
    {
      "name": "Gospel of the Hebrews",
      "year": 150,
      "wiki": "https://en.wikipedia.org/wiki/Gospel_of_the_Hebrews"
    },
    {
      "name": "Ulrich Zwingli",
      "year": 1531,
      "wiki": "https://en.wikipedia.org/wiki/Huldrych_Zwingli"
    },
    {
      "name": "Erasmus of Rotterdam",
      "year": 1536,
      "wiki": "https://en.wikipedia.org/wiki/Erasmus"
    },
    {
      "name": "Martin Luther",
      "year": 1546,
      "wiki": "https://en.wikipedia.org/wiki/Martin_Luther"
    },
    {
      "name": "Polycarp of Smyrna",
      "year": 155,
      "wiki": "https://en.wikipedia.org/wiki/Polycarp"
    },
    {
      "name": "John Calvin",
      "year": 1564,
      "wiki": "https://en.wikipedia.org/wiki/John_Calvin"
    },
    {
      "name": "John of the Cross",
      "year": 1591,
      "wiki": "https://en.wikipedia.org/wiki/John_of_the_Cross"
    },
    {
      "name": "Shepherd of Hermas",
      "year": 160,
      "wiki": "https://en.wikipedia.org/wiki/The_Shepherd_of_Hermas"
    },
    {
      "name": "Cornelius a Lapide",
      "year": 1637,
      "wiki": "https://en.wikipedia.org/wiki/Cornelius_a_Lapide"
    },
    {
      "name": "Justin Martyr",
      "year": 165,
      "wiki": "https://en.wikipedia.org/wiki/Justin_Martyr"
    },
    {
      "name": "Abercius",
      "year": 167,
      "wiki": "https://en.wikipedia.org/wiki/Inscription_of_Abercius"
    },
    {
      "name": "Muratorian fragment",
      "year": 170,
      "wiki": "https://en.wikipedia.org/wiki/Muratorian_fragment"
    },
    {
      "name": "Dionysius of Corinth",
      "year": 171,
      "wiki": "https://en.wikipedia.org/wiki/Dionysius_of_Corinth"
    },
    {
      "name": "Heracleon",
      "year": 175,
      "wiki": "https://en.wikipedia.org/wiki/Heracleon"
    },
    {
      "name": "John Wesley",
      "year": 1791,
      "wiki": "https://en.wikipedia.org/wiki/John_Wesley"
    },
    {
      "name": "Hegesippus",
      "year": 180,
      "wiki": "https://en.wikipedia.org/wiki/Hegesippus_(chronicler)"
    },
    {
      "name": "Tatian the Assyrian",
      "year": 180,
      "wiki": "https://en.wikipedia.org/wiki/Tatian"
    },
    {
      "name": "Valentinus",
      "year": 180,
      "wiki": "https://en.wikipedia.org/wiki/Valentinus_(Gnostic)"
    },
    {
      "name": "Melito of Sardis",
      "year": 180,
      "wiki": "https://en.wikipedia.org//wiki/Melito_of_Sardis"
    },
    {
      "name": "Theophilus of Antioch",
      "year": 185,
      "wiki": "https://en.wikipedia.org/wiki/Theophilus_of_Antioch"
    },
    {
      "name": "JB Lightfoot",
      "year": 1889,
      "wiki": "https://en.wikipedia.org/wiki/J._B._Lightfoot"
    },
    {
      "name": "Athenagoras of Athens",
      "year": 190,
      "wiki": "https://en.wikipedia.org/wiki/Athenagoras_of_Athens"
    },
    {
      "name": "Testaments of the Twelve Patriarchs",
      "year": 192,
      "wiki": "https://en.wikipedia.org/wiki/Testaments_of_the_Twelve_Patriarchs"
    },
    {
      "name": "GK Chesterton",
      "year": 1936,
      "wiki": "https://en.wikipedia.org/wiki/G._K._Chesterton"
    },
    {
      "name": "Polycrates Of Ephesus",
      "year": 196,
      "wiki": "https://en.wikipedia.org/wiki/Polycrates_of_Ephesus"
    },
    {
      "name": "CS Lewis",
      "year": 1963,
      "wiki": "https://en.wikipedia.org/wiki/C._S._Lewis"
    },
    {
      "name": "JRR Tolkien",
      "year": 1973,
      "wiki": "https://en.wikipedia.org/wiki/J._R._R._Tolkien"
    },
    {
      "name": "Acts of Peter",
      "year": 200,
      "wiki": "https://en.wikipedia.org/wiki/Acts_of_Peter"
    },
    {
      "name": "Liturgy of Addai and Mari",
      "year": 200,
      "wiki": "https://en.wikipedia.org/wiki/Liturgy_of_Addai_and_Mari"
    },
    {
      "name": "Caius Presbyter of Rome",
      "year": 200,
      "wiki": "https://en.wikipedia.org/wiki/Caius_(presbyter)"
    },
    {
      "name": "The Liturgy Of The Blessed Apostles",
      "year": 200,
      "wiki": "http://www.liturgies.net/Liturgies/Historical/LiturgyOfBlessedApostles.htm"
    },
    {
      "name": "Martyrdom Of Polycarp",
      "year": 200,
      "wiki": "https://en.wikipedia.org/wiki/Martyrdom_of_Polycarp"
    },
    {
      "name": "Irenaeus",
      "year": 202,
      "wiki": "https://en.wikipedia.org/wiki/Irenaeus"
    },
    {
      "name": "Douglas Wilson",
      "year": 2020,
      "wiki": "https://en.wikipedia.org/wiki/Douglas_Wilson_(theologian)"
    },
    {
      "name": "The Passion of Saints Perpetua and Felicity",
      "year": 203,
      "wiki": "https://en.wikipedia.org/wiki/The_Passion_of_Saints_Perpetua_and_Felicity"
    },
    {
      "name": "Clement of Alexandria",
      "year": 215,
      "wiki": "https://en.wikipedia.org/wiki/Clement_of_Alexandria"
    },
    {
      "name": "Pope Zephyrinus",
      "year": 217,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Zephyrinus"
    },
    {
      "name": "Zephyrinus",
      "year": 217,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Zephyrinus"
    },
    {
      "name": "Tertullian",
      "year": 220,
      "wiki": "https://en.wikipedia.org/wiki/Tertullian"
    },
    {
      "name": "Callistus I of Rome",
      "year": 223,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Callixtus_I"
    },
    {
      "name": "Didascalia Apostolorum",
      "year": 230,
      "wiki": "https://en.wikipedia.org/wiki/Didascalia_Apostolorum"
    },
    {
      "name": "Pope Urban I",
      "year": 230,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Urban_I"
    },
    {
      "name": "Pope Pontian",
      "year": 235,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Pontian"
    },
    {
      "name": "Hippolytus of Rome",
      "year": 235,
      "wiki": "https://en.wikipedia.org/wiki/Hippolytus_of_Rome"
    },
    {
      "name": "Pope Anterus",
      "year": 236,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Anterus"
    },
    {
      "name": "Julius Africanus",
      "year": 240,
      "wiki": "https://en.wikipedia.org/wiki/Sextus_Julius_Africanus"
    },
    {
      "name": "Fabian of Rome",
      "year": 250,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Fabian"
    },
    {
      "name": "Commodian",
      "year": 250,
      "wiki": "https://en.wikipedia.org/wiki/Commodian"
    },
    {
      "name": "Marcus Minucius Felix",
      "year": 250,
      "wiki": "https://en.wikipedia.org/wiki/Marcus_Minucius_Felix"
    },
    {
      "name": "Alexander of Jerusalem",
      "year": 251,
      "wiki": "https://en.wikipedia.org/wiki/Alexander_of_Jerusalem"
    },
    {
      "name": "Origen of Alexandria",
      "year": 253,
      "wiki": "https://en.wikipedia.org/wiki/Origen"
    },
    {
      "name": "Faustinus of Lyon",
      "year": 254,
      "wiki": "https://en.wikipedia.org/wiki/Faustinus_of_Lyon"
    },
    {
      "name": "Cyprian",
      "year": 258,
      "wiki": "https://en.wikipedia.org/wiki/Cyprian"
    },
    {
      "name": "Novatian",
      "year": 258,
      "wiki": "https://en.wikipedia.org/wiki/Novatian"
    },
    {
      "name": "Dionysius of Alexandria",
      "year": 264,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Dionysius_of_Alexandria"
    },
    {
      "name": "Pope Dionysius",
      "year": 268,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Dionysius"
    },
    {
      "name": "Theognostus Of Alexandria",
      "year": 270,
      "wiki": "https://en.wikipedia.org/wiki/Theognostus_of_Alexandria"
    },
    {
      "name": "Gregory of Neocaesarea",
      "year": 270,
      "wiki": "https://en.wikipedia.org/wiki/Gregory_Thaumaturgus"
    },
    {
      "name": "Malchion",
      "year": 272,
      "wiki": "https://en.wikipedia.org/wiki/Malchion"
    },
    {
      "name": "Archelaus of Carrhae",
      "year": 278,
      "wiki": "https://en.wikipedia.org/wiki/Archelaus_(bishop_of_Carrhae)"
    },
    {
      "name": "Theonas of Alexandria",
      "year": 300,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Theonas_of_Alexandria"
    },
    {
      "name": "Ammonius of Alexandria",
      "year": 300,
      "wiki": "https://en.wikipedia.org/wiki/Ammonius_of_Alexandria_(Christian_philosopher)"
    },
    {
      "name": "The Passing of Mary",
      "year": 300,
      "wiki": "https://www.ccel.org/ccel/schaff/anf08/anf08.vii.xliv.html"
    },
    {
      "name": "Pseudo-Cyprian",
      "year": 300,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Cyprian"
    },
    {
      "name": "Liturgy of Saint Mark",
      "year": 300,
      "wiki": "https://en.wikipedia.org/wiki/Liturgy_of_Saint_Cyril"
    },
    {
      "name": "Victorinus of Pettau",
      "year": 304,
      "wiki": "https://en.wikipedia.org/wiki/Victorinus_of_Pettau"
    },
    {
      "name": "Phileas of Thmuis",
      "year": 306,
      "wiki": "https://en.wikipedia.org/wiki/Phileas_and_Philoromus"
    },
    {
      "name": "Pamphilus of Caesarea",
      "year": 309,
      "wiki": "https://en.wikipedia.org/wiki/Pamphilus_of_Caesarea"
    },
    {
      "name": "Methodius of Olympus",
      "year": 311,
      "wiki": "https://en.wikipedia.org/wiki/Methodius_of_Olympus"
    },
    {
      "name": "Peter of Alexandria",
      "year": 311,
      "wiki": "https://en.wikipedia.org/wiki/Peter_I_of_Alexandria"
    },
    {
      "name": "Council of Ancyra of 314",
      "year": 314,
      "wiki": "https://en.wikipedia.org/wiki/Synod_of_Ancyra"
    },
    {
      "name": "Council of Neocaesarea of 315",
      "year": 315,
      "wiki": "https://en.wikipedia.org/wiki/Synod_of_Neocaesarea"
    },
    {
      "name": "Theodore Stratelates",
      "year": 319,
      "wiki": "https://en.wikipedia.org/wiki/Theodore_Stratelates"
    },
    {
      "name": "Lucius Caecilius Firmianus Lactantius",
      "year": 325,
      "wiki": "https://en.wikipedia.org/wiki/Lactantius"
    },
    {
      "name": "Council of Nicaea of 325",
      "year": 325,
      "wiki": "https://en.wikipedia.org/wiki/First_Council_of_Nicaea"
    },
    {
      "name": "Alexander of Alexandria",
      "year": 328,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Alexander_I_of_Alexandria"
    },
    {
      "name": "Arnobius of Sicca",
      "year": 330,
      "wiki": "https://en.wikipedia.org/wiki/Arnobius"
    },
    {
      "name": "Arius",
      "year": 336,
      "wiki": "https://en.wikipedia.org/wiki/Arius"
    },
    {
      "name": "Eusebius of Caesarea",
      "year": 339,
      "wiki": "https://en.wikipedia.org/wiki/Eusebius"
    },
    {
      "name": "Asterius of Cappadocia",
      "year": 341,
      "wiki": "https://en.wikipedia.org/wiki/Asterius_of_Cappadocia"
    },
    {
      "name": "Aphrahat the Persian Sage",
      "year": 345,
      "wiki": "https://en.wikipedia.org/wiki/Aphrahat"
    },
    {
      "name": "Pachomius the Great",
      "year": 348,
      "wiki": "https://en.wikipedia.org/wiki/Pachomius_the_Great"
    },
    {
      "name": "Syncletica of Alexandria",
      "year": 350,
      "wiki": "https://en.wikipedia.org/wiki/Syncletica_of_Alexandria"
    },
    {
      "name": "Julius Firmicus Maternus",
      "year": 350,
      "wiki": "https://en.wikipedia.org/wiki/Julius_Firmicus_Maternus"
    },
    {
      "name": "Ammon of Hadrianopolis",
      "year": 355,
      "wiki": "https://ccdl.claremont.edu/digital/collection/cce/id/1211"
    },
    {
      "name": "Anthony the Great",
      "year": 356,
      "wiki": "https://en.wikipedia.org/wiki/Anthony_the_Great"
    },
    {
      "name": "Eusebius of Emesa",
      "year": 360,
      "wiki": "https://en.wikipedia.org/wiki/Eusebius_of_Emesa"
    },
    {
      "name": "Potamius of Lisbon",
      "year": 360,
      "wiki": "https://en.wikipedia.org/wiki/Potamius"
    },
    {
      "name": "Gaudentius of Rimini",
      "year": 360,
      "wiki": "https://en.wikipedia.org/wiki/Gaudentius_of_Rimini"
    },
    {
      "name": "Eustathius of Antioch",
      "year": 360,
      "wiki": "https://en.wikipedia.org/wiki/Eustathius_of_Antioch"
    },
    {
      "name": "Acacius of Caesarea",
      "year": 366,
      "wiki": "https://en.wikipedia.org/wiki/Acacius_of_Caesarea"
    },
    {
      "name": "Hilary of Poitiers",
      "year": 367,
      "wiki": "https://en.wikipedia.org/wiki/Hilary_of_Poitiers"
    },
    {
      "name": "Theodorus of Tabennese",
      "year": 368,
      "wiki": "https://en.wikipedia.org/wiki/Theodorus_of_Tabennese"
    },
    {
      "name": "Gaius Marius Victorinus",
      "year": 370,
      "wiki": "https://en.wikipedia.org/wiki/Gaius_Marius_Victorinus"
    },
    {
      "name": "Lucifer of Cagliari",
      "year": 370,
      "wiki": "https://en.wikipedia.org/wiki/Lucifer_of_Cagliari"
    },
    {
      "name": "Eusebius of Vercelli",
      "year": 371,
      "wiki": "https://en.wikipedia.org/wiki/Eusebius_of_Vercelli"
    },
    {
      "name": "Ephrem the Syrian",
      "year": 373,
      "wiki": "https://en.wikipedia.org/wiki/Ephrem_the_Syrian"
    },
    {
      "name": "Athanasius of Alexandria",
      "year": 373,
      "wiki": "https://en.wikipedia.org/wiki/Athanasius_of_Alexandria"
    },
    {
      "name": "Titus of Bostra",
      "year": 378,
      "wiki": "https://en.wikipedia.org/wiki/Titus_of_Bostra"
    },
    {
      "name": "Basil of Caesarea",
      "year": 379,
      "wiki": "https://en.wikipedia.org/wiki/Basil_of_Caesarea"
    },
    {
      "name": "Macrina the Younger",
      "year": 379,
      "wiki": "https://en.wikipedia.org/wiki/Macrina_the_Younger"
    },
    {
      "name": "Oresiesis-Heru-sa Ast",
      "year": 380,
      "wiki": "https://en.wikipedia.org/wiki/Orsisius"
    },
    {
      "name": "Apostolic Constitutions",
      "year": 380,
      "wiki": "https://en.wikipedia.org/wiki/Apostolic_Constitutions"
    },
    {
      "name": "Council of Constantinople of 381",
      "year": 381,
      "wiki": "https://en.wikipedia.org/wiki/First_Council_of_Constantinople"
    },
    {
      "name": "Apollinaris of Laodicea",
      "year": 382,
      "wiki": "https://en.wikipedia.org/wiki/Apollinaris_of_Laodicea"
    },
    {
      "name": "Ambrosiaster",
      "year": 384,
      "wiki": "https://en.wikipedia.org/wiki/Ambrosiaster"
    },
    {
      "name": "Pseudo-Ambrose",
      "year": 384,
      "wiki": "https://en.wikipedia.org/wiki/Ambrosiaster"
    },
    {
      "name": "Cyril of Jerusalem",
      "year": 386,
      "wiki": "https://en.wikipedia.org/wiki/Cyril_of_Jerusalem"
    },
    {
      "name": "Horsiesios",
      "year": 387,
      "wiki": "https://coptic-wiki.org/horsiesios-saint"
    },
    {
      "name": "Optatus of Milevis",
      "year": 390,
      "wiki": "https://en.wikipedia.org/wiki/Optatus"
    },
    {
      "name": "Gregory of Nazianzus",
      "year": 390,
      "wiki": "https://en.wikipedia.org/wiki/Gregory_of_Nazianzus"
    },
    {
      "name": "Ticonius",
      "year": 390,
      "wiki": "https://en.wikipedia.org/wiki/Ticonius"
    },
    {
      "name": "Palladius of Antioch",
      "year": 390,
      "wiki": "https://en.wikipedia.org/wiki/Palladius_of_Antioch"
    },
    {
      "name": "Diodorus of Tarsus",
      "year": 390,
      "wiki": "https://en.wikipedia.org/wiki/Diodorus_of_Tarsus"
    },
    {
      "name": "Nemesius of Emesa",
      "year": 390,
      "wiki": "https://en.wikipedia.org/wiki/Nemesius"
    },
    {
      "name": "Macarius of Egypt",
      "year": 391,
      "wiki": "https://en.wikipedia.org/wiki/Macarius_of_Egypt"
    },
    {
      "name": "Pacian of Barcelona",
      "year": 391,
      "wiki": "https://en.wikipedia.org/wiki/Pacian"
    },
    {
      "name": "Gregory of Elvira",
      "year": 392,
      "wiki": "https://en.wikipedia.org/wiki/Gregory_of_Elvira"
    },
    {
      "name": "Gregory of Nyssa",
      "year": 395,
      "wiki": "https://en.wikipedia.org/wiki/Gregory_of_Nyssa"
    },
    {
      "name": "Ammonas of Egypt",
      "year": 396,
      "wiki": "https://en.wikipedia.org/wiki/Ammonas_of_Egypt"
    },
    {
      "name": "Ambrose of Milan",
      "year": 397,
      "wiki": "https://en.wikipedia.org/wiki/Ambrose"
    },
    {
      "name": "Philastrius of Brescia",
      "year": 397,
      "wiki": "https://en.wikipedia.org/wiki/Philastrius"
    },
    {
      "name": "Didymus the Blind",
      "year": 398,
      "wiki": "https://en.wikipedia.org/wiki/Didymus_the_Blind"
    },
    {
      "name": "Evagrius Ponticus",
      "year": 399,
      "wiki": "https://en.wikipedia.org/wiki/Evagrius_Ponticus"
    },
    {
      "name": "Adamantius",
      "year": 400,
      "wiki": "https://en.wikipedia.org/wiki/De_recta_in_Deum_fide"
    },
    {
      "name": "Book of Steps",
      "year": 400,
      "wiki": "https://en.wikipedia.org/wiki/Book_of_Steps"
    },
    {
      "name": "Hegemonius",
      "year": 400,
      "wiki": "https://en.wikipedia.org/wiki/Hegemonius"
    },
    {
      "name": "Philo of Carpasia",
      "year": 400,
      "wiki": "https://en.wikipedia.org/wiki/Karpasia_(town)"
    },
    {
      "name": "Pseudo-Clement",
      "year": 400,
      "wiki": "https://en.wikipedia.org/wiki/Clementine_literature"
    },
    {
      "name": "Pseudo-Hegesippus",
      "year": 400,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Hegesippus"
    },
    {
      "name": "Liturgy of Saint James",
      "year": 400,
      "wiki": "https://en.wikipedia.org/wiki/Liturgy_of_Saint_James"
    },
    {
      "name": "Pseudo-Ignatius",
      "year": 400,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Ignatius"
    },
    {
      "name": "Epiphanius of Salamis",
      "year": 403,
      "wiki": "https://en.wikipedia.org/wiki/Epiphanius_of_Salamis"
    },
    {
      "name": "Amphilochius of Iconium",
      "year": 403,
      "wiki": "https://en.wikipedia.org/wiki/Amphilochius_of_Iconium"
    },
    {
      "name": "Chromatius of Aquileia",
      "year": 406,
      "wiki": "https://en.wikipedia.org/wiki/Chromatius"
    },
    {
      "name": "John Chrysostom",
      "year": 407,
      "wiki": "https://en.wikipedia.org/wiki/John_Chrysostom"
    },
    {
      "name": "Gaudentius of Brescia",
      "year": 410,
      "wiki": "https://en.wikipedia.org/wiki/Gaudentius_of_Brescia"
    },
    {
      "name": "Prudentius",
      "year": 410,
      "wiki": "https://en.wikipedia.org/wiki/Prudentius"
    },
    {
      "name": "Tyrannius Rufinus",
      "year": 411,
      "wiki": "https://en.wikipedia.org/wiki/Tyrannius_Rufinus"
    },
    {
      "name": "Council of Carthage of 411",
      "year": 411,
      "wiki": "https://en.wikipedia.org/wiki/Councils_of_Carthage#Conference_of_411"
    },
    {
      "name": "Theophilus of Alexandria",
      "year": 412,
      "wiki": "https://en.wikipedia.org/wiki/Theophilus_I_of_Alexandria"
    },
    {
      "name": "Aurelius Prudentius Clemens",
      "year": 413,
      "wiki": "https://en.wikipedia.org/wiki/Prudentius"
    },
    {
      "name": "Nicetas of Remesiana",
      "year": 414,
      "wiki": "https://en.wikipedia.org/wiki/Nicetas_of_Remesiana"
    },
    {
      "name": "Pelagius",
      "year": 418,
      "wiki": "https://en.wikipedia.org/wiki/Pelagius"
    },
    {
      "name": "Council of Carthage of 419",
      "year": 419,
      "wiki": "https://en.wikipedia.org/wiki/Councils_of_Carthage#Council_of_419"
    },
    {
      "name": "Fastidius",
      "year": 420,
      "wiki": "https://en.wikisource.org/wiki/Nicene_and_Post-Nicene_Fathers:_Series_II/Volume_III/Lives_of_Illustrious_Men/Gennadius/Fastidius_the_bishop"
    },
    {
      "name": "Palladius of Galatia",
      "year": 420,
      "wiki": "https://en.wikipedia.org/wiki/Palladius_of_Galatia"
    },
    {
      "name": "Paulus Orosius",
      "year": 420,
      "wiki": "https://en.wikipedia.org/wiki/Orosius"
    },
    {
      "name": "Jerome",
      "year": 420,
      "wiki": "https://en.wikipedia.org/wiki/Jerome"
    },
    {
      "name": "Paulinus of Milan",
      "year": 422,
      "wiki": "https://en.wikipedia.org/wiki/Paulinus_the_Deacon"
    },
    {
      "name": "Severian of Gabala",
      "year": 425,
      "wiki": "https://en.wikipedia.org/wiki/Severian_of_Gabala"
    },
    {
      "name": "Sulpicius Severus",
      "year": 425,
      "wiki": "https://en.wikipedia.org/wiki/Sulpicius_Severus"
    },
    {
      "name": "Theodore of Mopsuestia",
      "year": 428,
      "wiki": "https://en.wikipedia.org//wiki/Theodore_of_Mopsuestia"
    },
    {
      "name": "Augustine of Hippo",
      "year": 430,
      "wiki": "https://en.wikipedia.org/wiki/Augustine_of_Hippo"
    },
    {
      "name": "Marcus Eremita",
      "year": 430,
      "wiki": "https://en.wikipedia.org/wiki/Marcus_Eremita"
    },
    {
      "name": "Paulinus of Nola",
      "year": 431,
      "wiki": "https://en.wikipedia.org/wiki/Paulinus_of_Nola"
    },
    {
      "name": "Council of Ephesus",
      "year": 431,
      "wiki": "https://en.wikipedia.org/wiki/Council_of_Ephesus"
    },
    {
      "name": "John Cassian",
      "year": 435,
      "wiki": "https://en.wikipedia.org/wiki/John_Cassian"
    },
    {
      "name": "Acacius of Beroea",
      "year": 437,
      "wiki": "https://en.wikipedia.org/wiki/Acacius_of_Beroea"
    },
    {
      "name": "Possidius",
      "year": 437,
      "wiki": "https://en.wikipedia.org//wiki/Possidius"
    },
    {
      "name": "Socrates Scholasticus",
      "year": 439,
      "wiki": "https://en.wikipedia.org/wiki/Socrates_of_Constantinople"
    },
    {
      "name": "John I of Antioch",
      "year": 441,
      "wiki": "https://en.wikipedia.org/wiki/John_I_of_Antioch"
    },
    {
      "name": "Cyril of Alexandria",
      "year": 444,
      "wiki": "https://en.wikipedia.org/wiki/Cyril_of_Alexandria"
    },
    {
      "name": "Vincent of Lérins",
      "year": 445,
      "wiki": "https://en.wikipedia.org/wiki/Vincent_of_L%C3%A9rins"
    },
    {
      "name": "Proclus of Constantinople",
      "year": 446,
      "wiki": "https://en.wikipedia.org/wiki/Proclus_of_Constantinople"
    },
    {
      "name": "Theodotus of Ancyra",
      "year": 446,
      "wiki": "https://en.wikipedia.org/wiki/Theodotus_of_Ancyra_(bishop)"
    },
    {
      "name": "Eznik of Kolb",
      "year": 449,
      "wiki": "https://en.wikipedia.org/wiki/Eznik_of_Kolb"
    },
    {
      "name": "Hilary of Arles",
      "year": 449,
      "wiki": "https://en.wikipedia.org/wiki/Hilary_of_Arles"
    },
    {
      "name": "Eucherius of Lyon",
      "year": 449,
      "wiki": "https://en.wikipedia.org/wiki/Eucherius_of_Lyon"
    },
    {
      "name": "Quodvultdeus",
      "year": 450,
      "wiki": "https://en.wikipedia.org/wiki/Quodvultdeus"
    },
    {
      "name": "John the Solitary",
      "year": 450,
      "wiki": "https://roger-pearse.com/wiki/index.php?title=John_the_Solitary"
    },
    {
      "name": "Isidore of Pelusium",
      "year": 450,
      "wiki": "https://en.wikipedia.org/wiki/Isidore_of_Pelusium"
    },
    {
      "name": "Abba Poemen",
      "year": 450,
      "wiki": "https://en.wikipedia.org/wiki/Poemen"
    },
    {
      "name": "Hesychius of Jerusalem",
      "year": 450,
      "wiki": "https://en.wikipedia.org/wiki/Hesychius_of_Jerusalem"
    },
    {
      "name": "Hermias Sozomen",
      "year": 450,
      "wiki": "https://en.wikipedia.org/wiki/Sozomen"
    },
    {
      "name": "Peter Chrysologus",
      "year": 450,
      "wiki": "https://en.wikipedia.org/wiki/Peter_Chrysologus"
    },
    {
      "name": "Nilus of Sinai",
      "year": 451,
      "wiki": "https://en.wikipedia.org/wiki/Nilus_of_Sinai"
    },
    {
      "name": "Prosper of Aquitaine",
      "year": 455,
      "wiki": "https://en.wikipedia.org/wiki/Prosper_of_Aquitaine"
    },
    {
      "name": "Julian of Eclanum",
      "year": 455,
      "wiki": "https://en.wikipedia.org/wiki/Julian_of_Eclanum"
    },
    {
      "name": "Theodoret of Cyrus",
      "year": 458,
      "wiki": "https://en.wikipedia.org/wiki/Theodoret"
    },
    {
      "name": "Valerian of Cimiez",
      "year": 460,
      "wiki": "https://www.wikidata.org/wiki/Q3554325"
    },
    {
      "name": "Arnobius the Younger",
      "year": 460,
      "wiki": "https://en.wikipedia.org/wiki/Arnobius_the_Younger"
    },
    {
      "name": "Patrick of Ireland",
      "year": 461,
      "wiki": "https://en.wikipedia.org/wiki/Saint_Patrick"
    },
    {
      "name": "Leo the Great",
      "year": 461,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Leo_I"
    },
    {
      "name": "Shenoute the Archimandrite",
      "year": 465,
      "wiki": "https://en.wikipedia.org/wiki/Shenoute"
    },
    {
      "name": "Maximus of Turin",
      "year": 465,
      "wiki": "https://en.wikipedia.org/wiki/Maximus_of_Turin"
    },
    {
      "name": "Basil of Seleucia",
      "year": 468,
      "wiki": "https://en.wikipedia.org/wiki/Basil_of_Seleucia"
    },
    {
      "name": "Gennadius of Constantinople",
      "year": 471,
      "wiki": "https://en.wikipedia.org/wiki/Gennadius_of_Constantinople"
    },
    {
      "name": "Besa The Copt",
      "year": 474,
      "wiki": "https://ccdl.claremont.edu/digital/collection/cce/id/345/"
    },
    {
      "name": "Vigilius of Thapsus",
      "year": 484,
      "wiki": "https://en.wikipedia.org/wiki/Vigilius_of_Thapsus"
    },
    {
      "name": "Diadochos of Photiki",
      "year": 486,
      "wiki": "https://en.wikipedia.org/wiki/Diadochos_of_Photiki"
    },
    {
      "name": "James",
      "year": 49,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_of_James"
    },
    {
      "name": "Faustus of Riez",
      "year": 490,
      "wiki": "https://en.wikipedia.org/wiki/Faustus_of_Riez"
    },
    {
      "name": "Isaiah the Solitary",
      "year": 491,
      "wiki": "https://en.wikipedia.org/wiki/Isaiah_the_Solitary"
    },
    {
      "name": "Gennadius of Massilia",
      "year": 496,
      "wiki": "https://en.wikipedia.org/wiki/Gennadius_of_Massilia"
    },
    {
      "name": "Galatians",
      "year": 50,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_to_the_Galatians"
    },
    {
      "name": "Philo of Alexandria",
      "year": 50,
      "wiki": "https://en.wikipedia.org/wiki/Philo"
    },
    {
      "name": "Salvian the Presbyter",
      "year": 500,
      "wiki": "https://en.wikipedia.org/wiki/Salvian"
    },
    {
      "name": "Eusebius of Gaul",
      "year": 500,
      "wiki": "https://fr.wikipedia.org/wiki/Eus%C3%A8be_gallican"
    },
    {
      "name": "Acts of Peter and Paul",
      "year": 500,
      "wiki": "https://en.wikipedia.org/wiki/Acts_of_Peter_and_Paul"
    },
    {
      "name": "Codex Veronensis",
      "year": 500,
      "wiki": "https://en.wikipedia.org/wiki/Codex_Veronensis"
    },
    {
      "name": "Ambrosian Hymn Writer",
      "year": 500,
      "wiki": "https://en.wikipedia.org/wiki/Ambrosian_hymns"
    },
    {
      "name": "Victor of Cartenna",
      "year": 500,
      "wiki": "https://www.biblicalcyclopedia.com/V/victor-of-cartenna.html"
    },
    {
      "name": "Pseudo-Chrysostom",
      "year": 500,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Chrysostom"
    },
    {
      "name": "Desert Fathers",
      "year": 500,
      "wiki": "https://en.wikipedia.org/wiki/Desert_Fathers"
    },
    {
      "name": "Aponius",
      "year": 500,
      "wiki": "https://referenceworks.brillonline.com/entries/brill-s-new-pauly/aponius-e128770"
    },
    {
      "name": "Victor Vitensis",
      "year": 500,
      "wiki": "https://en.wikipedia.org/wiki/Victor_Vitensis"
    },
    {
      "name": "Julianus Pomerius",
      "year": 505,
      "wiki": "https://en.wikipedia.org/wiki/Julianus_Pomerius"
    },
    {
      "name": "Epiphanius Scholasticus",
      "year": 510,
      "wiki": "https://en.wikipedia.org/wiki/Epiphanius_Scholasticus"
    },
    {
      "name": "Magnus Felix Ennodius",
      "year": 521,
      "wiki": "https://en.wikipedia.org/wiki/Magnus_Felix_Ennodius"
    },
    {
      "name": "Jacob of Serugh",
      "year": 521,
      "wiki": "https://en.wikipedia.org//wiki/Jacob_of_Serugh"
    },
    {
      "name": "Philoxenus of Mabbug",
      "year": 523,
      "wiki": "https://en.wikipedia.org/wiki/Philoxenus_of_Mabbug"
    },
    {
      "name": "Procopius of Gaza",
      "year": 528,
      "wiki": "https://en.wikipedia.org/wiki/Procopius_of_Gaza"
    },
    {
      "name": "Pseudo-Dionysius the Areopagite",
      "year": 532,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Dionysius_the_Areopagite"
    },
    {
      "name": "Fulgentius of Ruspe",
      "year": 533,
      "wiki": "https://en.wikipedia.org/wiki/Fulgentius_of_Ruspe"
    },
    {
      "name": "Remigius of Rheims",
      "year": 533,
      "wiki": "https://en.wikipedia.org/wiki/Saint_Remigius"
    },
    {
      "name": "Pseudo-Macarius",
      "year": 534,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Macarius"
    },
    {
      "name": "Eugippius",
      "year": 535,
      "wiki": "https://en.wikipedia.org/wiki/Eugippius"
    },
    {
      "name": "Severus of Antioch",
      "year": 538,
      "wiki": "https://en.wikipedia.org/wiki/Severus_of_Antioch"
    },
    {
      "name": "Caesarius of Arles",
      "year": 542,
      "wiki": "https://en.wikipedia.org/wiki/Caesarius_of_Arles"
    },
    {
      "name": "Arator",
      "year": 544,
      "wiki": "https://en.wikipedia.org/wiki/Arator"
    },
    {
      "name": "Facundus of Hermiane",
      "year": 544,
      "wiki": "https://en.wikipedia.org/wiki/Facundus_of_Hermiane"
    },
    {
      "name": "Venerable Barsanuphius and John the Prophet",
      "year": 545,
      "wiki": "https://en.wikipedia.org/wiki/Barsanuphius"
    },
    {
      "name": "Benedict of Nursia",
      "year": 548,
      "wiki": "https://en.wikipedia.org/wiki/Benedict_of_Nursia"
    },
    {
      "name": "1 Corinthians",
      "year": 55,
      "wiki": "https://en.wikipedia.org/wiki/First_Epistle_to_the_Corinthians"
    },
    {
      "name": "Oecumenius",
      "year": 550,
      "wiki": "https://en.wikipedia.org/wiki/Oecumenius"
    },
    {
      "name": "Verecundus of Junca",
      "year": 552,
      "wiki": "https://en.wikipedia.org/wiki/Verecundus_of_Junca"
    },
    {
      "name": "Second Council of Constantinople",
      "year": 553,
      "wiki": "https://en.wikipedia.org/wiki/Second_Council_of_Constantinople"
    },
    {
      "name": "Romanos the Melodist",
      "year": 555,
      "wiki": "https://en.wikipedia.org/wiki/Romanos_the_Melodist"
    },
    {
      "name": "Romans",
      "year": 56,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_to_the_Romans"
    },
    {
      "name": "2 Corinthians",
      "year": 56,
      "wiki": "https://en.wikipedia.org/wiki/Second_Epistle_to_the_Corinthians"
    },
    {
      "name": "Primasius of Hadrumetum",
      "year": 560,
      "wiki": "https://en.wikipedia.org/wiki/Primasius_of_Hadrumetum"
    },
    {
      "name": "Dorotheos of Gaza",
      "year": 565,
      "wiki": "https://en.wikipedia.org/wiki/Dorotheus_of_Gaza"
    },
    {
      "name": "Martin of Braga",
      "year": 580,
      "wiki": "https://en.wikipedia.org/wiki/Martin_of_Braga"
    },
    {
      "name": "Cassiodorus",
      "year": 585,
      "wiki": "https://en.wikipedia.org/wiki/Cassiodorus"
    },
    {
      "name": "Matthew",
      "year": 60,
      "wiki": "https://en.wikipedia.org/wiki/Gospel_of_Matthew"
    },
    {
      "name": "Mark",
      "year": 60,
      "wiki": "https://en.wikipedia.org/wiki/Gospel_of_Mark"
    },
    {
      "name": "Apringius of Beja",
      "year": 600,
      "wiki": "https://en.wikipedia.org/wiki/Apringius"
    },
    {
      "name": "Abraham of Nathpar",
      "year": 600,
      "wiki": "https://syriaca.org/person/321"
    },
    {
      "name": "Paschasius of Dumium",
      "year": 600,
      "wiki": "https://en.wikipedia.org/wiki/Paschasius_of_Dumium"
    },
    {
      "name": "Olympiodorus of Alexandria",
      "year": 600,
      "wiki": "https://www.biblicalcyclopedia.com/O/olympiodorus-of-alexandria.html"
    },
    {
      "name": "Leander of Seville",
      "year": 601,
      "wiki": "https://en.wikipedia.org/wiki/Leander_of_Seville"
    },
    {
      "name": "Gregory the Dialogist",
      "year": 604,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Gregory_I"
    },
    {
      "name": "Paterius",
      "year": 606,
      "wiki": "https://en.wikipedia.org/wiki/Paterius"
    },
    {
      "name": "Venantius Fortunatus",
      "year": 609,
      "wiki": "https://en.wikipedia.org/wiki/Venantius_Fortunatus"
    },
    {
      "name": "Luke",
      "year": 61,
      "wiki": "https://en.wikipedia.org/wiki/Gospel_of_Luke"
    },
    {
      "name": "Andreas of Caesarea",
      "year": 614,
      "wiki": "https://en.wikipedia.org/wiki/Andreas_of_Caesarea"
    },
    {
      "name": "Philippians",
      "year": 62,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_to_the_Philippians"
    },
    {
      "name": "Acts",
      "year": 62,
      "wiki": "https://en.wikipedia.org/wiki/Acts_of_the_Apostles"
    },
    {
      "name": "Ephesians",
      "year": 62,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_to_the_Ephesians"
    },
    {
      "name": "Isidore of Seville",
      "year": 636,
      "wiki": "https://en.wikipedia.org/wiki/Isidore_of_Seville"
    },
    {
      "name": "Sophronius of Jerusalem",
      "year": 638,
      "wiki": "https://en.wikipedia.org/wiki/Sophronius_of_Jerusalem"
    },
    {
      "name": "1 Timothy",
      "year": 64,
      "wiki": "https://en.wikipedia.org/wiki/First_Epistle_to_Timothy"
    },
    {
      "name": "Sahdona the Syrian",
      "year": 649,
      "wiki": "https://en.wikipedia.org/wiki/Sahdona"
    },
    {
      "name": "Lateran Council of 649",
      "year": 649,
      "wiki": "https://en.wikipedia.org/wiki/Lateran_Council_of_649"
    },
    {
      "name": "1 Peter",
      "year": 65,
      "wiki": "https://en.wikipedia.org/wiki/First_Epistle_of_Peter"
    },
    {
      "name": "Braulio of Zaragoza",
      "year": 651,
      "wiki": "https://en.wikipedia.org/wiki/Braulio_of_Zaragoza"
    },
    {
      "name": "Maximus the Confessor",
      "year": 662,
      "wiki": "https://en.wikipedia.org/wiki/Maximus_the_Confessor"
    },
    {
      "name": "Fructuosus of Braga",
      "year": 665,
      "wiki": "https://en.wikipedia.org/wiki/Fructuosus_of_Braga"
    },
    {
      "name": "Ildefonsus of Toledo",
      "year": 667,
      "wiki": "https://en.wikipedia.org/wiki/Ildefonsus"
    },
    {
      "name": "2 Peter",
      "year": 68,
      "wiki": "https://en.wikipedia.org/wiki/Second_Epistle_of_Peter"
    },
    {
      "name": "Hebrews",
      "year": 69,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_to_the_Hebrews"
    },
    {
      "name": "Julian of Toledo",
      "year": 690,
      "wiki": "https://en.wikipedia.org/wiki/Julian_of_Toledo"
    },
    {
      "name": "Jude",
      "year": 70,
      "wiki": "https://en.wikipedia.org/wiki/Epistle_of_Jude"
    },
    {
      "name": "Sibylline Oracles",
      "year": 700,
      "wiki": "https://en.wikipedia.org/wiki/Sibylline_Oracles"
    },
    {
      "name": "Isaac of Nineveh",
      "year": 700,
      "wiki": "https://en.wikipedia.org/wiki/Isaac_of_Nineveh"
    },
    {
      "name": "Adamnan",
      "year": 704,
      "wiki": "https://en.wikipedia.org/wiki/Adomn%C3%A1n"
    },
    {
      "name": "Adamnán of Iona",
      "year": 704,
      "wiki": "https://en.wikipedia.org/wiki/Adomn%C3%A1n"
    },
    {
      "name": "Jacob of Edessa",
      "year": 708,
      "wiki": "https://en.wikipedia.org/wiki/Jacob_of_Edessa"
    },
    {
      "name": "Bede",
      "year": 735,
      "wiki": "https://en.wikipedia.org/wiki/Bede"
    },
    {
      "name": "Andrew of Crete",
      "year": 740,
      "wiki": "https://en.wikipedia.org/wiki/Andrew_of_Crete"
    },
    {
      "name": "John Damascene",
      "year": 749,
      "wiki": "https://en.wikipedia.org/wiki/John_of_Damascus"
    },
    {
      "name": "Cosmas of Maiuma",
      "year": 773,
      "wiki": "https://en.wikipedia.org/wiki/Cosmas_of_Maiuma"
    },
    {
      "name": "John of Dalyatha",
      "year": 780,
      "wiki": "https://en.wikipedia.org/wiki/John_of_Dalyatha"
    },
    {
      "name": "John of Karpathos",
      "year": 800,
      "wiki": "https://en.wikipedia.org/wiki/John_of_Karpathos"
    },
    {
      "name": "Pseudo-Ephrem",
      "year": 800,
      "wiki": "https://en.wikipedia.org/wiki/Apocalypse_of_Pseudo-Ephraem"
    },
    {
      "name": "Alcuin of York",
      "year": 804,
      "wiki": "https://en.wikipedia.org/wiki/Alcuin"
    },
    {
      "name": "Dhuoda of Septimania",
      "year": 844,
      "wiki": "https://en.wikipedia.org/wiki/Dhuoda"
    },
    {
      "name": "Theophanes of Nicaea",
      "year": 845,
      "wiki": "https://en.wikipedia.org/wiki/Theodorus_and_Theophanes#Theophanes_the_Branded"
    },
    {
      "name": "Walafrid Strabo",
      "year": 849,
      "wiki": "https://en.wikipedia.org/wiki/Walafrid_Strabo"
    },
    {
      "name": "Ishodad of Merv",
      "year": 850,
      "wiki": "https://en.wikipedia.org/wiki/Ishodad_of_Merv"
    },
    {
      "name": "Haymo of Halberstadt",
      "year": 853,
      "wiki": "https://en.wikipedia.org/wiki/Haymo_of_Halberstadt"
    },
    {
      "name": "Rabanus Maurus",
      "year": 856,
      "wiki": "https://en.wikipedia.org/wiki/Rabanus_Maurus"
    },
    {
      "name": "Haimo of Auxerre",
      "year": 865,
      "wiki": "https://en.wikipedia.org/wiki/Haimo_of_Auxerre"
    },
    {
      "name": "Paschasius Radbertus",
      "year": 865,
      "wiki": "https://en.wikipedia.org/wiki/Paschasius_Radbertus"
    },
    {
      "name": "Berengaudus",
      "year": 892,
      "wiki": "https://en.wikipedia.org/wiki/Berengaudus"
    },
    {
      "name": "Photios I of Constantinople",
      "year": 893,
      "wiki": "https://en.wikipedia.org/wiki/Photios_I_of_Constantinople"
    },
    {
      "name": "John",
      "year": 90,
      "wiki": "https://en.wikipedia.org/wiki/Gospel_of_John"
    },
    {
      "name": "Arethas of Caesarea",
      "year": 900,
      "wiki": "https://en.wikipedia.org/wiki/Arethas_of_Caesarea"
    },
    {
      "name": "Agapius of Hierapolis",
      "year": 942,
      "wiki": "https://en.wikipedia.org/wiki/Agapius_of_Hierapolis"
    },
    {
      "name": "Thietland of Einsiedeln",
      "year": 945,
      "wiki": "https://sites.google.com/site/aquinasstudybible/home/glossa-ordinaria/thietland-of-einsiedein"
    },
    {
      "name": "Revelation",
      "year": 96,
      "wiki": "https://en.wikipedia.org/wiki/Book_of_Revelation"
    },
    {
      "name": "Clement of Rome",
      "year": 99,
      "wiki": "https://en.wikipedia.org/wiki/Pope_Clement_I"
    },
    {
      "name": "Pseudo-Tertullian",
      "year": 9999,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Tertullian"
    },
    {
      "name": "Pseudo-Hippolytus",
      "year": 9999,
      "wiki": "https://www.tertullian.org/fathers2/ANF-05/anf05-20.htm"
    },
    {
      "name": "Pseudo-Augustine",
      "year": 9999,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Augustine"
    },
    {
      "name": "Pseudo-Basil",
      "year": 9999,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Basil"
    },
    {
      "name": "Pseudo-Jerome",
      "year": 9999,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Jerome"
    },
    {
      "name": "Pseudo-Cyril",
      "year": 9999,
      "wiki": ""
    },
    {
      "name": "Pseudo-Athanasius",
      "year": 9999,
      "wiki": "https://en.wikipedia.org/wiki/Athanasius_of_Alexandria#Misattributed_works"
    },
    {
      "name": "Pseudo-Justin",
      "year": 9999,
      "wiki": "https://en.wikipedia.org/wiki/Pseudo-Justin"
    },
    {
      "name": "Pseudo-Origen",
      "year": 9999,
      "wiki": ""
    }
  ]
};
