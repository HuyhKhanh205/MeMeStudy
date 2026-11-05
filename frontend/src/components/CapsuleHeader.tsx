import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface CapsuleHeaderProps {
  title: string;
  onPressBack?: () => void;
  onPressRight?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightVariant?: 'orange' | 'red' | 'blue';
  showBack?: boolean;
  isCloseButton?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CapsuleHeader: React.FC<CapsuleHeaderProps> = ({
  title,
  onPressBack,
  onPressRight,
  rightIcon,
  rightVariant = 'orange',
  showBack = true,
  isCloseButton = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Nút bên trái (Back hoặc Close) */}
      {showBack ? (
        <Pressable
          onPress={onPressBack}
          style={[
            styles.roundButton,
            isCloseButton
              ? styles.closeButton
              : styles.backButton,
          ]}
        >
          <Ionicons
            name={isCloseButton ? 'close' : 'arrow-back'}
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Capsule Tiêu đề chính giữa */}
      <View style={styles.capsuleBadge}>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* Nút bên phải nếu có (Search / Options) */}
      {rightIcon ? (
        <Pressable
          onPress={onPressRight}
          style={[
            styles.roundButton,
            rightVariant === 'orange' && styles.orangeButton,
            rightVariant === 'red' && styles.closeButton,
            rightVariant === 'blue' && styles.backButton,
          ]}
        >
          <Ionicons name={rightIcon} size={18} color="#FFFFFF" />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  backButton: {
    backgroundColor: '#3498DB',
  },
  closeButton: {
    backgroundColor: '#FF5252',
  },
  orangeButton: {
    backgroundColor: '#F39C12',
  },
  placeholder: {
    width: 38,
  },
  capsuleBadge: {
    backgroundColor: '#8D5B28',
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F9E79F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});

