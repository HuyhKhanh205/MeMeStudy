import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';
import {
  CapsuleHeader,
  AssignmentCard,
  MascotBubble,
} from '../components';
import {
  mockAssignmentsTeacher,
  mockAssignmentsParent,
} from '../utils/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PracticeListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'exam' | 'doc' | 'audio'>('all');

  const filterOptions = [
    { key: 'all', label: 'Tất cả' },
    { key: 'exam', label: 'Đề thi' },
    { key: 'doc', label: 'Tài liệu' },
    { key: 'audio', label: 'Audio' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header: Back - Capsule "Kho đề ôn" - Search */}
      <CapsuleHeader
        title="Kho đề ôn"
        showBack={true}
        onPressBack={() => navigation.goBack()}
        rightIcon="search"
        rightVariant="orange"
        onPressRight={() => {}}
      />

      {/* 2. Filter Tabs Pills */}
      <View style={styles.filterRow}>
        {filterOptions.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key as any)}
              style={[
                styles.filterPill,
                isActive ? styles.filterPillActive : styles.filterPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 3. Nhóm: Cô Lan - Lớp 5A */}
        <View style={styles.groupHeaderRow}>
          <View style={styles.groupUserBadge}>
            <View style={[styles.avatarCircle, { backgroundColor: '#2ECC71' }]}>
              <Text style={styles.avatarLetter}>L</Text>
            </View>
            <Text style={styles.groupTitleText}>Cô Lan - Lớp 5A</Text>
          </View>
          <View style={styles.badgeNew}>
            <Text style={styles.badgeNewText}>2 đề mới</Text>
          </View>
        </View>

        {/* Các thẻ bài tập từ Cô Lan */}
        {mockAssignmentsTeacher.map((item) => (
          <AssignmentCard
            key={item.id}
            item={item}
            onPressAction={() =>
              navigation.navigate('Exam', {
                roundId: item.id,
                roundTitle: item.title,
              })
            }
          />
        ))}

        {/* 4. Nhóm: Mẹ Hoa gửi */}
        <View style={[styles.groupHeaderRow, { marginTop: 18 }]}>
          <View style={styles.groupUserBadge}>
            <View style={[styles.avatarCircle, { backgroundColor: '#9B51E0' }]}>
              <Text style={styles.avatarLetter}>H</Text>
            </View>
            <Text style={styles.groupTitleText}>Mẹ Hoa gửi</Text>
          </View>
          <View style={styles.badgeNew}>
            <Text style={styles.badgeNewText}>Mới</Text>
          </View>
        </View>

        {/* Các thẻ bài tập từ Mẹ Hoa */}
        {mockAssignmentsParent.map((item) => (
          <AssignmentCard
            key={item.id}
            item={item}
            onPressAction={() =>
              navigation.navigate('Exam', {
                roundId: item.id,
                roundTitle: item.title,
              })
            }
          />
        ))}

        {/* 5. Mascot Cú Xanh ở chân trang nhắc nhở */}
        <View style={styles.mascotFooterWrapper}>
          <MascotBubble
            type="owl"
            message="Còn 2 đề sắp đến hạn, cố lên nhé!"
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1.5,
  },
  filterPillActive: {
    backgroundColor: colors.orangeMain,
    borderColor: '#FFA726',
  },
  filterPillInactive: {
    backgroundColor: '#FFFDF9',
    borderColor: '#E6C9A2',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: '#7D6A55',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6,
  },
  groupUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  groupTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
  },
  badgeNew: {
    backgroundColor: '#FF4D6D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeNewText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  mascotFooterWrapper: {
    marginTop: 12,
  },
});

