import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { palette, radii, rs } from '../theme/palette';

export const IconButton: React.FC<{
  onPress?: () => void;
  size?: number;
  bg?: string;
  border?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ onPress, size = rs(40), bg = palette.bgGlass, border = palette.border, children, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 30, bounciness: 8 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start()
      }
    >
      <Animated.View
        style={[
          styles.btn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            borderColor: border,
            transform: [{ scale }],
          },
          style,
        ]}
      >
        <View style={styles.center}>{children}</View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
});
