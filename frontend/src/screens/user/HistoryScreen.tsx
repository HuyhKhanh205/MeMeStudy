import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Card from '../../components/Card';
import Emoji from '../../components/Emoji';
import EmojiBadge from '../../components/EmojiBadge';
import Screen from '../../components/Screen';
import { Animated, listEntering } from '../../components/motion';
import type { UserStackParamList } from '../../navigation/types';
import {
  getRuntimeAttempts,
  seasons,
  subscribeToStore,
  type ExamAttempt,
  type Season,
} from '../../services/mock/data';
import { colors, radius, spacing, typography } from '../../theme';

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

interface GroupedRound {
  roundId: number;
  roundTitle: string;
  seasonId: string;
  exams: ExamAttempt[];
  roundScore: number;
  latestDate: string;
}

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('2026-2027');
  const [attempts, setAttempts] = useState<ExamAttempt[]>(getRuntimeAttempts());
  const [expandedRoundIds, setExpandedRoundIds] = useState<Record<number, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAttempts([...getRuntimeAttempts()]);
      const unsub = subscribeToStore(() => {
        setAttempts([...getRuntimeAttempts()]);
      });
      return unsub;
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setAttempts([...getRuntimeAttempts()]);
    setTimeout(() => setRefreshing(false), 300);
  };

  const selectedSeason: Season =
    seasons.find((s) => s.id === selectedSeasonId) ?? seasons[0];

  // Lọc các attempt thuộc đợt đang chọn
  const seasonAttempts = attempts.filter((a) => a.seasonId === selectedSeasonId);

  // Nhóm attempts theo từng vòng thi
  const groupedRounds: GroupedRound[] = [];
  for (const a of seasonAttempts) {
    let group = groupedRounds.find((g) => g.roundId === a.roundId);
    if (!group) {
      group = {
        roundId: a.roundId,
        roundTitle: a.roundTitle,
        seasonId: a.seasonId,
        exams: [],
        roundScore: 0,
        latestDate: a.submittedAt,
      };
      groupedRounds.push(group);
    }
    // Tránh trùng bài thi nếu đã làm lại
    if (!group.exams.some((e) => e.examId === a.examId)) {
      group.exams.push(a);
    }
  }

  // Tính điểm vòng trung bình cho từng nhóm
  for (const group of groupedRounds) {
    group.exams.sort((x, y) => x.examOrder - y.examOrder);
    const sum = group.exams.reduce((acc, curr) => acc + curr.score, 0);
    group.roundScore = group.exams.length ? Math.round(sum / group.exams.length) : 0;
  }

  const toggleExpand = (roundId: number) => {
    setExpandedRoundIds((prev) => ({ ...prev, [roundId]: !prev[roundId] }));
  };

  // Mở màn hình xem lại kết quả bài thi
  const handleViewAttemptDetail = (attempt: ExamAttempt) => {
    navigation.navigate('Result', {
      result: {
        attemptId: attempt.id,
        roundId: attempt.roundId,
        roundTitle: attempt.roundTitle,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        submittedAt: attempt.submittedAt,
        review: attempt.review?.map((r) => ({ questionId: r.questionId, correct: r.correct })),
      },
      durationSeconds: attempt.durationSeconds,
    });
  };

  // Thống kê đợt
  const totalRoundsParticipated =
    selectedSeason.id === '2025-2026'
      ? selectedSeason.totalRoundsParticipated ?? 15
      : groupedRounds.length;

  const highestScore =
    selectedSeason.id === '2025-2026'
      ? '295/300'
      : seasonAttempts.length
        ? `${Math.max(...seasonAttempts.map((a) => a.score))}/100`
        : '0/100';

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        data={groupedRounds}
        keyExtractor={(item) => String(item.roundId)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* 1. Bộ lọc chọn đợt thi (Season Filter Tabs) */}
            <View style={styles.seasonTabsRow}>
              {seasons.map((season) => {
                const isSelected = season.id === selectedSeasonId;
                const isArchived = season.status === 'ARCHIVED';

                return (
                  <Pressable
                    key={season.id}
                    accessibilityRole="button"
                    onPress={() => setSelectedSeasonId(season.id)}
                    style={[styles.seasonTab, isSelected && styles.seasonTabActive]}
                  >
                    <Text
                      style={[styles.seasonTabText, isSelected && styles.seasonTabTextActive]}
                    >
                      {season.name.replace('Đợt thi ', '')}
                    </Text>
                    <View
                      style={[
                        styles.seasonStatusTag,
                        isSelected ? styles.statusTagWhite : styles.statusTagGray,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          isSelected ? styles.statusTagTextSelected : styles.statusTagTextDefault,
                        ]}
                      >
                        {isArchived ? 'Đã kết thúc' : 'Đang diễn ra'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* 2. Tổng quan đợt đang chọn */}
            <View style={styles.overviewBox}>
              <View style={styles.overviewTop}>
                <View style={styles.overviewTitleCol}>
                  <Text style={styles.overviewTitle}>{selectedSeason.name}</Text>
                  <Text style={styles.overviewDates}>
                    {selectedSeason.startDate} – {selectedSeason.endDate}
                  </Text>
                </View>

                {selectedSeason.status === 'ARCHIVED' && (
                  <View style={styles.archiveNoticeBadge}>
                    <Ionicons name="archive-outline" size={14} color="#64748b" />
                    <Text style={styles.archiveNoticeText}>Lưu trữ</Text>
                  </View>
                )}
              </View>

              <View style={styles.overviewStatsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Vòng đã tham gia</Text>
                  <Text style={styles.statValue}>{totalRoundsParticipated} vòng</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Điểm cao nhất</Text>
                  <Text style={styles.statValueHighlight}>{highestScore}</Text>
                </View>
              </View>

              {selectedSeason.status === 'ARCHIVED' && (
                <Text style={styles.archiveHelp}>
                  Đợt thi này đã kết thúc. Bạn có thể bấm vào từng bài để xem lại kết quả đã làm.
                </Text>
              )}
            </View>

            <View style={styles.listSectionHeader}>
              <Text style={styles.listSectionTitle}>
                Danh sách vòng đã thi ({groupedRounds.length}):
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Emoji name="owl" size={88} />
            <Text style={styles.emptyText}>Bạn chưa có bài làm nào trong đợt này.</Text>
            <Text style={styles.emptySub}>
              Hãy bắt đầu tham gia các vòng thi để tích lũy điểm và huy hiệu nhé!
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isExpanded = !!expandedRoundIds[item.roundId];

          return (
            <Animated.View entering={listEntering(index)}>
              <Card style={styles.roundCard}>
                {/* Header vòng */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toggleExpand(item.roundId)}
                  style={styles.roundHeaderRow}
                >
                  <EmojiBadge
                    name={item.roundScore >= 80 ? 'trophy' : 'memo'}
                    tone={item.roundScore >= 80 ? 'cream' : 'mint'}
                    size={46}
                  />

                  <View style={styles.roundMainInfo}>
                    <Text style={styles.roundTitle} numberOfLines={1}>
                      {item.roundTitle}
                    </Text>
                    <Text style={styles.roundSub}>
                      {item.exams.length} bài thi đã hoàn thành · Ngày {formatDateTime(item.latestDate)}
                    </Text>
                  </View>

                  <View style={styles.roundScoreCol}>
                    <Text style={styles.roundScoreNumber}>{item.roundScore}</Text>
                    <Text style={styles.roundScoreLabel}>Điểm vòng</Text>
                  </View>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#64748b"
                  />
                </Pressable>

                {/* Danh sách các bài thi thuộc vòng khi mở rộng */}
                {isExpanded && (
                  <View style={styles.examsList}>
                    <View style={styles.divider} />
                    <Text style={styles.examsSubTitle}>
                      Điểm chi tiết từng bài (Bấm vào bài để xem lại):
                    </Text>

                    {item.exams.map((examAttempt) => (
                      <Pressable
                        key={examAttempt.id}
                        accessibilityRole="button"
                        onPress={() => handleViewAttemptDetail(examAttempt)}
                        style={({ pressed }) => [
                          styles.examRow,
                          pressed && { backgroundColor: '#e2e8f0' },
                        ]}
                      >
                        <View style={styles.examLeft}>
                          <View style={styles.examOrderBadge}>
                            <Text style={styles.examOrderText}>{examAttempt.examOrder}</Text>
                          </View>
                          <View style={styles.examDetail}>
                            <Text style={styles.examTitle}>{examAttempt.examTitle}</Text>
                            <Text style={styles.examMeta}>
                              Đúng {examAttempt.correctCount}/{examAttempt.totalQuestions} câu ·{' '}
                              {formatDateTime(examAttempt.submittedAt)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.examScoreTag}>
                          <Text style={styles.examScoreValue}>{examAttempt.score}/100 đ</Text>
                          <Ionicons name="chevron-forward" size={14} color="#1d4ed8" />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </Card>
            </Animated.View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  noPadding: {
    padding: 0,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  headerArea: {
    gap: 12,
  },
  seasonTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seasonTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  seasonTabActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    boxShadow: '0px 2px 0px 0px #1d4ed8',
  },
  seasonTabText: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  seasonTabTextActive: {
    color: '#ffffff',
  },
  seasonStatusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusTagWhite: {
    backgroundColor: '#ffffff',
  },
  statusTagGray: {
    backgroundColor: '#f1f5f9',
  },
  statusTagText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTagTextSelected: {
    color: '#1d4ed8',
  },
  statusTagTextDefault: {
    color: '#64748b',
  },
  overviewBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    padding: spacing.md,
    gap: 10,
    boxShadow: '0px 3px 0px 0px #60a5fa',
  },
  overviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  overviewTitleCol: {
    gap: 2,
  },
  overviewTitle: {
    ...typography.heading,
    fontSize: 17,
    color: '#1d4ed8',
  },
  overviewDates: {
    ...typography.caption,
    fontSize: 12,
    color: '#64748b',
  },
  archiveNoticeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  archiveNoticeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  overviewStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#cbd5e1',
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748b',
  },
  statValue: {
    ...typography.heading,
    fontSize: 15,
    color: '#1e293b',
  },
  statValueHighlight: {
    ...typography.heading,
    fontSize: 15,
    color: '#16a34a',
  },
  archiveHelp: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  listSectionHeader: {
    marginTop: 4,
  },
  listSectionTitle: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  roundCard: {
    padding: spacing.md,
    borderRadius: 20,
    gap: 8,
  },
  roundHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roundMainInfo: {
    flex: 1,
    gap: 2,
  },
  roundTitle: {
    ...typography.heading,
    fontSize: 15,
    color: colors.text,
  },
  roundSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  roundScoreCol: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  roundScoreNumber: {
    ...typography.title,
    fontSize: 18,
    color: colors.primary,
  },
  roundScoreLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
  },
  examsList: {
    gap: 8,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  examsSubTitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  examLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  examOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examOrderText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  examDetail: {
    flex: 1,
    gap: 2,
  },
  examTitle: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  examMeta: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  examScoreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  examScoreValue: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
  },
});
