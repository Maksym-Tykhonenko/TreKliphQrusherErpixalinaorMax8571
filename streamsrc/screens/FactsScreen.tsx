import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fish, Flag, Waves, Share2, Shuffle, X } from 'lucide-react-native';
import { palette, radii, rs, spacing, type } from '../theme/palette';
import { ScreenHeader } from '../ui/Headers';
import { ChipBar, ChipDef } from '../ui/Chips';
import { ALL_FACTS, FACT_CATEGORIES, FactCategoryKey, FactItem } from '../data/routes';
import { useNav } from '../nav/NavRouter';
import { GradientButton } from '../ui/GradientButton';
import { IconButton } from '../ui/IconButton';
import { BOTTOM_BAR_HEIGHT } from '../ui/BottomBar';
import { shareText } from '../utils/share';

const CHIPS: ChipDef[] = FACT_CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon }));

const CAT_ICON = { sea: Fish, culture: Flag, ocean: Waves } as const;
const CAT_COLOR: Record<FactCategoryKey, string> = {
  sea: palette.cyan,
  culture: palette.warn,
  ocean: palette.primary,
};

export const FactsScreen: React.FC = () => {
  const [cat, setCat] = useState<FactCategoryKey>('sea');
  const { pushModal } = useNav();

  const filtered = useMemo(() => ALL_FACTS.filter((f) => f.category === cat), [cat]);

  const openRandom = () => {
    const f = ALL_FACTS[Math.floor(Math.random() * ALL_FACTS.length)];
    pushModal((close) => <RandomFactModal fact={f} onClose={close} />);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        eyebrow="Did you know?"
        title="Marine Facts"
        right={
          <Pressable onPress={openRandom} style={styles.randomBtn} hitSlop={6}>
            <LinearGradient
              colors={['#FF8056', '#D74A1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Shuffle size={rs(14)} color="#FFFFFF" />
            <Text style={styles.randomText}>Random</Text>
          </Pressable>
        }
      />

      <ChipBar items={CHIPS} active={cat} onChange={(k) => setCat(k as FactCategoryKey)} />

      <Text style={styles.count}>{filtered.length} facts about {FACT_CATEGORIES.find((c) => c.key === cat)?.label}</Text>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((f, i) => (
          <FactCard key={f.id} fact={f} index={i} onShare={() => shareText(buildShare(f))} />
        ))}
      </ScrollView>
    </View>
  );
};

const buildShare = (f: FactItem) =>
  `${f.title}\n\n${f.description}\n\nDiscovered via Fish Explorer Japan — Marine Facts.`;

const FactCard: React.FC<{ fact: FactItem; index: number; onShare: () => void }> = ({ fact, index, onShare }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 360, delay: index * 50, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, delay: index * 50, friction: 9, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [fade, slide, index]);

  const Icon = CAT_ICON[fact.category];
  const tint = CAT_COLOR[fact.category];

  return (
    <Animated.View
      style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}
    >
      <Pressable onPress={() => setExpanded((x) => !x)} style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: tint + '22', borderColor: tint + '55' }]}>
            <Icon size={rs(16)} color={tint} />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{fact.title}</Text>
        </View>
        <Text style={styles.cardCopy} numberOfLines={expanded ? undefined : 3}>
          {fact.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardToggle}>{expanded ? 'Show less ▴' : 'Read more ▾'}</Text>
          <Pressable onPress={onShare} hitSlop={8} style={styles.shareBtn}>
            <Share2 size={rs(16)} color={palette.textMuted} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const RandomFactModal: React.FC<{ fact: FactItem; onClose: () => void }> = ({ fact, onClose }) => {
  const tint = CAT_COLOR[fact.category];
  const Icon = CAT_ICON[fact.category];
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 100 }),
    ]).start();
  }, [fade, scale]);

  return (
    <Animated.View style={[styles.modalRoot, { opacity: fade }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2,10,26,0.78)' }]} />
      </Pressable>
      <Animated.View style={[styles.modalCard, { transform: [{ scale }], borderColor: tint + '55' }]}>
        <LinearGradient
          colors={[tint + '22', 'rgba(2,10,26,0.0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.modalHeader}>
          <View style={[styles.cardIcon, { backgroundColor: tint + '22', borderColor: tint + '55' }]}>
            <Icon size={rs(18)} color={tint} />
          </View>
          <Text style={[styles.modalEyebrow, { color: tint }]}>RANDOM FACT</Text>
          <IconButton onPress={onClose} size={rs(34)} bg="rgba(2,10,26,0.55)">
            <X size={rs(14)} color={palette.textPrimary} />
          </IconButton>
        </View>
        <Text style={styles.modalTitle}>{fact.title}</Text>
        <Text style={styles.modalCopy}>{fact.description}</Text>

        <View style={styles.modalActions}>
          <GradientButton
            variant="dark"
            label="Close"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <GradientButton
            variant="primary"
            label="Share"
            icon={<Share2 size={rs(16)} color="#FFFFFF" />}
            onPress={() => shareText(buildShare(fact))}
            style={{ flex: 1 }}
            glow
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  randomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    paddingHorizontal: spacing.m,
    height: rs(34),
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  randomText: { ...type.small, color: '#FFFFFF', fontWeight: '700' as const },
  count: { ...type.small, color: palette.textMuted, paddingHorizontal: spacing.l, marginBottom: spacing.s },
  list: { paddingHorizontal: spacing.l, paddingBottom: BOTTOM_BAR_HEIGHT + rs(60), gap: spacing.s },

  card: {
    backgroundColor: palette.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.s,
  },
  cardInner: { padding: spacing.m },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(6) },
  cardIcon: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardTitle: { ...type.h3, color: palette.textPrimary, flex: 1 },
  cardCopy: { ...type.small, color: palette.textMuted },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.s },
  cardToggle: { ...type.small, color: palette.primary, fontWeight: '700' as const },
  shareBtn: { padding: rs(4) },

  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
  },
  modalCard: {
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.l,
    overflow: 'hidden',
    width: '100%',
    maxWidth: rs(420),
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: spacing.m },
  modalEyebrow: { ...type.micro, fontWeight: '800' as const, letterSpacing: 1.4, flex: 1 },
  modalTitle: { ...type.title, color: palette.textPrimary, marginBottom: spacing.s },
  modalCopy: { ...type.body, color: palette.textMuted, marginBottom: spacing.l },
  modalActions: { flexDirection: 'row', gap: spacing.s },
});
