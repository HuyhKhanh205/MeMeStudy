import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WoodLabel } from '../game';
import Emoji from '../Emoji';
import { gameFonts } from '../../theme';

interface Props {
  onPracticeRound: () => void;
  onPracticeTopic: () => void;
}

export default function PracticeCard({ onPracticeRound, onPracticeTopic }: Props) {
  return (
    <View style={styles.container}>
      <WoodLabel text="Ôn tập nhanh" fontSize={15} style={styles.woodLabel} />

      <View style={styles.row}>
        {/* Lựa chọn 1: Ôn theo vòng */}
        <Pressable
          accessibilityRole="button"
          onPress={onPracticeRound}
          style={({ pressed }) => [styles.card, styles.roundCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.iconCircleBlue}>
            <Emoji name="memo" size={24} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>Ôn theo vòng</Text>
            <Text style={styles.sub}>3 bài · 30 câu</Text>
          </View>
          <View style={[styles.arrowCircle, { backgroundColor: '#3b82f6' }]}>
            <Ionicons name="arrow-forward" size={14} color="#ffffff" />
          </View>
        </Pressable>

        {/* Lựa chọn 2: Luyện theo chủ đề */}
        <Pressable
          accessibilityRole="button"
          onPress={onPracticeTopic}
          style={({ pressed }) => [styles.card, styles.topicCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.iconCirclePurple}>
            <Emoji name="star" size={24} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>Luyện theo chủ đề</Text>
            <Text style={styles.sub}>Từ vựng · Ngữ pháp · Nghe</Text>
          </View>
          <View style={[styles.arrowCircle, { backgroundColor: '#a855f7' }]}>
            <Ionicons name="arrow-forward" size={14} color="#ffffff" />
          </View>
        </Pressable>
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2.5,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  roundCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    boxShadow: '0px 4px 0px 0px #3b82f6',
  },
  topicCard: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
    boxShadow: '0px 4px 0px 0px #a855f7',
  },
  iconCircleBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCirclePurple: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    gap: 2,
    marginTop: 8,
  },
  title: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#1e293b',
  },
  sub: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
});

