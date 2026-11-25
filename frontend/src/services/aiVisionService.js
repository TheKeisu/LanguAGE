// frontend/src/services/aiVisionService.js
// ─────────────────────────────────────────────────────────────────
// Сервис реального распознавания объектов (AI Vision).
// Отправляет фото на FastAPI-бэкенд через multipart/form-data
// (надёжнее и компактнее, чем JSON+base64 — не требует кодирования).
// ─────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';

const getBaseUrl = () => {
  // На нативе (Android/iOS) — всегда IP ПК в локальной сети (игнорируем localhost из .env)
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return 'http://10.212.84.113:8080';
  }
  // На web — берём hostname страницы (работает и с localhost, и с LAN IP)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
};

export const PRESET_OBJECTS = [
  {
    kazakh: 'Шәйнек',
    transcription: 'Shäynek',
    russian: 'Чайник',
    category: 'Ыдыс-аяқ (Посуда)',
    description: 'Шәй қайнатуға арналған ыдыс. Қазақ дастарқанында шәй беру — қонақжайлылық белгісі.',
    descriptionRu: 'Посуда для заваривания чая. Угощение чаем у казахов — знак гостеприимства.',
    exampleSentence: 'Үстелге ыстық шәйнек пен бауырсақ қойылды.',
    exampleTranslation: 'На стол поставили горячий чайник и баурсаки.',
    anatomy: [
      { morph: 'Шәй', role: 'корень', meaning: 'чай', type: 'root' },
      { morph: 'нек', role: 'суффикс', meaning: 'посуда для чая', type: 'affix' },
    ],
    confidence: 95,
  },
];

/**
 * Распознаёт выделенную пальцем область на фото через AI-бэкенд.
 * Использует multipart/form-data для надёжной передачи изображения.
 *
 * @param {object} params
 * @param {string} [params.imageUri]    - URI файла (file:// на нативе, data: на web)
 * @param {string} [params.imageBase64] - base64-строка фото (запасной вариант)
 * @param {{ x: number, y: number, width: number, height: number }} [params.crop]
 */
export async function recognizeObjectArea({ imageBase64, imageUri, crop }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/ai-camera/recognize`;

  console.log('[AI-Vision] baseUrl:', baseUrl);
  console.log('[AI-Vision] imageUri:', imageUri ? imageUri.slice(0, 60) : 'none');
  console.log('[AI-Vision] base64 present:', !!imageBase64, 'len:', imageBase64 ? imageBase64.length : 0);

  const controller = new AbortController();
  // 90 секунд — BLIP-модель на CPU может обрабатывать долго
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const formData = new FormData();

    if (Platform.OS !== 'web' && imageUri) {
      // ── Нативный путь: передаём файл напрямую по URI ──────────────
      // React Native сам читает file:// и отправляет как бинарник
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
    } else if (imageBase64) {
      // ── Web-путь: конвертируем base64/data: URI в Blob ────────────
      const dataUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      const fetchResp = await fetch(dataUrl);
      const blob = await fetchResp.blob();
      formData.append('image', blob, 'photo.jpg');
    } else if (imageUri) {
      // Fallback для web с обычным URI
      const fetchResp = await fetch(imageUri);
      const blob = await fetchResp.blob();
      formData.append('image', blob, 'photo.jpg');
    } else {
      throw new Error('Не удалось прочитать изображение для анализа');
    }

    // Координаты кропа как отдельные поля формы
    const c = crop || { x: 0, y: 0, width: 1, height: 1 };
    formData.append('crop_x', String(c.x));
    formData.append('crop_y', String(c.y));
    formData.append('crop_width', String(c.width));
    formData.append('crop_height', String(c.height));

    console.log('[AI-Vision] Sending FormData to', url);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // НЕ ставим Content-Type — браузер/RN сам добавит boundary для multipart
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.detail || `Ошибка сервера: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[AI-Vision] ERROR:', url, err.name, err.message);
    throw new Error(`[${url}] ${err.name}: ${err.message}`);
  }
}
