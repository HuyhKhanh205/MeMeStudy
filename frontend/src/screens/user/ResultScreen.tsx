import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ComponentProps } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CircleButton,
  GameBoard,
  GameButton,
  StarIcon,
  SunnyBackground,
  WoodLabel,
} from '../../components/game';
import Emoji from '../../components/Emoji';
import { CountUp, Float, PopIn } from '../../components/motion';
import { formatSeconds } from '../../hooks/useCountdown';
import type { UserStackParamList } from '../../navigation/types';
import { gameColors, gameFonts, gameGradients, gameShadows } from '../../theme';

type Props = NativeStackScreenProps<UserStackParamList, 'Result'>;

function headline(ratio: number): string {
  if (ratio >= 0.8) return 'Hoàn thành xuất sắc!';
  if (ratio >= 0.5) return 'Làm tốt lắm!';
  return 'Cố gắng lần sau nhé!';
}

/** 3 sao: 100% → 3, ≥70% → 2 (như Figma 8/10), ≥40% → 1. */
function starCount(ratio: number): number {
  if (ratio >= 1) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
}

type IconName = ComponentProps<typeof Ionicons>['name'];

function StatChip({ icon, color, text }: { icon: IconName; color: string; text: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

/** Màn kết quả — Figma "A4 · Kết quả & phần thưởng" (Style A – Game hoá). */
export default function ResultScreen({ navigation, route }: Props) {
  const { result, durationSeconds } = route.params;
  const insets = useSafeAreaInsets();

  const total = result.totalQuestions;
  const ratio = total ? result.correctCount / total : 0;
  const stars = starCount(ratio);
  const wrongCount = total - result.correctCount;
  const wrongNumbers = (result.review ?? [])
    .map((r, i) => (r.correct ? null : i + 1))
    .filter((n): n is number => n != null);

  return (
    <SunnyBackground>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 4 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.headerRow}>
            <CircleButton
              icon="close"
              tone="red"
              accessibilityLabel="Đóng"
              onPress={() => navigation.navigate('Tabs', { screen: 'RoundList' })}
            />
            <View style={styles.headerTitle} pointerEvents="none">
              <WoodLabel text="Kết quả" />
            </View>
          </View>

          {/* Cú mèo đội mũ tốt nghiệp như mascot Figma: ghép 2 Fluent Emoji. */}
          {/* Cú mèo nảy vào rồi nhấp nhô vui vẻ. */}
          <PopIn style={styles.mascotWrap}>
            <Float distance={6}>
              <View style={styles.mascot}>
                <Emoji name="owl" size={116} />
                <Emoji name="graduationCap" size={62} style={styles.cap} />
              </View>
            </Float>
          </PopIn>

          <GameBoard style={styles.board}>
            <Text style={styles.headline}>{headline(ratio)}</Text>

            <View
              style={styles.stars}
              accessible
              accessibilityLabel={`Đạt ${stars} trên 3 sao`}
            >
              {/* 3 sao lần lượt nảy lên. */}
              <PopIn delay={400}>
                <StarIcon size={40} filled={stars >= 1} />
              </PopIn>
              <PopIn delay={650}>
                <StarIcon size={52} filled={stars >= 2} />
              </PopIn>
              <PopIn delay={900}>
                <StarIcon size={40} filled={stars >= 3} />
              </PopIn>
            </View>

            <View style={styles.scoreRow}>
              <CountUp
                value={result.correctCount}
                delay={300}
                format={(n) => `${Math.round(n)}/${total}`}
                style={styles.score}
              />
              <Text style={styles.scoreLabel}>câu đúng</Text>
            </View>

            <View style={styles.chips}>
              {durationSeconds != null ? (
                <StatChip icon="time-outline" color="#1D4ED8" text={formatSeconds(durationSeconds)} />
              ) : null}
              <StatChip icon="checkmark-sharp" color="#22A35F" text={`Đúng ${result.correctCount}`} />
              <StatChip icon="close-sharp" color="#E8475E" text={`Sai ${wrongCount}`} />
            </View>

            <PopIn delay={1100}>
              <LinearGradient colors={gameGradients.orangeButton} style={styles.reward}>
                <StarIcon size={20} />
                <Text style={styles.rewardText}>Điểm: {result.score}</Text>
              </LinearGradient>
            </PopIn>

            <Text style={styles.roundTitle} numberOfLines={2}>
              Đề: {result.roundTitle}
            </Text>
          </GameBoard>

          {wrongNumbers.length > 0 ? (
            <View style={styles.review}>
              <WoodLabel text="Câu cần ôn lại" fontSize={15} style={styles.reviewLabel} />
              <View style={styles.reviewChips}>
                {wrongNumbers.map((n) => (
                  <View key={n} style={styles.reviewChip}>
                    <Text style={styles.reviewChipText}>Câu {n}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.spacer} />

          <GameButton
            label="Thi lại"
            pulse
            style={styles.retry}
            onPress={() =>
              navigation.replace('Exam', { roundId: result.roundId, roundTitle: result.roundTitle })
            }
          />
          <Pressable
            accessibilityRole="link"
            onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
            hitSlop={8}
            style={styles.homeLink}
          >
            <Text style={styles.homeLinkText}>Về trang chủ</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SunnyBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  page: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  headerRow: {
    height: 47,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotWrap: {
    alignSelf: 'center',
  },
  mascot: {
    width: 128,
    height: 128,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cap: {
    position: 'absolute',
    top: -2,
    transform: [{ rotate: '-8deg' }],
  },
  board: {
    marginTop: 12,
    alignItems: 'center',
    gap: 10,
  },
  headline: {
    fontFamily: gameFonts.display,
    fontSize: 28,
    color: gameColors.orangeDark,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontFamily: gameFonts.display,
    fontSize: 46,
    lineHeight: 74,
    color: gameColors.ink,
  },
  scoreLabel: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 16,
    color: gameColors.inkMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: gameColors.chipBorder,
    backgroundColor: '#ffffff',
  },
  chipText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: gameColors.ink,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    boxShadow: gameShadows.rewardPill,
  },
  rewardText: {
    fontFamily: gameFonts.display,
    fontSize: 16,
    color: '#ffffff',
  },
  roundTitle: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: gameColors.inkMuted,
    textAlign: 'center',
  },
  review: {
    marginTop: 16,
    gap: 4,
  },
  reviewLabel: {
    alignSelf: 'flex-start',
  },
  reviewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: gameColors.red,
    backgroundColor: gameColors.reviewFill,
  },
  reviewChipText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: gameColors.redDark,
  },
  spacer: {
    flexGrow: 1,
    minHeight: 12,
  },
  retry: {
    alignSelf: 'center',
  },
  homeLink: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  homeLinkText: {
    fontFamily: gameFonts.display,
    fontSize: 17,
    color: '#ffffff',
  },
});
