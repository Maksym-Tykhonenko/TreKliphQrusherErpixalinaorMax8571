import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Easing, ImageBackground, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MapPin, Bookmark, BookmarkCheck, Share2, Star, Navigation, Calendar, Fish, Info } from 'lucide-react-native';
import { palette, radii, rs, screen, spacing, type } from '../theme/palette';
import { RouteItem } from '../data/routes';
import { IconButton } from '../ui/IconButton';
import { GradientButton } from '../ui/GradientButton';
import { useAppStore } from '../state/AppStore';
import { useToast } from '../ui/Toast';

const openMaps = (lat: number, lng: number, label: string) => {
  const labelEnc = encodeURIComponent(label);
  const url = `https://maps.apple.com/?ll=${lat},${lng}&q=${labelEnc}`;
  Linking.canOpenURL(url).then((ok) => {
    if (ok) Linking.openURL(url);
    else Alert.alert('Unable to open Maps', 'Coordinates: ' + lat + ', ' + lng);
  });
};

export const RouteDetail: React.FC<{
  route: RouteItem;
  onClose: () => void;
}> = ({ route, onClose }) => {
  const { isRouteSaved, toggleSavedRoute } = useAppStore();
  const toast = useToast();
  const saved = isRouteSaved(route.id);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 10, tension: 80 }),
    ]).start();
  }, [fade, slide]);

  const onSave = async () => {
    await toggleSavedRoute(route.id);
    toast.show(saved ? 'Removed from Saved' : 'Saved to your collection', saved ? 'info' : 'success');
  };

  const onShare = async () => {
    await Share.share({
      message: `${route.title} (${route.region}) — ${route.coordinates}\n\n${route.description}\n\nDiscover Japan with Fish Explorer Japan.`,
    });
  };

  return (
    <Animated.View style={[styles.root, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={['rgba(2,10,26,0.65)', 'rgba(2,10,26,0.95)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: rs(180) }}
        >
          <ImageBackground source={route.image} style={styles.hero} imageStyle={styles.heroImg}>
            <LinearGradient
              colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 'rgba(2,10,26,0.95)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroTop}>
              <IconButton onPress={onClose} bg="rgba(2,10,26,0.55)">
                <X size={rs(18)} color={palette.textPrimary} />
              </IconButton>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{route.categoryLabel}</Text>
              </View>
            </View>

            <View style={styles.heroBottom}>
              <View style={styles.ratingPill}>
                <Star size={rs(14)} color={palette.warn} fill={palette.warn} />
                <Text style={styles.ratingText}>{route.rating.toFixed(1)}</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.body}>
            <Text style={styles.title}>{route.title}</Text>
            {route.region ? <Text style={styles.region}>{route.region}</Text> : null}

            <View style={styles.metaRow}>
              <MapPin size={rs(14)} color={palette.accent} />
              <Text style={styles.metaText}>{route.coordinates}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>SEASON</Text>
              <View style={styles.infoLine}>
                <Calendar size={rs(14)} color={palette.cyan} />
                <Text style={styles.infoValue}>{route.season}</Text>
              </View>
            </View>

            {route.species.length > 0 ? (
              <View style={styles.infoCard}>
                <View style={styles.infoLine}>
                  <Fish size={rs(14)} color={palette.cyan} />
                  <Text style={styles.infoLabel}>TARGET SPECIES</Text>
                </View>
                <View style={styles.speciesWrap}>
                  {route.species.map((s) => (
                    <View key={s} style={styles.species}>
                      <Text style={styles.speciesText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <Text style={styles.desc}>{route.description}</Text>

            <View style={styles.safetyCard}>
              <View style={styles.infoLine}>
                <Info size={rs(14)} color={palette.warn} />
                <Text style={styles.infoLabel}>RESPONSIBLE TRAVEL</Text>
              </View>
              <Text style={styles.safetyText}>
                Always check local guidelines, respect protected waters, and prepare safely. Follow seasonal rules
                set by regional coastal authorities.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.actionBar}>
          <View style={styles.actionRow}>
            <GradientButton
              variant={saved ? 'accent' : 'primary'}
              icon={
                saved ? (
                  <BookmarkCheck size={rs(18)} color="#FFFFFF" />
                ) : (
                  <Bookmark size={rs(18)} color="#FFFFFF" />
                )
              }
              label={saved ? 'Saved' : 'Save'}
              onPress={onSave}
              style={{ flex: 1 }}
              glow
            />
            <IconButton onPress={onShare} size={rs(50)}>
              <Share2 size={rs(20)} color={palette.textPrimary} />
            </IconButton>
            <IconButton onPress={() => openMaps(route.lat, route.lng, route.title)} size={rs(50)} bg="rgba(255,111,61,0.18)" border="rgba(255,111,61,0.55)">
              <Navigation size={rs(20)} color={palette.accent} />
            </IconButton>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bgRoot,
  },
  safe: { flex: 1 },
  hero: {
    height: screen.height * 0.42,
    justifyContent: 'space-between',
    padding: spacing.l,
  },
  heroImg: { resizeMode: 'cover' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: {
    backgroundColor: 'rgba(255,111,61,0.95)',
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: radii.pill,
  },
  catBadgeText: { ...type.micro, color: '#FFFFFF', fontWeight: '800' as const },
  heroBottom: { flexDirection: 'row' },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
    gap: rs(6),
  },
  ratingText: { ...type.small, color: '#FFFFFF', fontWeight: '800' as const },
  body: { paddingHorizontal: spacing.l, paddingTop: spacing.l },
  title: { ...type.hero, color: palette.textPrimary, marginBottom: rs(4) },
  region: { ...type.h3, color: palette.textMuted, marginBottom: spacing.m, fontWeight: '600' as const },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: spacing.m },
  metaText: { ...type.small, color: palette.textPrimary },
  infoCard: {
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  infoLabel: { ...type.micro, color: palette.textMuted, letterSpacing: 1.4 },
  infoValue: { ...type.body, color: palette.textPrimary, marginLeft: rs(4) },
  speciesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(6), marginTop: spacing.s },
  species: {
    backgroundColor: 'rgba(46,107,255,0.18)',
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(46,107,255,0.45)',
  },
  speciesText: { ...type.small, color: '#BBD0FF', fontWeight: '700' as const, fontSize: rs(12) },
  desc: { ...type.body, color: palette.textMuted, marginTop: rs(4), marginBottom: spacing.m },
  safetyCard: {
    backgroundColor: 'rgba(255,200,87,0.08)',
    borderColor: 'rgba(255,200,87,0.35)',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.m,
  },
  safetyText: { ...type.small, color: palette.textMuted, marginTop: rs(6) },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.l,
    backgroundColor: 'rgba(4,13,36,0.96)',
    borderTopWidth: 1,
    borderTopColor: palette.divider,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
});
