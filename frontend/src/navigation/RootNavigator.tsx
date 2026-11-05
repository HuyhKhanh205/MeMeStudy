import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { PracticeListScreen } from '../screens/PracticeListScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { ParentZoneScreen } from '../screens/ParentZoneScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PracticeList" component={PracticeListScreen} />
        <Stack.Screen name="Exam" component={ExamScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="ParentZone" component={ParentZoneScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
