// src/screens/auth/PinVerifyScreen.js
import React from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import PinInputScreen from './PinInputScreen';
import { useAuth } from '../../context/AuthContext';

export default function PinVerifyScreen({ navigation }) {
  const { login, user, logoutAndClearPin } = useAuth();

  const verify = async (pin) => {
    try {
      // If we have a stored email, use it — otherwise this is a fresh device
      const storedEmail = await SecureStore.getItemAsync('userEmail');
      const email = storedEmail ?? user?.email ?? '';
      await login(email, pin);
    } catch (e) {
      Alert.alert('Incorrect PIN', e.message ?? 'Please try again.');
    }
  };

  const handleFallback = () => {
    Alert.alert(
      'Forgot PIN?',
      'You will be logged out and need to log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: logoutAndClearPin },
      ]
    );
  };

  return (
    <PinInputScreen
      title="Enter PIN"
      subtitle={user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Enter your PIN to continue'}
      onComplete={verify}
      onBack={handleFallback}
    />
  );
}
