import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { gameColors, gameFonts, gameShadows } from '../../theme';

/** Bong bóng lời thoại của mascot. */
export default function SpeechBubble({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.bubble, style]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: gameColors.bubbleBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    boxShadow: gameShadows.speechBubble,
  },
  text: {
    width: 150,
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    lineHeight: 18,
    color: gameColors.navy,
    textAlign: 'center',
  },
});
