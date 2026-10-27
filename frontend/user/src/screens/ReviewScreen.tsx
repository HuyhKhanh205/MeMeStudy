import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import StateView from '../components/StateView';
import { useStudyFiles } from '../hooks/useStudyFiles';
import { studyFileService } from '../services/studyFileService';
import { colors, spacing } from '../utils/constants';
import { formatDate } from '../utils/format';

/** Lets the learner add their own notes/files and review them later. */
export default function ReviewScreen() {
  const { data: files, loading, error, reload } = useStudyFiles();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await studyFileService.create({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      await reload();
    } catch (err) {
      Alert.alert('Không thể thêm tệp', err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    await studyFileService.remove(id);
    await reload();
  };

  if (!files) {
    return <StateView loading={loading} error={error} onRetry={reload} />;
  }

  return (
    <FlatList
      data={files}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View style={styles.form}>
          <Text style={styles.heading}>Thêm tài liệu ôn tập</Text>
          <TextInput style={styles.input} placeholder="Tiêu đề" value={title} onChangeText={setTitle} />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Nội dung (mỗi dòng dạng: câu hỏi - đáp án)"
            value={content}
            onChangeText={setContent}
            multiline
          />
          <PrimaryButton
            title="Thêm"
            disabled={saving || !title.trim() || !content.trim()}
            onPress={handleAdd}
          />
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Chưa có tài liệu nào.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.flashcards.length} thẻ · {formatDate(item.createdAt)}
            </Text>
          </View>
          <Pressable onPress={() => handleRemove(item.id)} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  form: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm + 4,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardMeta: {
    color: colors.textMuted,
  },
});
