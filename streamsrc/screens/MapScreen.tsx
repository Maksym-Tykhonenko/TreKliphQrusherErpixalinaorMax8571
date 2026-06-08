import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { ChevronRight, X, Star } from 'lucide-react-native';
import { palette, radii, rs, screen, spacing, type } from '../theme/palette';
import { ScreenHeader } from '../ui/Headers';
import { ChipBar, ChipDef } from '../ui/Chips';
import { ALL_ROUTES, ROUTE_CATEGORIES, RouteCategoryKey, RouteItem } from '../data/routes';
import { useNav } from '../nav/NavRouter';
import { RouteDetail } from './RouteDetail';
import { BOTTOM_BAR_HEIGHT } from '../ui/BottomBar';

const CHIPS: ChipDef[] = ROUTE_CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon }));

// Stylised Japan archipelago path (decorative — for UI atmosphere).
const JAPAN_PATH =
  'M155 30 C 170 40, 180 60, 175 80 C 170 100, 160 110, 150 130 C 140 140, 130 150, 130 170 C 130 190, 145 200, 155 215 C 165 230, 175 245, 170 270 C 165 295, 145 310, 130 325 C 110 345, 95 365, 95 390 C 95 410, 105 425, 100 445 C 95 460, 80 470, 75 490 C 70 510, 80 530, 70 545 C 60 560, 40 565, 35 580';

const MAP_WIDTH = screen.width - rs(32);
const MAP_HEIGHT = MAP_WIDTH * 1.3;

// Reduce real lat/lng into local map coordinates.
const LAT_MIN = 24;
const LAT_MAX = 46;
const LNG_MIN = 124;
const LNG_MAX = 146;

const project = (lat: number, lng: number) => {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * MAP_WIDTH;
  const y = (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * MAP_HEIGHT;
  return { x: Math.max(rs(20), Math.min(MAP_WIDTH - rs(20), x)), y: Math.max(rs(20), Math.min(MAP_HEIGHT - rs(20), y)) };
};

const PIN_COLOR: Record<RouteCategoryKey, string> = {
  all: palette.primary,
  coastal: palette.cyan,
  mountain: palette.warn,
  deep: palette.accent,
};

export const MapScreen: React.FC = () => {
  const [cat, setCat] = useState<RouteCategoryKey>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const { pushModal } = useNav();

  const filtered = useMemo(
    () => ALL_ROUTES.filter((r) => cat === 'all' || r.category === cat),
    [cat],
  );

  const active = filtered.find((r) => r.id === activeId) ?? null;

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow="Interactive" title="Tide Map" subtitle="Tap a pin to preview a destination" />
      <ChipBar items={CHIPS} active={cat} onChange={(k) => setCat(k as RouteCategoryKey)} />

      <View style={styles.mapHost}>
        <LinearGradient
          colors={['#062047', '#020A1A']}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
        />
        <Svg
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        >
          <Defs>
            <RadialGradient id="gridGlow" cx="50%" cy="50%" r="55%">
              <Stop offset="0%" stopColor="#103163" stopOpacity={0.85} />
              <Stop offset="100%" stopColor="#020A1A" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={MAP_WIDTH / 2} cy={MAP_HEIGHT / 2} r={MAP_WIDTH / 1.4} fill="url(#gridGlow)" />
          {[...Array(8)].map((_, i) => (
            <Circle
              key={`r${i}`}
              cx={MAP_WIDTH / 2}
              cy={MAP_HEIGHT / 2}
              r={(i + 1) * (MAP_WIDTH / 16)}
              stroke="rgba(91,217,255,0.06)"
              strokeWidth={1}
              fill="none"
            />
          ))}
          <G transform={`translate(${MAP_WIDTH * 0.15}, 10) scale(${MAP_WIDTH / 280}, ${MAP_HEIGHT / 620})`}>
            <Path
              d={JAPAN_PATH}
              stroke="rgba(120,165,255,0.45)"
              strokeWidth={3}
              fill="rgba(46,107,255,0.12)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        </Svg>

        {filtered.map((r) => (
          <Pin
            key={r.id}
            route={r}
            active={r.id === activeId}
            onPress={() => setActiveId(r.id)}
          />
        ))}

        <View style={styles.legend}>
          <LegendDot color={palette.cyan} label="Coastal" />
          <LegendDot color={palette.warn} label="Mountain" />
          <LegendDot color={palette.accent} label="Deep Sea" />
        </View>
      </View>

      {active ? (
        <PreviewCard
          item={active}
          onClose={() => setActiveId(null)}
          onOpen={() =>
            pushModal((close) => <RouteDetail route={active} onClose={close} />)
          }
        />
      ) : null}
    </View>
  );
};

