import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { gameFonts, gameGradients, gameShadows } from '../../theme';

/** Biển gỗ chữ kem ("Kết quả", "Câu cần ôn lại"). */
export default function WoodLabel({
  text,
  fontSize = 22,
  style,
}: {
  text: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient colors={gameGradients.woodLabel} style={styles.label}>
        <Text accessibilityRole="header" style={[styles.text, { fontSize }]}>
          {text}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    boxShadow: gameShadows.woodLabel,
  },
  label: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6e4119',
  },
  text: {
    fontFamily: gameFonts.display,
    color: '#fff6e3',
  },
});
