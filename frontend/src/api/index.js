// frontend/src/api/index.js
// Единая точка экспорта API-слоя

export * from './auth';
export * from './lessons';
export * from './exercises';
export * from './users';
export { apiRequest, tokenStorage } from './client';

