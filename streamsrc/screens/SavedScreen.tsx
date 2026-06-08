import React, { useMemo, useRef, useEffect } from 'react';
import { Animated, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bookmark, MapPin, Star, Compass } from 'lucide-react-native';
import { palette, radii, rs, spacing, type } from '../theme/palette';
import { ScreenHeader } from '../ui/Headers';
import { ROUTE_BY_ID, RouteItem } from '../data/routes';
import { useAppStore } from '../state/AppStore';
import { useNav } from '../nav/NavRouter';
import { RouteDetail } from './RouteDetail';
import { GradientButton } from '../ui/GradientButton';
import { BOTTOM_BAR_HEIGHT } from '../ui/BottomBar';

export const SavedScreen: React.FC = () => {
  const { savedRouteIds } = useAppStore();
  const { pushModal, setActiveTab } = useNav();

  const saved = useMemo<RouteItem[]>(
    () => savedRouteIds.map((id) => ROUTE_BY_ID[id]).filter(Boolean),
    [savedRouteIds],
  );

  const openDetail = (r: RouteItem) => {
    pushModal((close) => <RouteDetail route={r} onClose={close} />);
  };

  if (saved.length === 0) {
    return (
      <View style={styles.root}>
        <ScreenHeader eyebrow="My Collection" title="Saved Routes" subtitle="0 routes saved" />
        <EmptyState onGo={() => setActiveTab('spots')} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow="My Collection" title="Saved Routes" subtitle={`${saved.length} ${saved.length === 1 ? 'route' : 'routes'} saved`} />
      <FlatList
        data={saved}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <SavedRow index={index} item={item} onPress={() => openDetail(item)} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const SavedRow: React.FC<{ item: RouteItem; index: number; onPress: () => void }> = ({ item, index, onPress }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 360, delay: index * 50, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, delay: index * 50, friction: 9, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [fade, slide, index]);
  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <Pressable onPress={onPress} style={styles.row}>
        <Image source={item.image} style={styles.thumb} />
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.categoryLabel}</Text>
            </View>
          </View>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.rowMeta}>
            <MapPin size={rs(12)} color={palette.textSubtle} />
            <Text style={styles.rowMetaText} numberOfLines={1}>
              {item.coordinates}
            </Text>
          </View>
          <View style={styles.rowRating}>
            <Star size={rs(12)} color={palette.warn} fill={palette.warn} />
            <Text style={styles.rowRatingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const EmptyState: React.FC<{ onGo: () => void }> = ({ onGo }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.1] });

  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Animated.View
          style={[
            styles.emptyRing,
            { transform: [{ scale: ringScale }], opacity: ringOpacity },
          ]}
        />
        <LinearGradient
          colors={['rgba(255,200,87,0.25)', 'rgba(255,111,61,0.25)']}
          style={styles.emptyCircle}
        >
          <Bookmark size={rs(34)} color={palette.warn} fill={palette.warn} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>No saved routes yet</Text>
      <Text style={styles.emptyCopy}>
        Explore locations and tap the bookmark icon to keep them in your personal collection.
      </Text>
      <GradientButton
        variant="primary"
        label="Go to Locations"
        icon={<Compass size={rs(18)} color="#FFFFFF" />}
        onPress={onGo}
        glow
        style={{ minWidth: rs(220) }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: spacing.l, paddingBottom: BOTTOM_BAR_HEIGHT + rs(60), paddingTop: spacing.s, gap: spacing.s },
  row: {
    flexDirection: 'row',
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.s,
    marginBottom: spacing.s,
  },
  thumb: { width: rs(74), height: rs(74), borderRadius: radii.md, marginRight: spacing.m, resizeMode: 'cover' },
  rowBody: { flex: 1, justifyContent: 'space-between', paddingVertical: rs(2) },
  rowTop: { flexDirection: 'row' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(91,217,255,0.18)',
    paddingHorizontal: rs(8),
    paddingVertical: rs(2),
    borderRadius: radii.pill,
  },
  badgeText: { ...type.micro, color: palette.cyan, fontWeight: '700' as const },
  rowTitle: { ...type.h3, color: palette.textPrimary, marginTop: rs(2) },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
  rowMetaText: { ...type.small, color: palette.textSubtle },
  rowRating: { flexDirection: 'row', alignItems: 'center', gap: rs(4), position: 'absolute', right: 0, top: 0 },
  rowRatingText: { ...type.small, color: palette.warn, fontWeight: '700' as const },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyIcon: { width: rs(160), height: rs(160), alignItems: 'center', justifyContent: 'center' },
  emptyRing: {
    position: 'absolute',
    width: rs(160),
    height: rs(160),
    borderRadius: rs(80),
    borderWidth: 2,
    borderColor: palette.warn,
  },
  emptyCircle: {
    width: rs(110),
    height: rs(110),
    borderRadius: rs(55),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,200,87,0.35)',
  },
  emptyTitle: { ...type.h2, color: palette.textPrimary, marginTop: spacing.m, textAlign: 'center' },
  emptyCopy: {
    ...type.body,
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.xl,
    maxWidth: rs(300),
  },
});
