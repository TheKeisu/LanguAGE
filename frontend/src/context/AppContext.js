// frontend/src/context/AppContext.js
// ─────────────────────────────────────────────────────────────────
// Единый глобальный контекст LanguAGE:
// Авторизация, прогресс уроков, цель на день, навигация между экранами
// и синхронизация с реальным FastAPI-бэкендом.
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllLessons,
  getMyProgress,
  getMyProfile,
  tokenStorage,
  clearSession,
} from '../api';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  DAILY_GOAL: 'language_daily_goal',
  LOCAL_PROGRESS: 'language_local_completed_lessons',
  XP: 'language_user_xp',
  STREAK: 'language_user_streak',
  STREAK_LAST_DATE: 'language_streak_last_date', // дата последней тренировки (YYYY-MM-DD)
};

// Полная программа курса казахского языка (4 раздела, от А1 до B1)
const DEFAULT_CURRICULUM = [
  // ── РАЗДЕЛ 1: Алфавит, фонетика и базовые фразы ──
  {
    id: 1,
    sectionId: 1,
    title: 'Ә, Ө, Ү, Ұ - Мягкие и твердые гласные',
    description: 'Основа казахской фонетики и правильная артикуляция',
    type: 'THEORY',
  },
  {
    id: 2,
    sectionId: 1,
    title: 'Қ, Ғ, Ң, Һ - Гортанные и носовые звуки',
    description: 'Учимся произносить глубокие согласные',
    type: 'PRACTICE',
  },
  {
    id: 3,
    sectionId: 1,
    title: 'Сәлемдесу - Приветствия и этикет',
    description: 'Сәлеметсіз бе, Қайырлы таң, Қалыңыз қалай?',
    type: 'PRACTICE',
  },
  {
    id: 4,
    sectionId: 1,
    title: 'Танысу - Знакомство и имена',
    description: 'Менің атым..., Сіздің атыңыз кім?',
    type: 'PRACTICE',
  },
  {
    id: 5,
    sectionId: 1,
    title: 'Алғашқы сөздер - Базовый словарь',
    description: 'Иә, жоқ, рақмет, мархабат, сау болыңыз',
    type: 'PRACTICE',
  },
  {
    id: 6,
    sectionId: 1,
    title: 'Сандар - Числа от 1 до 10',
    description: 'Бір, екі, үш, төрт, бес, алты, жеті, сегіз, тоғыз, он',
    type: 'PRACTICE',
  },
  {
    id: 7,
    sectionId: 1,
    title: 'Қорытынды тест - Финал Раздела 1',
    description: 'Закрепление алфавита, звуков и первых диалогов',
    type: 'PRACTICE',
  },

  // ── РАЗДЕЛ 2: Семья, дом и распорядок дня ──
  {
    id: 8,
    sectionId: 2,
    title: 'Менің отбасым - Моя семья',
    description: 'Әке, ана, аға, әпке, іні, қарындас',
    type: 'PRACTICE',
  },
  {
    id: 9,
    sectionId: 2,
    title: 'Менің үйім - Мой дом и уют',
    description: 'Бөлме, үстел, орындық, терезе, есік',
    type: 'PRACTICE',
  },
  {
    id: 10,
    sectionId: 2,
    title: 'Күн тәртібі - Распорядок дня',
    description: 'Ояну, жұмысқа бару, түскі ас, демалу',
    type: 'PRACTICE',
  },
  {
    id: 11,
    sectionId: 2,
    title: 'Тағамдар - Еда и традиционные блюда',
    description: 'Нан, ет, шай, бауырсақ, қымыз, шұбат',
    type: 'PRACTICE',
  },

  // ── РАЗДЕЛ 3: Город, транспорт и покупки ──
  {
    id: 12,
    sectionId: 3,
    title: 'Дүкенде - Покупки и общение',
    description: 'Қанша тұрады, бағасы, сатып алу, жеңілдік',
    type: 'PRACTICE',
  },
  {
    id: 13,
    sectionId: 3,
    title: 'Қалалық көлік - В городе и транспорт',
    description: 'Автобус, такси, аялдама, метро, билет',
    type: 'PRACTICE',
  },
  {
    id: 14,
    sectionId: 3,
    title: 'Бағыт-бағдар - Как спросить дорогу',
    description: 'Оңға, солға, тура, жақын, алыс',
    type: 'PRACTICE',
  },

  // ── РАЗДЕЛ 4: Профессии, увлечения и свободное общение ──
  {
    id: 15,
    sectionId: 4,
    title: 'Мамандықтар - Кто вы по профессии',
    description: 'Дәрігер, мұғалім, инженер, кәсіпкер',
    type: 'PRACTICE',
  },
  {
    id: 16,
    sectionId: 4,
    title: 'Бос уақыт пен хобби - Увлечения',
    description: 'Кітап оқу, спорт, саяхат, музыка',
    type: 'PRACTICE',
  },
];

