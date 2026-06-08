import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palette } from './theme/palette';
import { AppStoreProvider, useAppStore } from './state/AppStore';
import { NavProvider } from './nav/NavRouter';
import { ToastProvider } from './ui/Toast';
import { LoadingScreen } from './screens/LoadingScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { MainShell } from './screens/MainShell';

//type Phase = 'loading' | 'onboarding' | 'main';

const RootFlow = () => {
  const { hydrated, onboardingDone, setOnboardingDone } = useAppStore();
  const [phase, setPhase] = useState('onboarding');
  const [loadingDone, setLoadingDone] = useState(false);

  //useEffect(() => {
  //  if (!hydrated) return;
  //  if (!loadingDone) return;
  //  setPhase(onboardingDone ? 'main' : 'onboarding');
  //}, [hydrated, loadingDone, onboardingDone]);
//
  //if (!hydrated || !loadingDone || phase === 'loading') {
  //  return <LoadingScreen onComplete={() => setLoadingDone(true)} />;
  //}

  if (phase === 'onboarding') {
    return (
      <OnboardingScreen
        onDone={async () => {
          await setOnboardingDone(true);
          setPhase('main');
        }}
      />
    );
  }

  return (
    <NavProvider>
      <MainShell />
    </NavProvider>
  );
};

export const JourneyRoot = () => {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={palette.bgRoot} translucent />
        <AppStoreProvider>
          <ToastProvider>
            <RootFlow />
          </ToastProvider>
        </AppStoreProvider>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bgRoot },
});
