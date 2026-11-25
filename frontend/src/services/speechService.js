// frontend/src/services/speechService.js
// ─────────────────────────────────────────────────────────────────
// Сервис TTS и STT на чистом нативном Web Speech API браузера:
// 1. Нативный TTS: window.speechSynthesis + SpeechSynthesisUtterance
//    - Поиск голоса kk-KZ (казахский) или ru-RU (кириллица)
//    - Четкое воспроизведение речи без внешних сетевых зависимостей
// 2. Нативный STT: window.SpeechRecognition / window.webkitSpeechRecognition
//    - Реальный захват голоса пользователя с микрофона (kk-KZ / ru-RU)
//    - Честное сравнение через расстояние Левенштейна
//    - Если произнесены случайные слова - реальный низкий балл и незачет
// ─────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import { triggerSuccessHaptic, triggerErrorHaptic } from './hapticsService';

// ── Звуковые эффекты через Web Audio API ─────────────────────────
const playSuccessChord = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [523.25, 659.25, 783.99]; // До-Ми-Соль (аккорд победы)

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + i * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.5);

      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.55);
    });

    setTimeout(() => ctx.close(), 1000);
  } catch (_) {}
};

const playErrorBuzz = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);

    setTimeout(() => ctx.close(), 500);
  } catch (_) {}
};

// ═══════════════════════════════════════════════════════════════════
// TTS ПОЛНОСТЬЮ ОТКЛЮЧЕН ПО ТРЕБОВАНИЮ ПОЛЬЗОВАТЕЛЯ
// ═══════════════════════════════════════════════════════════════════
export const speak = () => ({ cancel: () => {} });
export const isTTSAvailable = () => false;

// ═══════════════════════════════════════════════════════════════════
// НАТИВНЫЙ WEB SPEECH RECOGNITION (STT) С ЧЕСТНОЙ ОЦЕНКОЙ
// ═══════════════════════════════════════════════════════════════════

/** Нормализация казахского текста для сравнения */
const cleanForCompare = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()«»"']/g, '')
    .trim()
    .replace(/ә/g, 'э')
    .replace(/і/g, 'и')
    .replace(/ң/g, 'н')
    .replace(/ғ/g, 'г')
    .replace(/ү/g, 'у')
    .replace(/ұ/g, 'у')
    .replace(/қ/g, 'к')
    .replace(/ө/g, 'о')
    .replace(/һ/g, 'х')
    .replace(/\s+/g, ' ');
};

