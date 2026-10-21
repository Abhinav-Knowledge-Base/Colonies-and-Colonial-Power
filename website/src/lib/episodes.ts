import fs from 'node:fs';
import path from 'node:path';

export interface EpisodeMetadata {
  id: string; // e.g. season-01/ep-01-what-the-word-colony-did
  seasonNum: number;
  seasonSlug: string;
  seasonTitle: string;
  seasonDescription: string;
  seasonBadge: string;
  epNum: number;
  slug: string;
  filename: string;
  title: string;
  cleanTitle: string;
  logline: string;
  years: string;
  seasonField: string;
  beforeAfter: string;
  raw: string;
  wordCount: number;
  readingMinutes: number;
  imagePrompt: string;
  imageSrc: string | null;
  prevEpisode?: { seasonSlug: string; slug: string; title: string; epNum: number } | null;
  nextEpisode?: { seasonSlug: string; slug: string; title: string; epNum: number } | null;
}

export interface SeasonInfo {
  number: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
  episodeCount: number;
  episodes: EpisodeMetadata[];
}

export const SEASONS_CONFIG: Record<string, { title: string; tagline: string; description: string; color: string; accent: string; icon: string }> = {
  'season-01': {
    title: 'The System',
    tagline: 'Word, World, Line, Charter, Types, Archive, Numbers, Refusals',
    description: 'Episodes 1–8 build the conceptual tools before any empire stars: the Latin word colonia, oceanic claims, chartered companies, settler and extractive models, and the colonial archive.',
    color: '#3b82f6',
    accent: '#60a5fa',
    icon: '🧭',
  },
  'season-02': {
    title: 'Iberian Worlds',
    tagline: 'From Atlantic Islands to Potosí, Manila, and 1898',
    description: 'Madeira, Hispaniola, Mexico through alliance, Potosí’s mountain of silver, the trans-Pacific Manila galleon, Brazil, casta paintings, and Iberian rule changing hands.',
    color: '#eab308',
    accent: '#facc15',
    icon: '🪙',
  },
  'season-03': {
    title: 'Britain',
    tagline: 'Factories Before Flags to the Imperial Ledger',
    description: 'English commercial footholds, Caribbean plantations, settler displacement in North America and Australasia, 1776, the Raj as one system, and an unsparing ledger instead of nostalgia.',
    color: '#ef4444',
    accent: '#f87171',
    icon: '⚓',
  },
  'season-04': {
    title: 'Other Empires',
    tagline: 'Dutch, French, Belgian, German, Italian, Russian, Japanese & US Powers',
    description: 'The VOC spice monopoly, Cultivation System in Java, French overseas rule, the Congo Free State, German colonial genocide, and imperial peers.',
    color: '#10b981',
    accent: '#34d399',
    icon: '🌐',
  },
  'season-05': {
    title: 'The Atlantic Machine',
    tagline: 'Capture, Middle Passage, Plantation, Law, Haiti & Abolition',
    description: 'The Atlantic slave trade from African coasts and ship decks through sugar regimes, the law of the mother, Haitian victory, and abolition as hard politics.',
    color: '#8b5cf6',
    accent: '#a78bfa',
    icon: '⛓️',
  },
  'season-06': {
    title: 'The Americas',
    tagline: 'Ecological Exchange, Labor Beside Slavery, Maroons & Unfinished Equality',
    description: 'Columbian exchange, Indigenous litigation across centuries, maroons and borderlands, creole republics, Brazil’s distinct path, and US-Canadian settler expansion.',
    color: '#f97316',
    accent: '#fb923c',
    icon: '🗺️',
  },
  'season-07': {
    title: 'Africa',
    tagline: 'States Before the Scramble, Paper Partition & Many Africas',
    description: 'African states before 1884, missionaries and territorial claims, the Berlin conference reality, conquest on the ground, settler Africa, and resistance before the flags came down.',
    color: '#14b8a6',
    accent: '#2dd4bf',
    icon: '🌍',
  },
  'season-08': {
    title: 'Asia',
    tagline: 'Footholds, Treaties in China, Southeast Asia & Many Clocks',
    description: 'Maritime footholds on crowded seas, unequal treaties in China, divided Southeast Asia, the Philippines, Japanese empire, wartime occupation, and Asia leaving on many clocks.',
    color: '#ec4899',
    accent: '#f472b6',
    icon: '🏮',
  },
  'season-09': {
    title: 'Resistance and After',
    tagline: 'Revolt, Mass Politics, Wars of Exit, Bandung & The Unfinished Ending',
    description: 'Revolts older than nationalism, mass independence movements, World War II as hinge, Algeria and Kenya, Bandung, and the treaties and borders that stayed.',
    color: '#d97706',
    accent: '#f59e0b',
    icon: '🔥',
  },
};

let cachedEpisodes: EpisodeMetadata[] | null = null;

