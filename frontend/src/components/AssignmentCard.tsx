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
import { PlayfulButton } from './PlayfulButton';

export interface AssignmentItem {
  id: string;
  title: string;
  authorOrScope?: string;
  questionCount?: number;
  durationMinutes?: number;
  deadline?: string;
  fileType: 'pdf' | 'docx' | 'mp3' | 'image';
  buttonLabel?: string;
  buttonVariant?: 'green' | 'teal' | 'orange' | 'red';
  statusText?: string;
}

interface AssignmentCardProps {
  item: AssignmentItem;
  onPressAction?: () => void;
  onPressCard?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  item,
  onPressAction,
  onPressCard,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getFileBadge = () => {
    switch (item.fileType) {
      case 'pdf':
        return {
          bg: '#E3F2FD',
          iconColor: '#1E88E5',
          label: 'PDF',
          iconName: 'document-text' as keyof typeof Ionicons.glyphMap,
        };
      case 'docx':
        return {
          bg: '#E8EAF6',
          iconColor: '#3949AB',
          label: 'DOCX',
          iconName: 'document-attach' as keyof typeof Ionicons.glyphMap,
        };
      case 'mp3':
        return {
          bg: '#F3E5F5',
          iconColor: '#8E24AA',
          label: 'MP3',
          iconName: 'musical-notes' as keyof typeof Ionicons.glyphMap,
        };
      case 'image':
      default:
        return {
          bg: '#E0F2F1',
          iconColor: '#00897B',
          label: 'ẢNH',
          iconName: 'images' as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const badge = getFileBadge();

  // Tạo chuỗi phụ đề mô tả
  const detailsArray = [];
  if (item.authorOrScope) detailsArray.push(item.authorOrScope);
  if (item.questionCount) detailsArray.push(`${item.questionCount} câu`);
  if (item.durationMinutes) detailsArray.push(`${item.durationMinutes} phút`);
  if (item.deadline) detailsArray.push(`Hạn ${item.deadline}`);
  const descriptionText = detailsArray.join(' • ');

  return (
    <Pressable
      onPress={onPressCard || onPressAction}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.container, style]}
    >
      {/* Viền đáy 3D kiểu gỗ/bảng */}
      <View style={styles.shadowLayer} />

      {/* Mặt thẻ */}
      <View
        style={[
          styles.cardFace,
          {
            transform: [{ translateY: isPressed ? 2 : 0 }],
            marginBottom: isPressed ? 0 : 2,
          },
        ]}
      >
        {/* Icon file hình vuông bo góc */}
        <View style={[styles.fileBox, { backgroundColor: badge.bg }]}>
          <Ionicons name={badge.iconName} size={22} color={badge.iconColor} />
          <Text style={[styles.fileBadgeText, { color: badge.iconColor }]}>
            {badge.label}
          </Text>
        </View>

        {/* Nội dung tiêu đề & mô tả */}
        <View style={styles.contentCol}>
          <Text style={styles.titleText} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.descText} numberOfLines={2}>
            {item.statusText || descriptionText}
          </Text>
        </View>

        {/* Nút hành động 3D bên phải */}
        <View style={styles.actionCol}>
          <PlayfulButton
            title={item.buttonLabel || 'Ôn ngay'}
            onPress={onPressAction || onPressCard}
            variant={item.buttonVariant || (item.fileType === 'mp3' || item.fileType === 'image' ? 'teal' : 'green')}
            size="small"
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 6,
    width: '100%',
  },
  shadowLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: '#E6C9A2',
    borderRadius: 22,
    top: 3,
  },
  cardFace: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#F3DFC1',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  fileBox: {
    width: 48,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#422810',
    lineHeight: 18,
  },
  descText: {
    fontSize: 11,
    color: '#8D7B68',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 15,
  },
  actionCol: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});

