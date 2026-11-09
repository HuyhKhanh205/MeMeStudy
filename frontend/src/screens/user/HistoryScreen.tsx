import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleButton, WoodLabel } from '../../components/game';
import Emoji from '../../components/Emoji';
import EmojiBadge from '../../components/EmojiBadge';
import { Animated, listEntering } from '../../components/motion';
import type { UserStackParamList } from '../../navigation/types';
import {
  getRoundRank,
  getRuntimeAttempts,
  seasons,
  subscribeToStore,
  type ExamAttempt,
  type Season,
} from '../../services/mock/data';
import { colors, gameFonts, spacing, typography } from '../../theme';

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
  const insets = useSafeAreaInsets();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('2026-2027');
  const [attempts, setAttempts] = useState<ExamAttempt[]>(getRuntimeAttempts());
  const [expandedRoundIds, setExpandedRoundIds] = useState<Record<number, boolean>>({
    1: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Ẩn thanh header mặc định của Tab để hiển thị trọn vẹn nền trời của Home.png
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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

  // Tính điểm vòng = cộng từ 3 bài thi (thang điểm tối đa 300)
  for (const group of groupedRounds) {
    group.exams.sort((x, y) => x.examOrder - y.examOrder);
    group.roundScore = group.exams.reduce((acc, curr) => acc + curr.score, 0);
  }

  const toggleExpand = (roundId: number) => {
    setExpandedRoundIds((prev) => ({ ...prev, [roundId]: !prev[roundId] }));
  };

  // Mở màn hình xem lại kết quả bài thi (không chấm lại, không cho thi lại bài đã xong)
  const handleViewAttemptDetail = (attempt: ExamAttempt) => {
    (navigation.navigate as any)('Result', {
      result: {
        attemptId: attempt.id,
        roundId: attempt.roundId,
        roundTitle: attempt.roundTitle,
        examId: attempt.examId,
        examOrder: attempt.examOrder,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        submittedAt: attempt.submittedAt,
        review: attempt.review?.map((r) => ({
          questionId: r.questionId,
          correct: r.correct,
          choiceId: r.choiceId,
        })),
      },
      durationSeconds: attempt.durationSeconds,
      fromHistory: true,
    });
  };

  // Thống kê đợt
  const totalRoundsParticipated =
    selectedSeason.id === '2025-2026'
      ? selectedSeason.totalRoundsParticipated ?? 15
      : groupedRounds.length;

  // Điểm cao nhất tính theo điểm vòng (thang điểm 300)
  const highestScore =
    selectedSeason.id === '2025-2026'
      ? '295/300'
      : groupedRounds.length
        ? `${Math.max(...groupedRounds.map((g) => g.roundScore))}/300`
        : '0/300';

  return (
    <ImageBackground
      source={require('../../../assets/background/Home.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <FlatList
        data={groupedRounds}
        keyExtractor={(item) => String(item.roundId)}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 36,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Thanh tiêu đề trên cùng */}
            <View style={styles.topBar}>
              <WoodLabel text="Lịch sử bài thi" fontSize={18} />
              <CircleButton
                icon="home"
                accessibilityLabel="Về trang chủ"
                onPress={() => (navigation as any).navigate('Home')}
                tone="blue"
              />
            </View>

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
                  Đợt thi này đã kết thúc. Bạn có thể bấm vào từng bài để xem lại chi tiết bài làm.
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
          <View style={styles.emptyCard}>
            <Emoji name="owl" size={84} />
            <Text style={styles.emptyText}>Bạn chưa có bài làm nào trong đợt này.</Text>
            <Text style={styles.emptySub}>
              Hãy bắt đầu tham gia các vòng thi để tích lũy điểm và huy hiệu nhé!
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => (navigation as any).navigate('RoundList')}
              style={styles.exploreBtn}
            >
              <Text style={styles.exploreBtnText}>Khám phá vòng thi ngay →</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => {
          const isExpanded = !!expandedRoundIds[item.roundId];

          return (
            <Animated.View entering={listEntering(index)}>
              <View style={styles.roundCardBox}>
                {/* Header vòng */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toggleExpand(item.roundId)}
                  style={styles.roundHeaderRow}
                >
                  <EmojiBadge
                    name={item.exams.length === 3 && item.roundScore >= 180 ? 'trophy' : 'memo'}
                    tone={item.exams.length === 3 && item.roundScore >= 180 ? 'cream' : 'mint'}
                    size={46}
                  />

                  <View style={styles.roundMainInfo}>
                    <Text style={styles.roundTitle} numberOfLines={1}>
                      {item.roundTitle}
                    </Text>
                    <Text style={styles.roundSub}>
                      {item.exams.length}/3 bài thi · Ngày {formatDateTime(item.latestDate)}
                    </Text>
                  </View>

                  <View style={styles.roundScoreCol}>
                    <Text style={styles.roundScoreNumber}>{item.roundScore}</Text>
                    <Text style={styles.roundScoreLabel}>/300 điểm vòng</Text>
                    {item.exams.length === 3 && (
                      <View
                        style={[
                          styles.rankTag,
                          { backgroundColor: getRoundRank(item.roundScore).color + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankTagText,
                            { color: getRoundRank(item.roundScore).color },
                          ]}
                        >
                          {getRoundRank(item.roundScore).label}
                        </Text>
                      </View>
                    )}
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
              </View>
            </Animated.View>
          );
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5CB4F8',
    width: '100%',
     height:"100%"
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  headerArea: {
    gap: 10,
    marginBottom: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderWidth: 2,
    borderColor: '#bfdbfe',
    boxShadow: '0px 2px 0px 0px #93c5fd',
  },
  seasonTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
    boxShadow: '0px 2px 0px 0px #1e40af',
  },
  seasonTabText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
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
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 10,
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
    borderWidth: 2.5,
    borderColor: '#bfdbfe',
    padding: spacing.md,
    gap: 10,
    boxShadow: '0px 4px 0px 0px #60a5fa',
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
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 17,
    color: '#1d4ed8',
  },
  overviewDates: {
    fontFamily: gameFonts.bodyBold,
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
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
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
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  statValue: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#1e293b',
  },
  statValueHighlight: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#16a34a',
  },
  archiveHelp: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  listSectionHeader: {
    marginTop: 4,
  },
  listSectionTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#ffffff',
    textShadowColor: '#1d4ed8',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 20,
    boxShadow: '0px 3px 0px 0px #60a5fa',
  },
  emptyText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#1e293b',
  },
  emptySub: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  exploreBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 6,
  },
  exploreBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#ffffff',
  },
  roundCardBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#bfdbfe',
    padding: spacing.md,
    gap: 8,
    boxShadow: '0px 4px 0px 0px #60a5fa',
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
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: colors.text,
  },
  roundSub: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  roundScoreCol: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  roundScoreNumber: {
    fontFamily: gameFonts.display,
    fontSize: 20,
    color: '#1d4ed8',
  },
  roundScoreLabel: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 9,
    color: colors.textMuted,
  },
  rankTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 2,
    alignItems: 'center',
  },
  rankTagText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 9,
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
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
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
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#1d4ed8',
  },
  examDetail: {
    flex: 1,
    gap: 2,
  },
  examTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: colors.text,
  },
  examMeta: {
    fontFamily: gameFonts.bodyBold,
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
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#1d4ed8',
  },
});
