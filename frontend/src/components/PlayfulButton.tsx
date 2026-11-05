import React, { useState } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface PlayfulButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'orange' | 'green' | 'teal' | 'red' | 'purple' | 'disabled';
  size?: 'small' | 'medium' | 'large';
  showPlayIcon?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const PlayfulButton: React.FC<PlayfulButtonProps> = ({
  title,
  onPress,
  variant = 'orange',
  size = 'large',
  showPlayIcon = false,
  iconName,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Xác định màu sắc mặt nút và đáy 3D
  const getColors = () => {
    switch (variant) {
      case 'orange':
        return {
          face: colors.orangeMain,
          border: '#FFA726',
          bottom: colors.orangeDark,
          text: '#FFFFFF',
          playColor: colors.orangeMain,
        };
      case 'green':
        return {
          face: colors.trueGreen,
          border: '#58D68D',
          bottom: colors.trueGreenDark,
          text: '#FFFFFF',
          playColor: colors.trueGreen,
        };
      case 'teal':
        return {
          face: colors.imageTeal,
          border: '#48C9B0',
          bottom: '#148F77',
          text: '#FFFFFF',
          playColor: colors.imageTeal,
        };
      case 'red':
        return {
          face: colors.falseRed,
          border: '#FF7690',
          bottom: colors.falseRedDark,
          text: '#FFFFFF',
          playColor: colors.falseRed,
        };
      case 'purple':
        return {
          face: colors.purpleMain,
          border: '#A569BD',
          bottom: '#76448A',
          text: '#FFFFFF',
          playColor: colors.purpleMain,
        };
      case 'disabled':
      default:
        return {
          face: '#BDC3C7',
          border: '#D5D8DC',
          bottom: '#95A5A6',
          text: '#FFFFFF',
          playColor: '#7F8C8D',
        };
    }
  };

  const scheme = getColors();

  // Xác định kích thước
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 7,
          paddingHorizontal: 16,
          fontSize: 13,
          iconSize: 14,
          circleSize: 22,
          radius: 20,
          depth: 3,
        };
      case 'medium':
        return {
          paddingVertical: 10,
          paddingHorizontal: 22,
          fontSize: 16,
          iconSize: 16,
          circleSize: 26,
          radius: 24,
          depth: 4,
        };
      case 'large':
      default:
        return {
          paddingVertical: 14,
          paddingHorizontal: 28,
          fontSize: 19,
          iconSize: 20,
          circleSize: 32,
          radius: 30,
          depth: 5,
        };
    }
  };

  const sz = getSizeStyle();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={variant === 'disabled'}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {/* Lớp bóng đáy 3D */}
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: scheme.bottom,
            borderRadius: sz.radius,
            bottom: 0,
            height: '100%',
          },
        ]}
      />

      {/* Mặt nút chính */}
      <View
        style={[
          styles.faceLayer,
          {
            backgroundColor: scheme.face,
            borderColor: scheme.border,
            borderRadius: sz.radius,
            paddingVertical: sz.paddingVertical,
            paddingHorizontal: sz.paddingHorizontal,
            transform: [{ translateY: isPressed ? sz.depth : 0 }],
            marginBottom: isPressed ? 0 : sz.depth,
          },
        ]}
      >
        {/* Icon Play tròn trắng như Ảnh 3 */}
        {showPlayIcon && (
          <View
            style={[
              styles.playCircle,
              {
                width: sz.circleSize,
                height: sz.circleSize,
                borderRadius: sz.circleSize / 2,
              },
            ]}
          >
            <Ionicons
              name="play"
              size={sz.iconSize}
              color={scheme.playColor}
              style={{ marginLeft: 2 }}
            />
          </View>
        )}

        {/* Custom Icon nếu có */}
        {iconName && !showPlayIcon && (
          <Ionicons
            name={iconName}
            size={sz.iconSize}
            color={scheme.text}
            style={styles.customIcon}
          />
        )}

        {/* Chữ trên nút */}
        <Text
          style={[
            styles.titleText,
            {
              fontSize: sz.fontSize,
              color: scheme.text,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  shadowLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 3,
  },
  faceLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  playCircle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customIcon: {
    marginRight: 8,
  },
  titleText: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

