import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');
const BASE_W = 390;
const BASE_H = 844;

export const screen = { width: SW, height: SH };

export const rs = (size: number) => {
  const scaled = (SW / BASE_W) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const rv = (size: number) => {
  const scaled = (SH / BASE_H) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const isSmall = SW < 360;

export const palette = {
  bgDeep: '#020A1A',
  bgRoot: '#040D24',
  bgCard: '#0B1A38',
  bgSurface: '#10224A',
  bgGlass: 'rgba(13,30,68,0.78)',
  divider: 'rgba(120,165,255,0.12)',
  border: 'rgba(120,165,255,0.18)',
  textPrimary: '#F1F6FF',
  textMuted: '#9EB3D9',
  textSubtle: '#6C82A8',
  primary: '#2E6BFF',
  primaryDeep: '#1B49C7',
  accent: '#FF6F3D',
  accentDeep: '#D74A1C',
  warn: '#FFC857',
  ok: '#7AE582',
  rose: '#FF5577',
  cyan: '#5BD9FF',
  shadow: 'rgba(0,0,0,0.45)',
};

export const radii = {
  sm: rs(8),
  md: rs(14),
  lg: rs(20),
  xl: rs(28),
  pill: rs(999),
};

export const spacing = {
  xs: rs(4),
  s: rs(8),
  m: rs(14),
  l: rs(20),
  xl: rs(28),
  xxl: rs(40),
};

export const fontStack = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const type = {
  hero: { fontSize: rs(34), lineHeight: rs(40), fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: rs(26), lineHeight: rs(32), fontWeight: '800' as const, letterSpacing: -0.3 },
  h2: { fontSize: rs(22), lineHeight: rs(28), fontWeight: '700' as const },
  h3: { fontSize: rs(18), lineHeight: rs(24), fontWeight: '700' as const },
  body: { fontSize: rs(15), lineHeight: rs(22), fontWeight: '500' as const },
  small: { fontSize: rs(13), lineHeight: rs(18), fontWeight: '500' as const },
  micro: { fontSize: rs(11), lineHeight: rs(14), fontWeight: '700' as const, letterSpacing: 1.2 },
};
