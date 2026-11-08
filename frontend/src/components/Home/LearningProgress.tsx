import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { WoodLabel } from '../game';
import { gameFonts, spacing } from '../../theme';

interface Props {
  completed: number;
  total: number;
  quote?: string;
}

export default function LearningProgress({
  completed,
  total,
  quote = 'Cố gắng hoàn thành thêm bài học nhé!',
}: Props) {
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <View style={styles.container}>
      <WoodLabel text="Tiến độ học tập" fontSize={15} style={styles.woodLabel} />

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Tổng số bài đã xong</Text>
          <Text style={styles.scoreText}>
            {completed}/{total} bài ({percent}%)
          </Text>
        </View>

        {/* Thanh tiến độ */}
        <View style={styles.track}>
          <View style={[styles.bar, { width: `${percent}%` }]} />
        </View>

        {/* Câu động viên */}
        <View style={styles.quoteRow}>
          <Ionicons name="sparkles" size={16} color="#eab308" />
          <Text style={styles.quoteText}>{quote}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  woodLabel: {
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#bbf7d0',
    padding: spacing.md,
    gap: 8,
    boxShadow: '0px 4px 0px 0px #22c55e',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#334155',
  },
  scoreText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#16a34a',
  },
  track: {
    height: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  bar: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 7,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  quoteText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#15803d',
  },
});