export const AppProvider = ({ children }) => {
  // Навигация
  const [screen, setScreen] = useState('landing'); // 'landing' | 'onboarding' | 'auth' | 'main' | 'lesson'
  const [tab, setTab] = useState('learn'); // 'learn' | 'sounds' | 'quests' | 'profile'
  const [activeLessonId, setActiveLessonId] = useState(null);

  // Пользователь и авторизация
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  // Геймификация
  const [dailyGoal, setDailyGoal] = useState(10); // минуты
  const [streak, setStreak] = useState(0);        // дни — 0 по умолчанию, растёт только у авторизованных
  const [xp, setXp] = useState(0);               // очки
  const [hearts, setHearts] = useState(5);        // жизни

  // Уроки и прогресс
  const [lessons, setLessons] = useState(DEFAULT_CURRICULUM);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set([1])); // урок 1 пройден по умолчанию
  const [progressSummary, setProgressSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Инициализация при старте ──
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Проверяем токен
        const savedToken = await tokenStorage.getAccessToken();
        if (savedToken) {
          setToken(savedToken);
          setIsAuth(true);

          // Загружаем сохраненный прогресс только для авторизованных
          const savedProgress = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_PROGRESS);
          if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            setCompletedLessonIds(new Set(parsed));
          }

          // Загружаем XP для авторизованных
          const savedXp = await AsyncStorage.getItem(STORAGE_KEYS.XP);
          if (savedXp) setXp(parseInt(savedXp, 10));

          // Загружаем и проверяем стрик для авторизованных
          await loadAndUpdateStreak();
        } else {
          // Гость: прогресс всегда сбрасывается при перезаходе, стрик = 0
          setCompletedLessonIds(new Set());
          setStreak(0);
          setXp(0);
          await AsyncStorage.removeItem(STORAGE_KEYS.LOCAL_PROGRESS);
        }

        // 2. Загружаем цель на день
        const savedGoal = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
        if (savedGoal) {
          setDailyGoal(parseInt(savedGoal, 10));
        }

        // 3. Загружаем уроки с бэкенда
        await loadBackendLessons();

        // 4. Загружаем профиль с бэкенда при наличии токена
        const currentToken = await tokenStorage.getAccessToken();
        if (currentToken) {
          await loadUserProfileAndProgress();
        }
      } catch (err) {
        console.warn('Initialization note:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // ── Загрузка и обновление стрика (только для авторизованных) ──
  // Логика: хранится дата последней тренировки и текущий стрик.
  // При загрузке: если тренировка была сегодня - стрик без изменений,
  // если вчера - стрик сохраняется, если раньше - стрик сбрасывается в 0.
  const loadAndUpdateStreak = async () => {
    try {
      const savedStreak = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
      const savedLastDate = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_LAST_DATE);
      
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

      if (!savedLastDate) {
        // Первый заход - стрик 0
        setStreak(0);
        return;
      }

      const lastDate = savedLastDate; // YYYY-MM-DD
      const diffMs = new Date(today) - new Date(lastDate);
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Уже тренировались сегодня - стрик без изменений
        setStreak(currentStreak);
      } else if (diffDays === 1) {
        // Вчера тренировались - стрик жив, но ещё не прирос (вырастет при прохождении урока)
        setStreak(currentStreak);
      } else {
        // Пропустили день(ы) - стрик сгорает
        setStreak(0);
        await AsyncStorage.setItem(STORAGE_KEYS.STREAK, '0');
      }
    } catch (_) {
      setStreak(0);
    }
  };

  // ── Загрузка уроков с реального бэкенда ──
  const loadBackendLessons = async () => {
    try {
      const data = await getAllLessons();
      if (Array.isArray(data) && data.length > 0) {
        setLessons(data);
      }
    } catch (_) {
      // При отсутствии сети или если база пуста - используем готовую программу
    }
  };

  // ── Загрузка прогресса с реального бэкенда ──
  const loadUserProfileAndProgress = async () => {
    try {
      const [profileData, progressData] = await Promise.allSettled([
        getMyProfile(),
        getMyProgress(),
      ]);

      if (profileData.status === 'fulfilled' && profileData.value) {
        setUser(profileData.value);
      }
      if (progressData.status === 'fulfilled' && progressData.value) {
        setProgressSummary(progressData.value);
        if (progressData.value.lessons) {
          const completedIds = progressData.value.lessons
            .filter((l) => l.completed)
            .map((l) => l.lessonId);
          if (completedIds.length > 0) {
            setCompletedLessonIds((prev) => new Set([...prev, ...completedIds]));
          }
        }
      }
    } catch (_) {}
  };

  // ── Навигация ──
  const navigateTo = useCallback((newScreen, lessonId = null) => {
    if (lessonId !== null) {
      setActiveLessonId(lessonId);
    }
    setScreen(newScreen);
  }, []);

  // ── Сохранение цели на день ──
  const saveGoal = async (minutes) => {
    setDailyGoal(minutes);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL, minutes.toString());
  };

  // ── Завершение урока ──
  const completeLesson = async (lessonId, earnedXp = 20) => {
    const updated = new Set(completedLessonIds);
    updated.add(lessonId);
    setCompletedLessonIds(updated);

    const newXp = xp + earnedXp;
    setXp(newXp);

    const saveOps = [
      AsyncStorage.setItem(STORAGE_KEYS.XP, newXp.toString()),
    ];

    // Прогресс и стрик сохраняются только для авторизованных пользователей
    if (isAuth) {
      saveOps.push(
        AsyncStorage.setItem(STORAGE_KEYS.LOCAL_PROGRESS, JSON.stringify(Array.from(updated)))
      );

      // Обновляем стрик: проверяем дату последней тренировки
      try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const savedLastDate = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_LAST_DATE);
        
        let newStreak = streak;
        if (savedLastDate !== today) {
          // Первая тренировка за сегодня - прирост стрика
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);

          if (savedLastDate === yesterdayStr || !savedLastDate) {
            // Вчера тренировались или это первый раз - прирост
            newStreak = streak + 1;
          } else {
            // Пропустили - стрик начинается заново с 1
            newStreak = 1;
          }
          setStreak(newStreak);
          await AsyncStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
          await AsyncStorage.setItem(STORAGE_KEYS.STREAK_LAST_DATE, today);
        }
      } catch (_) {}
    }

    await Promise.all(saveOps);

    // Возврат на главный экран
    setScreen('main');
  };

  // ── Начисление XP за задания / награды ──
  const addXp = async (amount) => {
    // XP начисляется только авторизованным
    if (!isAuth) return;
    const newXp = xp + amount;
    setXp(newXp);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.XP, newXp.toString());
    } catch (_) {}
  };

  // ── Вход / Выход ──
  const handleLogout = async () => {
    await clearSession();
    setIsAuth(false);
    setUser(null);
    setToken(null);
    // При выходе сбрасываем все данные пользователя
    setStreak(0);
    setXp(0);
    setCompletedLessonIds(new Set());
    setScreen('landing');
  };

  const handleAuthSuccess = async (session) => {
    setIsAuth(true);
    setToken(session.access_token);
    if (session.user) {
      setUser(session.user);
    }
    // При входе загружаем стрик из хранилища
    await loadAndUpdateStreak();
    // Загружаем XP
    const savedXp = await AsyncStorage.getItem(STORAGE_KEYS.XP);
    if (savedXp) setXp(parseInt(savedXp, 10));
    // Загружаем прогресс
    const savedProgress = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_PROGRESS);
    if (savedProgress) {
      setCompletedLessonIds(new Set(JSON.parse(savedProgress)));
    }
    await loadUserProfileAndProgress();
    setScreen('main');
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        tab,
        activeLessonId,
        user,
        token,
        isAuth,
        dailyGoal,
        streak,
        xp,
        hearts,
        lessons,
        completedLessonIds,
        progressSummary,
        loading,
        navigateTo,
        setTab,
        saveGoal,
        completeLesson,
        addXp,
        handleLogout,
        handleAuthSuccess,
        reloadLessons: loadBackendLessons,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

