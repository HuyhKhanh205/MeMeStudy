import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { gameFonts, gameGradients, gameShadows } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Animated, Pulse, usePressScale } from '../motion';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Phập phồng nhẹ để mời bấm (ví dụ: đã chọn đáp án). */
  pulse?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DISABLED_GRADIENT = ['#ffd9a3', '#f9bf7e'] as const;

/** Figma: Game/Button — nút cam nổi 3D có vòng tròn play. */
export default function GameButton({ label, onPress, disabled, loading, pulse, style }: Props) {
  const inactive = disabled || loading;
  const press = usePressScale(0.94);
  return (
    // Pulse (mời bấm) bọc ngoài cùng và nhận `style` định vị; bên trong là lớp co lại khi nhấn.
    <Pulse active={!!pulse && !inactive} scale={1.04} duration={1200} style={style}>
      <Animated.View style={press.style}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: inactive, busy: loading }}
          disabled={inactive}
          onPress={onPress}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          style={[styles.wrap, disabled && styles.disabled]}
        >
          {/* Disabled: tông cam nhạt đặc màu (không dùng opacity để không lộ trang trí phía sau). */}
          <LinearGradient
            colors={disabled ? DISABLED_GRADIENT : gameGradients.orangeButton}
            style={styles.button}
          >
            <View style={styles.play}>
              {loading ? (
                <ActivityIndicator color="#f7861e" />
              ) : (
                <Ionicons name="play" size={22} color="#F7861E" style={styles.playIcon} />
              )}
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Pulse>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 30,
    boxShadow: gameShadows.orangeButton,
  },
  disabled: {
    boxShadow: '0px 6px 0px 0px #d9a46a, 0px 12px 18px 0px rgba(0,0,0,0.12)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 14,
    paddingLeft: 12,
    paddingRight: 30,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#ffe3b0',
  },
  play: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: gameShadows.playInner,
  },
  // Tam giác play hơi lệch phải để nhìn cân giữa vòng tròn.
  playIcon: {
    marginLeft: 3,
  },
  label: {
    fontFamily: gameFonts.display,
    fontSize: 28,
    color: '#ffffff',
  },
});
