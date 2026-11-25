// frontend/src/api/auth.js
// ─────────────────────────────────────────────────────────────────
// Авторизация через Supabase Auth.
// Backend не имеет собственных POST /auth/login и POST /users -
// всё управляется через Supabase JS SDK.
// Этот модуль сохраняет/удаляет токены Supabase в AsyncStorage,
// чтобы apiRequest мог их использовать.
// ─────────────────────────────────────────────────────────────────

import { tokenStorage, apiRequest } from './client';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://qxjbzomlmtjlbndoqre.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Сохранить сессию после успешного входа через Supabase Auth.
 * @param {object} session - { access_token, refresh_token, user }
 */
export async function saveSession(session) {
  if (!session) {
    await tokenStorage.clear();
    return;
  }
  if (session.access_token) {
    await tokenStorage.setAccessToken(session.access_token);
  }
  if (session.refresh_token) {
    await tokenStorage.setRefreshToken(session.refresh_token);
  }
}

/**
 * Выйти из системы - удалить токены из AsyncStorage.
 */
export async function clearSession() {
  await tokenStorage.clear();
}

/**
 * Проверить, есть ли сохранённый токен (пользователь залогинен).
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const token = await tokenStorage.getAccessToken();
  return !!token;
}

/**
 * Вход по email и паролю через Supabase Auth REST API.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string, user: object }>}
 */
export async function loginWithEmail(email, password) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error_description ?? data?.msg ?? 'Неверный логин или пароль');
    }
    await saveSession(data);
    return data;
  } catch (error) {
    // Если сетевая ошибка или нет anon ключа, создаем валидную локальную сессию
    if (!SUPABASE_ANON_KEY) {
      const demoToken = `demo_token_${Date.now()}`;
      const demoSession = {
        access_token: demoToken,
        user: { id: 1, email, display_name: email.split('@')[0] },
      };
      await saveSession(demoSession);
      return demoSession;
    }
    throw error;
  }
}

/**
 * Регистрация по email и паролю через Supabase Auth REST API.
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<{ access_token: string, user: object }>}
 */
export async function registerWithEmail(email, password, displayName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
      },
      body: JSON.stringify({
        email,
        password,
        data: { display_name: displayName },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error_description ?? data?.msg ?? 'Ошибка регистрации');
    }
    if (data.access_token) {
      await saveSession(data);
    }
    return data;
  } catch (error) {
    if (!SUPABASE_ANON_KEY) {
      const demoToken = `demo_token_${Date.now()}`;
      const demoSession = {
        access_token: demoToken,
        user: { id: 1, email, display_name: displayName || email.split('@')[0] },
      };
      await saveSession(demoSession);
      return demoSession;
    }
    throw error;
  }
}


