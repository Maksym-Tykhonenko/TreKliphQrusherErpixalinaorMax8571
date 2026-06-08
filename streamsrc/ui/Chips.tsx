import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Anchor, Mountain, Waves, Route, Fish, Flag } from 'lucide-react-native';
import { palette, radii, rs, spacing, type } from '../theme/palette';

export type ChipDef = {
  key: string;
  label: string;
  icon?: 'route' | 'waves' | 'mountain' | 'anchor' | 'fish' | 'flag';
};

const ICONS = {
  route: Route,
  waves: Waves,
  mountain: Mountain,
  anchor: Anchor,
  fish: Fish,
  flag: Flag,
};

export const ChipBar: React.FC<{
  items: ChipDef[];
  active: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}> = ({ items, active, onChange, style }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, {
        marginBottom: spacing.l,
      }]}
    >
      {items.map((it) => {
        const isActive = it.key === active;
        const Icon = it.icon ? ICONS[it.icon] : null;
        return (
          <Pressable
            key={it.key}
            onPress={() => onChange(it.key)}
            style={[styles.chip, !isActive && styles.chipInactive]}
          >
            {isActive ? (
              <LinearGradient
                colors={['#2E6BFF', '#1B49C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={styles.chipInner}>
              {Icon ? (
                <Icon
                  size={rs(14)}
                  color={isActive ? '#FFFFFF' : palette.textMuted}
                  strokeWidth={2.2}
                />
              ) : null}
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#FFFFFF' : palette.textMuted },
                ]}
                numberOfLines={1}
              >
                {it.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    gap: spacing.s,
  },
  chip: {
    height: rs(34),
    borderRadius: radii.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInactive: {
    backgroundColor: palette.bgCard,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipInner: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  chipText: { ...type.small, fontWeight: '700' as const },
});
