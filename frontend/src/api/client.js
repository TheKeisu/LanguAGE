// frontend/src/api/client.js
// ─────────────────────────────────────────────────────────────────
// HTTP-клиент для FastAPI-бэкенда LanguAGE.
// Авторизация через Supabase JWT, токен хранится в AsyncStorage.
// Работает на Mobile (iOS/Android) и Web (Expo Web).
// ─────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Конфигурация BASE_URL ─────────────────────────────────────────
// На Web / браузере: http://localhost:8000
// На Android-эмуляторе: 10.0.2.2 (это localhost хост-машины)
// На iOS симуляторе: localhost
// При наличии EXPO_PUBLIC_API_URL — берётся оно
const getDefaultBaseUrl = () => {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return 'http://10.212.84.113:8080';
  }
  // На web берём hostname страницы (работает и с localhost, и с LAN IP)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
};

const BASE_URL = getDefaultBaseUrl();

// AsyncStorage-ключи
const TOKEN_KEY   = 'supabase_access_token';
const REFRESH_KEY = 'supabase_refresh_token';

// ── Хелперы для токенов ───────────────────────────────────────────
export const tokenStorage = {
  getAccessToken:  () => AsyncStorage.getItem(TOKEN_KEY),
  setAccessToken:  (token) => AsyncStorage.setItem(TOKEN_KEY, token),
  getRefreshToken: () => AsyncStorage.getItem(REFRESH_KEY),
  setRefreshToken: (token) => AsyncStorage.setItem(REFRESH_KEY, token),
  clear:           () => AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]),
};

// ── Базовый fetch с таймаутом и авторизацией ──────────────────────
/**
 * Выполняет HTTP-запрос к бэкенду.
 * @param {string} path       - путь (например, '/lesson')
 * @param {object} [options]  - стандартные fetch-опции
 * @param {boolean} [auth]    - добавить Authorization header (по умолчанию true)
 * @returns {Promise<any>}    - распарсенный JSON или null (для 204)
 */
export async function apiRequest(path, options = {}, auth = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (auth) {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Таймаут 5 секунд, чтобы приложение мгновенно переходило на оффлайн fallback
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 204 No Content - возвращаем null
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      const message = data?.message ?? data?.detail ?? `HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data   = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
