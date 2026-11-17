import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WoodLabel } from '../game';
import { gameFonts, gameGradients, spacing } from '../../theme';
import type { TeacherAssignment } from '../../services/mock/data';

interface Props {
  assignments: TeacherAssignment[];
  onStartAssignment: (item: TeacherAssignment) => void;
  onViewResult: (item: TeacherAssignment) => void;
}

export default function AssignmentCard({
  assignments,
  onStartAssignment,
  onViewResult,
}: Props) {
  const pendingCount = assignments.filter((a) => !a.isCompleted).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <WoodLabel text="Đề kiểm tra giáo viên giao" fontSize={15} />
        {pendingCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{pendingCount} đề mới</Text>
          </View>
        )}
      </View>

      <View style={styles.list}>
        {assignments.map((item) => {
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.docIconBox}>
                <Ionicons
                  name={item.isCompleted ? 'checkmark-done-circle' : 'document-text'}
                  size={24}
                  color={item.isCompleted ? '#16a34a' : '#0284c7'}
                />
              </View>

              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.meta}>
                  {item.questionCount} câu · {item.durationMinutes} phút · Hạn {item.deadline}
                </Text>

                {item.isCompleted ? (
                  <View style={styles.completedTag}>
                    <Text style={styles.completedTagText}>
                      Đã làm: <Text style={styles.scoreHighlight}>{item.score}/100 đ</Text>
                    </Text>
                  </View>
                ) : (
                  <View style={styles.pendingTag}>
                    <Text style={styles.pendingTagText}>Chưa làm</Text>
                  </View>
                )}
              </View>

              {item.isCompleted ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onViewResult(item)}
                  style={styles.actionBtnOutline}
                >
                  <Text style={styles.btnOutlineText}>Xem kết quả →</Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onStartAssignment(item)}
                  style={styles.actionBtnGradient}
                >
                  <LinearGradient
                    colors={gameGradients.greenAnswer}
                    style={styles.gradientBtn}
                  >
                    <Text style={styles.btnText}>Bắt đầu làm bài →</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  countText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#ffffff',
  },
  list: {
    gap: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fffdfa',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#fed7aa',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0px 4px 0px 0px #fb923c',
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#1e293b',
  },
  meta: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  completedTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  completedTagText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#15803d',
  },
  scoreHighlight: {
    fontFamily: gameFonts.bodyExtraBold,
    color: '#16a34a',
  },
  pendingTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pendingTagText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#dc2626',
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: '#1d4ed8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
  },
  btnOutlineText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#1d4ed8',
  },
  actionBtnGradient: {
    borderRadius: 14,
    boxShadow: '0px 3px 0px 0px #1e8a52',
  },
  gradientBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
  },
  btnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#ffffff',
  },
});

