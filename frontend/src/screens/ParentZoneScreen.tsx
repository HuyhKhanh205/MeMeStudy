import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';
import {
  CapsuleHeader,
  AssignmentCard,
  PlayfulButton,
} from '../components';
import { mockUploadedParentFiles } from '../utils/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ParentZoneScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'teacher' | 'parent'>('parent');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header: Back & Capsule "Góc bố mẹ" */}
      <CapsuleHeader
        title="Góc bố mẹ"
        showBack={true}
        onPressBack={() => navigation.goBack()}
      />

      {/* 2. Tab Switch: Thầy cô | Bố mẹ */}
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveTab('teacher')}
          style={[
            styles.tabButton,
            activeTab === 'teacher' ? styles.tabActive : styles.tabInactive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'teacher' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Thầy cô
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('parent')}
          style={[
            styles.tabButton,
            activeTab === 'parent' ? styles.tabActive : styles.tabInactive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'parent' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Bố mẹ
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 3. Vùng Tải Đề / Tài Liệu (Khung nét đứt) */}
        <View style={styles.uploadDottedBox}>
          <View style={styles.cloudIconWrapper}>
            <Ionicons name="cloud-upload" size={28} color={colors.orangeMain} />
          </View>

          <Text style={styles.uploadMainTitle}>Chạm để tải đề / tài liệu</Text>
          <Text style={styles.uploadSubtitle}>
            PDF, Word, ảnh chụp, MP3 • Tối đa 20MB
          </Text>

          {/* 3 Nút nhỏ: Chụp ảnh, Chọn file, Ghi âm */}
          <View style={styles.uploadActionsRow}>
            <Pressable style={styles.uploadSmallBtn}>
              <Ionicons name="camera-outline" size={16} color="#27AE60" />
              <Text style={styles.uploadSmallBtnText}>Chụp ảnh</Text>
            </Pressable>

            <Pressable style={styles.uploadSmallBtn}>
              <Ionicons name="folder-open-outline" size={16} color="#2980B9" />
              <Text style={styles.uploadSmallBtnText}>Chọn file</Text>
            </Pressable>

            <Pressable style={styles.uploadSmallBtn}>
              <Ionicons name="mic-outline" size={16} color="#8E44AD" />
              <Text style={styles.uploadSmallBtnText}>Ghi âm</Text>
            </Pressable>
          </View>
        </View>

        {/* 4. Section: Đã tải lên */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Đã tải lên</Text>
          </View>
        </View>

        {mockUploadedParentFiles.map((file) => (
          <AssignmentCard
            key={file.id}
            item={file}
            onPressAction={() => {}}
          />
        ))}

        {/* 5. Form Giao Bài: Giao cho & Hạn ôn */}
        <View style={styles.formSection}>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Giao cho</Text>
            <View style={styles.formSelectCapsule}>
              <Text style={styles.formSelectValue}>Minh Anh (con)</Text>
              <Ionicons name="chevron-down" size={16} color="#7F8C8D" />
            </View>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Hạn ôn</Text>
            <View style={styles.formSelectCapsule}>
              <Text style={styles.formSelectValue}>30/10/2026</Text>
              <Ionicons name="chevron-down" size={16} color="#7F8C8D" />
            </View>
          </View>
        </View>

        {/* 6. Nút to 3D: "Gửi cho con" */}
        <View style={styles.submitButtonWrapper}>
          <PlayfulButton
            title="Gửi cho con"
            variant="orange"
            size="large"
            showPlayIcon={true}
            onPress={() => {
              navigation.navigate('PracticeList');
            }}
            style={styles.sendButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#CDEEFE',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#E6C9A2',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.orangeMain,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#7D6A55',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Khung upload nét đứt
  uploadDottedBox: {
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F39C12',
    borderStyle: 'dashed',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginVertical: 10,
  },
  cloudIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4A2E14',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 11,
    color: '#8D7B68',
    fontWeight: '600',
    marginBottom: 12,
  },
  uploadActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0D0C0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },
  uploadSmallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A2E14',
    marginLeft: 4,
  },

  // Section title
  sectionTitleRow: {
    marginTop: 10,
    marginBottom: 6,
  },
  sectionBadge: {
    backgroundColor: '#8D5B28',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F9E79F',
    alignSelf: 'flex-start',
  },
  sectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Form giao bài
  formSection: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F0D8B4',
    padding: 14,
    marginTop: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
  },
  formSelectCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0D0C0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 140,
    justifyContent: 'space-between',
  },
  formSelectValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34495E',
    marginRight: 6,
  },

  submitButtonWrapper: {
    marginTop: 16,
    alignItems: 'center',
  },
  sendButton: {
    width: '85%',
  },
});

