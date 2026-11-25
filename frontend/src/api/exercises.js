// frontend/src/api/exercises.js
// ─────────────────────────────────────────────────────────────────
// Публичные маршруты:
//   GET  /lesson/{lessonId}/exercises   → ExerciseResponse[]
//
// Требуют авторизации (Supabase JWT):
//   POST /exercises/{exerciseId}/answer → SubmitAnswerResponse
//
// Только администратор:
//   POST   /lesson/{lessonId}/exercises → ExerciseResponse (201)
//   PUT    /exercises/{exerciseId}      → ExerciseResponse
//   DELETE /exercises/{exerciseId}      → null (204)
//
// Схема ExerciseResponse:
//   { id, prompt, type: 'TEXT'|'MULTIPLE_CHOICE'|'FILL_BLANK', options: string[]|null }
//
// Схема SubmitAnswerResponse:
//   { isCorrect: boolean, correctAnswer: string|null }
//   correctAnswer - null если ответ верный, иначе правильный ответ.
// ─────────────────────────────────────────────────────────────────

import { apiRequest } from './client';

/**
 * Получить все упражнения урока (публично).
 * @param {number} lessonId
 */
export const getExercisesForLesson = (lessonId) =>
  apiRequest(`/lesson/${lessonId}/exercises`, {}, false);

/**
 * Отправить ответ на упражнение (требует авторизации).
 * @param {number} exerciseId
 * @param {string} answer
 * @returns {Promise<{ isCorrect: boolean, correctAnswer: string|null }>}
 */
export const submitAnswer = (exerciseId, answer) =>
  apiRequest(`/exercises/${exerciseId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });

// ── Только администратор ──────────────────────────────────────────

/**
 * Создать упражнение в уроке (admin).
 * @param {number} lessonId
 * @param {{
 *   prompt: string,
 *   correctAnswer: string,
 *   type?: 'TEXT' | 'MULTIPLE_CHOICE' | 'FILL_BLANK',
 *   options?: string[]
 * }} payload
 */
export const createExercise = (lessonId, payload) =>
  apiRequest(`/lesson/${lessonId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

/**
 * Обновить упражнение (admin).
 * @param {number} exerciseId
 * @param {{
 *   prompt: string,
 *   correctAnswer: string,
 *   type?: 'TEXT' | 'MULTIPLE_CHOICE' | 'FILL_BLANK',
 *   options?: string[]
 * }} payload
 */
export const updateExercise = (exerciseId, payload) =>
  apiRequest(`/exercises/${exerciseId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

/**
 * Удалить упражнение (admin).
 * - 404 - не найдено
 * - 409 - есть ответы пользователей
 * @param {number} exerciseId
 */
export const deleteExercise = (exerciseId) =>
  apiRequest(`/exercises/${exerciseId}`, { method: 'DELETE' });

