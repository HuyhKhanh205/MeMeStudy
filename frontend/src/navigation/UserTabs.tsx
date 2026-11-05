import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Emoji from '../components/Emoji';
import type { EmojiName } from '../components/emojiAssets';
import { Bounce } from '../components/motion';
import ExamScreen from '../screens/user/ExamScreen';
import HistoryScreen from '../screens/user/HistoryScreen';
import HomeScreen from '../screens/user/HomeScreen';
import ResultScreen from '../screens/user/ResultScreen';
import RoundListScreen from '../screens/user/RoundListScreen';
import { colors } from '../theme';
import type { UserStackParamList, UserTabParamList } from './types';

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createNativeStackNavigator<UserStackParamList>();

/** Icon tab là Fluent Emoji 3D, khớp với hình ở các thẻ trang chủ. */
const tabIcons: Record<keyof UserTabParamList, EmojiName> = {
  Home: 'house',
  RoundList: 'memo',
  History: 'trophy',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontWeight: '600' },
        // Tab đang chọn: to, rõ và nảy một nhịp; tab khác: nhỏ và mờ.
        tabBarIcon: ({ focused }) => (
          <Bounce trigger={focused} scale={1.25}>
            <Emoji
              name={tabIcons[route.name]}
              size={focused ? 28 : 24}
              style={{ opacity: focused ? 1 : 0.45 }}
            />
          </Bounce>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="RoundList" component={RoundListScreen} options={{ title: 'Vòng thi' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Lịch sử' }} />
    </Tab.Navigator>
  );
}

/** Tab chính của user; màn làm bài và kết quả mở đè lên tab (ẩn tab bar). */
export default function UserTabs() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      {/* Exam/Result tự vẽ header theo Figma (Style A – Game hoá). */}
      <Stack.Screen
        name="Exam"
        component={ExamScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
