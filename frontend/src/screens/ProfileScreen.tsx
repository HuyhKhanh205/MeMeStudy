import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { CapsuleHeader, PlayfulButton } from '../components';
import { mockUserData } from '../utils/mockData';
import { colors } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <CapsuleHeader
        title="Hồ sơ bé"
        showBack={true}
        onPressBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Avatar MA to tròn */}
        <View style={styles.bigAvatar}>
          <Text style={styles.bigAvatarText}>{mockUserData.avatarInitial}</Text>
        </View>

        <Text style={styles.userNameText}>{mockUserData.name}</Text>
        <Text style={styles.userSubText}>Lớp 5A • Trường Tiểu học MeMe</Text>

        {/* Thông số thành tích */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>{mockUserData.stars}</Text>
            <Text style={styles.statLabel}>Sao tích lũy</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="flame" size={24} color="#FF7675" />
            <Text style={styles.statNumber}>{mockUserData.streakDays}</Text>
            <Text style={styles.statLabel}>Ngày liên tiếp</Text>
          </View>
        </View>

        {/* Nút sang Góc bố mẹ */}
        <View style={styles.btnWrapper}>
          <PlayfulButton
            title="Vào góc bố mẹ"
            variant="orange"
            size="medium"
            onPress={() => navigation.navigate('ParentZone')}
            fullWidth={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#CDEEFE',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 20,
  },
  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAB1A0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  bigAvatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D63031',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
  },
  userSubText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E6C9A2',
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textDark,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E6C9A2',
  },
  btnWrapper: {
    width: '100%',
  },
});
