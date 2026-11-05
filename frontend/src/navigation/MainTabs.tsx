import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ReviewScreen from '../screens/ReviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../utils/constants';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Review: 'documents',
  Profile: 'person',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Học' }} />
      <Tab.Screen name="Review" component={ReviewScreen} options={{ title: 'Ôn tập' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}
