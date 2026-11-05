import React from 'react';
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
  PlayfulButton,
  LearningJourneyCard,
  AssignmentCard,
  MascotBubble,
} from '../components';
import {
  mockUserData,
  mockAssignmentsTeacher,
} from '../utils/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header: Logo MeMeStudy, Avatar & Settings */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>MeMeStudy</Text>
            </View>
            <View style={styles.sloganCapsule}>
              <Text style={styles.sloganText}>Học vui - Ôn tốt - Cùng MeMe!</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Avatar MA */}
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarText}>{mockUserData.avatarInitial}</Text>
            </Pressable>

            {/* Nút cài đặt / bánh răng */}
            <Pressable
              onPress={() => navigation.navigate('ParentZone')}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-sharp" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* 2. Thẻ hiển thị Sao & Chuỗi ngày liên tiếp (Streak) */}
        <View style={styles.statsBanner}>
          <View style={styles.statPill}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statPillText}>{mockUserData.stars} sao</Text>
          </View>
          <Text style={styles.statDivider}>•</Text>
          <View style={styles.statPill}>
            <Ionicons name="flame" size={16} color="#FF7675" />
            <Text style={styles.statPillText}>
              {mockUserData.streakDays} ngày liên tiếp
            </Text>
          </View>
        </View>

        {/* 3. Mascot Bé Cú Xanh với bong bóng lời thoại */}
        <MascotBubble
          type="owl"
          message="Cô Lan vừa giao 2 đề mới. Cùng tớ ôn nào!"
        />

        {/* 4. Nút to 3D "Bắt đầu ôn tập" */}
        <View style={styles.ctaButtonWrapper}>
          <PlayfulButton
            title="Bắt đầu ôn tập"
            variant="orange"
            size="large"
            showPlayIcon={true}
            onPress={() => navigation.navigate('Exam', { roundId: 'as-1', roundTitle: 'Đề ôn Unit 5 – My hobbies' })}
            style={styles.heroButton}
          />
        </View>

        {/* 5. Section: Hành trình ôn tập (3 Thẻ như Ảnh 2) */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleCapsule}>
            <Text style={styles.sectionTitleText}>Hành trình ôn tập</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.journeyScroll}
        >
          {/* Thẻ 1: Xanh lá */}
          <LearningJourneyCard
            stepNumber={1}
            title="Đề kiểm tra"
            subtitle="Giáo viên giao"
            countText="3/10 đề"
            colorScheme="green"
            iconType="book"
            onPress={() => navigation.navigate('PracticeList')}
          />

          {/* Thẻ 2: Tím */}
          <LearningJourneyCard
            stepNumber={2}
            title="Tài liệu ôn"
            subtitle="PDF + Word + Ảnh"
            countText="5 mới"
            colorScheme="purple"
            iconType="layers"
            onPress={() => navigation.navigate('PracticeList')}
          />

          {/* Thẻ 3: Cam */}
          <LearningJourneyCard
            stepNumber={3}
            title="Luyện nghe"
            subtitle="Audio bài học"
            countText="3/10 đề"
            colorScheme="orange"
            iconType="headset"
            onPress={() => navigation.navigate('PracticeList')}
          />
        </ScrollView>

        {/* 6. Section: Mới từ thầy cô & bố mẹ */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleCapsule}>
            <Text style={styles.sectionTitleText}>Mới từ thầy cô & bố mẹ</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('PracticeList')}>
            <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
          </Pressable>
        </View>

        {/* Thẻ đề bài ôn tập */}
        {mockAssignmentsTeacher.slice(0, 1).map((item) => (
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

        {/* 7. Footer: Thành tích & Quà hôm nay */}
        <View style={styles.footerCardsRow}>
          {/* Thẻ thành tích */}
          <View style={styles.footerSmallCard}>
            <View style={styles.footerCardIconRow}>
              <Ionicons name="trophy" size={18} color="#FFB800" />
              <Text style={styles.footerCardTitle}>Thành tích</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
            </View>
            <Text style={styles.footerCardSub}>120/500</Text>
          </View>

          {/* Thẻ quà hôm nay */}
          <View style={styles.footerSmallCard}>
            <View style={styles.footerCardIconRow}>
              <Ionicons name="gift" size={18} color="#FF6B8B" />
              <Text style={styles.footerCardTitle}>Quà hôm nay</Text>
            </View>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name="star"
                  size={14}
                  color={s <= 4 ? '#FFD700' : '#E0E0E0'}
                />
              ))}
            </View>
            <Text style={styles.footerCardSub}>4/5 sao</Text>
          </View>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0984E3',
    letterSpacing: -0.5,
  },
  sloganCapsule: {
    backgroundColor: '#F39C12',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  sloganText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAB1A0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 8,
  },
  avatarText: {
    color: '#D63031',
    fontWeight: '800',
    fontSize: 13,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0984E3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 132, 227, 0.75)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
  statDivider: {
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  ctaButtonWrapper: {
    marginVertical: 10,
    alignItems: 'center',
  },
  heroButton: {
    width: '92%',
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 6,
  },
  sectionTitleCapsule: {
    backgroundColor: '#8D5B28',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F9E79F',
    alignSelf: 'flex-start',
  },
  sectionTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  seeAllText: {
    color: '#0984E3',
    fontSize: 12,
    fontWeight: '700',
  },
  journeyScroll: {
    paddingVertical: 6,
    paddingRight: 10,
  },
  footerCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  footerSmallCard: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0D8B4',
    padding: 10,
    marginHorizontal: 4,
  },
  footerCardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  footerCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textDark,
    marginLeft: 5,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0E5D8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  footerCardSub: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
});