export function getAllEpisodes(): EpisodeMetadata[] {
  if (cachedEpisodes) return cachedEpisodes;

  const baseDir = path.resolve('..');
  if (!fs.existsSync(baseDir)) return [];

  const files = fs.readdirSync(baseDir)
    .filter((f) => /^\d{2}\s+.+\.md$/.test(f))
    .sort((a, b) => parseInt(a.slice(0, 2), 10) - parseInt(b.slice(0, 2), 10));

  const episodes: EpisodeMetadata[] = [];

  for (const filename of files) {
    const epNum = parseInt(filename.slice(0, 2), 10);
    const seasonNum = Math.floor((epNum - 1) / 8) + 1;
    const seasonSlug = `season-0${seasonNum}`;
    const cfg = SEASONS_CONFIG[seasonSlug] || {
      title: `Season ${seasonNum}`,
      tagline: '',
      description: '',
      color: '#d4a359',
      accent: '#f3cf8a',
      icon: '📜',
    };

    const filepath = path.join(baseDir, filename);
    const raw = fs.readFileSync(filepath, 'utf-8');

    // Title
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.md$/, '');
    const cleanTitle = title.replace(/^Ep\s+\d+\s*[—–-]\s*/i, '');

    // Slug: ep-01-what-the-word-colony-did
    const namePart = filename.replace(/^\d{2}\s+/, '').replace(/\.md$/, '');
    const slug = `ep-${String(epNum).padStart(2, '0')}-${namePart.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

    // Extract table fields
    const loglineMatch = raw.match(/\|\s*\*\*Logline\*\*\s*\|\s*([^|\n]+?)\s*\|/);
    const logline = loglineMatch ? loglineMatch[1].trim() : cleanTitle;

    const yearsMatch = raw.match(/\|\s*\*\*Years\*\*\s*\|\s*([^|\n]+?)\s*\|/);
    const years = yearsMatch ? yearsMatch[1].trim() : '';

    const seasonMatch = raw.match(/\|\s*\*\*Season\*\*\s*\|\s*([^|\n]+?)\s*\|/);
    const seasonField = seasonMatch ? seasonMatch[1].trim() : cfg.title;

    const beforeAfterMatch = raw.match(/\|\s*\*\*Before \/ after\*\*\s*\|\s*([^|\n]+?)\s*\|/);
    const beforeAfter = beforeAfterMatch ? beforeAfterMatch[1].trim() : '';

    const wordCount = raw.split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(3, Math.ceil(wordCount / 220));

    // Curated documentary visual prompt
    const imagePrompt = `Historical documentary shot for "${cleanTitle}" (${years || 'Colonial Era'}): authentic archival aesthetic, museum-grade cinematography, 35mm film grain, raking chiaroscuro natural lighting, photorealistic material textures of parchment, iron, timber, stone, or textiles, widescreen 16:9 composition, no artificial CGI gloss.`;

    episodes.push({
      id: `${seasonSlug}/${slug}`,
      seasonNum,
      seasonSlug,
      seasonTitle: cfg.title,
      seasonDescription: cfg.description,
      seasonBadge: `Season ${seasonNum}`,
      epNum,
      slug,
      filename,
      title,
      cleanTitle,
      logline,
      years,
      seasonField,
      beforeAfter,
      raw,
      wordCount,
      readingMinutes,
      imagePrompt,
      imageSrc: null,
    });
  }

  // Prev / next pointers
  for (let i = 0; i < episodes.length; i++) {
    if (i > 0) {
      episodes[i].prevEpisode = {
        seasonSlug: episodes[i - 1].seasonSlug,
        slug: episodes[i - 1].slug,
        title: episodes[i - 1].title,
        epNum: episodes[i - 1].epNum,
      };
    }
    if (i < episodes.length - 1) {
      episodes[i].nextEpisode = {
        seasonSlug: episodes[i + 1].seasonSlug,
        slug: episodes[i + 1].slug,
        title: episodes[i + 1].title,
        epNum: episodes[i + 1].epNum,
      };
    }
  }

  cachedEpisodes = episodes;
  return episodes;
}

export function getAllSeasons(): SeasonInfo[] {
  const all = getAllEpisodes();
  const seasonSlugs = Object.keys(SEASONS_CONFIG);

  return seasonSlugs.map((slug) => {
    const cfg = SEASONS_CONFIG[slug];
    const eps = all.filter((e) => e.seasonSlug === slug);
    const sNum = parseInt(slug.replace('season-0', '').replace('season-', ''), 10);

    return {
      number: sNum,
      slug,
      title: cfg.title,
      tagline: cfg.tagline,
      description: cfg.description,
      color: cfg.color,
      accent: cfg.accent,
      icon: cfg.icon,
      episodeCount: eps.length,
      episodes: eps,
    };
  });
}

export function getSeason(slug: string): SeasonInfo | undefined {
  return getAllSeasons().find((s) => s.slug === slug);
}

export function getEpisode(seasonSlug: string, slug: string): EpisodeMetadata | undefined {
  return getAllEpisodes().find((e) => e.seasonSlug === seasonSlug && e.slug === slug);
}

export function getReadmeRaw(): string {
  const p = path.resolve('..', 'README.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

export function getPathsRaw(): string {
  const p = path.resolve('..', 'SEASONS_AND_PATHS.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

export function getMatrixRaw(): string {
  const p = path.resolve('..', 'COMPARATIVE_MATRIX.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

export function getGuideRaw(): string {
  const p = path.resolve('..', 'PRODUCTION_GUIDE.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

export function getSourcesRaw(): string {
  const p = path.resolve('..', 'SOURCE_CATALOG.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

export function getFactcheckRaw(): string {
  const p = path.resolve('..', 'RIGHTS_AND_FACTCHECK.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}
