import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface Props {
  children: ReactNode;
  /** Bọc nội dung trong ScrollView. */
  scroll?: boolean;
  /** Mặc định bỏ cạnh trên vì header của navigator đã xử lý. */
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}

export default function Screen({
  children,
  scroll = false,
  edges = ['left', 'right', 'bottom'],
  contentStyle,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
