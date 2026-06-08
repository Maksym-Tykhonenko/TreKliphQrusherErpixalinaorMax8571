import React, { useRef, useEffect } from 'react';
import { Alert, Animated, Easing, ImageBackground, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Edit3, Share2, Trash2, MapPin, Calendar, Scale } from 'lucide-react-native';
import { palette, radii, rs, screen, spacing, type } from '../theme/palette';
import { IconButton } from '../ui/IconButton';
import { DiaryEntry, useAppStore } from '../state/AppStore';
import { useToast } from '../ui/Toast';
import { GradientButton } from '../ui/GradientButton';
import { useNav } from '../nav/NavRouter';
import { DiaryAddEdit } from './DiaryAddEdit';

export const DiaryDetail: React.FC<{ entry: DiaryEntry; onClose: () => void }> = ({ entry, onClose }) => {
  const { removeDiaryEntry } = useAppStore();
  const toast = useToast();
  const { pushModal } = useNav();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 9, tension: 80 }),
    ]).start();
  }, [fade, slide]);

  const dateStr = new Date(entry.createdAt).toISOString().slice(0, 10);

  const onEdit = () => {
    pushModal((close) => <DiaryAddEdit initial={entry} onClose={() => { close(); onClose(); }} />);
  };

  const onShare = async () => {
    await Share.share({
      message: `${entry.fishName} • ${entry.weight} • ${entry.location} (${dateStr})\n\n${entry.description}\n\nLogged with Fish Explorer Japan.`,
    });
  };

  const onDelete = () => {
    Alert.alert('Delete entry', 'Remove this diary entry? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeDiaryEntry(entry.id);
          toast.show('Entry deleted', 'info');
          onClose();
        },
      },
    ]);
  };

  return (
    <Animated.View style={[styles.root, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: rs(140) }}>
          <ImageBackground
            source={entry.photoUri ? { uri: entry.photoUri } : undefined}
            style={styles.hero}
            imageStyle={styles.heroImg}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 'rgba(2,10,26,0.95)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroTop}>
              <IconButton onPress={onClose} bg="rgba(2,10,26,0.55)">
                <ChevronLeft size={rs(18)} color={palette.textPrimary} />
              </IconButton>
            </View>
            <View style={styles.heroBottom}>
              <Text style={styles.title}>{entry.fishName}</Text>
            </View>
          </ImageBackground>

          <View style={styles.body}>
            <View style={styles.statRow}>
              <Stat icon={<Scale size={rs(14)} color={palette.cyan} />} label="WEIGHT" value={entry.weight} />
              <Stat icon={<Calendar size={rs(14)} color={palette.warn} />} label="DATE" value={dateStr} />
              <Stat icon={<MapPin size={rs(14)} color={palette.accent} />} label="LOCATION" value={entry.location} />
            </View>

            <View style={styles.descBox}>
              <Text style={styles.descLabel}>NOTES</Text>
              <Text style={styles.descText}>{entry.description}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <GradientButton
            variant="primary"
            label="Edit"
            icon={<Edit3 size={rs(16)} color="#FFFFFF" />}
            onPress={onEdit}
            style={{ flex: 1 }}
            glow
          />
          <IconButton onPress={onShare} size={rs(50)}>
            <Share2 size={rs(20)} color={palette.textPrimary} />
          </IconButton>
          <IconButton
            onPress={onDelete}
            size={rs(50)}
            bg="rgba(255,85,119,0.15)"
            border="rgba(255,85,119,0.45)"
          >
            <Trash2 size={rs(20)} color={palette.rose} />
          </IconButton>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.stat}>
    <View style={styles.statHeader}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bgRoot },
  hero: {
    height: screen.height * 0.4,
    justifyContent: 'space-between',
    padding: spacing.l,
    backgroundColor: palette.bgCard,
  },
  heroImg: { resizeMode: 'cover' },
  heroTop: { flexDirection: 'row' },
  heroBottom: {},
  title: { ...type.hero, color: palette.textPrimary },
  body: { paddingHorizontal: spacing.l, paddingTop: spacing.s },
  statRow: { flexDirection: 'row', gap: rs(8), marginBottom: spacing.m },
  stat: {
    flex: 1,
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.s + 2,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(4), marginBottom: rs(4) },
  statLabel: { ...type.micro, color: palette.textMuted },
  statValue: { ...type.body, color: palette.textPrimary, fontWeight: '700' as const },
  descBox: {
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.m,
  },
  descLabel: { ...type.micro, color: palette.textMuted, marginBottom: rs(6) },
  descText: { ...type.body, color: palette.textPrimary },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.l,
    backgroundColor: 'rgba(4,13,36,0.96)',
    borderTopWidth: 1,
    borderTopColor: palette.divider,
    flexDirection: 'row',
    gap: spacing.s,
  },
});
