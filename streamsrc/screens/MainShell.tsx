import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, rs } from '../theme/palette';
import { BOTTOM_BAR_HEIGHT, BottomBar } from '../ui/BottomBar';
import { useNav } from '../nav/NavRouter';
import { SpotsScreen } from './SpotsScreen';
import { SavedScreen } from './SavedScreen';
import { MapScreen } from './MapScreen';
import { FactsScreen } from './FactsScreen';
import { DiaryScreen } from './DiaryScreen';
import { QuizScreen } from './QuizScreen';

export const MainShell: React.FC = () => {
  const { activeTab } = useNav();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(10);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 9, tension: 90 }),
    ]).start();
  }, [activeTab, fade, slide]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <Animated.View
          style={[
            styles.stage,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          {activeTab === 'spots' ? <SpotsScreen /> : null}
          {activeTab === 'saved' ? <SavedScreen /> : null}
          {activeTab === 'map' ? <MapScreen /> : null}
          {activeTab === 'facts' ? <FactsScreen /> : null}
          {activeTab === 'diary' ? <DiaryScreen /> : null}
          {activeTab === 'quiz' ? <QuizScreen /> : null}
        </Animated.View>
      </SafeAreaView>
      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bgRoot },
  stage: { flex: 1, paddingBottom: BOTTOM_BAR_HEIGHT },
});
