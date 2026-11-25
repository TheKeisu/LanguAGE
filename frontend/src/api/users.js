// frontend/src/api/users.js
// ─────────────────────────────────────────────────────────────────
// Маршруты пользователей (все требуют авторизации):
//   GET /users/me             → UserResponse
//   GET /users/me/progress    → ProgressSummary
//   GET /users/me/attempts    → ExerciseAttemptResponse[]
//   GET /users/{id}           → UserResponse  (только admin)
//
// Схемы ответов:
//
//   UserResponse:
//     { id: number, email: string, displayName: string }
//
//   ProgressSummary:
//     {
//       totalAttempts: number,
//       correctAttempts: number,
//       incorrectAttempts: number,
//       accuracyPercent: number,
//       totalLessons: number,
//       completedLessons: number,
//       lessons: LessonProgress[]
//     }
//
//   LessonProgress:
//     {
//       lessonId: number,
//       title: string,
//       totalExercises: number,
//       answeredExercises: number,
//       correctExercises: number,
//       completed: boolean
//     }
//
//   ExerciseAttemptResponse:
//     { id: number, exerciseId: number, isCorrect: boolean, createdAt: string }
//
// Урок считается завершённым когда:
//   - answered == total (все упражнения отвечены)
//   - correct >= total / 2  (не менее 50% верно)
//   - урок не пустой (total > 0)
// ─────────────────────────────────────────────────────────────────

import { apiRequest } from './client';

/**
 * Получить профиль текущего пользователя.
 * При первом вызове GET /users/me бэкенд создаёт запись пользователя
 * (get_or_create_supabase_user) по sub и email из JWT.
 * @returns {Promise<{ id: number, email: string, displayName: string }>}
 */
export const getMyProfile = () =>
  apiRequest('/users/me');

/**
 * Получить сводку прогресса текущего пользователя.
 * @returns {Promise<ProgressSummary>}
 */
export const getMyProgress = () =>
  apiRequest('/users/me/progress');

/**
 * Получить историю попыток текущего пользователя (от новых к старым).
 * @returns {Promise<ExerciseAttemptResponse[]>}
 */
export const getMyAttempts = () =>
  apiRequest('/users/me/attempts');

/**
 * Получить пользователя по ID (только admin).
 * @param {number} userId
 * @returns {Promise<{ id: number, email: string, displayName: string }>}
 */
export const getUserById = (userId) =>
  apiRequest(`/users/${userId}`);

