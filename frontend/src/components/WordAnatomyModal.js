// frontend/src/components/WordAnatomyModal.js
// ─────────────────────────────────────────────────────────────
// Компонент «Анатомия казахского слова»:
// Визуализирует морфемный разбор казахского слова/фразы:
// корень + суффиксы + притяжательные/падежные окончания в виде
// тактильных цветных кубиков-блоков в дизайне Anti-AI.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import AppText from './AppText';
import AppPressable from '../components/AppPressable';
import { Colors, Typography, Spacing } from '../theme/theme';
import { CloseIcon, SparklesIcon } from './Icons';

// Словарь морфемного разбора для всех ключевых фраз уроков и практики
export const MORPHEME_DB = {
  'Қалаларымызда': [
    { morph: 'Қала', role: 'корень', meaning: 'город', type: 'root' },
    { morph: 'лар', role: 'мн. число', meaning: 'множество', type: 'affix' },
    { morph: 'ымыз', role: 'притяж.', meaning: 'наш (1 л. мн.ч.)', type: 'possession' },
    { morph: 'да', role: 'местный пад.', meaning: 'где? / в чём?', type: 'case' },
  ],
  'Қалаларымыздан': [
    { morph: 'Қала', role: 'корень', meaning: 'город', type: 'root' },
    { morph: 'лар', role: 'мн. число', meaning: 'множество', type: 'affix' },
    { morph: 'ымыз', role: 'притяж.', meaning: 'наш', type: 'possession' },
    { morph: 'дан', role: 'исходный пад.', meaning: 'откуда? / из', type: 'case' },
  ],
  'Менің атым': [
    { morph: 'Менің', role: 'местоим.', meaning: 'мой / моя (родительный)', type: 'root' },
    { morph: 'ат', role: 'корень', meaning: 'имя / конь', type: 'root' },
    { morph: 'ым', role: 'притяж.', meaning: 'мой (1 л. ед.ч.)', type: 'possession' },
  ],
  'Атыңыз': [
    { morph: 'Ат', role: 'корень', meaning: 'имя', type: 'root' },
    { morph: 'ыңыз', role: 'притяж. вежл.', meaning: 'Ваше (2 л. вежл.)', type: 'possession' },
  ],
  'Сәлеметсіз бе': [
    { morph: 'Сәлемет', role: 'корень', meaning: 'здоровье / мир', type: 'root' },
    { morph: 'сіз', role: 'местоим.', meaning: 'Вы (вежливая форма)', type: 'possession' },
    { morph: 'бе', role: 'вопрос. част.', meaning: 'вопросительная частица', type: 'case' },
  ],
  'Сәлем': [
    { morph: 'Сәлем', role: 'корень', meaning: 'привет / приветствие', type: 'root' },
  ],
  'Рақмет': [
    { morph: 'Рақмет', role: 'корень', meaning: 'спасибо / благодарность', type: 'root' },
  ],
  'Иә': [
    { morph: 'Иә', role: 'частица', meaning: 'да (согласие)', type: 'root' },
  ],
  'Жоқ': [
    { morph: 'Жоқ', role: 'частица', meaning: 'нет / отсутствует', type: 'root' },
  ],
  'Алмалар': [
    { morph: 'Алма', role: 'корень', meaning: 'яблоко', type: 'root' },
    { morph: 'лар', role: 'мн. число', meaning: 'множественное число', type: 'affix' },
  ],
  'Алма': [
    { morph: 'Алма', role: 'корень', meaning: 'яблоко', type: 'root' },
  ],
  'Үйде': [
    { morph: 'Үй', role: 'корень', meaning: 'дом', type: 'root' },
    { morph: 'де', role: 'местный пад.', meaning: 'в доме (где?)', type: 'case' },
  ],
  'Үй': [
    { morph: 'Үй', role: 'корень', meaning: 'дом', type: 'root' },
  ],
  'Үлкен': [
    { morph: 'Үлкен', role: 'корень/прил.', meaning: 'большой / старший', type: 'root' },
  ],
  'Кіші': [
    { morph: 'Кіші', role: 'корень/прил.', meaning: 'маленький / младший', type: 'root' },
  ],
  'Мектепте': [
    { morph: 'Мектеп', role: 'корень', meaning: 'школа', type: 'root' },
    { morph: 'те', role: 'местный пад.', meaning: 'в школе (где?)', type: 'case' },
  ],
  'Мектеп': [
    { morph: 'Мектеп', role: 'корень', meaning: 'школа', type: 'root' },
  ],
  'Дәрігер': [
    { morph: 'Дәрі', role: 'корень', meaning: 'лекарство', type: 'root' },
    { morph: 'гер', role: 'суффикс', meaning: 'суффикс профессии (лекарь)', type: 'affix' },
  ],
  'Мұғалім': [
    { morph: 'Мұғалім', role: 'корень', meaning: 'учитель / преподаватель', type: 'root' },
  ],
  'Оқушы': [
    { morph: 'Оқу', role: 'корень', meaning: 'учёба / читать', type: 'root' },
    { morph: 'шы', role: 'суффикс лица', meaning: 'тот, кто учится (ученик)', type: 'affix' },
  ],
  'Барамын': [
    { morph: 'Бар', role: 'корень', meaning: 'идти / ехать', type: 'root' },
    { morph: 'а', role: 'наст. время', meaning: 'суффикс перехода', type: 'affix' },
    { morph: 'мын', role: 'личное оконч.', meaning: 'я (1-е лицо ед.ч.)', type: 'possession' },
  ],
  'Бармаймын': [
    { morph: 'Бар', role: 'корень', meaning: 'идти', type: 'root' },
    { morph: 'май', role: 'отрицание', meaning: 'не (отрицательный суффикс)', type: 'affix' },
    { morph: 'мын', role: 'личное оконч.', meaning: 'я', type: 'possession' },
  ],
  'Келдіңіз': [
    { morph: 'Кел', role: 'корень', meaning: 'приходить', type: 'root' },
    { morph: 'ді', role: 'прош. время', meaning: 'суффикс прош. времени', type: 'affix' },
    { morph: 'ңіз', role: 'личное вежл.', meaning: 'Вы (2-е лицо вежл.)', type: 'possession' },
  ],
  'Қош келдіңіз': [
    { morph: 'Қош', role: 'наречие', meaning: 'добро / приятно', type: 'root' },
    { morph: 'кел', role: 'корень', meaning: 'приходить', type: 'root' },
    { morph: 'ді', role: 'прош. время', meaning: 'прошедшее время', type: 'affix' },
    { morph: 'ңіз', role: 'вежл. лицо', meaning: 'Вы', type: 'possession' },
  ],
  'Жақсы': [
    { morph: 'Жақсы', role: 'прилаг./нареч.', meaning: 'хорошо / хороший', type: 'root' },
  ],
  'Жаман': [
    { morph: 'Жаман', role: 'прилаг./нареч.', meaning: 'плохо / плохой', type: 'root' },
  ],
  'Базарда': [
    { morph: 'Базар', role: 'корень', meaning: 'рынок / базар', type: 'root' },
    { morph: 'да', role: 'местный пад.', meaning: 'на базаре (где?)', type: 'case' },
  ],
  'Дүкенде': [
    { morph: 'Дүкен', role: 'корень', meaning: 'магазин', type: 'root' },
    { morph: 'де', role: 'местный пад.', meaning: 'в магазине (где?)', type: 'case' },
  ],
  'Апта': [
    { morph: 'Апта', role: 'корень', meaning: 'неделя (7 дней)', type: 'root' },
  ],
  'Бүгін': [
    { morph: 'Бұл', role: 'указат.', meaning: 'этот', type: 'root' },
    { morph: 'күн', role: 'корень', meaning: 'день (слитно: бүгін = сегодня)', type: 'root' },
  ],
  'Ертең': [
    { morph: 'Ертең', role: 'наречие', meaning: 'завтра / утром', type: 'root' },
  ],
  'Кеше': [
    { morph: 'Кеше', role: 'наречие', meaning: 'вчера', type: 'root' },
  ],
  'Бір': [{ morph: 'Бір', role: 'числит.', meaning: 'один (1)', type: 'root' }],
  'Екі': [{ morph: 'Екі', role: 'числит.', meaning: 'два (2)', type: 'root' }],
  'Үш': [{ morph: 'Үш', role: 'числит.', meaning: 'три (3)', type: 'root' }],
  'Төрт': [{ morph: 'Төрт', role: 'числит.', meaning: 'четыре (4)', type: 'root' }],
  'Бес': [{ morph: 'Бес', role: 'числит.', meaning: 'пять (5)', type: 'root' }],
  'Алты': [{ morph: 'Алты', role: 'числит.', meaning: 'шесть (6)', type: 'root' }],
  'Жеті': [{ morph: 'Жеті', role: 'числит.', meaning: 'семь (7)', type: 'root' }],
  'Сегіз': [{ morph: 'Сегіз', role: 'числит.', meaning: 'восемь (8)', type: 'root' }],
  'Тоғыз': [{ morph: 'Тоғыз', role: 'числит.', meaning: 'девять (9)', type: 'root' }],
  'Он': [{ morph: 'Он', role: 'числит.', meaning: 'десять (10)', type: 'root' }],
};

