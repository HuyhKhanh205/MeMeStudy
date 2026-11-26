import { Pressable, StyleSheet, Text, View } from 'react-native';
import { queryErrorMessage, useExplainAnswerMutation } from '../store/api';
import { gameColors, gameFonts } from '../theme';
import type { AiExplainSource, AiProvider } from '../types';
import Emoji from './Emoji';
import { Float, PopIn } from './motion';

interface Props {
  questionId: number;
  /** Đáp án học sinh đã chọn (null nếu bỏ trống). */
  selectedChoiceId: number | null;
}

const SOURCE_LABEL: Record<AiExplainSource, string> = {
  ai: 'AI',
  fallback: 'Lời giải có sẵn',
  mock: 'Chế độ mock',
};

const PROVIDER_LABEL: Record<AiProvider, string> = {
  gemini: 'Gemini AI',
  claude: 'Claude AI',
};

function sourceLabel(source: AiExplainSource, provider?: AiProvider): string {
  return source === 'ai' && provider ? PROVIDER_LABEL[provider] : SOURCE_LABEL[source];
}

/**
 * AI basic — nút "Hỏi Cú AI vì sao sai?" trong thẻ câu sai ở màn Kết quả.
 * Gọi POST /ai/explain qua RTK Query (mutation); backend dùng Gemini hoặc Claude, app không giữ API key.
 */
export default function AiExplainBox({ questionId, selectedChoiceId }: Props) {
  const [explain, { data, isLoading, error }] = useExplainAnswerMutation();
  const ask = () => {
    void explain({ questionId, selectedChoiceId });
  };

  if (isLoading) {
    return (
      <View style={[styles.box, styles.row]} accessibilityLiveRegion="polite">
        <Float distance={5} duration={900}>
          <Emoji name="owl" size={34} />
        </Float>
        <Text style={styles.thinking}>Cú MeMe đang suy nghĩ…</Text>
      </View>
    );
  }

  if (data) {
    return (
      <PopIn>
        <View style={styles.box} accessibilityLiveRegion="polite">
          <View style={styles.row}>
            <Emoji name="owl" size={30} />
            <Text style={styles.title}>Cú AI giải thích</Text>
            <View style={[styles.badge, data.source === 'ai' ? styles.badgeAi : styles.badgeOther]}>
              <Text style={[styles.badgeText, data.source === 'ai' && styles.badgeTextAi]}>
                {sourceLabel(data.source, data.provider)}
              </Text>
            </View>
          </View>
          <Text style={styles.answer}>{data.explanation}</Text>
          {data.notice ? <Text style={styles.notice}>{data.notice}</Text> : null}
        </View>
      </PopIn>
    );
  }

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hỏi Cú AI vì sao câu này sai"
        onPress={ask}
        style={({ pressed }) => [styles.askButton, pressed && styles.askButtonPressed]}
      >
        <Emoji name="owl" size={24} />
        <Text style={styles.askText}>{error ? 'Thử hỏi Cú AI lại' : 'Hỏi Cú AI vì sao sai?'}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{queryErrorMessage(error)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 10,
    padding: 12,
    gap: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#c4b5fd',
    backgroundColor: gameColors.lilac,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinking: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#6d28d9',
  },
  title: {
    flex: 1,
    fontFamily: gameFonts.display,
    fontSize: 16,
    color: '#5b21b6',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeAi: {
    backgroundColor: '#7c3aed',
  },
  badgeOther: {
    backgroundColor: '#ede9fe',
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  badgeText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#6d28d9',
  },
  badgeTextAi: {
    color: '#ffffff',
  },
  answer: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 14,
    lineHeight: 21,
    color: gameColors.ink,
  },
  notice: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    fontStyle: 'italic',
    color: gameColors.inkMuted,
  },
  askButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#c4b5fd',
    backgroundColor: '#f5f3ff',
  },
  askButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  askText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#6d28d9',
  },
  error: {
    marginTop: 6,
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: gameColors.redDark,
  },
});
