import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Map, Bookmark, Compass, Lightbulb, BookOpen, Eye } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, radii, rs, spacing, type } from '../theme/palette';
import { TabKey, useNav } from '../nav/NavRouter';

const TABS: { key: TabKey; label: string; Icon: any }[] = [
  { key: 'spots', label: 'Spots', Icon: Compass },
  { key: 'saved', label: 'Saved', Icon: Bookmark },
  { key: 'map', label: 'Map', Icon: Map },
  { key: 'facts', label: 'Facts', Icon: Lightbulb },
  { key: 'diary', label: 'Diary', Icon: BookOpen },
  { key: 'quiz', label: 'Quiz', Icon: Eye },
];

export const BOTTOM_BAR_HEIGHT = rs(64);

export const BottomBar: React.FC = () => {
  const { activeTab, setActiveTab } = useNav();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.host,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? rs(8) : rs(10)) },
      ]}
    >
      <LinearGradient
        colors={['rgba(4,13,36,0)', 'rgba(4,13,36,0.95)']}
        style={[StyleSheet.absoluteFill, { top: -rs(20) }]}
        pointerEvents="none"
      />
      <View style={styles.bar}>
        {TABS.map((t) => (
          <TabButton
            key={t.key}
            tab={t}
            active={activeTab === t.key}
            onPress={() => setActiveTab(t.key)}
          />
        ))}
      </View>
    </View>
  );
};

const TabButton: React.FC<{
  tab: { key: TabKey; label: string; Icon: any };
  active: boolean;
  onPress: () => void;
}> = ({ tab, active, onPress }) => {
  const dot = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(dot, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 90,
    }).start();
  }, [active, dot]);

  const color = active ? palette.accent : palette.textSubtle;
  const Icon = tab.Icon;

  return (
    <Pressable onPress={onPress} style={styles.btn} hitSlop={6}>
      <Animated.View
        style={[
          styles.indicator,
          {
            opacity: dot,
            transform: [
              {
                scaleX: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              },
            ],
          },
        ]}
      />
      <Icon size={rs(20)} color={color} strokeWidth={2.2} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {tab.label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.bgRoot,
    borderTopWidth: 1,
    borderTopColor: palette.divider,
  },
  bar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.s,
    paddingTop: spacing.s,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(2),
  },
  indicator: {
    position: 'absolute',
    top: -rs(8),
    width: rs(26),
    height: rs(3),
    borderRadius: rs(2),
    backgroundColor: palette.accent,
  },
  label: { ...type.small, fontSize: rs(10), marginTop: rs(2), fontWeight: '700' as const },
});