/** Алгоритм расстояния Левенштейна */
const levenshteinDist = (a, b) => {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;

  const row = [];
  for (let j = 0; j <= n; j++) row[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = i;
    for (let j = 1; j <= n; j++) {
      let val;
      if (a[i - 1] === b[j - 1]) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[n] = prev;
  }
  return row[n];
};

/**
 * Честный анализ произношения на основе услышанного
 */
export const evaluatePronunciation = (heardText, expectedText) => {
  const normHeard = cleanForCompare(heardText);
  const normExpected = cleanForCompare(expectedText);

  if (!normHeard) {
    return {
      score: 0,
      isCorrect: false,
      transcript: '',
      feedback: 'Речь не услышана. Говорите прямо в микрофон.',
    };
  }

  // 1. Точное полное совпадение
  if (normHeard === normExpected) {
    return {
      score: 100,
      isCorrect: true,
      transcript: heardText,
      feedback: 'Идеально! 100% точное произношение!',
    };
  }

  // 2. Строгий расчет сходства по Левенштейну
  const maxLen = Math.max(normHeard.length, normExpected.length);
  const dist = levenshteinDist(normHeard, normExpected);

  // Штраф за пропущенные/лишние буквы (каждая буква важна)
  const lengthDiff = Math.abs(normHeard.length - normExpected.length);
  const lengthPenalty = lengthDiff * 18;

  const rawSimilarity = Math.max(0, 1 - dist / maxLen);
  const score = Math.max(0, Math.min(95, Math.round(rawSimilarity * 100 - lengthPenalty)));

  // Строгий зачет: ТОЛЬКО при высоком балле (>= 85%) и без усечения слов
  const isCorrect = score >= 85 && lengthDiff === 0 && dist <= 1;

  return {
    score,
    isCorrect,
    transcript: heardText,
    feedback: isCorrect
      ? (score >= 90 ? 'Отличное произношение!' : 'Хорошо! Слово принято.')
      : `Неверно! Вы сказали «${heardText}», а нужно сказать «${expectedText}».`,
  };
};

let activeRecognizer = null;

/**
 * Нативный Web Speech API: запуск распознавания голоса
 */
export const startRecognition = (expectedText, callbacks = {}) => {
  const { onStart, onResult, onError, maxDuration = 4500 } = callbacks;

  if (activeRecognizer) {
    try { activeRecognizer.abort(); } catch (_) {}
    activeRecognizer = null;
  }

  let finished = false;
  let autoTimer = null;

  const handleFinish = (result) => {
    if (finished) return;
    finished = true;
    clearTimeout(autoTimer);
    activeRecognizer = null;
    onResult?.(result);
  };

  const cancel = () => {
    finished = true;
    clearTimeout(autoTimer);
    if (activeRecognizer) {
      try { activeRecognizer.abort(); } catch (_) {}
      activeRecognizer = null;
    }
  };

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.lang = 'kk-KZ';
        rec.continuous = false;
        rec.interimResults = false;
        rec.maxAlternatives = 3;
        activeRecognizer = rec;

        rec.onstart = () => {
          if (!finished) onStart?.();
        };

        rec.onresult = (event) => {
          const results = event.results[0];
          let bestResult = { score: 0, isCorrect: false, transcript: '', feedback: '' };

          for (let i = 0; i < results.length; i++) {
            const transcript = results[i].transcript || '';
            const evalRes = evaluatePronunciation(transcript, expectedText);
            if (evalRes.score >= bestResult.score) {
              bestResult = evalRes;
            }
          }

          handleFinish(bestResult);
        };

        rec.onerror = (evt) => {
          if (evt.error === 'no-speech') {
            handleFinish({
              score: 0,
              isCorrect: false,
              transcript: '',
              feedback: 'Голос не услышан. Попробуйте еще раз четко произнести слово в микрофон.',
            });
            return;
          }
          if (evt.error === 'not-allowed') {
            onError?.('Доступ к микрофону заблокирован в настройках браузера.');
            finished = true;
            return;
          }

          handleFinish({
            score: 0,
            isCorrect: false,
            transcript: '',
            feedback: 'Не удалось распознать звук. Попробуйте еще раз.',
          });
        };

        rec.onend = () => {
          if (!finished) {
            handleFinish({
              score: 0,
              isCorrect: false,
              transcript: '',
              feedback: 'Запись завершена.',
            });
          }
        };

        rec.start();

        autoTimer = setTimeout(() => {
          try { rec.stop(); } catch (_) {}
        }, maxDuration);

        return { cancel, stop: () => { try { rec.stop(); } catch (_) {} } };
      } catch (err) {
        onError?.(err);
        return { cancel: () => {}, stop: () => {} };
      }
    } else {
      onError?.('Браузер не поддерживает нативный SpeechRecognition. Используйте Chrome или Edge.');
      return { cancel: () => {}, stop: () => {} };
    }
  } else {
    onError?.('Голосовой ввод на мобильном требует разрешения микрофона.');
    return { cancel: () => {}, stop: () => {} };
  }
};



export const isSTTAvailable = () => {
  if (Platform.OS !== 'web') return true;
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const playSoundFeedback = (type) => {
  switch (type) {
    case 'correct':
    case 'success':
      triggerSuccessHaptic();
      playSuccessChord();
      break;
    case 'error':
    case 'wrong':
      triggerErrorHaptic();
      playErrorBuzz();
      break;
    default:
      break;
  }
};

export default {
  speak,
  startRecognition,
  evaluatePronunciation,
  isTTSAvailable,
  isSTTAvailable,
  playSoundFeedback,
};
