import React, { useMemo, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search, Compass } from 'lucide-react-native';
import { palette, radii, rs, spacing, type } from '../theme/palette';
import { ScreenHeader } from '../ui/Headers';
import { ChipBar, ChipDef } from '../ui/Chips';
import { RouteCard } from '../ui/RouteCard';
import { ALL_ROUTES, ROUTE_CATEGORIES, RouteCategoryKey, RouteItem } from '../data/routes';
import { useNav } from '../nav/NavRouter';
import { RouteDetail } from './RouteDetail';
import { BOTTOM_BAR_HEIGHT } from '../ui/BottomBar';
import { IconButton } from '../ui/IconButton';

const CHIPS: ChipDef[] = ROUTE_CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon }));

export const SpotsScreen: React.FC = () => {
  const [cat, setCat] = useState<RouteCategoryKey>('all');
  const [query, setQuery] = useState('');
  const { pushModal, closeModal } = useNav();

  const filtered = useMemo<RouteItem[]>(() => {
    const q = query.trim().toLowerCase();
    return ALL_ROUTES.filter((r) => {
      if (cat !== 'all' && r.category !== cat) return false;
      if (q && !(`${r.title} ${r.region}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [cat, query]);

  const openDetail = (r: RouteItem) => {
    const id = pushModal((close) => <RouteDetail route={r} onClose={close} />);
    void id;
    void closeModal;
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        eyebrow="Discover"
        title="Marine Locations"
      />

      <View style={styles.searchWrap}>
        <View style={styles.searchInner}>
          <Search size={rs(16)} color={palette.textSubtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search routes…"
            placeholderTextColor={palette.textSubtle}
            style={styles.input}
            returnKeyType="search"
          />
        </View>
      </View>

      <ChipBar
        items={CHIPS}
        active={cat}
        onChange={(k) => setCat(k as RouteCategoryKey)}
      />

      <Text style={styles.count}>{filtered.length} routes found</Text>

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <FadeIn delay={index * 40}>
            <RouteCard route={item} onPress={() => openDetail(item)} />
          </FadeIn>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const v = React.useRef(new Animated.Value(0)).current;
  const t = React.useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(v, { toValue: 1, duration: 360, delay, useNativeDriver: true }),
      Animated.spring(t, { toValue: 0, delay, friction: 9, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [v, t, delay]);
  return <Animated.View style={{ opacity: v, transform: [{ translateY: t }] }}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchWrap: { paddingHorizontal: spacing.l, marginTop: spacing.s },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    paddingHorizontal: spacing.m,
    paddingVertical: rs(10),
    borderRadius: radii.md,
  },
  input: { flex: 1, ...type.body, color: palette.textPrimary, padding: 0 },
  count: {
    ...type.small,
    color: palette.textMuted,
    paddingHorizontal: spacing.l,
    marginBottom: spacing.s,
  },
  list: { paddingHorizontal: spacing.l, paddingBottom: BOTTOM_BAR_HEIGHT + rs(60) },
});
