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

interface LearningJourneyCardProps {
  stepNumber?: number;
  title: string;
  subtitle: string;
  countText: string;
  colorScheme: 'green' | 'purple' | 'orange';
  iconType: 'book' | 'layers' | 'headset';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LearningJourneyCard: React.FC<LearningJourneyCardProps> = ({
  stepNumber = 1,
  title,
  subtitle,
  countText,
  colorScheme,
  iconType,
  onPress,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getScheme = () => {
    switch (colorScheme) {
      case 'green':
        return {
          bg: '#EAF8ED',
          borderBottom: '#48BB78',
          accent: '#2ECC71',
          accentDark: '#27AE60',
          badgeBg: '#34A853',
        };
      case 'purple':
        return {
          bg: '#F3EEFD',
          borderBottom: '#9F7AEA',
          accent: '#9B51E0',
          accentDark: '#8E44AD',
          badgeBg: '#8E44AD',
        };
      case 'orange':
      default:
        return {
          bg: '#FEF4E5',
          borderBottom: '#ED8936',
          accent: '#F39C12',
          accentDark: '#D68910',
          badgeBg: '#E67E22',
        };
    }
  };

  const scheme = getScheme();

  const renderIcon = () => {
    switch (iconType) {
      case 'book':
        return <Ionicons name="book-outline" size={18} color={scheme.accent} />;
      case 'layers':
        return <Ionicons name="layers-outline" size={18} color={scheme.accent} />;
      case 'headset':
      default:
        return <Ionicons name="headset-outline" size={18} color={scheme.accent} />;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.container, style]}
    >
      {/* Lớp viền đáy 3D */}
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: scheme.borderBottom,
          },
        ]}
      />

      {/* Mặt thẻ */}
      <View
        style={[
          styles.cardFace,
          {
            backgroundColor: scheme.bg,
            transform: [{ translateY: isPressed ? 3 : 0 }],
            marginBottom: isPressed ? 0 : 3,
          },
        ]}
      >
        {/* Header với Badge số và Tiêu đề */}
        <View style={styles.headerRow}>
          <View style={[styles.stepBadge, { backgroundColor: scheme.badgeBg }]}>
            <Text style={styles.stepText}>{stepNumber}</Text>
          </View>
          <Text style={styles.titleText}>{title}</Text>
        </View>

        {/* Phụ đề */}
        <Text style={styles.subtitleText}>{subtitle}</Text>

        {/* Capsule thông tin số đề & nút chuyển tròn */}
        <View style={styles.footerRow}>
          <View style={styles.infoCapsule}>
            {renderIcon()}
            <Text style={styles.countText}>{countText}</Text>
          </View>

          <View style={[styles.circleButton, { backgroundColor: scheme.accent }]}>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 12,
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderRadius: 20,
    top: 3,
  },
  cardFace: {
    borderRadius: 20,
    padding: 12,
    minHeight: 145,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
    flex: 1,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 4,
    marginLeft: 28,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  infoCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDark,
    marginLeft: 5,
  },
  circleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});

