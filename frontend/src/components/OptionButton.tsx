import React, { useState } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface OptionButtonProps {
  type: 'true' | 'false' | 'choice';
  label?: string; // Dùng cho A, B, C, D hoặc True, False
  text?: string;
  isSelected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  type,
  label,
  text,
  isSelected = false,
  onPress,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  if (type === 'true') {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[styles.container, style]}
      >
        {/* Bóng đáy 3D */}
        <View style={[styles.shadowLayer, { backgroundColor: colors.trueGreenDark }]} />

        {/* Mặt nút True */}
        <View
          style={[
            styles.faceLayer,
            {
              backgroundColor: colors.trueGreen,
              borderColor: isSelected ? '#A9DFBF' : '#58D68D',
              borderWidth: isSelected ? 3 : 1.5,
              transform: [{ translateY: isPressed ? 3 : 0 }],
              marginBottom: isPressed ? 0 : 3,
            },
          ]}
        >
          {/* Tròn trắng icon checkmark */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-sharp" size={18} color={colors.trueGreen} />
          </View>
          <Text style={styles.labelButtonText}>{text || 'True'}</Text>
        </View>
      </Pressable>
    );
  }

  if (type === 'false') {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[styles.container, style]}
      >
        {/* Bóng đáy 3D */}
        <View style={[styles.shadowLayer, { backgroundColor: colors.falseRedDark }]} />

        {/* Mặt nút False */}
        <View
          style={[
            styles.faceLayer,
            {
              backgroundColor: colors.falseRed,
              borderColor: isSelected ? '#FADBD8' : '#FF7690',
              borderWidth: isSelected ? 3 : 1.5,
              transform: [{ translateY: isPressed ? 3 : 0 }],
              marginBottom: isPressed ? 0 : 3,
            },
          ]}
        >
          {/* Tròn trắng icon X */}
          <View style={styles.iconCircle}>
            <Ionicons name="close-sharp" size={18} color={colors.falseRed} />
          </View>
          <Text style={styles.labelButtonText}>{text || 'False'}</Text>
        </View>
      </Pressable>
    );
  }

  // Biến thể trắc nghiệm A, B, C, D
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.container, styles.choiceContainer, style]}
    >
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: isSelected ? colors.orangeDark : colors.cardShadow,
            borderRadius: 20,
          },
        ]}
      />

      <View
        style={[
          styles.choiceFaceLayer,
          {
            backgroundColor: isSelected ? '#FFF8EE' : '#FFFFFF',
            borderColor: isSelected ? colors.orangeMain : colors.cardBorder,
            transform: [{ translateY: isPressed ? 3 : 0 }],
            marginBottom: isPressed ? 0 : 3,
          },
        ]}
      >
        {label && (
          <View
            style={[
              styles.choiceLabelCircle,
              {
                backgroundColor: isSelected ? colors.orangeMain : '#F4ECE1',
              },
            ]}
          >
            <Text
              style={[
                styles.choiceLabelText,
                { color: isSelected ? '#FFFFFF' : colors.textDark },
              ]}
            >
              {label}
            </Text>
          </View>
        )}
        <Text style={styles.choiceContentText}>{text}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 6,
  },
  choiceContainer: {
    flex: undefined,
    width: '100%',
    marginHorizontal: 0,
    marginVertical: 6,
  },
  shadowLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderRadius: 26,
    top: 3,
  },
  faceLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  choiceFaceLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  labelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  choiceLabelCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  choiceLabelText: {
    fontSize: 16,
    fontWeight: '800',
  },
  choiceContentText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
});

