/**
 * Navegación principal de la aplicación
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import VehicleScreen from '../screens/VehicleScreen';
import ReportsScreen from '../screens/ReportsScreen';
import TabNavigator from './TabNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  OrderDetail: { orderId: string };
  Vehicle: { vehicleId: string };
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ headerShown: true, title: 'Detalle de Orden' }}
            />
            <Stack.Screen
              name="Vehicle"
              component={VehicleScreen}
              options={{ headerShown: true, title: 'Mi Vehículo' }}
            />
            <Stack.Screen
              name="Reports"
              component={ReportsScreen}
              options={{ headerShown: true, title: 'Reports' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

