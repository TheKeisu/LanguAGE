// frontend/src/services/hapticsService.js
// ─────────────────────────────────────────────────────────────────
// Сервис тактильного виброотклика (Haptic Feedback) для LanguAGE.
// Работает на iOS / Android через expo-haptics,
// а в браузере (Web) безопасно использует navigator.vibrate.
// ─────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';

let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (_) {}

/**
 * Легкий тактильный щелчок при нажатии на кнопку / выбор варианта
 */
export const triggerLightHaptic = () => {
  try {
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  } catch (_) {}
};

/**
 * Уверенный щелчок при переключении табов / открытии меню
 */
export const triggerMediumHaptic = () => {
  try {
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  } catch (_) {}
};

/**
 * Радостная вибрация успеха при правильном ответе
 */
export const triggerSuccessHaptic = () => {
  try {
    if (Platform.OS !== 'web' && Haptics?.notificationAsync) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 40, 30]);
    }
  } catch (_) {}
};

/**
 * Ощутимая вибрация при ошибке в ответе
 */
export const triggerErrorHaptic = () => {
  try {
    if (Platform.OS !== 'web' && Haptics?.notificationAsync) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 50, 40]);
    }
  } catch (_) {}
};

export default {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
};
