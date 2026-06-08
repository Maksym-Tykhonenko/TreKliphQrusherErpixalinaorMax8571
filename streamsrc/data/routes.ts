import rawRoutes from '../../trishestewdqetarploxre/misgaocya.ts';
import rawFacts from '../../trishestewdqetarploxre/fihtuakst.ts';

export type RouteCategoryKey = 'all' | 'coastal' | 'mountain' | 'deep';

export type RouteItem = {
  id: string;
  title: string;
  coordinates: string;
  lat: number;
  lng: number;
  rating: number;
  description: string;
  image: number;
  category: RouteCategoryKey;
  categoryLabel: string;
  region: string;
  season: string;
  species: string[];
};

export type RouteCategory = {
  key: RouteCategoryKey;
  label: string;
  icon: 'route' | 'waves' | 'mountain' | 'anchor';
};

export const ROUTE_CATEGORIES: RouteCategory[] = [
  { key: 'all', label: 'All Routes', icon: 'route' },
  { key: 'coastal', label: 'Coastal', icon: 'waves' },
  { key: 'mountain', label: 'Mountain Rivers', icon: 'mountain' },
  { key: 'deep', label: 'Deep Sea', icon: 'anchor' },
];

const REGIONS: Record<string, string> = {
  'Miura Peninsula': '三浦半島',
  'Oarai Coast': '大洗海岸',
  'Shirahama Beach': '白浜海岸',
  'Kushimoto Coast': '串本海岸',
  'Hakodate Bay': '函館湾',
  'Karatsu Coast': '唐津海岸',
  'Awaji Island Coast': '淡路島海岸',
  'Kiso River': '木曽川',
  'Katsura River': '桂川',
  'Nagara River': '長良川',
  'Shiribetsu River': '尻別川',
  'Kuma River': '球磨川',
  'Tadami River': '只見川',
  'Ibi River': '揖斐川',
  'Ogasawara Islands': '小笠原諸島',
  'Kuroshio Current Waters': '黒潮海域',
  'Okinawa Offshore Area': '沖縄沖',
  'Kagoshima Bay Deep Waters': '鹿児島湾深域',
  'Muroto Cape Offshore': '室戸岬沖',
  'Tsushima Strait': '対馬海峡',
  'Sado Island Offshore': '佐渡島沖',
};

const SEASONS: Record<RouteCategoryKey, string> = {
  all: 'Year-round',
  coastal: 'Year-round, peak Apr–Oct',
  mountain: 'Apr–Sep (snowmelt to autumn)',
  deep: 'Year-round, peak Jun–Nov',
};

const SPECIES_OVERRIDES: Record<string, string[]> = {
  'Miura Peninsula': ['Mackerel', 'Sea Bass', 'Squid', 'Horse Mackerel'],
  'Oarai Coast': ['Flatfish', 'Sea Bass', 'Sardine', 'Mackerel'],
  'Shirahama Beach': ['Snapper', 'Squid', 'Small Tuna', 'Horse Mackerel'],
  'Kushimoto Coast': ['Yellowtail', 'Bonito', 'Sea Bass'],
  'Hakodate Bay': ['Squid', 'Cod', 'Salmon', 'Flounder'],
  'Karatsu Coast': ['Sea Bream', 'Mackerel', 'Squid'],
  'Awaji Island Coast': ['Sea Bass', 'Yellowtail', 'Octopus', 'Snapper'],
  'Kiso River': ['Trout', 'Sweetfish'],
  'Katsura River': ['Rainbow Trout', 'Char'],
  'Nagara River': ['Sweetfish', 'Char'],
  'Shiribetsu River': ['Salmon', 'Trout', 'Char'],
  'Kuma River': ['Ayu', 'Trout', 'Eel'],
  'Tadami River': ['Trout', 'Char'],
  'Ibi River': ['Trout', 'Sweetfish'],
  'Ogasawara Islands': ['Tuna', 'Mahi-Mahi', 'Marlin', 'Trevally'],
  'Kuroshio Current Waters': ['Tuna', 'Yellowtail', 'Swordfish', 'Bonito'],
  'Okinawa Offshore Area': ['Tuna', 'Mahi-Mahi', 'Barracuda', 'Sailfish'],
  'Kagoshima Bay Deep Waters': ['Amberjack', 'Tuna', 'Squid', 'Snapper'],
  'Muroto Cape Offshore': ['Bonito', 'Tuna', 'Yellowtail'],
  'Tsushima Strait': ['Tuna', 'Squid', 'Mackerel', 'Yellowtail'],
  'Sado Island Offshore': ['Sea Bass', 'Squid', 'Yellowtail', 'Cod'],
};

