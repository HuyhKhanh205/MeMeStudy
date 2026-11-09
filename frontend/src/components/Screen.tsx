import type { ReactNode } from 'react';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            { padding: spacing.md, gap: spacing.md },
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <YStack
          flex={1}
          padding={spacing.md}
          gap={spacing.md}
          style={contentStyle as any}
        >
          {children}
        </YStack>
      )}
    </SafeAreaView>
  );
}
