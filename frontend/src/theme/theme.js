// frontend/src/theme/theme.js
// ─────────────────────────────────────────────
// Дизайн-токены LanguAGE | Строго соблюдать!
// Никаких градиентов, blur-теней, glassmorphism.
// ─────────────────────────────────────────────

export const Colors = {
  // ── Фон ──────────────────────────────────────
  background: '#FFFFFF',       // Чисто белый - основной фон всех экранов

  // ── Текст ────────────────────────────────────
  text:        '#18181B',      // Угольно-чёрный - основной текст, иконки, жёсткие контуры
  textSub:     '#4A4A45',      // Второстепенный текст

  // ── Акценты ──────────────────────────────────
  accent:      '#ffe640',      // Ярко-жёлтый - активные кнопки, текущий узел карты, прогресс-бары
  accentBlue:  '#40dfff',      // Электрический голубой - шапка раздела, бейджи, TTS/STT-иконки

  // ── Неактивные / разделители ─────────────────
  inactive:    '#E5E2C9',      // Закрытые уроки, пустые слоты, разделители

  // ── Вспомогательные (не менять!) ─────────────
  white:       '#FFFFFF',
  transparent: 'transparent',
};

export const Typography = {
  fontRegular: 'JetBrainsMono_400Regular',
  fontBold:    'JetBrainsMono_700Bold',

  // Размеры
  xs:   11,
  sm:   13,
  md:   15,
  lg:   18,
  xl:   22,
  xxl:  28,
  hero: 36,
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const Radius = {
  sm:  8,
  md:  12,   // Стандартный - все кнопки и карточки
  lg:  20,
  full: 999,
};

// ── Тактильная 3D-грань (Anti-AI rules) ──────
// borderBottomWidth: 5 → при нажатии уменьшается до 2
export const TactileEdge = {
  borderWidth:          2,
  borderColor:          '#18181B',
  borderRadius:         12,
  borderBottomWidth:    5,
  borderBottomColor:    '#18181B',
};

export const TactileEdgePressed = {
  borderWidth:          2,
  borderColor:          '#18181B',
  borderRadius:         12,
  borderBottomWidth:    2,
  borderBottomColor:    '#18181B',
};

// ── Запрещено использовать ────────────────────
// shadowRadius, elevation, box-shadow с blur,
// gradient, glassmorphism, neon glow.
// ─────────────────────────────────────────────