// Умный определитель/разборщик слов
export function getWordBreakdown(query) {
  if (!query) return null;
  const clean = query.trim().replace(/[.,!?;:«»"']/g, '');

  // 1. Точное совпадение
  if (MORPHEME_DB[clean]) return MORPHEME_DB[clean];

  // 2. Поиск по регистронезависимому ключу
  const lowerQuery = clean.toLowerCase();
  for (const [key, val] of Object.entries(MORPHEME_DB)) {
    if (key.toLowerCase() === lowerQuery) return val;
  }

  // 3. Если фраза из нескольких слов, пробуем разбить по первому слову
  const words = clean.split(/\s+/);
  if (words.length > 1) {
    for (const w of words) {
      if (MORPHEME_DB[w]) return MORPHEME_DB[w];
    }
  }

  // 4. Эвристический морфемный разбор (агглютинативный парсер казахского)
  // Проверяем окончания множественного числа (лар/лер/дар/дер/тар/тер)
  const plurals = ['лар', 'лер', 'дар', 'дер', 'тар', 'тер'];
  for (const p of plurals) {
    if (lowerQuery.endsWith(p) && lowerQuery.length > p.length + 2) {
      const rootPart = clean.slice(0, clean.length - p.length);
      const affixPart = clean.slice(clean.length - p.length);
      return [
        { morph: rootPart, role: 'корень', meaning: 'основа слова', type: 'root' },
        { morph: affixPart, role: 'мн. число', meaning: 'множественное число', type: 'affix' },
      ];
    }
  }

  // Проверяем падежные окончания местного падежа (да/де/та/те)
  const locatives = ['да', 'де', 'та', 'те'];
  for (const loc of locatives) {
    if (lowerQuery.endsWith(loc) && lowerQuery.length > loc.length + 2) {
      const rootPart = clean.slice(0, clean.length - loc.length);
      const locPart = clean.slice(clean.length - loc.length);
      return [
        { morph: rootPart, role: 'корень', meaning: 'основа слова', type: 'root' },
        { morph: locPart, role: 'местный пад.', meaning: 'где? / в чём?', type: 'case' },
      ];
    }
  }

  // Дефолтный разбор
  return [
    { morph: clean, role: 'корень', meaning: 'словарная форма', type: 'root' },
  ];
}

const getMorphemeColor = (type) => {
  switch (type) {
    case 'root':
      return Colors.accent; // #ffe640 - корень слова
    case 'affix':
      return Colors.accentBlue; // #40dfff - суффиксы и множественность
    case 'possession':
      return '#B4E7FF'; // притяжательные формы
    case 'case':
    default:
      return Colors.inactive; // #E5E2C9 - падежные окончания
  }
};

const WordAnatomyModal = ({ visible, word, onClose }) => {
  if (!visible) return null;

  const breakdown = getWordBreakdown(word);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Верхняя строка с заголовком и крестиком */}
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <SparklesIcon size={18} color={Colors.text} />
              <AppText bold size={Typography.sm} color={Colors.text} style={{ marginLeft: 6 }}>
                АНАТОМИЯ КАЗАХСКОГО СЛОВА
              </AppText>
            </View>
            <AppPressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && { transform: [{ translateY: 2 }] }]}
              accessibilityLabel="Закрыть анатомию слова"
            >
              <CloseIcon size={18} />
            </AppPressable>
          </View>

          {/* Исходное слово/фраза */}
          <View style={styles.sourceWordBox}>
            <AppText bold size={Typography.xl} color={Colors.text} align="center">
              {word}
            </AppText>
            <AppText size={Typography.xs} color={Colors.textSub} align="center" style={{ marginTop: 4 }}>
              Казахский язык - агглютинативный: значения собираются присоединением аффиксов к корню!
            </AppText>
          </View>

          {/* Морфемные блоки-кубики */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cubesRow} keyboardShouldPersistTaps="handled">
            {breakdown && breakdown.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <View style={styles.plusSignWrap}>
                    <AppText bold size={Typography.lg} color={Colors.textSub}>+</AppText>
                  </View>
                )}
                <View style={[styles.morphemeCube, { backgroundColor: getMorphemeColor(item.type) }]}>
                  <View style={styles.cubeTop}>
                    <AppText bold size={Typography.base} color={Colors.text}>
                      {item.morph}
                    </AppText>
                  </View>
                  <View style={styles.cubeDivider} />
                  <View style={styles.cubeBottom}>
                    <AppText bold size={Typography.xs} color={Colors.text} numberOfLines={1}>
                      {item.role}
                    </AppText>
                    <AppText size={Typography.xs - 2} color={Colors.textSub} numberOfLines={2}>
                      {item.meaning}
                    </AppText>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </ScrollView>

          {/* Легенда цветов */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
              <AppText size={Typography.xs} color={Colors.textSub}>Корень</AppText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.accentBlue }]} />
              <AppText size={Typography.xs} color={Colors.textSub}>Аффикс</AppText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.inactive }]} />
              <AppText size={Typography.xs} color={Colors.textSub}>Падеж / Форма</AppText>
            </View>
          </View>

          {/* Кнопка закрытия */}
          <AppPressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
            ]}
          >
            <AppText bold size={Typography.sm} color={Colors.text} align="center" ru="Понятно, спасибо!">
              ТҮСІНІКТІ, РАҚМЕТ!
            </AppText>
          </AppPressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    zIndex: 99999,
  },
  card: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    backgroundColor: Colors.inactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceWordBox: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cubesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  plusSignWrap: {
    paddingHorizontal: 8,
  },
  morphemeCube: {
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    minWidth: 90,
    maxWidth: 120,
    overflow: 'hidden',
  },
  cubeTop: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cubeDivider: {
    height: 1.5,
    backgroundColor: Colors.text,
  },
  cubeBottom: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.text,
    marginRight: 6,
  },
  actionBtn: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 12,
    marginTop: Spacing.xs,
  },
});

export default WordAnatomyModal;