const Pin: React.FC<{ route: RouteItem; active: boolean; onPress: () => void }> = ({ route, active, onPress }) => {
  const { x, y } = project(route.lat, route.lng);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulse.setValue(0);
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [active, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });
  const color = PIN_COLOR[route.category];

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={[styles.pinHit, { left: x - rs(15), top: y - rs(15) }]}
    >
      <Animated.View
        style={[
          styles.ring,
          {
            backgroundColor: color,
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />
      <View style={[styles.pin, { backgroundColor: color, borderColor: active ? '#FFFFFF' : color + '88' }]} />
    </Pressable>
  );
};

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={styles.legendRow}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const PreviewCard: React.FC<{
  item: RouteItem;
  onClose: () => void;
  onOpen: () => void;
}> = ({ item, onClose, onOpen }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(60);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8, tension: 100 }),
    ]).start();
  }, [fade, slide, item.id]);

  return (
    <Animated.View
      style={[styles.preview, { opacity: fade, transform: [{ translateY: slide }] }]}
    >
      <View style={styles.previewInner}>
        <Image source={item.image} style={styles.previewImg} />
        <View style={{ flex: 1, marginLeft: spacing.s }}>
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>{item.categoryLabel}</Text>
          </View>
          <Text style={styles.previewTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.previewMeta}>
            <Star size={rs(11)} color={palette.warn} fill={palette.warn} />
            <Text style={styles.previewMetaText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.previewCoord} numberOfLines={1}>{item.coordinates}</Text>
          </View>
        </View>
        <Pressable onPress={onOpen} style={styles.previewCta} hitSlop={6}>
          <ChevronRight size={rs(18)} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={onClose} style={styles.previewClose} hitSlop={6}>
          <X size={rs(14)} color={palette.textMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // root: { flex: 1 },
  mapHost: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    alignSelf: 'center',
    marginTop: spacing.s,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.border,
  },
  pinHit: {
    position: 'absolute',
    width: rs(30),
    height: rs(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: rs(14),
    height: rs(14),
    borderRadius: rs(7),
  },
  pin: {
    width: rs(14),
    height: rs(14),
    borderRadius: rs(7),
    borderWidth: 2,
  },
  legend: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    backgroundColor: 'rgba(2,10,26,0.7)',
    borderRadius: radii.md,
    padding: spacing.s,
    gap: rs(4),
    borderWidth: 1,
    borderColor: palette.border,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  legendDot: { width: rs(8), height: rs(8), borderRadius: rs(4) },
  legendText: { ...type.small, color: palette.textMuted, fontWeight: '700' as const, fontSize: rs(11) },

  preview: {
    position: 'absolute',
    left: spacing.l,
    right: spacing.l,
    bottom: BOTTOM_BAR_HEIGHT + rs(40),
  },
  previewInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.s,
    paddingRight: spacing.m,
  },
  previewImg: { width: rs(56), height: rs(56), borderRadius: radii.md },
  previewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,111,61,0.18)',
    paddingHorizontal: rs(8),
    paddingVertical: rs(2),
    borderRadius: radii.pill,
  },
  previewBadgeText: { ...type.micro, color: palette.accent, fontWeight: '800' as const },
  previewTitle: { ...type.h3, color: palette.textPrimary, marginTop: rs(2) },
  previewMeta: { flexDirection: 'row', alignItems: 'center', gap: rs(6), marginTop: rs(2) },
  previewMetaText: { ...type.small, color: palette.warn, fontWeight: '700' as const, fontSize: rs(11) },
  previewCoord: { ...type.small, color: palette.textSubtle, fontSize: rs(11), flexShrink: 1 },
  previewCta: {
    width: rs(34),
    height: rs(34),
    borderRadius: rs(17),
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.s,
  },
  previewClose: {
    position: 'absolute',
    top: rs(6),
    right: rs(6),
    width: rs(20),
    height: rs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
});