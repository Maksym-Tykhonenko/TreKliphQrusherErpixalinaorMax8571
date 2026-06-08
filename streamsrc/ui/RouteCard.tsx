import React, { useRef } from 'react';
import { Animated, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronRight, Star } from 'lucide-react-native';
import { palette, radii, rs, spacing, type } from '../theme/palette';
import { RouteItem } from '../data/routes';

export const RouteCard: React.FC<{
  route: RouteItem;
  onPress?: () => void;
  compact?: boolean;
}> = ({ route, onPress, compact }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
      }
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <ImageBackground source={route.image} style={styles.image} imageStyle={styles.imageRadius}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(2,10,26,0.35)', 'rgba(2,10,26,0.95)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.topRow}>
            <View style={styles.catBadge}>
              <Text style={styles.catBadgeText}>{route.categoryLabel}</Text>
            </View>
            <View style={styles.rating}>
              <Star size={rs(12)} color={palette.warn} fill={palette.warn} />
              <Text style={styles.ratingText}>{route.rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.bottom}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {route.title}
              </Text>
              {!compact && route.region ? (
                <Text style={styles.region} numberOfLines={1}>
                  {route.region}
                </Text>
              ) : null}
              {route.species.length > 0 ? (
                <View style={styles.speciesRow}>
                  {route.species.slice(0, 2).map((s) => (
                    <View key={s} style={styles.speciesChip}>
                      <Text style={styles.speciesText}>{s}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
            <View style={styles.cta}>
              <ChevronRight size={rs(18)} color={palette.textPrimary} />
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: palette.bgCard,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: palette.border,
  },
  image: { height: rs(180), justifyContent: 'space-between', padding: spacing.m },
  imageRadius: { borderRadius: radii.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,111,61,0.95)',
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
  },
  catBadgeText: { ...type.micro, color: '#FFFFFF', fontWeight: '800' as const },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
    gap: rs(4),
  },
  ratingText: { ...type.small, color: '#FFFFFF', fontWeight: '700' as const },
  bottom: { flexDirection: 'row', alignItems: 'flex-end' },
  title: { ...type.h2, color: '#FFFFFF' },
  region: { ...type.small, color: 'rgba(255,255,255,0.7)', marginTop: rs(2) },
  speciesRow: { flexDirection: 'row', gap: rs(6), marginTop: rs(8) },
  speciesChip: {
    backgroundColor: 'rgba(120,165,255,0.18)',
    paddingHorizontal: rs(8),
    paddingVertical: rs(3),
    borderRadius: radii.pill,
  },
  speciesText: { ...type.small, color: '#FFFFFF', fontWeight: '700' as const, fontSize: rs(11) },
  cta: {
    width: rs(34),
    height: rs(34),
    borderRadius: rs(17),
    backgroundColor: 'rgba(46,107,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.s,
  },
});
