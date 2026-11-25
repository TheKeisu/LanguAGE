// frontend/src/api/lessons.js
// ─────────────────────────────────────────────────────────────────
// Маршруты уроков (публичные - без токена):
//   GET  /lesson                    → LessonResponse[]
//   GET  /lesson/{id}               → LessonResponse
//   GET  /lesson/by-type?type=...   → LessonResponse[]
//
// Только для администратора (требуют токена):
//   POST   /lesson                  → LessonResponse (201)
//   PUT    /lesson/{id}             → LessonResponse
//   DELETE /lesson/{id}             → null (204)
//
// Схема LessonResponse: { id, title, description, type: 'THEORY'|'PRACTICE' }
// ─────────────────────────────────────────────────────────────────

import { apiRequest } from './client';

/** Получить все уроки (публично). */
export const getAllLessons = () =>
  apiRequest('/lesson', {}, false);

/**
 * Получить урок по ID (публично).
 * @param {number} id
 */
export const getLessonById = (id) =>
  apiRequest(`/lesson/${id}`, {}, false);

/**
 * Получить уроки по типу (публично).
 * @param {'THEORY' | 'PRACTICE'} type
 */
export const getLessonsByType = (type) =>
  apiRequest(`/lesson/by-type?type=${type}`, {}, false);

// ── Только администратор ──────────────────────────────────────────

/**
 * Создать урок (admin).
 * @param {{ title: string, description: string, type: 'THEORY'|'PRACTICE' }} payload
 */
export const createLesson = (payload) =>
  apiRequest('/lesson', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

/**
 * Обновить урок (admin).
 * @param {number} id
 * @param {{ title: string, description: string, type: 'THEORY'|'PRACTICE' }} payload
 */
export const updateLesson = (id, payload) =>
  apiRequest(`/lesson/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

/**
 * Удалить урок (admin).
 * Возвращает null (204) или бросает ошибку:
 *   - 404 - урок не найден
 *   - 409 - нельзя удалить (есть ответы пользователей)
 * @param {number} id
 */
export const deleteLesson = (id) =>
  apiRequest(`/lesson/${id}`, { method: 'DELETE' });

