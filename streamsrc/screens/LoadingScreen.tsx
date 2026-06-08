import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { palette, radii, rs, screen, spacing, type } from '../theme/palette';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PATH_LENGTH = 600;

export const LoadingScreen: React.FC<{ onComplete?: () => void; durationMs?: number }> = ({
  durationMs = 5000,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;
  const bubbleTimers = useRef<ReturnType<typeof setTimeout>[]>([]).current;
  const bubbles = useRef(
    Array.from({ length: 7 }).map(() => ({
      y: new Animated.Value(0),
      o: new Animated.Value(0),
      x: Math.random() * (screen.width - rs(40)) + rs(20),
      delay: Math.random() * 1400,
      size: rs(4 + Math.random() * 8),
    })),
  ).current;

  useEffect(() => {
    const progressAnimation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
    );
    progressAnimation.start();

    Animated.loop(
      Animated.timing(wave1, {
        toValue: 1,
        duration: 4500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(wave2, {
        toValue: 1,
        duration: 6200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    bubbles.forEach((b) => {
      const run = () => {
        b.o.setValue(0);
        b.y.setValue(0);
        Animated.parallel([
          Animated.timing(b.o, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(b.y, {
            toValue: 1,
            duration: 3500 + Math.random() * 1500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.timing(b.o, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => run());
        });
      };
      bubbleTimers.push(setTimeout(run, b.delay));
    });

    return () => {
      bubbleTimers.forEach(clearTimeout);
      bubbleTimers.length = 0;
      progressAnimation.stop();
    };
  }, [progress, wave1, wave2, ringSpin, bubbles, durationMs]);

  const wave1Translate = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -screen.width],
  });
  const wave2Translate = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [-screen.width, 0],
  });
  const spinDeg = ringSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const orbitDash = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [PATH_LENGTH, 0],
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#020A1A', '#062047', '#020A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.wavesBox} pointerEvents="none">
        <Animated.View style={[styles.waveRow, { transform: [{ translateX: wave1Translate }] }]}>
          <WaveStrip color="rgba(46,107,255,0.25)" />
          <WaveStrip color="rgba(46,107,255,0.25)" />
        </Animated.View>
        <Animated.View style={[styles.waveRow2, { transform: [{ translateX: wave2Translate }] }]}>
          <WaveStrip color="rgba(91,217,255,0.18)" />
          <WaveStrip color="rgba(91,217,255,0.18)" />
        </Animated.View>
      </View>

      {bubbles.map((b, i) => {
        const ty = b.y.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -rs(220)],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.bubble,
              {
                left: b.x,
                width: b.size,
                height: b.size,
                borderRadius: b.size / 2,
                opacity: b.o,
                transform: [{ translateY: ty }],
              },
            ]}
          />
        );
      })}

      <View style={styles.center}>
        <View style={styles.logoStack}>
          <Animated.View style={[styles.logoBox, { transform: [{ rotate: spinDeg }] }]}>
            <Svg width={rs(160)} height={rs(160)} viewBox="0 0 200 200">
              <Circle cx={100} cy={100} r={90} stroke="rgba(91,217,255,0.18)" strokeWidth={2} fill="none" />
              <AnimatedCircle
                cx={100}
                cy={100}
                r={90}
                stroke={palette.accent}
                strokeWidth={4}
                fill="none"
                strokeDasharray={`${PATH_LENGTH} ${PATH_LENGTH}`}
                strokeDashoffset={orbitDash}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </Svg>
          </Animated.View>
          <View style={styles.logoCore} pointerEvents="none">
            <Svg width={rs(90)} height={rs(90)} viewBox="0 0 100 100">
              <Path
                d="M10 50 C 25 30, 45 30, 60 50 L 75 40 L 75 60 L 60 50 C 45 70, 25 70, 10 50 Z"
                fill={palette.primary}
                opacity={0.9}
              />
              <Circle cx={22} cy={47} r={2.5} fill="#FFFFFF" />
              <Path
                d="M10 50 C 25 35, 45 35, 60 50"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1.5}
                fill="none"
              />
            </Svg>
          </View>
        </View>

        <Text style={styles.brand}>JAPAN EXPLORER</Text>
        <Text style={styles.tagline}>Marine routes across the Japanese coast</Text>

        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { transform: [{ scaleX: progressWidth }] }]}> 
            <LinearGradient
              colors={['#5BD9FF', '#2E6BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <Animated.Text style={styles.progressLabel}>
          Charting the tide
        </Animated.Text>
      </View>
    </View>
  );
};

const WaveStrip: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={screen.width} height={rs(140)} viewBox={`0 0 ${screen.width} 140`}>
    <AnimatedPath
      d={`M0 80 Q ${screen.width * 0.25} 30 ${screen.width * 0.5} 80 T ${screen.width} 80 L ${screen.width} 140 L 0 140 Z`}
      fill={color}
    />
  </Svg>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bgDeep, overflow: 'hidden' },
  wavesBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: rs(280),
  },
  waveRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: screen.width * 2,
  },
  waveRow2: {
    position: 'absolute',
    bottom: rs(40),
    flexDirection: 'row',
    width: screen.width * 2,
  },
  bubble: {
    position: 'absolute',
    bottom: rs(100),
    backgroundColor: 'rgba(91,217,255,0.55)',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  logoStack: {
    width: rs(160),
    height: rs(160),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: rs(160),
    height: rs(160),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCore: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    ...type.title,
    color: palette.textPrimary,
    marginTop: spacing.xl,
    letterSpacing: rs(2),
  },
  tagline: {
    ...type.small,
    color: palette.textMuted,
    marginTop: rs(6),
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  progressBar: {
    width: rs(220),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: 'rgba(120,165,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: rs(3),
    overflow: 'hidden',
    transformOrigin: 'left',
  },
  progressLabel: {
    ...type.micro,
    color: palette.cyan,
    marginTop: rs(10),
    textTransform: 'uppercase',
  },
});
