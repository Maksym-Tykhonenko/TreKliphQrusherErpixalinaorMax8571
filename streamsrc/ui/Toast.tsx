import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react-native';
import { palette, radii, rs, spacing, type } from '../theme/palette';

type ToastKind = 'success' | 'info' | 'warn';
type ToastItem = { id: number; text: string; kind: ToastKind };

type ToastCtx = {
  show: (text: string, kind?: ToastKind) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((text: string, kind: ToastKind = 'success') => {
    idRef.current += 1;
    const id = idRef.current;
    setItems((cur) => [...cur, { id, text, kind }]);
    setTimeout(() => {
      setItems((cur) => cur.filter((i) => i.id !== id));
    }, 2400);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <SafeAreaView pointerEvents="none" style={styles.host}>
        {items.map((it) => (
          <ToastView key={it.id} item={it} />
        ))}
      </SafeAreaView>
    </Ctx.Provider>
  );
};

const ToastView: React.FC<{ item: ToastItem }> = ({ item }) => {
  const slide = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8, tension: 80 }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slide, { toValue: -30, duration: 240, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start();
    }, 2100);

    return () => clearTimeout(t);
  }, [slide, opacity]);

  const Icon =
    item.kind === 'success' ? CheckCircle2 : item.kind === 'warn' ? AlertTriangle : Info;
  const accent =
    item.kind === 'success' ? palette.ok : item.kind === 'warn' ? palette.warn : palette.cyan;

  return (
    <Animated.View
      style={[
        styles.toast,
        { opacity, transform: [{ translateY: slide }], borderColor: accent + '55' },
      ]}
    >
      <View style={[styles.toastIcon, { backgroundColor: accent + '22' }]}>
        <Icon size={rs(18)} color={accent} />
      </View>
      <Text style={styles.toastText} numberOfLines={2}>
        {item.text}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.bgGlass,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s + 2,
    marginTop: spacing.s,
    maxWidth: 480,
    minWidth: rs(220),
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  toastIcon: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  toastText: { ...type.small, color: palette.textPrimary, flexShrink: 1 },
});

export const useToast = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be used inside ToastProvider');
  return v;
};
