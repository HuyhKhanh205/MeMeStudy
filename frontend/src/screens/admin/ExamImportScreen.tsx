import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import { File as FsFile } from 'expo-file-system';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Emoji from '../../components/Emoji';
import { Animated, Float, listEntering } from '../../components/motion';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import type { AdminStackParamList } from '../../navigation/types';
import {
  queryErrorMessage,
  useCreateExamMutation,
  useGetRoundsQuery,
  useImportExamFileMutation,
} from '../../store/api';
import { colors, radius, spacing } from '../../theme';
import type { DraftQuestion, ExamDraft } from '../../types';
import { confirm, showAlert } from '../../utils/confirm';

type Props = NativeStackScreenProps<AdminStackParamList, 'ExamImport'>;

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'text/plain',
];
const LETTERS = ['A', 'B', 'C', 'D'];

/** Hạn nộp mặc định: 7 ngày sau, dạng dd/MM như dữ liệu đề giao có sẵn. */
function defaultDeadline(): string {
  const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

/** Đọc file đã chọn thành base64: web dùng FileReader của DocumentPicker, điện thoại dùng expo-file-system. */
async function readBase64(asset: DocumentPicker.DocumentPickerAsset): Promise<string> {
  if (Platform.OS === 'web') {
    if (!asset.base64) throw new Error('Trình duyệt không đọc được file này.');
    return asset.base64.replace(/^data:[^,]*,/, '');
  }
  return new FsFile(asset.uri).base64();
}

/**
 * Giáo viên tải file đề (PDF / Word / ảnh chụp) → Gemini tách thành câu hỏi trắc nghiệm
 * → giáo viên xem lại, sửa đáp án → "Tạo bài kiểm tra" lưu vào MariaDB và giao cho học sinh.
 */
export default function ExamImportScreen({ navigation }: Props) {
  const { data: rounds } = useGetRoundsQuery();
  const openRounds = (rounds ?? []).filter((r) => r.isOpen);
  const [roundId, setRoundId] = useState<number | null>(null);
  const selectedRoundId = roundId ?? openRounds[openRounds.length - 1]?.id ?? null;

  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [draft, setDraft] = useState<ExamDraft | null>(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('15');
  const [deadline, setDeadline] = useState(defaultDeadline());

  const [importFile, importState] = useImportExamFileMutation();
  const [createExam, createState] = useCreateExamMutation();
  const [readError, setReadError] = useState<string | null>(null);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ACCEPTED_TYPES,
      copyToCacheDirectory: true,
      base64: true,
    });
    if (res.canceled || !res.assets[0]) return;
    const asset = res.assets[0];
    if (asset.size && asset.size > MAX_FILE_BYTES) {
      void showAlert(
        'File quá lớn',
        'Hãy chọn file nhỏ hơn 8 MB (có thể tách đề thành nhiều file).',
      );
      return;
    }
    setFile(asset);
    setDraft(null);
    setReadError(null);
    importState.reset();
  };

  const readWithGemini = async () => {
    if (!file) return;
    setReadError(null);
    let dataBase64: string;
    try {
      dataBase64 = await readBase64(file);
    } catch (e) {
      setReadError(e instanceof Error ? e.message : 'Không đọc được file.');
      return;
    }
    const result = await importFile({
      fileName: file.name,
      mimeType: file.mimeType ?? '',
      dataBase64,
    });
    if ('data' in result && result.data) {
      setDraft(result.data);
      setTitle(result.data.title);
    }
  };

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setDraft((d) =>
      d
        ? {
            ...d,
            questions: d.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
          }
        : d,
    );
  };

  const removeQuestion = async (index: number) => {
    const ok = await confirm('Xoá câu hỏi?', `Bỏ câu ${index + 1} khỏi đề này.`, {
      confirmText: 'Xoá',
      destructive: true,
    });
    if (ok)
      setDraft((d) => (d ? { ...d, questions: d.questions.filter((_, i) => i !== index) } : d));
  };

  const resetAll = () => {
    setFile(null);
    setDraft(null);
    setTitle('');
    setDuration('15');
    setDeadline(defaultDeadline());
    importState.reset();
    createState.reset();
  };

  const submit = async () => {
    if (!draft || selectedRoundId == null) return;
    const minutes = Number.parseInt(duration, 10);
    if (!title.trim()) {
      void showAlert('Thiếu tên đề', 'Hãy nhập tên đề trước khi tạo.');
      return;
    }
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
      void showAlert('Thời gian chưa đúng', 'Thời gian làm bài từ 1 đến 180 phút.');
      return;
    }
    const unchecked = draft.questions.filter((q) => q.answerFromDocument === false).length;
    if (unchecked > 0) {
      const ok = await confirm(
        'Còn câu chưa kiểm tra',
        `${unchecked} câu có đáp án do Gemini tự giải. Vẫn tạo đề?`,
        { confirmText: 'Vẫn tạo' },
      );
      if (!ok) return;
    }
    const result = await createExam({
      roundId: selectedRoundId,
      title: title.trim(),
      durationMinutes: minutes,
      deadline: deadline.trim(),
      questions: draft.questions.map(({ content, choices, correctIndex, explanation }) => ({
        content,
        choices,
        correctIndex,
        explanation,
      })),
    });
    if ('data' in result && result.data) {
      const created = result.data;
      await showAlert(
        'Đã tạo bài kiểm tra 🎉',
        `"${created.title}" (${created.questionCount} câu, ${created.durationMinutes} phút, hạn ${created.deadline}) đã được giao. Học sinh thấy đề ở mục "Đề kiểm tra giáo viên giao" trên trang chủ.`,
      );
      resetAll();
      navigation.replace('ExamList'); // Back từ danh sách về thẳng Dashboard
    }
  };

  const importError = readError ?? queryErrorMessage(importState.error);
  const createError = queryErrorMessage(createState.error);

  return (
    <Screen scroll contentStyle={styles.content}>
      {/* Bước 1: chọn vòng */}
      <Card>
        <Text style={styles.stepTitle}>1. Giao đề vào vòng thi</Text>
        <Text style={styles.hint}>Học sinh làm đề trong vòng đang mở mà bạn chọn.</Text>
        <View style={styles.chips}>
          {openRounds.map((r) => {
            const active = r.id === selectedRoundId;
            return (
              <Pressable
                key={r.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => setRoundId(r.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{r.title}</Text>
              </Pressable>
            );
          })}
          {openRounds.length === 0 ? (
            <Text style={styles.hint}>Chưa có vòng nào đang mở.</Text>
          ) : null}
        </View>
      </Card>

      {/* Bước 2: chọn file và cho Gemini đọc */}
      <Card>
        <Text style={styles.stepTitle}>2. Chọn file đề</Text>
        <Text style={styles.hint}>
          PDF, Word (.docx), ảnh chụp đề (JPG/PNG) hoặc .txt — tối đa 8 MB. Đề nên có câu hỏi kèm
          lựa chọn A, B, C, D; nếu có bảng đáp án hoặc đáp án in đậm/gạch chân, Gemini sẽ dùng luôn.
        </Text>
        <Button
          title={file ? 'Chọn file khác' : 'Chọn file đề'}
          variant="secondary"
          onPress={pickFile}
          disabled={importState.isLoading || createState.isLoading}
        />
        {file ? (
          <View style={styles.fileRow}>
            <Ionicons name="document-text" size={22} color={colors.primary} />
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={styles.hint}>{formatSize(file.size)}</Text>
          </View>
        ) : null}

        {importState.isLoading ? (
          <View style={styles.thinkingBox} accessibilityLiveRegion="polite">
            <Float distance={5} duration={900}>
              <Emoji name="owl" size={40} />
            </Float>
            <View style={styles.flex}>
              <Text style={styles.thinkingTitle}>Cú MeMe đang nhờ Gemini đọc đề…</Text>
              <Text style={styles.hint}>Thường mất 10–60 giây tuỳ độ dài file.</Text>
            </View>
          </View>
        ) : file && !draft ? (
          <Button title="Gemini đọc đề" onPress={readWithGemini} />
        ) : null}

        {importError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {importError}
          </Text>
        ) : null}
      </Card>

      {/* Bước 3: xem lại bản nháp */}
      {draft ? (
        // Trượt nhẹ từ dưới lên (không dùng PopIn: phóng to cả khối dài sẽ làm nội dung nhảy chỗ)
        <Animated.View entering={listEntering(0)} style={styles.draft}>
          <Text style={styles.stepTitle}>3. Xem lại và tạo bài kiểm tra</Text>
          <Text style={styles.hint}>
            Đọc được {draft.questions.length} câu
            {draft.provider === 'gemini'
              ? ' bằng Gemini AI'
              : draft.provider === 'mock'
                ? ' (chế độ mock)'
                : ''}
            . Chạm vào lựa chọn để đổi đáp án đúng.
          </Text>

          {draft.warnings.map((w) => (
            <View key={w} style={styles.warning}>
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
              <Text style={styles.warningText}>{w}</Text>
            </View>
          ))}

          <Card>
            <TextField label="Tên đề" value={title} onChangeText={setTitle} maxLength={180} />
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField
                  label="Thời gian (phút)"
                  value={duration}
                  onChangeText={(t) => setDuration(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              <View style={styles.flex}>
                <TextField
                  label="Hạn nộp"
                  value={deadline}
                  onChangeText={setDeadline}
                  maxLength={20}
                />
              </View>
            </View>
          </Card>

          {draft.questions.map((q, qi) => (
            <Card key={qi}>
              <View style={styles.qHeader}>
                <Text style={styles.qNumber}>Câu {qi + 1}</Text>
                {q.answerFromDocument === false ? (
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>Gemini tự giải — kiểm tra lại</Text>
                  </View>
                ) : null}
                <View style={styles.flex} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Xoá câu ${qi + 1}`}
                  hitSlop={8}
                  onPress={() => void removeQuestion(qi)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
              <TextInput
                style={styles.qContent}
                value={q.content}
                onChangeText={(t) => updateQuestion(qi, { content: t })}
                multiline
                maxLength={1000}
                accessibilityLabel={`Nội dung câu ${qi + 1}`}
              />
              {q.choices.map((choice, ci) => {
                const correct = ci === q.correctIndex;
                return (
                  <Pressable
                    key={ci}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: correct }}
                    accessibilityLabel={`Đáp án ${LETTERS[ci]}: ${choice}`}
                    onPress={() =>
                      updateQuestion(qi, {
                        correctIndex: ci,
                        answerFromDocument: true,
                      })
                    }
                    style={[styles.choice, correct && styles.choiceCorrect]}
                  >
                    <View style={[styles.letter, correct && styles.letterCorrect]}>
                      <Text style={[styles.letterText, correct && styles.letterTextCorrect]}>
                        {LETTERS[ci]}
                      </Text>
                    </View>
                    <Text style={styles.choiceText}>{choice}</Text>
                    {correct ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    ) : null}
                  </Pressable>
                );
              })}
              {q.explanation ? <Text style={styles.explanation}>💡 {q.explanation}</Text> : null}
            </Card>
          ))}

          {createError ? <Text style={styles.error}>{createError}</Text> : null}
          <Button
            title={`Tạo bài kiểm tra (${draft.questions.length} câu)`}
            onPress={submit}
            loading={createState.isLoading}
            disabled={draft.questions.length === 0 || selectedRoundId == null}
          />
          <Button
            title="Huỷ, chọn file khác"
            variant="ghost"
            onPress={resetAll}
            disabled={createState.isLoading}
          />
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.md,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  thinkingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  thinkingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9A3412',
  },
  error: {
    fontSize: 14,
    color: colors.danger,
  },
  draft: {
    gap: spacing.md,
  },
  warning: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  qHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  aiBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: '#FFEDD5',
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  qContent: {
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 44,
  },
  choiceCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  letterCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  letterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  letterTextCorrect: {
    color: colors.white,
  },
  choiceText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  explanation: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
});
