import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronLeft, Clock, Award, RotateCw, Share2, Check, X as XIcon, Eye } from 'lucide-react-native';
import { palette, radii, rs, spacing, type } from '../theme/palette';
import { ScreenHeader } from '../ui/Headers';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quiz';
import { GradientButton } from '../ui/GradientButton';
import { IconButton } from '../ui/IconButton';
import { useAppStore } from '../state/AppStore';
import { useToast } from '../ui/Toast';
import { BOTTOM_BAR_HEIGHT } from '../ui/BottomBar';
import { shareText } from '../utils/share';

type Mode = 'intro' | 'quiz' | 'result';

const QUESTION_TIME = 15;
const QUESTIONS_PER_RUN = 5;

const pickRun = (): QuizQuestion[] => {
  const pool = [...QUIZ_QUESTIONS];
  const out: QuizQuestion[] = [];
  while (out.length < QUESTIONS_PER_RUN && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
};

export const QuizScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>('intro');
  const [run, setRun] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<{ q: QuizQuestion; picked: number | null }[]>([]);
  const [time, setTime] = useState(QUESTION_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { quizBest, recordQuizRun } = useAppStore();
  const toast = useToast();

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => () => stopTimer(), []);

  const startTimer = () => {
    stopTimer();
    setTime(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          stopTimer();
          // auto-reveal
          setPicked((cur) => (cur == null ? -1 : cur));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const begin = () => {
    const next = pickRun();
    setRun(next);
    setIdx(0);
    setPicked(null);
    setResults([]);
    setMode('quiz');
    startTimer();
  };

  const onPick = (i: number) => {
    if (picked != null) return;
    setPicked(i);
    stopTimer();
  };

  const onNext = async () => {
    const q = run[idx];
    const finalPicked = picked == null || picked < 0 ? null : picked;
    const newResults = [...results, { q, picked: finalPicked }];
    setResults(newResults);
    if (idx + 1 >= run.length) {
      const score = newResults.reduce((acc, r) => (r.picked === r.q.answer ? acc + 1 : acc), 0);
      await recordQuizRun(score, run.length);
      if (score > quizBest) toast.show(`New best score: ${score}/${run.length}`, 'success');
      setMode('result');
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      startTimer();
    }
  };

  if (mode === 'intro') return <Intro onStart={begin} bestScore={quizBest} />;

  if (mode === 'result') {
    return (
      <ResultView
        results={results}
        onRetry={begin}
        onHome={() => setMode('intro')}
      />
    );
  }

  const cur = run[idx];

  return (
    <View style={styles.root}>
      <View style={styles.quizHead}>
        <IconButton
          onPress={() => {
            stopTimer();
            setMode('intro');
          }}
          bg="rgba(2,10,26,0.55)"
        >
          <ChevronLeft size={rs(18)} color={palette.textPrimary} />
        </IconButton>
        <View style={styles.timerPill}>
          <Clock size={rs(14)} color={time <= 5 ? palette.rose : palette.warn} />
          <Text style={[styles.timerText, time <= 5 && { color: palette.rose }]}>{time}</Text>
        </View>
        <Text style={styles.qIndex}>{idx + 1}/{run.length}</Text>
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${((idx + (picked != null ? 1 : 0)) / run.length) * 100}%` },
          ]}
        >
          <LinearGradient
            colors={['#5BD9FF', '#2E6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.quizBody}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.prompt}>{cur.prompt}</Text>
        <View style={styles.imgBox}>
          <Image source={cur.image} style={styles.imgFill} />
          <LinearGradient
            colors={['rgba(0,0,0,0.0)', 'rgba(2,10,26,0.65)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {cur.options.map((opt, i) => {
          const isPicked = picked === i;
          const correct = picked != null && i === cur.answer;
          const wrong = picked === i && i !== cur.answer;
          return (
            <Pressable
              key={opt}
              onPress={() => onPick(i)}
              disabled={picked != null}
              style={[
                styles.opt,
                isPicked && picked === cur.answer && styles.optCorrect,
                wrong && styles.optWrong,
                correct && picked !== cur.answer && styles.optReveal,
              ]}
            >
              <View
                style={[
                  styles.optLetter,
                  isPicked && picked === cur.answer && styles.optLetterCorrect,
                  wrong && styles.optLetterWrong,
                ]}
              >
                <Text style={styles.optLetterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={styles.optText}>{opt}</Text>
              {correct ? (
                <Check size={rs(18)} color={palette.ok} />
              ) : wrong ? (
                <XIcon size={rs(18)} color={palette.rose} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <GradientButton
          variant={picked == null ? 'dark' : idx + 1 >= run.length ? 'accent' : 'accent'}
          label={picked == null ? 'Choose an answer' : idx + 1 >= run.length ? 'See Result' : 'Next Question'}
          onPress={onNext}
          disabled={picked == null}
          glow={picked != null}
          fullWidth
        />
      </View>
    </View>
  );
};

const Intro: React.FC<{ onStart: () => void; bestScore: number }> = ({ onStart, bestScore }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 90 }),
    ]).start();
  }, [fade, scale]);

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow="Test Yourself" title="Species Quiz" />
      <Animated.View style={[styles.introBody, { opacity: fade, transform: [{ scale }] }]}>
        <LinearGradient
          colors={['#103163', '#062047']}
          style={styles.introIconBox}
        >
          <Eye size={rs(46)} color={palette.cyan} strokeWidth={2.2} />
        </LinearGradient>

        <View style={styles.introChip}>
          <Text style={styles.introChipText}>MARINE KNOWLEDGE QUIZ</Text>
        </View>

        <Text style={styles.introTitle}>Can You Name These Species?</Text>
        <Text style={styles.introCopy}>
          Test your knowledge of Japan's marine life — 5 questions, 4 options each, 15 seconds per question.
        </Text>

        <View style={styles.introStats}>
          <StatLine icon={<Eye size={rs(14)} color={palette.cyan} />} text="5 species to identify" />
          <StatLine icon={<Clock size={rs(14)} color={palette.warn} />} text="15 seconds per question" />
          <StatLine icon={<Check size={rs(14)} color={palette.ok} />} text="4 answer choices each" />
          <StatLine icon={<Award size={rs(14)} color={palette.accent} />} text={`Best score: ${bestScore} / ${QUESTIONS_PER_RUN}`} />
        </View>

        <GradientButton
          variant="accent"
          label="Start Quiz"
          onPress={onStart}
          fullWidth
          glow
          size="lg"
          icon={<Eye size={rs(18)} color="#FFFFFF" />}
        />
      </Animated.View>
    </View>
  );
};

const StatLine: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <View style={styles.statLine}>
    {icon}
    <Text style={styles.statLineText}>{text}</Text>
  </View>
);

const ResultView: React.FC<{
  results: { q: QuizQuestion; picked: number | null }[];
  onRetry: () => void;
  onHome: () => void;
}> = ({ results, onRetry, onHome }) => {
  const score = useMemo(
    () => results.reduce((a, r) => (r.picked === r.q.answer ? a + 1 : a), 0),
    [results],
  );
  const total = results.length;
  const pct = Math.round((score / total) * 100);

  const rank =
    pct >= 80 ? 'Marine Expert' : pct >= 60 ? 'Sea Explorer' : pct >= 40 ? 'Learning Voyager' : 'Coastal Beginner';
  const rankColor =
    pct >= 80 ? palette.ok : pct >= 60 ? palette.cyan : pct >= 40 ? palette.warn : palette.rose;

  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(ring, { toValue: 1, useNativeDriver: true, friction: 9, tension: 80 }).start();
  }, [ring]);

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow="Results" title="Quiz Complete" />
      <ScrollView
        contentContainerStyle={styles.resultBody}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.scoreBox,
            { transform: [{ scale: ring }], borderColor: rankColor + '88' },
          ]}
        >
          <LinearGradient
            colors={[rankColor + '22', 'rgba(2,10,26,0.0)']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.scoreBig, { color: rankColor }]}>
            {score}/{total}
          </Text>
          <View style={[styles.rankPill, { borderColor: rankColor + '66' }]}>
            <Eye size={rs(14)} color={rankColor} />
            <Text style={[styles.rankText, { color: rankColor }]}>{rank}</Text>
          </View>
          <Text style={styles.pct}>{pct}% correct</Text>
        </Animated.View>

        <View style={styles.resultsList}>
          <Text style={styles.resultsLabel}>RESULTS</Text>
          {results.map((r, i) => {
            const ok = r.picked === r.q.answer;
            return (
              <View key={r.q.id} style={styles.resultRow}>
                <View
                  style={[styles.resultDot, { backgroundColor: ok ? palette.ok : palette.rose }]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultPrompt} numberOfLines={1}>
                    Q{i + 1}: {r.q.options[r.q.answer]}
                  </Text>
                  {!ok ? (
                    <Text style={styles.resultPicked} numberOfLines={1}>
                      You answered: {r.picked != null && r.picked >= 0 ? r.q.options[r.picked] : 'No answer'}
                    </Text>
                  ) : (
                    <Text style={styles.resultPickedOk}>Correct</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <GradientButton
          variant="primary"
          label="Share Result"
          icon={<Share2 size={rs(16)} color="#FFFFFF" />}
          onPress={() =>
            shareText(
              `I scored ${score}/${total} on the Marine Knowledge Quiz in Fish Explorer Japan — rank: ${rank}.`,
            )
          }
          style={{ flex: 1 }}
          glow
        />
        <GradientButton
          variant="dark"
          label="Retry"
          icon={<RotateCw size={rs(16)} color={palette.textPrimary} />}
          onPress={onRetry}
          style={{ flex: 1 }}
        />
        <IconButton onPress={onHome} size={rs(50)}>
          <ChevronLeft size={rs(20)} color={palette.textPrimary} />
        </IconButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  introBody: {
    paddingHorizontal: spacing.l,
    paddingBottom: BOTTOM_BAR_HEIGHT + rs(50),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introIconBox: {
    width: rs(120),
    height: rs(120),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: 'rgba(91,217,255,0.3)',
  },
  introChip: {
    backgroundColor: 'rgba(91,217,255,0.18)',
    borderColor: 'rgba(91,217,255,0.5)',
    borderWidth: 1,
    paddingHorizontal: rs(12),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
    marginBottom: spacing.m,
  },
  introChipText: { ...type.micro, color: palette.cyan, letterSpacing: 1.6, fontWeight: '800' as const },
  introTitle: { ...type.title, color: palette.textPrimary, textAlign: 'center', marginBottom: spacing.s },
  introCopy: { ...type.body, color: palette.textMuted, textAlign: 'center', marginBottom: spacing.l, maxWidth: rs(340) },
  introStats: {
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.m,
    width: '100%',
    gap: rs(8),
    marginBottom: spacing.l,
  },
  statLine: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  statLineText: { ...type.small, color: palette.textPrimary, flex: 1 },

  quizHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    gap: spacing.s,
  },
  timerPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    paddingVertical: rs(6),
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.pill,
  },
  timerText: { ...type.h3, color: palette.warn },
  qIndex: { ...type.body, color: palette.textMuted, fontWeight: '700' as const },
  progressBar: {
    marginHorizontal: spacing.l,
    height: rs(4),
    borderRadius: rs(2),
    backgroundColor: 'rgba(120,165,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },

  quizBody: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: rs(140),
  },
  prompt: { ...type.h2, color: palette.textPrimary, marginBottom: spacing.s },
  imgBox: {
    height: rs(180),
    borderRadius: radii.lg,
    backgroundColor: palette.bgCard,
    marginBottom: spacing.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.border,
  },
  imgFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', resizeMode: 'cover' },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: rs(12),
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
    gap: spacing.s,
  },
  optCorrect: { borderColor: palette.ok, backgroundColor: 'rgba(122,229,130,0.15)' },
  optWrong: { borderColor: palette.rose, backgroundColor: 'rgba(255,85,119,0.15)' },
  optReveal: { borderColor: palette.ok, backgroundColor: 'rgba(122,229,130,0.08)' },
  optLetter: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    backgroundColor: 'rgba(120,165,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  optLetterCorrect: { backgroundColor: palette.ok, borderColor: palette.ok },
  optLetterWrong: { backgroundColor: palette.rose, borderColor: palette.rose },
  optLetterText: { ...type.small, color: '#FFFFFF', fontWeight: '800' as const },
  optText: { ...type.body, color: palette.textPrimary, flex: 1 },

  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    backgroundColor: 'rgba(4,13,36,0.96)',
    borderTopWidth: 1,
    borderTopColor: palette.divider,
    flexDirection: 'row',
    gap: spacing.s,
  },

  resultBody: { paddingHorizontal: spacing.l, paddingTop: spacing.s, paddingBottom: rs(160) },
  scoreBox: {
    alignItems: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.l,
    borderRadius: radii.xl,
    borderWidth: 2,
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  scoreBig: { fontSize: rs(54), lineHeight: rs(58), fontWeight: '800' as const, letterSpacing: -1 },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    paddingHorizontal: rs(12),
    paddingVertical: rs(4),
    borderWidth: 1,
    borderRadius: radii.pill,
    marginTop: spacing.s,
  },
  rankText: { ...type.small, fontWeight: '800' as const, letterSpacing: 0.5 },
  pct: { ...type.body, color: palette.textMuted, marginTop: spacing.s },

  resultsList: {
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.m,
  },
  resultsLabel: { ...type.micro, color: palette.textMuted, marginBottom: spacing.s },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: rs(10), paddingVertical: rs(6) },
  resultDot: { width: rs(10), height: rs(10), borderRadius: rs(5) },
  resultPrompt: { ...type.small, color: palette.textPrimary, fontWeight: '700' as const },
  resultPicked: { ...type.small, color: palette.textMuted, fontSize: rs(11) },
  resultPickedOk: { ...type.small, color: palette.ok, fontSize: rs(11), fontWeight: '700' as const },
});
