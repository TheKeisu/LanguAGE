// frontend/src/screens/SoundsScreen.js
// ─────────────────────────────────────────────────────────────
// Полноценный раздел «ЗВУКИ» (Фонетический тренажер казахского языка):
// - Интерактивная сетка 9 специфических букв казахского алфавита:
//   Ә, І, Ң, Ғ, Ү, Ұ, Қ, Ө, Һ
// - Прогресс-полоса освоения каждой буквы
// - Подробная подсказка артикуляции (положение губ и языка)
// - Озвучка слов-примеров через speechService (TTS)
// - Встроенный STT-тренажер произношения с живым эквалайзером
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';

import AppText from '../components/AppText';
import AppPressable from '../components/AppPressable';
import TactileButton from '../components/TactileButton';
import { CheckIcon, SparklesIcon, TargetIcon, FlameIcon, SoundIcon } from '../components/Icons';
import { Colors, Typography, Spacing } from '../theme/theme';
import { startRecognition, playSoundFeedback } from '../services/speechService';

const LETTERS_DATA = [
  {
    char: 'Ә',
    small: 'ә',
    title: 'Мягкий «а»',
    sound: '[æ]',
    russianCompare: 'Похож на звук «я» в слове «мяч» или английский «cat» [æ]',
    articulation: 'Широко раскройте рот, кончик языка упирается в нижние зубы, а спинка языка приподнимается вперёд к твёрдому нёбу.',
    words: [
      { kz: 'Әке', ru: 'Отец' },
      { kz: 'Ән', ru: 'Песня' },
      { kz: 'Әдемі', ru: 'Красивый' },
    ],
    practiceWord: 'Әке',
  },
  {
    char: 'І',
    small: 'і',
    title: 'Краткий мягкий «и»',
    sound: '[ɪ]',
    russianCompare: 'Очень краткий, полуглухой звук, средний между русскими «и» и «ы»',
    articulation: 'Язык продвинут вперёд и поднят к нёбу. Звук произносится мгновенно, без растягивания гласного.',
    words: [
      { kz: 'Іні', ru: 'Младший брат' },
      { kz: 'Ірімшік', ru: 'Сыр' },
      { kz: 'Іс', ru: 'Дело' },
    ],
    practiceWord: 'Іні',
  },
  {
    char: 'Ң',
    small: 'ң',
    title: 'Носовой «нг»',
    sound: '[ŋ]',
    russianCompare: 'Как английское буквосочетание «ng» в слове «morning» или «sing»',
    articulation: 'Задняя спинка языка плотно смыкается с мягким нёбом. Воздушная струя полностью проходит через нос, звук «г» не произносится.',
    words: [
      { kz: 'Жаңа', ru: 'Новый' },
      { kz: 'Аң', ru: 'Зверь' },
      { kz: 'Мың', ru: 'Тысяча' },
    ],
    practiceWord: 'Жаңа',
  },
  {
    char: 'Ғ',
    small: 'ғ',
    title: 'Горловой звонкий «г»',
    sound: '[ʁ]',
    russianCompare: 'Похож на французский картавый [r] или украинский фрикативный «г»',
    articulation: 'Задняя часть языка смыкается с язычком мягкого нёба в глубине гортани, создавая звонкую вибрацию с трением.',
    words: [
      { kz: 'Ғалым', ru: 'Учёный' },
      { kz: 'Ағаш', ru: 'Дерево' },
      { kz: 'Баға', ru: 'Цена' },
    ],
    practiceWord: 'Ғалым',
  },
  {
    char: 'Ү',
    small: 'ү',
    title: 'Мягкий «у»',
    sound: '[ʏ]',
    russianCompare: 'Как немецкое «ü» в «über» или французское «u»',
    articulation: 'Сложите губы трубочкой как для звука «у», но внутри рта язык держите в позиции мягкого «и».',
    words: [
      { kz: 'Үй', ru: 'Дом' },
      { kz: 'Үлкен', ru: 'Большой' },
      { kz: 'Үш', ru: 'Три' },
    ],
    practiceWord: 'Үй',
  },
  {
    char: 'Ұ',
    small: 'ұ',
    title: 'Твёрдый «у»',
    sound: '[ʊ]',
    russianCompare: 'Глубокий твердый «у», ближе к закрытому звуку в слове «тут»',
    articulation: 'Губы вытягиваются вперед умеренно (меньше, чем в русском «у»), корень языка оттягивается назад в гортань.',
    words: [
      { kz: 'Ұл', ru: 'Сын' },
      { kz: 'Ұшақ', ru: 'Самолёт' },
      { kz: 'Ұстаз', ru: 'Учитель' },
    ],
    practiceWord: 'Ұл',
  },
  {
    char: 'Қ',
    small: 'қ',
    title: 'Глухой твердый «к»',
    sound: '[q]',
    russianCompare: 'Глубокий гортанный «к», произносится далеко в горле',
    articulation: 'Корень языка смыкается с глубокой задней стенкой глотки. Звучит сухо, щёлкающе, как лёгкое покашливание.',
    words: [
      { kz: 'Қала', ru: 'Город' },
      { kz: 'Қол', ru: 'Рука' },
      { kz: 'Қазақ', ru: 'Казах' },
    ],
    practiceWord: 'Қала',
  },
  {
    char: 'Ө',
    small: 'ө',
    title: 'Мягкий «о»',
    sound: '[œ]',
    russianCompare: 'Как немецкое «ö» в слове «Köln» или французское «eu» в «fleur»',
    articulation: 'Округлите губы как при русском «о», но язык подайте вперед и приподнимите, стараясь произнести «э».',
    words: [
      { kz: 'Өмір', ru: 'Жизнь' },
      { kz: 'Өрт', ru: 'Пожар' },
      { kz: 'Өлең', ru: 'Стихотворение' },
    ],
    practiceWord: 'Өмір',
  },
  {
    char: 'Һ',
    small: 'һ',
    title: 'Лёгкий выдох «х»',
    sound: '[h]',
    russianCompare: 'Как английский [h] в «hello» или тёплый выдох на замёрзшие руки',
    articulation: 'Звук образуется свободным выдохом воздуха через открытые голосовые связки без напряжения и без трения языка.',
    words: [
      { kz: 'Һәм', ru: 'И / также' },
      { kz: 'Гауһар', ru: 'Бриллиант' },
      { kz: 'Жиһаз', ru: 'Мебель' },
    ],
    practiceWord: 'Гауһар',
  },
];

