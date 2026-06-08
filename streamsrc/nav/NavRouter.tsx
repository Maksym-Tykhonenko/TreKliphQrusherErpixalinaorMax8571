import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native';

export type TabKey = 'spots' | 'saved' | 'map' | 'facts' | 'diary' | 'quiz';

type ModalDef = { id: string; render: (close: () => void) => React.ReactNode };

type NavCtx = {
  activeTab: TabKey;
  setActiveTab: (t: TabKey) => void;
  pushModal: (render: (close: () => void) => React.ReactNode) => string;
  closeModal: (id?: string) => void;
};

const Ctx = createContext<NavCtx | null>(null);

export const NavProvider: React.FC<{
  initialTab?: TabKey;
  children: React.ReactNode;
}> = ({ initialTab = 'spots', children }) => {
  const [activeTab, setActiveTabState] = useState<TabKey>(initialTab);
  const [modals, setModals] = useState<ModalDef[]>([]);
  const idRef = useRef(0);

  const setActiveTab = useCallback((t: TabKey) => setActiveTabState(t), []);

  const pushModal = useCallback(
    (render: (close: () => void) => React.ReactNode) => {
      idRef.current += 1;
      const id = `m${idRef.current}`;
      setModals((cur) => [...cur, { id, render }]);
      return id;
    },
    [],
  );

  const closeModal = useCallback((id?: string) => {
    setModals((cur) => {
      if (id == null) return cur.slice(0, -1);
      return cur.filter((m) => m.id !== id);
    });
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (modals.length > 0) {
        closeModal();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [modals.length, closeModal]);

  const value = useMemo<NavCtx>(
    () => ({ activeTab, setActiveTab, pushModal, closeModal }),
    [activeTab, setActiveTab, pushModal, closeModal],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {modals.map((m) => (
        <ModalLayer key={m.id} onClose={() => closeModal(m.id)} render={m.render} />
      ))}
    </Ctx.Provider>
  );
};

const ModalLayer: React.FC<{
  render: (close: () => void) => React.ReactNode;
  onClose: () => void;
}> = ({ render, onClose }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 70, friction: 11 }),
    ]).start();
  }, [fade, slide]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { opacity: fade }]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateY: slide }] }]}
        pointerEvents="box-none"
      >
        <View style={StyleSheet.absoluteFill}>{render(onClose)}</View>
      </Animated.View>
    </Animated.View>
  );
};

export const useNav = (): NavCtx => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav must be used inside NavProvider');
  return v;
};
