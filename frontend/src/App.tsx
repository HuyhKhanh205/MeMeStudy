import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2/800ExtraBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import LoadingView from './components/LoadingView';
import { AuthProvider } from './hooks/useAuth';
import RootNavigator from './navigation/RootNavigator';
import { store } from './store';

export default function App() {
  // Font của Style A – Game hoá (xem src/theme/game.ts).
  const [fontsLoaded, fontError] = useFonts({
    Baloo2_800ExtraBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {fontsLoaded || fontError ? (
        <Provider store={store}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </Provider>
      ) : (
        <LoadingView />
      )}
    </SafeAreaProvider>
  );
}
