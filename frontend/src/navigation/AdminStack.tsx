import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ExamListScreen from '../screens/admin/ExamListScreen';
import QuestionListScreen from '../screens/admin/QuestionListScreen';
import type { AdminStackParamList } from './types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Quản trị' }} />
      <Stack.Screen name="QuestionList" component={QuestionListScreen} options={{ title: 'Câu hỏi' }} />
      <Stack.Screen name="ExamList" component={ExamListScreen} options={{ title: 'Đề thi' }} />
    </Stack.Navigator>
  );
}
