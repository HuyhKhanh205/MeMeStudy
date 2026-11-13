import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleButton } from '../game';
import Emoji from '../Emoji';
import { Float } from '../motion';
import { gameColors, gameFonts, spacing } from '../../theme';
import type { StudentInfo } from '../../services/mock/data';

interface Props {
  student: StudentInfo;
  onPressProfile?: () => void;
}

export default function StudentHeader({ student, onPressProfile }: Props) {
  const initials = student.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.wrap}>
      {/* 1. Thanh logo trên cùng */}
      <View style={styles.topRow}>
        <View style={styles.brandLeft}>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>MeMeStudy</Text>
            <View style={styles.langPill}>
              <Text style={styles.langText}>VI</Text>
            </View>
          </View>
          <View style={styles.sloganPill}>
            <Text style={styles.sloganText}>Học vui – Ôn tốt – Cùng MeMe!</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mở hồ sơ cá nhân"
            onPress={onPressProfile}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
          <CircleButton
            icon="settings-sharp"
            accessibilityLabel="Hồ sơ cá nhân"
            onPress={onPressProfile ?? (() => {})}
            tone="blue"
          />
        </View>
      </View>

      {/* 2. Thẻ chào hỏi học sinh + Mascot + Điểm sao & Streak */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeInfo}>
          <Text style={styles.greetingText}>Xin chào, {student.name}!</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Tài khoản {student.role.toLowerCase()}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statChip, styles.coinChip]}>
              <Ionicons name="star" size={15} color="#eab308" />
              <Text style={styles.statChipText}>{student.coins} xu</Text>
            </View>
            <View style={[styles.statChip, styles.streakChip]}>
              <Ionicons name="flame" size={16} color="#f97316" />
              <Text style={styles.statChipText}>{student.streakDays} ngày liên tiếp</Text>
            </View>
          </View>
        </View>

        <Float distance={6} duration={2500} style={styles.mascotWrap}>
          <Emoji name="owl" size={72} />
          <View style={styles.gradCap}>
            <Emoji name="graduationCap" size={36} />
          </View>
        </Float>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandLeft: {
    gap: 4,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontFamily: gameFonts.display,
    fontSize: 32,
    lineHeight: 36,
    color: '#ffffff',
    textShadowColor: '#1d4ed8',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 1,
  },
  langPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  langText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 10,
    color: '#1d4ed8',
  },
  sloganPill: {
    backgroundColor: gameColors.orange,
    borderWidth: 2,
    borderColor: '#ffcf96',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  sloganText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff0d6',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 0px 0px #b8743a',
  },
  avatarText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#b8743a',
  },

  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#bfdbfe',
    padding: spacing.md,
    boxShadow: '0px 4px 0px 0px #93c5fd',
  },
  welcomeInfo: {
    flex: 1,
    gap: 6,
  },
  greetingText: {
    fontFamily: gameFonts.display,
    fontSize: 20,
    color: '#1e293b',
  },
  roleBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#1d4ed8',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  coinChip: {
    backgroundColor: '#fef9c3',
    borderColor: '#fde047',
  },
  streakChip: {
    backgroundColor: '#ffedd5',
    borderColor: '#fdba74',
  },
  statChipText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#334155',
  },
  mascotWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 8,
  },
  gradCap: {
    position: 'absolute',
    top: -12,
    left: 14,
    transform: [{ rotate: '-12deg' }],
  },
});

