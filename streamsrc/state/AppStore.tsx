import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, readJSON, writeJSON } from './storage';

export type DiaryEntry = {
  id: string;
  photoUri: string;
  fishName: string;
  weight: string;
  location: string;
  description: string;
  createdAt: number;
};

export type QuizRun = {
  id: string;
  score: number;
  total: number;
  takenAt: number;
};

type AppCtx = {
  hydrated: boolean;
  onboardingDone: boolean;
  setOnboardingDone: (v: boolean) => Promise<void>;

  savedRouteIds: string[];
  toggleSavedRoute: (id: string) => Promise<void>;
  isRouteSaved: (id: string) => boolean;

  diary: DiaryEntry[];
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => Promise<DiaryEntry>;
  updateDiaryEntry: (id: string, patch: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>) => Promise<void>;
  removeDiaryEntry: (id: string) => Promise<void>;

  quizBest: number;
  quizHistory: QuizRun[];
  recordQuizRun: (score: number, total: number) => Promise<void>;
};

const Ctx = createContext<AppCtx | null>(null);

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);
  const [onboardingDone, setOnboardingDoneState] = useState(false);
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [quizBest, setQuizBest] = useState(0);
  const [quizHistory, setQuizHistory] = useState<QuizRun[]>([]);

  useEffect(() => {
    (async () => {
      const [done, saved, dia, best, hist] = await Promise.all([
        readJSON<boolean>(KEYS.onboardingDone, false),
        readJSON<string[]>(KEYS.savedRoutes, []),
        readJSON<DiaryEntry[]>(KEYS.diary, []),
        readJSON<number>(KEYS.quizBest, 0),
        readJSON<QuizRun[]>(KEYS.quizHistory, []),
      ]);
      setOnboardingDoneState(!!done);
      setSavedRouteIds(Array.isArray(saved) ? saved : []);
      setDiary(Array.isArray(dia) ? dia : []);
      setQuizBest(Number.isFinite(best) ? Number(best) : 0);
      setQuizHistory(Array.isArray(hist) ? hist : []);
      setHydrated(true);
    })();
  }, []);

  const setOnboardingDone = useCallback(async (v: boolean) => {
    setOnboardingDoneState(v);
    await writeJSON(KEYS.onboardingDone, v);
  }, []);

  const toggleSavedRoute = useCallback(async (id: string) => {
    setSavedRouteIds((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
      writeJSON(KEYS.savedRoutes, next);
      return next;
    });
  }, []);

  const isRouteSaved = useCallback(
    (id: string) => savedRouteIds.includes(id),
    [savedRouteIds],
  );

  const addDiaryEntry: AppCtx['addDiaryEntry'] = useCallback(async (entry) => {
    const newEntry: DiaryEntry = { ...entry, id: uid(), createdAt: Date.now() };
    let snapshot: DiaryEntry[] = [];
    setDiary((cur) => {
      snapshot = [newEntry, ...cur];
      writeJSON(KEYS.diary, snapshot);
      return snapshot;
    });
    return newEntry;
  }, []);

  const updateDiaryEntry: AppCtx['updateDiaryEntry'] = useCallback(async (id, patch) => {
    setDiary((cur) => {
      const next = cur.map((e) => (e.id === id ? { ...e, ...patch } : e));
      writeJSON(KEYS.diary, next);
      return next;
    });
  }, []);

  const removeDiaryEntry = useCallback(async (id: string) => {
    setDiary((cur) => {
      const next = cur.filter((e) => e.id !== id);
      writeJSON(KEYS.diary, next);
      return next;
    });
  }, []);

  const recordQuizRun = useCallback(async (score: number, total: number) => {
    const run: QuizRun = { id: uid(), score, total, takenAt: Date.now() };
    setQuizHistory((cur) => {
      const next = [run, ...cur].slice(0, 30);
      writeJSON(KEYS.quizHistory, next);
      return next;
    });
    setQuizBest((cur) => {
      const newBest = Math.max(cur, score);
      writeJSON(KEYS.quizBest, newBest);
      return newBest;
    });
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      hydrated,
      onboardingDone,
      setOnboardingDone,
      savedRouteIds,
      toggleSavedRoute,
      isRouteSaved,
      diary,
      addDiaryEntry,
      updateDiaryEntry,
      removeDiaryEntry,
      quizBest,
      quizHistory,
      recordQuizRun,
    }),
    [
      hydrated,
      onboardingDone,
      setOnboardingDone,
      savedRouteIds,
      toggleSavedRoute,
      isRouteSaved,
      diary,
      addDiaryEntry,
      updateDiaryEntry,
      removeDiaryEntry,
      quizBest,
      quizHistory,
      recordQuizRun,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAppStore = (): AppCtx => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppStore must be used inside AppStoreProvider');
  return v;
};
