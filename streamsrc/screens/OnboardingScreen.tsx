import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, radii, rs, screen, spacing, type } from '../theme/palette';
import { GradientButton } from '../ui/GradientButton';

type Slide = {
  key: string;
  eyebrow: string;
  eyebrowTone: 'primary' | 'cyan' | 'warn' | 'accent';
  title: string;
  copy: string;
  image: number;
};

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    eyebrow: 'WELCOME',
    eyebrowTone: 'accent',
    title: 'Welcome to Japan Water Routes',
    copy: 'A calm, curated guide to Japan’s sacred coasts, mountain streams and open-water passages — built for travellers who love the sea.',
    image: require('../../riwtekiplesx/shizreobinrod/rignohard1.png'),
  },
  {
    key: 'coast',
    eyebrow: 'COASTAL CALM',
    eyebrowTone: 'cyan',
    title: 'Where the ocean meets ancient rock',
    copy: 'Japan’s 29,000 km of coastline hides thousands of legendary destinations — from sacred Ise Bay to wild Pacific cliffs.',
    image: require('../../riwtekiplesx/shizreobinrod/rignohard2.png'),
  },
  {
    key: 'mountain',
    eyebrow: 'MOUNTAIN STREAMS',
    eyebrowTone: 'warn',
    title: 'Crystal rivers through cedar forests',
    copy: 'High in Japan’s mountain valleys, streams run cold and clear. Discover quiet bends where mist drifts and the water sings.',
    image: require('../../riwtekiplesx/shizreobinrod/rignohard3.png'),
  },
  {
    key: 'deep',
    eyebrow: 'DEEP BLUE ROUTES',
    eyebrowTone: 'accent',
    title: 'Offshore tides become a way of life',
    copy: 'Japan’s deep blue routes are woven into local culture — the ama divers, the Ebisu shrines, the seasonal currents.',
    image: require('../../riwtekiplesx/shizreobinrod/rignohard4.png'),
  },
  {
    key: 'journey',
    eyebrow: 'YOUR JOURNEY',
    eyebrowTone: 'warn',
    title: 'The sea is waiting. Are you?',
    copy: 'Start exploring locations, save your favourites, log a personal diary and learn the secrets of Japan’s ancient waters.',
    image: require('../../riwtekiplesx/shizreobinrod/rignohard5.png'),
  },
];

const TONE: Record<Slide['eyebrowTone'], { bg: string; fg: string }> = {
  primary: { bg: 'rgba(46,107,255,0.18)', fg: palette.primary },
  cyan: { bg: 'rgba(91,217,255,0.18)', fg: palette.cyan },
  warn: { bg: 'rgba(255,200,87,0.18)', fg: palette.warn },
  accent: { bg: 'rgba(255,111,61,0.22)', fg: palette.accent },
};

export const OnboardingScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const fade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    fade.setValue(0);
    slideAnim.setValue(40);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 70,
      }),
    ]).start();
  }, [idx, fade, slideAnim]);

  const isLast = idx === SLIDES.length - 1;
  const next = () => (isLast ? onDone() : setIdx((i) => i + 1));
  const tone = TONE[slide.eyebrowTone];

  const dots = useMemo(
    () =>
      SLIDES.map((_, i) => {
        const active = i === idx;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              active && {
                width: rs(26),
                backgroundColor: slide.eyebrowTone === 'accent' ? palette.accent : palette.primary,
              },
            ]}
          />
        );
      }),
    [idx, slide.eyebrowTone],
  );

  return (
    <View style={styles.root}>
      <ImageBackground source={slide.image} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(2,10,26,0.05)', 'rgba(2,10,26,0.4)', 'rgba(2,10,26,0.98)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.topRow}>
          <View style={styles.progressRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressCell,
                  i <= idx && { backgroundColor: tone.fg },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Animated.View
          style={[
            styles.content,
            { opacity: fade, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={[styles.eyebrowChip, { backgroundColor: tone.bg, borderColor: tone.fg + '66' }]}>
            <Text style={[styles.eyebrowText, { color: tone.fg }]}>{slide.eyebrow}</Text>
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.copy}>{slide.copy}</Text>

          <View style={styles.dotsRow}>{dots}</View>

          <GradientButton
            variant={isLast ? 'accent' : 'primary'}
            label={isLast ? 'Start My Journey' : 'Continue'}
            iconRight={<ArrowRight size={rs(18)} color="#FFFFFF" />}
            onPress={next}
            fullWidth
            glow
            size="lg"
          />
          {!isLast ? (
            <Pressable onPress={onDone} hitSlop={8} style={styles.skip}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : (
            <View style={{ height: rs(20) }} />
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bgDeep },
  safe: { flex: 1, paddingHorizontal: spacing.l },
  topRow: { paddingTop: spacing.s },
  progressRow: { flexDirection: 'row', gap: rs(6) },
  progressCell: {
    flex: 1,
    height: rs(3),
    borderRadius: rs(2),
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  content: {
    paddingBottom: spacing.s,
  },
  eyebrowChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: rs(12),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
    borderWidth: 1,
    marginBottom: spacing.m,
  },
  eyebrowText: { ...type.micro, fontWeight: '800' as const, letterSpacing: 1.6 },
  title: { ...type.hero, color: palette.textPrimary, marginBottom: spacing.s, maxWidth: screen.width * 0.94 },
  copy: { ...type.body, color: 'rgba(241,246,255,0.85)', marginBottom: spacing.l },
  dotsRow: { flexDirection: 'row', gap: rs(6), marginBottom: spacing.l },
  dot: {
    width: rs(10),
    height: rs(6),
    borderRadius: rs(4),
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  skip: { alignSelf: 'center', paddingVertical: spacing.s, marginTop: rs(6) },
  skipText: { ...type.small, color: palette.textMuted, fontWeight: '700' as const },
});
