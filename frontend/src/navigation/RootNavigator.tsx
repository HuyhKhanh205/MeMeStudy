import { NavigationContainer } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';
import { useAuth } from '../hooks/useAuth';
import AdminStack from './AdminStack';
import AuthStack from './AuthStack';
import UserTabs from './UserTabs';

/** Chọn nhánh điều hướng theo trạng thái đăng nhập và user.role. */
export default function RootNavigator() {
  const { status, user } = useAuth();

  if (status === 'loading') return <LoadingView />;

  return (
    <NavigationContainer>
      {status !== 'authenticated' || !user ? (
        <AuthStack />
      ) : user.role === 'ADMIN' ? (
        <AdminStack />
      ) : (
        <UserTabs />
      )}
    </NavigationContainer>
  );
}
