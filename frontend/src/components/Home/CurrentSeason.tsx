import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { WoodLabel } from '../game';
import { gameFonts, spacing } from '../../theme';
import type { ExamAttempt, Season, SeasonRound } from '../../services/mock/data';
import { getRoundScore } from '../../services/mock/data';

interface Props {
  season: Season;
  rounds: SeasonRound[];
  attempts: ExamAttempt[];
  onSelectRound: (round: SeasonRound) => void;
  onViewAllRounds: () => void;
}

export default function CurrentSeason({
  season,
  rounds,
  attempts,
  onSelectRound,
  onViewAllRounds,
}: Props) {
  const handlePressRound = (round: SeasonRound) => {
    if (round.status === 'LOCKED') {
      Alert.alert('Vòng thi chưa mở', 'Vòng này đang tạm khóa. Bạn hãy đón chờ mở vòng nhé!');
      return;
    }
    onSelectRound(round);
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề mục */}
      <View style={styles.headerBetween}>
        <WoodLabel text={season.name} fontSize={16} />
        <Pressable onPress={onViewAllRounds} hitSlop={8}>
          <Text style={styles.viewAllText}>Xem tất cả vòng thi →</Text>
        </Pressable>
      </View>

      <Text style={styles.subDesc}>Chọn vòng thi để tiếp tục hành trình</Text>

      {/* Danh sách các thẻ vòng */}
      <View style={styles.roundsList}>
        {rounds.map((round) => {
          const isCompleted = round.status === 'COMPLETED';
          const isInProgress = round.status === 'IN_PROGRESS';
          const isLocked = round.status === 'LOCKED';
          const score = isCompleted ? getRoundScore(round.id, attempts) : null;

          return (
            <Pressable
              key={round.id}
              accessibilityRole="button"
              onPress={() => handlePressRound(round)}
              style={({ pressed }) => [
                styles.roundCard,
                isCompleted && styles.roundCompleted,
                isInProgress && styles.roundInProgress,
                isLocked && styles.roundLocked,
                pressed && { opacity: 0.9 },
              ]}
            >
              {/* Cột số thứ tự */}
              <View
                style={[
                  styles.numberBadge,
                  isCompleted && styles.numBadgeGreen,
                  isInProgress && styles.numBadgeOrange,
                  isLocked && styles.numBadgeGray,
                ]}
              >
                <Text style={styles.numberText}>{round.roundNumber}</Text>
              </View>

              {/* Thông tin vòng */}
              <View style={styles.roundInfo}>
                <View style={styles.titleRow}>
                  <Text style={[styles.roundTitle, isLocked && styles.textMuted]}>
                    {round.title}
                  </Text>
                  {isLocked && <Ionicons name="lock-closed" size={16} color="#94a3b8" />}
                </View>

                {/* Nhãn trạng thái */}
                <View style={styles.statusRow}>
                  {isCompleted && (
                    <View style={styles.badgeCompleted}>
                      <Ionicons name="checkmark-circle" size={13} color="#16a34a" />
                      <Text style={styles.badgeCompletedText}>Đã hoàn thành</Text>
                      {score != null && (
                        <Text style={styles.scoreText}>· {score}/100 đ</Text>
                      )}
                    </View>
                  )}

                  {isInProgress && (
                    <View style={styles.badgeInProgress}>
                      <Ionicons name="flash" size={13} color="#f97316" />
                      <Text style={styles.badgeInProgressText}>Đang thi</Text>
                    </View>
                  )}

                  {isLocked && (
                    <View style={styles.badgeLocked}>
                      <Text style={styles.badgeLockedText}>Chưa mở</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Mũi tên */}
              <View
                style={[
                  styles.arrowCircle,
                  isCompleted && { backgroundColor: '#dcfce7' },
                  isInProgress && { backgroundColor: '#ffedd5' },
                  isLocked && { backgroundColor: '#e2e8f0' },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isLocked ? '#94a3b8' : isCompleted ? '#16a34a' : '#ea580c'}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 13,
    color: '#ffffff',
    textShadowColor: '#1d4ed8',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
  },
  subDesc: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#ffffff',
    textShadowColor: '#1d4ed8',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    marginTop: -2,
  },
  roundsList: {
    gap: 10,
    marginTop: 4,
  },
  roundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 2.5,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  roundCompleted: {
    borderColor: '#86efac',
    boxShadow: '0px 4px 0px 0px #4ade80',
  },
  roundInProgress: {
    borderColor: '#fdba74',
    boxShadow: '0px 4px 0px 0px #f97316',
  },
  roundLocked: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    boxShadow: '0px 4px 0px 0px #94a3b8',
    opacity: 0.85,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeGreen: {
    backgroundColor: '#16a34a',
  },
  numBadgeOrange: {
    backgroundColor: '#f97316',
  },
  numBadgeGray: {
    backgroundColor: '#94a3b8',
  },
  numberText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 16,
    color: '#ffffff',
  },
  roundInfo: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roundTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#0f172a',
  },
  textMuted: {
    color: '#64748b',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  badgeCompletedText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#16a34a',
  },
  scoreText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#15803d',
  },
  badgeInProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  badgeInProgressText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#ea580c',
  },
  badgeLocked: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeLockedText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

