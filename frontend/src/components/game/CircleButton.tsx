import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet } from 'react-native';
import { gameGradients, gameShadows } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

interface Props {
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  accessibilityLabel: string;
  tone?: 'blue' | 'red';
}

/** Nút tròn 44px viền trắng (nút quay lại / đóng ở A3, A4). */
export default function CircleButton({ icon, onPress, accessibilityLabel, tone = 'blue' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={tone === 'red' ? gameGradients.redCircle : gameGradients.blueCircle}
        style={styles.circle}
      >
        <Ionicons name={icon} size={22} color="#ffffff" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    boxShadow: gameShadows.circle,
  },
  pressed: {
    transform: [{ translateY: 2 }],
  },
  circle: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
