import AsyncStorage from '@react-native-async-storage/async-storage';

const NS = 'tfqe::';

export const KEYS = {
  onboardingDone: NS + 'onboarding-done',
  savedRoutes: NS + 'saved-routes',
  diary: NS + 'diary-entries',
  quizBest: NS + 'quiz-best',
  quizHistory: NS + 'quiz-history',
};

export const readJSON = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeJSON = async (key: string, value: unknown) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export const removeKey = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
};
