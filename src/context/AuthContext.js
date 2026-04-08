// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [isNewUser,   setIsNewUser]   = useState(false);

  useEffect(() => {
    authApi.getMe()
      .then((u) => setUser(u ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, pin) => {
    const storedPin   = await SecureStore.getItemAsync('userPin');
    const storedEmail = await SecureStore.getItemAsync('userEmail');
    const cleanEntered = email.trim().toLowerCase();
    const cleanStored  = (storedEmail ?? '').trim().toLowerCase();

    if (storedPin) {
      if (pin !== storedPin) throw new Error('Incorrect PIN');
      if (cleanStored && cleanEntered !== cleanStored) {
        throw new Error('Email does not match');
      }
      const u = await authApi.getMe();
      if (u) { setPinVerified(true); setUser(u); return u; }
      const fresh = await authApi.login({ email: cleanEntered, password: pin });
      await SecureStore.setItemAsync('userEmail', cleanEntered);
      setPinVerified(true); setUser(fresh); return fresh;
    }

    const u = await authApi.login({ email: cleanEntered, password: pin });
    await SecureStore.setItemAsync('userPin',   pin);
    await SecureStore.setItemAsync('userEmail', cleanEntered);
    setPinVerified(true); setUser(u); return u;
  };

  const register = async (data) => {
    const u = await authApi.register(data);
    const cleanEmail = data.email.trim().toLowerCase();
    await SecureStore.setItemAsync('userEmail', cleanEmail);
    await SecureStore.setItemAsync('userPin',   data.password);
    setIsNewUser(true); setPinVerified(true); setUser(u); return u;
  };

  const savePin = async (pin) => {
    await SecureStore.setItemAsync('userPin', pin);
    const email = user?.email ?? await SecureStore.getItemAsync('userEmail');
    if (email) await SecureStore.setItemAsync('userEmail', email.trim().toLowerCase());
  };

  const updateUser = (data) =>
    setUser((prev) => prev ? { ...prev, ...data } : prev);

  const logout = async () => {
    await authApi.logout();
    setPinVerified(false); setUser(null);
  };

  const logoutAndClearPin = async () => {
    await authApi.logout();
    await SecureStore.deleteItemAsync('userPin').catch(() => {});
    await SecureStore.deleteItemAsync('userEmail').catch(() => {});
    setPinVerified(false); setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, pinVerified, isNewUser,
      setPinVerified, setIsNewUser, updateUser,
      login, register, logout, logoutAndClearPin, savePin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
