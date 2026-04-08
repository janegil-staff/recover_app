// src/services/api.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getToken() {
  return SecureStore.getItemAsync('token');
}

async function request(method, path, body) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Request failed');
  return json.data ?? json;
}

async function saveTokens(data) {
  await SecureStore.setItemAsync('token', data.token);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
}

async function clearSession() {
  await SecureStore.deleteItemAsync('token').catch(() => {});
  await SecureStore.deleteItemAsync('refreshToken').catch(() => {});
  await AsyncStorage.removeItem('user').catch(() => {});
}

// ── authApi — shape matches FocusApp usage ────────────────────────────────
export const authApi = {
  // Returns { token, refreshToken, user }
  register: async ({ email, password, name, language, age, gender }) => {
    if (!email) throw new Error('Email is required');
    const payload = { email, password, name: name ?? email.split('@')[0], language: language ?? 'en', age: age ?? 0, gender: gender ?? 'other' };
    console.log('[API] register payload:', payload);
    const data = await request('POST', '/api/auth/register', payload);
    await saveTokens(data);
    return data.user;
  },

  // Returns user object
  login: async ({ email, password }) => {
    const data = await request('POST', '/api/auth/login', { email, password });
    await saveTokens(data);
    return data.user;
  },

  // Returns user or null
  getMe: async () => {
    const token = await getToken();
    if (!token) return null;
    try {
      const data = await request('GET', '/api/auth/me');
      return data;
    } catch (_) {
      return null;
    }
  },

  logout: async () => {
    await clearSession();
  },
};

// ── patientApi ────────────────────────────────────────────────────────────
export const patientApi = {
  get: () => request('GET', '/api/patient'),
  updateProfile: (data) => request('PATCH', '/api/patient/profile', data),
  addRecord: (record) => request('POST', '/api/patient/records', record),
  deleteRecord: (date) =>
    request('DELETE', `/api/patient/records/${date}`),

  // Medications
  getMedications:    ()     => request('GET',    '/api/patient/medications?active=true'),
  addMedication:     (data) => request('POST',   '/api/patient/medications', data),
  deleteMedication:  (id)   => request('DELETE', `/api/patient/medications/${id}`),
  saveMedBulk:       (ids)  => request('PATCH',  '/api/patient/medications/bulk', { medications: ids }),
  updateQuestionnaire: (key, data) =>
    request('PATCH', '/api/patient/questionnaire', { key, data }),
};
