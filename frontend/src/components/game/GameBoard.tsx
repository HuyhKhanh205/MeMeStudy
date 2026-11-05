import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { gameColors, gameShadows } from '../../theme';

/** Bảng gỗ kem viền nâu (Question board ở A3, Result board ở A4). */
export default function GameBoard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.board, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: gameColors.boardFill,
    borderWidth: 4,
    borderColor: gameColors.boardBorder,
    borderRadius: 28,
    padding: 18,
    boxShadow: gameShadows.board,
  },
});
