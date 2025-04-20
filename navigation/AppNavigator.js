import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserPanel from '../screens/UserPanel';
import AdminPanel from '../screens/AdminPanel';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ userRole }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === null && (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        )}
        {(userRole === false || userRole === 'sin-rol') && (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
        {userRole === 'admin' && (
          <Stack.Screen name="AdminPanel" component={AdminPanel} />
        )}
        {userRole === 'user' && (
          <Stack.Screen name="UserPanel" component={UserPanel} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
