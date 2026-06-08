import React, { useEffect, useRef } from 'react';
import { Animated, Easing, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Plus, BookOpen, MapPin, Calendar, Scale } from 'lucide-react-native';
import { palette, radii, rs, spacing, type } from '../theme/palette';
import { ScreenHeader } from '../ui/Headers';
import { GradientButton } from '../ui/GradientButton';
import { useAppStore, DiaryEntry } from '../state/AppStore';
import { useNav } from '../nav/NavRouter';
import { DiaryAddEdit } from './DiaryAddEdit';
import { DiaryDetail } from './DiaryDetail';
import { IconButton } from '../ui/IconButton';
import { BOTTOM_BAR_HEIGHT } from '../ui/BottomBar';

export const DiaryScreen: React.FC = () => {
  const { diary } = useAppStore();
  const { pushModal } = useNav();

  const openAdd = () => pushModal((close) => <DiaryAddEdit onClose={close} />);
  const openDetail = (e: DiaryEntry) =>
    pushModal((close) => <DiaryDetail entry={e} onClose={close} />);

  if (diary.length === 0) {
    return (
      <View style={styles.root}>
        <ScreenHeader
          eyebrow="Personal Log"
          title="Catch Diary"
          subtitle="0 entries recorded"
          right={
            <IconButton onPress={openAdd} size={rs(40)} bg={palette.accent} border={palette.accent}>
              <Plus size={rs(18)} color="#FFFFFF" />
            </IconButton>
          }
        />
        <EmptyState onAdd={openAdd} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader
        eyebrow="Personal Log"
        title="Catch Diary"
        subtitle={`${diary.length} ${diary.length === 1 ? 'entry' : 'entries'} recorded`}
        right={
          <IconButton onPress={openAdd} size={rs(40)} bg={palette.accent} border={palette.accent}>
            <Plus size={rs(18)} color="#FFFFFF" />
          </IconButton>
        }
      />

      <FlatList
        data={diary}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <DiaryRow entry={item} index={index} onPress={() => openDetail(item)} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const DiaryRow: React.FC<{ entry: DiaryEntry; index: number; onPress: () => void }> = ({ entry, index, onPress }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 360, delay: index * 50, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.spring(slide, { toValue: 0, delay: index * 50, friction: 9, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [fade, slide, index]);

  const dateStr = new Date(entry.createdAt).toISOString().slice(0, 10);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <Pressable onPress={onPress} style={styles.row}>
        <Image source={{ uri: entry.photoUri }} style={styles.thumb} />
        <LinearGradient
          colors={['rgba(0,0,0,0.0)', 'rgba(2,10,26,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle} numberOfLines={1}>{entry.fishName}</Text>
          <Text style={styles.rowDesc} numberOfLines={2}>{entry.description}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Scale size={rs(11)} color={palette.cyan} />
              <Text style={styles.metaText}>{entry.weight}</Text>
            </View>
            <View style={styles.metaChip}>
              <Calendar size={rs(11)} color={palette.warn} />
              <Text style={styles.metaText}>{dateStr}</Text>
            </View>
            <View style={[styles.metaChip, { flexShrink: 1 }]}>
              <MapPin size={rs(11)} color={palette.accent} />
              <Text style={[styles.metaText, { flexShrink: 1 }]} numberOfLines={1}>{entry.location}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.05] });

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
          colors={['rgba(255,111,61,0.25)', 'rgba(46,107,255,0.25)']}
          style={styles.emptyCircle}
        >
          <BookOpen size={rs(34)} color={palette.accent} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>You have no entries yet</Text>
      <Text style={styles.emptyCopy}>
        Capture your journey — add a photo, name, weight, location and a short note for every memorable day.
      </Text>
      <GradientButton
        variant="accent"
        label="Add Entry"
        icon={<Plus size={rs(18)} color="#FFFFFF" />}
        onPress={onAdd}
        glow
        style={{ minWidth: rs(220) }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: spacing.l, paddingBottom: BOTTOM_BAR_HEIGHT + rs(60), paddingTop: spacing.s },
  row: {
    height: rs(170),
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.m,
    backgroundColor: palette.bgCard,
    borderWidth: 1,
    borderColor: palette.border,
  },
  thumb: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', resizeMode: 'cover' },
  rowBody: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.m },
  rowTitle: { ...type.h2, color: '#FFFFFF', marginBottom: rs(2) },
  rowDesc: { ...type.small, color: 'rgba(255,255,255,0.78)', marginBottom: spacing.s },
  metaRow: { flexDirection: 'row', gap: rs(6), flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(2,10,26,0.55)',
    borderRadius: radii.pill,
    paddingHorizontal: rs(8),
    paddingVertical: rs(3),
  },
  metaText: { ...type.small, color: '#FFFFFF', fontWeight: '700' as const, fontSize: rs(11) },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyIcon: { width: rs(160), height: rs(160), alignItems: 'center', justifyContent: 'center' },
  emptyRing: {
    position: 'absolute',
    width: rs(160),
    height: rs(160),
    borderRadius: rs(80),
    borderWidth: 2,
    borderColor: palette.accent,
  },
  emptyCircle: {
    width: rs(110),
    height: rs(110),
    borderRadius: rs(55),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,111,61,0.35)',
  },
  emptyTitle: { ...type.h2, color: palette.textPrimary, marginTop: spacing.m, textAlign: 'center' },
  emptyCopy: {
    ...type.body,
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.xl,
    maxWidth: rs(320),
  },
});
