export interface WomenNote {
  author: string;
  authorPt: string;
  text: string;
  source: string;
}

type VerseKey = string; // "bookId:chapter:verse"

const WOMEN_NOTES: Record<VerseKey, WomenNote[]> = {
  /* ── Gênesis ── */
  "GEN:1:1": [
    {
      author: "Hannah Whitall Smith",
      authorPt: "Hannah Whitall Smith",
      text: "In the beginning God. Not chaos, not chance — but God. All that exists flows from a personal, purposeful Creator whose goodness is the foundation of everything He makes. To trust Him is to stand on solid ground.",
      source: "The God of All Comfort, 1906"
    }
  ],
  "GEN:1:27": [
    {
      author: "Catherine Booth",
      authorPt: "Catherine Booth",
      text: "Male and female created He them — both in the image of God. There is no higher dignity than this: to bear the image of the Almighty. Let no human prejudice diminish what God has declared glorious.",
      source: "Female Ministry, 1859"
    }
  ],
  "GEN:3:15": [
    {
      author: "Jessie Penn-Lewis",
      authorPt: "Jessie Penn-Lewis",
      text: "The seed of the woman shall bruise the serpent's head — here is the first gospel proclaimed in Eden. The very curse becomes the cradle of promise. God does not abandon; He redeems. Christ is hidden in this ancient word.",
      source: "The Warfare with Satan, 1905"
    }
  ],
  /* ── Salmos ── */
  "PSA:23:1": [
    {
      author: "Frances Ridley Havergal",
      authorPt: "Frances Ridley Havergal",
      text: "The Lord is my Shepherd — not merely a shepherd in general, but mine. This personal possession is the secret of peace. When I know He leads, I need not fear the valley, for His rod and staff are ever with me.",
      source: "Kept for the Master's Use, 1879"
    }
  ],
  "PSA:23:4": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "Even through the valley of the shadow — not around it, but through it. Our Shepherd does not promise a road without shadows; He promises His presence in every shadow. That is enough. More than enough.",
      source: "Gold Cord, 1932"
    }
  ],
  "PSA:46:1": [
    {
      author: "Hannah Whitall Smith",
      authorPt: "Hannah Whitall Smith",
      text: "God is our refuge and strength, a very present help in trouble. Not a distant God who must be sought after trouble passes, but a very present help — right here, right now, in the midst of the storm.",
      source: "The Christian's Secret of a Happy Life, 1875"
    }
  ],
  "PSA:91:1": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "To dwell in the secret place of the Most High is not a privilege of distance from the world's trouble but of depth in God. The one who abides there is not untouched by sorrow but is held through it by invisible hands.",
      source: "Candles in the Dark, 1981"
    }
  ],
  "PSA:119:105": [
    {
      author: "Frances Ridley Havergal",
      authorPt: "Frances Ridley Havergal",
      text: "A lamp to my feet — not a searchlight illuminating the distant horizon, but a lamp close enough to show the next step. God's Word grants us enough light to walk faithfully, one step at a time, in holy trust.",
      source: "Precious Words, 1872"
    }
  ],
  /* ── Provérbios ── */
  "PRO:31:25": [
    {
      author: "Catherine Booth",
      authorPt: "Catherine Booth",
      text: "Strength and honour are her clothing; and she shall rejoice in time to come. The woman of God is arrayed not in the fashions of the age but in virtues that endure. Her joy is not in applause but in faithfulness.",
      source: "Papers on Practical Religion, 1878"
    }
  ],
  "PRO:3:5": [
    {
      author: "Hannah Whitall Smith",
      authorPt: "Hannah Whitall Smith",
      text: "Trust in the Lord with all your heart — the entirety of the heart given over to God. Not our own understanding but His wisdom. This surrender is not weakness; it is the highest act of faith, releasing us into God's perfect care.",
      source: "The Christian's Secret of a Happy Life, 1875"
    }
  ],
  /* ── Isaías ── */
  "ISA:40:31": [
    {
      author: "Jessie Penn-Lewis",
      authorPt: "Jessie Penn-Lewis",
      text: "They that wait upon the Lord shall renew their strength. The waiting is not passive — it is an active, expectant clinging to the living God. In that waiting, the soul is remade. What the world calls weakness, God transforms into wings.",
      source: "The Life That Wins, 1912"
    }
  ],
  "ISA:53:5": [
    {
      author: "Phoebe Palmer",
      authorPt: "Phoebe Palmer",
      text: "He was wounded for our transgressions — what majesty of love is here! The sinless One bearing the sin of all. Every wound of Christ is a channel of grace to the penitent soul. In His stripes the deepest healing is found.",
      source: "The Way of Holiness, 1843"
    }
  ],
  "ISA:61:1": [
    {
      author: "Catherine Booth",
      authorPt: "Catherine Booth",
      text: "The Spirit of the Lord is upon me — these words, fulfilled in Christ, are also the commission of the Church. Every believer anointed by the Spirit is sent to the poor, the broken, the captive. The gospel is not a theory but a release.",
      source: "Aggressive Christianity, 1880"
    }
  ],
  /* ── Jeremias ── */
  "JER:29:11": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "For I know the thoughts that I think toward you, saith the Lord — thoughts of peace and not evil, to give you an expected end. When the way seems hidden and the purpose unclear, this word stands: God knows, God plans, God cares. Nothing is accident with Him.",
      source: "Edges of His Ways, 1955"
    }
  ],
  /* ── Mateus ── */
  "MAT:5:3": [
    {
      author: "Phoebe Palmer",
      authorPt: "Phoebe Palmer",
      text: "Blessed are the poor in spirit — those who have come to the end of self-sufficiency. This poverty is the gate of heaven. As the soul empties itself of pride, it is filled with the riches of God. The kingdom belongs to those who know their need.",
      source: "The Way of Holiness, 1843"
    }
  ],
  "MAT:5:8": [
    {
      author: "Hannah Whitall Smith",
      authorPt: "Hannah Whitall Smith",
      text: "Blessed are the pure in heart, for they shall see God. Purity of heart is singleness of vision — seeing all things in God and God in all things. The undivided heart, given wholly to Him, is rewarded with the clearest sight of His presence.",
      source: "The Christian's Secret of a Happy Life, 1875"
    }
  ],
  "MAT:6:33": [
    {
      author: "Frances Ridley Havergal",
      authorPt: "Frances Ridley Havergal",
      text: "Seek ye first the kingdom of God — here is the divine order. Not our needs first, not our comfort first, but His kingdom and righteousness. When this priority is right, the promise follows: all these things shall be added. God never fails those who put Him first.",
      source: "Royal Bounty, 1887"
    }
  ],
  "MAT:11:28": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "Come unto me, all ye that labour and are heavy laden — this invitation is not conditional on our worthiness or readiness. The weary are welcomed exactly as they are. The rest He gives is not the rest of inactivity but of a soul at peace within His yoke.",
      source: "His Thoughts Said... His Father Said..., 1941"
    }
  ],
  "MAT:16:24": [
    {
      author: "Catherine Booth",
      authorPt: "Catherine Booth",
      text: "If any man will come after me, let him deny himself, and take up his cross. The cross is not an ornament to be worn but a burden to be carried daily. Self-denial is the school of discipleship; it is in losing our life that we find the life that truly matters.",
      source: "Aggressive Christianity, 1880"
    }
  ],
  /* ── João ── */
  "JHN:1:1": [
    {
      author: "Jessie Penn-Lewis",
      authorPt: "Jessie Penn-Lewis",
      text: "In the beginning was the Word — Christ is not an afterthought of God but the eternal expression of His heart. Before all worlds were spoken into being, the Word was. Here is the foundation of our faith: a Saviour who is not created but Creator.",
      source: "The Centrality of the Cross, 1908"
    }
  ],
  "JHN:3:16": [
    {
      author: "Phoebe Palmer",
      authorPt: "Phoebe Palmer",
      text: "God so loved the world — not conditionally, not reluctantly, but so loved: with a love that moved heaven itself. This is the beating heart of the gospel. The gift of His Son is the measure of His love. Nothing can exceed it; nothing is beyond its reach.",
      source: "Faith and Its Effects, 1848"
    }
  ],
  "JHN:4:14": [
    {
      author: "Hannah Whitall Smith",
      authorPt: "Hannah Whitall Smith",
      text: "The water that I shall give him shall be in him a well of water springing up into everlasting life. Christ does not merely offer refreshment from without; He becomes a living spring within the soul. The satisfied heart springs up, it flows out, it overflows to others.",
      source: "Every-Day Religion, 1893"
    }
  ],
  "JHN:10:10": [
    {
      author: "Frances Ridley Havergal",
      authorPt: "Frances Ridley Havergal",
      text: "I am come that they might have life, and that they might have it more abundantly. The life Christ gives is not mere existence but overflow — life in its fullness, its depth, its joy. He is not a minimum Saviour; He is an abundantly generous Lord.",
      source: "Kept for the Master's Use, 1879"
    }
  ],
  "JHN:14:6": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "I am the way — not one of many roads but the Way itself. When the path is dark and confusing, we do not need a map; we need to hold the hand of the One who is the Way. He does not merely show the road to the Father; He is that road.",
      source: "Gold by Moonlight, 1935"
    }
  ],
  "JHN:15:5": [
    {
      author: "Jessie Penn-Lewis",
      authorPt: "Jessie Penn-Lewis",
      text: "I am the vine, ye are the branches — our life is derived, not self-generated. Apart from Him we can do nothing. This is not failure; it is design. The branch that abides does not strain to produce fruit; it simply remains, and fruit is the natural result of union with Christ.",
      source: "The Overcomer, 1909"
    }
  ],
  /* ── Romanos ── */
  "ROM:8:1": [
    {
      author: "Phoebe Palmer",
      authorPt: "Phoebe Palmer",
      text: "There is therefore now no condemnation to them which are in Christ Jesus. Now — not after years of penance, not after achieving some level of holiness — but now, in this moment, in Christ. Condemnation has been fully borne by Him; none remains for those who are His.",
      source: "The Way of Holiness, 1843"
    }
  ],
  "ROM:8:28": [
    {
      author: "Hannah Whitall Smith",
      authorPt: "Hannah Whitall Smith",
      text: "All things work together for good to them that love God. Not some things — all things. Not perhaps they will work together, but they do. The child of God need not fear any circumstance, for all is under the management of a Father who makes no mistakes.",
      source: "The God of All Comfort, 1906"
    }
  ],
  "ROM:8:38": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "Neither death, nor life... shall be able to separate us from the love of God. I have tested this promise across many years of sorrow and service in this land. It holds. When everything else gives way, the love of God remains. Nothing can reach beyond it.",
      source: "Edges of His Ways, 1955"
    }
  ],
  "ROM:12:1": [
    {
      author: "Catherine Booth",
      authorPt: "Catherine Booth",
      text: "Present your bodies a living sacrifice — the whole self given to God, not only in moments of religious feeling but in the daily routine of body and will. This reasonable service is the true response to mercies received. Half-consecration is no consecration at all.",
      source: "Aggressive Christianity, 1880"
    }
  ],
  /* ── 1 Coríntios ── */
  "1CO:13:4": [
    {
      author: "Frances Ridley Havergal",
      authorPt: "Frances Ridley Havergal",
      text: "Charity suffereth long, and is kind — love is not a feeling that comes and goes but a character formed in the soul by the Holy Spirit. It suffers patiently because it sees the beloved through the eyes of Christ. This love is not our achievement; it is His gift poured into willing hearts.",
      source: "Kept for the Master's Use, 1879"
    }
  ],
  "1CO:13:13": [
    {
      author: "Phoebe Palmer",
      authorPt: "Phoebe Palmer",
      text: "The greatest of these is charity — love. Faith will one day be sight; hope will be fulfillment; but love never ends, for God Himself is love. To grow in love is to grow in the likeness of God. This is the highest sanctification.",
      source: "Present to my Christian Friend on Entire Devotion to God, 1845"
    }
  ],
  /* ── Gálatas ── */
  "GAL:2:20": [
    {
      author: "Jessie Penn-Lewis",
      authorPt: "Jessie Penn-Lewis",
      text: "I am crucified with Christ: nevertheless I live — this is the paradox of the cross-life. The old self is not merely suppressed but crucified; yet in that death, Christ lives. The believer who has truly seen the cross lives by faith, no longer by self-effort or self-pleasing.",
      source: "The Centrality of the Cross, 1908"
    }
  ],
  "GAL:5:22": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "The fruit of the Spirit — love, joy, peace. Fruit is not manufactured; it grows. We cannot produce spiritual fruit by determination alone. What we can do is remain in the Vine, keep the soil of the heart prepared, and trust the Spirit to bring forth what He will.",
      source: "If, 1938"
    }
  ],
  /* ── Filipenses ── */
  "PHP:4:4": [
    {
      author: "Frances Ridley Havergal",
      authorPt: "Frances Ridley Havergal",
      text: "Rejoice in the Lord alway — this is a command, not a suggestion. And it is possible because the joy is not in circumstances but in the Lord. He does not change; therefore our joy in Him need not depend on what happens around us.",
      source: "Royal Bounty, 1887"
    }
  ],
  "PHP:4:7": [
    {
      author: "Hannah Whitall Smith",
      authorPt: "Hannah Whitall Smith",
      text: "The peace of God which passeth all understanding — it passes all understanding because it is not produced by understanding. Reason cannot explain why a soul in the midst of trial should be at rest. But prayer and trust unlock what logic cannot reach.",
      source: "The Christian's Secret of a Happy Life, 1875"
    }
  ],
  "PHP:4:13": [
    {
      author: "Catherine Booth",
      authorPt: "Catherine Booth",
      text: "I can do all things through Christ which strengtheneth me. Not merely endure all things, but do — active, purposeful, fruitful service. The strength is Christ's; the willingness is ours. When these meet, there is no limit to what God can accomplish through yielded lives.",
      source: "Papers on Salvation, 1863"
    }
  ],
  /* ── Hebreus ── */
  "HEB:11:1": [
    {
      author: "Phoebe Palmer",
      authorPt: "Phoebe Palmer",
      text: "Faith is the substance of things hoped for — not imagination or wishful thinking, but substance. The faith God gives has weight and reality. It holds what has not yet been seen and stands firm upon the character of the God who cannot lie.",
      source: "Faith and Its Effects, 1848"
    }
  ],
  "HEB:12:1": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "Surrounded by so great a cloud of witnesses — they who have run and finished, they watch. We are not alone in this race. Every saint who trusted God through sorrow encourages us to strip off whatever hinders and run with eyes fixed not on the crowd but on Christ.",
      source: "God's Missionary, 1939"
    }
  ],
  "HEB:12:2": [
    {
      author: "Jessie Penn-Lewis",
      authorPt: "Jessie Penn-Lewis",
      text: "Looking unto Jesus, the author and finisher of our faith — He began this work and He will complete it. Our part is not to perfect ourselves but to keep our eyes on the One who is perfecting us. The look of faith is the source of every victory.",
      source: "Face to Face, 1902"
    }
  ],
  /* ── 1 Pedro ── */
  "1PE:5:7": [
    {
      author: "Hannah Whitall Smith",
      authorPt: "Hannah Whitall Smith",
      text: "Casting all your care upon him; for he careth for you. This is not stoic detachment but loving transfer — we do not bear the burden alone because we are invited to place it entirely in hands stronger than ours. He who cares for sparrows cares infinitely more for His own.",
      source: "The God of All Comfort, 1906"
    }
  ],
  /* ── Apocalipse ── */
  "REV:3:20": [
    {
      author: "Frances Ridley Havergal",
      authorPt: "Frances Ridley Havergal",
      text: "Behold, I stand at the door and knock — it is the Saviour who waits, who knocks. He does not force entry; He invites. The door is opened from the inside by a willing heart. Those who hear His voice and open will find He comes not merely to visit but to dwell.",
      source: "Coming to the King, 1882"
    }
  ],
  "REV:21:5": [
    {
      author: "Amy Carmichael",
      authorPt: "Amy Carmichael",
      text: "Behold, I make all things new — the God who created declares His final intention. Nothing is too broken to be remade; nothing is too stained to be restored. This promise is not only for eternity; it begins now, in every heart that yields to His renewing work.",
      source: "Toward Jerusalem, 1936"
    }
  ],
};

export function getWomenVerseNotes(bookId: string, chapter: number, verse: number): WomenNote[] {
  const key = `${bookId}:${chapter}:${verse}`;
  return WOMEN_NOTES[key] || [];
}

export function getWomenChapterNotes(bookId: string, chapter: number): Record<number, WomenNote[]> {
  const result: Record<number, WomenNote[]> = {};
  const prefix = `${bookId}:${chapter}:`;
  for (const key in WOMEN_NOTES) {
    if (key.startsWith(prefix)) {
      const verse = parseInt(key.split(":")[2], 10);
      result[verse] = WOMEN_NOTES[key];
    }
  }
  return result;
}

export function hasWomenNotes(bookId: string, chapter: number): boolean {
  const prefix = `${bookId}:${chapter}:`;
  return Object.keys(WOMEN_NOTES).some(k => k.startsWith(prefix));
}