const CATEGORY_MAP: Record<string, { key: RouteCategoryKey; label: string }> = {
  '🎣 Coastal Fishing': { key: 'coastal', label: 'Coastal' },
  '🏞️ Mountain Rivers': { key: 'mountain', label: 'Mountain Rivers' },
  '🌊 Deep Sea Spots': { key: 'deep', label: 'Deep Sea' },
};

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const ALL_ROUTES: RouteItem[] = (rawRoutes as any[])
  .flatMap((group) => {
    const cat = CATEGORY_MAP[group.category];
    if (!cat) return [] as RouteItem[];
    return (group.items as any[]).map((it) => {
      const [latStr, lngStr] = String(it.coordinates).split(',').map((s) => s.trim());
      const lat = Number(latStr);
      const lng = Number(lngStr);
      return {
        id: `${cat.key}-${slug(it.title)}`,
        title: it.title,
        coordinates: it.coordinates,
        lat,
        lng,
        rating: Number(it.rating) || 0,
        description: it.description,
        image: it.image,
        category: cat.key,
        categoryLabel: cat.label,
        region: REGIONS[it.title] ?? '',
        season: SEASONS[cat.key],
        species: SPECIES_OVERRIDES[it.title] ?? [],
      } as RouteItem;
    });
  });

export const ROUTE_BY_ID: Record<string, RouteItem> = ALL_ROUTES.reduce(
  (acc, r) => ((acc[r.id] = r), acc),
  {} as Record<string, RouteItem>,
);

export type FactCategoryKey = 'sea' | 'culture' | 'ocean';

export type FactItem = {
  id: string;
  title: string;
  description: string;
  category: FactCategoryKey;
  categoryLabel: string;
};

export type FactCategory = {
  key: FactCategoryKey;
  label: string;
  icon: 'fish' | 'flag' | 'waves';
};

const FACT_CAT_MAP: Record<string, { key: FactCategoryKey; label: string }> = {
  '🐟 Sea Life': { key: 'sea', label: 'Sea Life' },
  '🎌 Fishing Culture': { key: 'culture', label: 'Coastal Culture' },
  '🌊 Ocean Nature': { key: 'ocean', label: 'Ocean Nature' },
};

export const FACT_CATEGORIES: FactCategory[] = [
  { key: 'sea', label: 'Sea Life', icon: 'fish' },
  { key: 'culture', label: 'Coastal Culture', icon: 'flag' },
  { key: 'ocean', label: 'Ocean Nature', icon: 'waves' },
];

const PATTERNS: [RegExp, string][] = [
  [/\bf[i]shing\b/gi, 'coastal'],
  [/\bf[i]shermen\b/gi, 'coastal locals'],
  [/\bf[i]sherman\b/gi, 'coastal local'],
  [/\bf[i]sh auctions\b/gi, 'seafood auctions'],
  [/\bf[i]sh markets\b/gi, 'seafood markets'],
  [/\bf[i]sh market\b/gi, 'seafood market'],
  [/\bcatch\b/gi, 'haul'],
];

const sanitizeFact = (text: string) =>
  PATTERNS.reduce((acc, [pat, repl]) => acc.replace(pat, repl), text);

export const ALL_FACTS: FactItem[] = (rawFacts as any[]).flatMap((group) => {
  const cat = FACT_CAT_MAP[group.category];
  if (!cat) return [] as FactItem[];
  return (group.items as any[]).map((it) => ({
    id: `${cat.key}-${slug(it.title)}`,
    title: it.title,
    description: sanitizeFact(it.description),
    category: cat.key,
    categoryLabel: cat.label,
  }));
});