// Компонент живого эквалайзера (Anti-AI стиль)
const LiveWaveEqualizer = ({ isRecording }) => {
  const bars = [
    useRef(new Animated.Value(6)).current,
    useRef(new Animated.Value(14)).current,
    useRef(new Animated.Value(22)).current,
    useRef(new Animated.Value(10)).current,
    useRef(new Animated.Value(18)).current,
  ];

  useEffect(() => {
    let anim;
    if (isRecording) {
      const animations = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 24 - (i % 3) * 6,
              duration: 180 + i * 40,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 6 + (i % 2) * 4,
              duration: 200 + i * 30,
              useNativeDriver: false,
            }),
          ])
        )
      );
      anim = Animated.parallel(animations);
      anim.start();
    } else {
      bars.forEach((bar) => bar.setValue(8));
    }

    return () => {
      if (anim) anim.stop();
    };
  }, [isRecording]);

  return (
    <View style={styles.equalizerRow}>
      {bars.map((bar, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.equalizerBar,
            { height: bar, backgroundColor: isRecording ? Colors.accent : Colors.inactive },
          ]}
        />
      ))}
    </View>
  );
};

const SoundsScreen = () => {
  const [selectedLetter, setSelectedLetter] = useState(LETTERS_DATA[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [sttResult, setSttResult] = useState(null);
  const recognitionRef = useRef(null);

  // Прогресс освоения по буквам (от 0 до 100%)
  const [mastery, setMastery] = useState({
    'Ә': 85,
    'І': 60,
    'Ң': 40,
    'Ғ': 50,
    'Ү': 70,
    'Ұ': 30,
    'Қ': 90,
    'Ө': 45,
    'Һ': 20,
  });

  const handleStartPractice = () => {
    if (isRecording) {
      if (recognitionRef.current?.cancel) {
        recognitionRef.current.cancel();
      }
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setSttResult(null);

    recognitionRef.current = startRecognition(selectedLetter.practiceWord, {
      onResult: (result) => {
        setIsRecording(false);
        const scorePct = typeof result.score === 'number' ? result.score : 0;
        const isGood = result.isCorrect;

        setSttResult({
          score: scorePct,
          transcript: result.transcript,
          isCorrect: isGood,
          feedback: result.feedback || (isGood ? 'Отличное произношение!' : 'Слово произнесено неверно.'),
        });

        if (isGood) {
          playSoundFeedback('correct');
          setMastery((prev) => ({
            ...prev,
            [selectedLetter.char]: Math.min(100, (prev[selectedLetter.char] || 0) + 15),
          }));
        } else {
          playSoundFeedback('wrong');
        }
      },
      onError: (err) => {
        setIsRecording(false);
        setSttResult({
          score: 0,
          transcript: '',
          isCorrect: false,
          feedback: typeof err === 'string' ? err : 'Голос не распознан. Проверьте микрофон и попробуйте снова.',
        });
        playSoundFeedback('wrong');
      },
    });
  };

  // Вычисляем средний прогресс
  const totalMastery = Math.round(
    Object.values(mastery).reduce((a, b) => a + b, 0) / LETTERS_DATA.length
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
     keyboardShouldPersistTaps="handled">
      {/* ── Заголовок раздела ── */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTitleRow}>
          <SoundIcon size={26} color={Colors.text} />
          <AppText bold size={Typography.xl} color={Colors.text} style={{ marginLeft: 10 }} ru="Звуки казахского языка">
            ДЫБЫСТАР - ЗВУКИ КАЗАХСКОГО ЯЗЫКА
          </AppText>
        </View>
        <AppText size={Typography.sm} color={Colors.textSub} style={{ marginTop: 6 }} ru="Интерактивный фонетический тренажер 9 специфических звуков">
          9 ерекше қазақ дыбысын меңгеру - 9 специфических звуков с правильным произношением
        </AppText>

        {/* Общая полоса прогресса освоения звуков */}
        <View style={styles.masterySummaryBox}>
          <View style={styles.masterySummaryHeader}>
            <AppText bold size={Typography.xs} color={Colors.text} ru="Общее освоение фонетики казахского языка">
              ДЫБЫСТАРДЫ МЕҢГЕРУ ДЕҢГЕЙІ (ОСВОЕНИЕ ЗВУКОВ)
            </AppText>
            <AppText bold size={Typography.xs} color={Colors.text}>
              {totalMastery}%
            </AppText>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${totalMastery}%` }]} />
          </View>
        </View>
      </View>

      {/* ── Интерактивная тактильная сетка букв 3×3 ── */}
      <View style={styles.gridContainer}>
        {LETTERS_DATA.map((item) => {
          const isSelected = selectedLetter.char === item.char;
          const letterScore = mastery[item.char] || 0;

          return (
            <AppPressable
              key={item.char}
              onPress={() => {
                setSelectedLetter(item);
                setSttResult(null);
              }}
              style={({ pressed }) => [
                styles.gridTile,
                isSelected && styles.gridTileSelected,
                pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
              ]}
              accessibilityLabel={`Казахская буква ${item.char}`}
            >
              {/* Значок освоения */}
              {letterScore >= 80 && (
                <View style={styles.tileCheckBadge}>
                  <CheckIcon size={12} color={Colors.white} />
                </View>
              )}

              <AppText bold size={Typography.xxl} color={Colors.text} align="center" ru={item.russianCompare}>
                {item.char} {item.small}
              </AppText>
              <AppText bold size={Typography.sm} color={Colors.textSub} align="center" style={{ marginTop: 4 }}>
                {item.sound}
              </AppText>
            </AppPressable>
          );
        })}
      </View>

      {/* ── ДЕТАЛЬНАЯ КАРТОЧКА ТРЕНАЖЕРА ДЛЯ ВЫБРАННОЙ БУКВЫ ── */}
      <View style={styles.detailCard}>
        {/* Заголовок карточки буквы */}
        <View style={styles.detailHeader}>
          <View style={styles.letterBigBadge}>
            <AppText bold size={Typography.xxl + 4} color={Colors.text}>
              {selectedLetter.char} {selectedLetter.small}
            </AppText>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <AppText bold size={Typography.lg} color={Colors.text}>
              {selectedLetter.title}
            </AppText>
            <AppText bold size={Typography.sm} color={Colors.textSub} style={{ marginTop: 2 }}>
              Фонетический знак: {selectedLetter.sound}
            </AppText>
            <View style={styles.letterMasteryRow}>
              <AppText size={Typography.xs} color={Colors.textSub}>
                Уровень освоения:
              </AppText>
              <AppText bold size={Typography.xs} color={Colors.text} style={{ marginLeft: 6 }}>
                {mastery[selectedLetter.char] || 0}%
              </AppText>
            </View>
          </View>
        </View>

        {/* 1. Сравнение с русским звуком */}
        <View style={styles.infoSection}>
          <AppText bold size={Typography.xs} color={Colors.text}>
            СРАВНЕНИЕ СО ЗНАКОМЫМИ ЗВУКАМИ:
          </AppText>
          <View style={styles.compareBox}>
            <AppText size={Typography.xs + 1} color={Colors.text} style={{ lineHeight: 19 }}>
              {selectedLetter.russianCompare}
            </AppText>
          </View>
        </View>

        {/* 2. Подсказка артикуляции (положение языка и губ) */}
        <View style={styles.infoSection}>
          <AppText bold size={Typography.xs} color={Colors.text}>
            КАК ПРАВИЛЬНО ПРОИЗНОСИТЬ (АРТИКУЛЯЦИЯ):
          </AppText>
          <View style={styles.articulationBox}>
            <AppText size={Typography.xs + 1} color={Colors.text} style={{ lineHeight: 20 }}>
              {selectedLetter.articulation}
            </AppText>
          </View>
        </View>

        {/* 3. Примеры слов */}
        <View style={styles.infoSection}>
          <AppText bold size={Typography.xs} color={Colors.text} style={{ marginBottom: 8 }}>
            ПРИМЕРЫ СЛОВ:
          </AppText>
          <View style={styles.wordsGrid}>
            {selectedLetter.words.map((w, idx) => {
              const isCurrentPractice = selectedLetter.practiceWord === w.kz;
              return (
                <AppPressable
                  key={idx}
                  onPress={() => {
                    setSelectedLetter((prev) => ({ ...prev, practiceWord: w.kz }));
                    setSttResult(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Слово ${w.kz} - ${w.ru}. Нажмите для тренировки`}
                  style={({ pressed }) => [
                    styles.wordCard,
                    isCurrentPractice && styles.wordCardActive,
                    pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
                  ]}
                >
                  <AppText bold size={Typography.base} color={Colors.text}>
                    {w.kz}
                  </AppText>
                  <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }}>
                    {w.ru}
                  </AppText>
                </AppPressable>
              );
            })}
          </View>
        </View>

        {/* 4. STT-тренажер произношения с эквалайзером */}
        <View style={styles.trainerBlock}>
          <View style={styles.trainerHeader}>
            <TargetIcon size={18} color={Colors.text} />
            <AppText bold size={Typography.xs} color={Colors.text} ru="Интерактивный тренажер произношения (STT)" style={{ marginLeft: 6 }}>
              ИНТЕРАКТИВТІ ДЫБЫСТАЛУ ТРЕНАЖЕРІ (STT)
            </AppText>
          </View>

          <View style={styles.trainerPromptBox}>
            <AppText size={Typography.xs} color={Colors.textSub} align="center" ru="Произнесите контрольное слово в микрофон:">
              Бақылау сөзін микрофонға айтыңыз:
            </AppText>
            <AppText bold size={Typography.xl} color={Colors.text} align="center" style={{ marginTop: 4 }}>
              «{selectedLetter.practiceWord}»
            </AppText>
          </View>

          {/* Живой визуальный эквалайзер */}
          <LiveWaveEqualizer isRecording={isRecording} />

          {/* Кнопка записи */}
          <AppPressable
            onPress={handleStartPractice}
            style={({ pressed }) => [
              styles.recordBtn,
              isRecording && styles.recordBtnActive,
              pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
            ]}
          >
            <AppText bold size={Typography.sm} color={Colors.text} align="center" ru={isRecording ? 'Остановить запись' : 'Начать проверку речи'}>
              {isRecording ? '■ ЖАЗУДЫ ТОҚТАТУ' : '● ДАУЫСТЫ ТЕКСЕРУ'}
            </AppText>
          </AppPressable>

          {/* Результат проверки STT */}
          {sttResult && (
            <View style={[styles.resultBox, !sttResult.isCorrect && { borderColor: '#C62828' }]}>
              <View style={styles.resultScoreRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AppText bold size={Typography.sm} color={Colors.text} ru="Точность:">
                    Дәлдігі:
                  </AppText>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: sttResult.isCorrect ? '#E8F5E9' : '#FFEBEE', borderColor: sttResult.isCorrect ? '#2E7D32' : '#C62828' },
                    ]}
                  >
                    <AppText bold size={Typography.xs} color={sttResult.isCorrect ? '#2E7D32' : '#C62828'} ru={sttResult.isCorrect ? 'Верно' : 'Неверно'}>
                      {sttResult.isCorrect ? '✓ ДҰРЫС' : '✕ ҚАТЕ'}
                    </AppText>
                  </View>
                </View>

                <View style={[styles.scorePill, { backgroundColor: sttResult.isCorrect ? Colors.accent : '#FFCDD2' }]}>
                  <AppText bold size={Typography.sm} color={sttResult.isCorrect ? Colors.text : '#C62828'}>
                    {sttResult.score}%
                  </AppText>
                </View>
              </View>
              {sttResult.transcript ? (
                <AppText size={Typography.xs} color={Colors.textSub} ru="Распознано:" style={{ marginTop: 4 }}>
                  Танылған сөз: «{sttResult.transcript}»
                </AppText>
              ) : null}
              <AppText
                bold
                size={Typography.xs}
                color={sttResult.isCorrect ? '#2E7D32' : '#C62828'}
                style={{ marginTop: 4 }}
              >
                {sttResult.feedback}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: Spacing.xxl + 20,
  },
  headerBlock: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterySummaryBox: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1.5,
    borderTopColor: Colors.inactive,
  },
  masterySummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: Colors.inactive,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.text,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  gridTile: {
    width: '31%',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    position: 'relative',
  },
  gridTileSelected: {
    backgroundColor: Colors.accent,
    borderBottomWidth: 5,
  },
  tileCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    borderWidth: 1.5,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileProgressTrack: {
    width: '80%',
    height: 6,
    backgroundColor: Colors.inactive,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.text,
    marginTop: 8,
    overflow: 'hidden',
  },
  tileProgressFill: {
    height: '100%',
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 18,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    padding: Spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.inactive,
    marginBottom: Spacing.md,
  },
  letterBigBadge: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterMasteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  letterAudioBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.accentBlue,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    marginBottom: Spacing.md,
  },
  compareBox: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 10,
    padding: Spacing.sm + 2,
    marginTop: 6,
  },
  articulationBox: {
    backgroundColor: '#FFF9C4', // мягкий тактильный желтый
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 10,
    padding: Spacing.sm + 2,
    marginTop: 6,
  },
  wordsGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  wordCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  wordCardActive: {
    backgroundColor: Colors.accent,
    borderBottomWidth: 5,
  },
  wordCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainerBlock: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trainerPromptBox: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  equalizerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 28,
    gap: 8,
    marginVertical: Spacing.sm,
  },
  equalizerBar: {
    width: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.text,
  },
  recordBtn: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 12,
    marginTop: Spacing.xs,
  },
  recordBtnActive: {
    backgroundColor: '#FF8A80',
  },
  resultBox: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    padding: Spacing.sm + 2,
    marginTop: Spacing.md,
  },
  resultScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    marginLeft: 8,
  },
  scorePill: {
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});

export default SoundsScreen;
