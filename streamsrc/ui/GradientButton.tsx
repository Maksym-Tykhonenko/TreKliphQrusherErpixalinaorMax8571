import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle, TextStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { palette, radii, rs, spacing, type as typeT } from '../theme/palette';

type Variant = 'primary' | 'accent' | 'ghost' | 'dark';

type Props = {
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children?: React.ReactNode;
};

const COLORS: Record<Variant, { from: string; to: string; text: string; border?: string }> = {
  primary: { from: '#2E6BFF', to: '#1B49C7', text: '#FFFFFF' },
  accent: { from: '#FF8056', to: '#D74A1C', text: '#FFFFFF' },
  ghost: { from: 'rgba(120,165,255,0.0)', to: 'rgba(120,165,255,0.0)', text: palette.textPrimary, border: palette.border },
  dark: { from: '#13234A', to: '#0B1A38', text: palette.textPrimary, border: palette.border },
};

export const GradientButton: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  disabled,
  fullWidth,
  style,
  textStyle,
  size = 'md',
  glow,
  children,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = COLORS[variant];

  const sz =
    size === 'sm'
      ? { padV: spacing.s, padH: spacing.m, font: typeT.small }
      : size === 'lg'
      ? { padV: spacing.m + 2, padH: spacing.l, font: typeT.h3 }
      : { padV: spacing.m, padH: spacing.l, font: typeT.h3 };

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30, bounciness: 6 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start()
      }
      style={[fullWidth && { alignSelf: 'stretch' }, style]}
    >
      <Animated.View
        style={[
          styles.outer,
          {
            transform: [{ scale }],
            opacity: disabled ? 0.5 : 1,
            borderColor: cfg.border ?? 'transparent',
            borderWidth: cfg.border ? 1 : 0,
          },
          glow &&
            !disabled && {
              shadowColor: variant === 'accent' ? palette.accent : palette.primary,
              shadowOpacity: 0.45,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            },
        ]}
      >
        <LinearGradient
          colors={[cfg.from, cfg.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.row,
            { paddingVertical: sz.padV, paddingHorizontal: sz.padH },
          ]}
        >
          {icon ? <View style={styles.iconL}>{icon}</View> : null}
          {children ?? (
            <Text style={[styles.label, sz.font, { color: cfg.text }, textStyle]} numberOfLines={1}>
              {label}
            </Text>
          )}
          {iconRight ? <View style={styles.iconR}>{iconRight}</View> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: rs(48),
  },
  label: { textAlign: 'center' },
  iconL: { marginRight: spacing.s },
  iconR: { marginLeft: spacing.s },
});
