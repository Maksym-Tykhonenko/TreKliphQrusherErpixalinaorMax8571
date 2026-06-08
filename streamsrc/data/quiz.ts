export type QuizQuestion = {
  id: string;
  prompt: string;
  image: number;
  options: string[];
  answer: number;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Which species is famous for returning to the same river where it was born?',
    image: require('../../riwtekiplesx/ShiribetsuRiver.png'),
    options: ['Bluefin Tuna', 'Pacific Salmon', 'Yellowtail', 'Mackerel'],
    answer: 1,
  },
  {
    id: 'q2',
    prompt: 'Which Japanese region is most famous for cold-water squid and cod hauls?',
    image: require('../../riwtekiplesx/HakodateBay.png'),
    options: ['Okinawa Offshore', 'Hakodate Bay', 'Awaji Island', 'Ogasawara Islands'],
    answer: 1,
  },
  {
    id: 'q3',
    prompt: 'The Kuroshio Current is known as which type of ocean current?',
    image: require('../../riwtekiplesx/KuroshioCurrentWaters.png'),
    options: ['A warm current', 'A cold current', 'A tidal eddy', 'A freshwater outflow'],
    answer: 0,
  },
  {
    id: 'q4',
    prompt: 'Which river is renowned for traditional cormorant culture and sweetfish?',
    image: require('../../riwtekiplesx/NagaraRiver.png'),
    options: ['Kuma River', 'Tadami River', 'Nagara River', 'Ibi River'],
    answer: 2,
  },
  {
    id: 'q5',
    prompt: 'Which deep-water destination sits far south of Tokyo in the Pacific?',
    image: require('../../riwtekiplesx/OgasawaraIslands.png'),
    options: ['Tsushima Strait', 'Sado Island', 'Ogasawara Islands', 'Muroto Cape'],
    answer: 2,
  },
  {
    id: 'q6',
    prompt: 'Which species symbolizes good luck and celebration in Japan?',
    image: require('../../riwtekiplesx/AwajiIslandCoast.png'),
    options: ['Sea Bream (Tai)', 'Pufferfish', 'Sardine', 'Eel'],
    answer: 0,
  },
  {
    id: 'q7',
    prompt: 'Where do warm and cold currents famously meet near Japan?',
    image: require('../../riwtekiplesx/MurotoCapeOffshore.png'),
    options: ['Inside Tokyo Bay', 'Off the Pacific coast', 'In Lake Biwa', 'In the Inland Sea only'],
    answer: 1,
  },
];
