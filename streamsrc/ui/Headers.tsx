import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, rs, spacing, type } from '../theme/palette';

export const ScreenHeader: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, right }) => (
  <View style={styles.header}>
    <View style={styles.left}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {right ? <View style={styles.right}>{right}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  left: { flex: 1 },
  right: { marginLeft: spacing.m },
  eyebrow: { ...type.micro, color: palette.accent, marginBottom: rs(4), textTransform: 'uppercase' },
  title: { ...type.title, color: palette.textPrimary },
  subtitle: { ...type.small, color: palette.textMuted, marginTop: rs(4) },
});
