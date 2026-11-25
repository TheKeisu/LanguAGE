// frontend/src/screens/DialoguesScreen.js
// ─────────────────────────────────────────────────────────────
// Раздел «СЦЕНАРИИ / ДИАЛОГИ»:
// Интерактивные пошаговые диалоги из реальной жизни:
// 1. «В кофейне» (Кофеханада) - заказ кофе и десерта
// 2. «На Зелёном базаре» (Жасыл базарда) - вопрос о цене и покупка
// 3. «Знакомство и приветствие» (Танысу) - этикет сәлемдесу
// Чат с персонажем, озвучка TTS, варианты ответа / STT и XP.
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';

import AppText from '../components/AppText';
import AppPressable from '../components/AppPressable';
import TactileButton from '../components/TactileButton';
import {
  MessageIcon,
  CheckIcon,
  StarIcon,
  SparklesIcon,
  ArrowLeftIcon,
  TargetIcon,
} from '../components/Icons';
import { Colors, Typography, Spacing } from '../theme/theme';
import { startRecognition, playSoundFeedback } from '../services/speechService';
import { useApp } from '../context/AppContext';

const DIALOGUES_DATA = [
  {
    id: 'coffee_shop',
    title: 'Кофеханада',
    subtitle: 'В кофейне',
    desc: 'Заказ напитка и традиционного десерта в алматинской кофейне',
    character: 'Айбек (Бариста)',
    xpReward: 30,
    steps: [
      {
        characterText: 'Сәлеметсіз бе! Кофеханамызға қош келдіңіз. Не ішесіз?',
        characterRu: 'Здравствуйте! Добро пожаловать в нашу кофейню. Что будете пить?',
        options: [
          { text: 'Сәлеметсіз бе! Маған бір үлкен капучино беріңізші.', ru: 'Здравствуйте! Дайте мне один большой капучино, пожалуйста.', isCorrect: true },
          { text: 'Жоқ, мен білмеймін.', ru: 'Нет, я не знаю.', isCorrect: false },
          { text: 'Сау болыңыз!', ru: 'До свидания!', isCorrect: false },
        ],
      },
      {
        characterText: 'Әрине! Сүті қандай болсын: кәдімгі ме әлде сұлы сүті ме?',
        characterRu: 'Конечно! Какое молоко: обычное или овсяное?',
        options: [
          { text: 'Сұлы сүтімен жасаңызшы, рақмет!', ru: 'Сделайте на овсяном молоке, спасибо!', isCorrect: true },
          { text: 'Бүгін күн суық.', ru: 'Сегодня холодно.', isCorrect: false },
          { text: 'Үш алма беріңіз.', ru: 'Дайте три яблока.', isCorrect: false },
        ],
      },
      {
        characterText: 'Жақсы! Тәттілерден бауырсақ немесе балбұлақ аласыз ба?',
        characterRu: 'Хорошо! Из сладкого возьмёте баурсаки или десерт?',
        options: [
          { text: 'Иә, екі ыстық бауырсақ қосыңызшы.', ru: 'Да, добавьте два горячих баурсака, пожалуйста.', isCorrect: true },
          { text: 'Жоқ, мен барамын.', ru: 'Нет, я иду.', isCorrect: false },
          { text: 'Кеше келдім.', ru: 'Я вчера пришёл.', isCorrect: false },
        ],
      },
      {
        characterText: 'Тамаша таңдау! Картамен төлейсіз бе, қолма-қол ма?',
        characterRu: 'Отличный выбор! Оплата картой или наличными?',
        options: [
          { text: 'Картамен төлеймін. Мінекейіңіз!', ru: 'Оплачу картой. Вот, пожалуйста!', isCorrect: true },
          { text: 'Білмеймін.', ru: 'Не знаю.', isCorrect: false },
          { text: 'Менің атым Айбек.', ru: 'Меня зовут Айбек.', isCorrect: false },
        ],
      },
      {
        characterText: 'Рақмет! Сіздің тапсырысыңыз бес минутта дайын болады. Асыңыз дәмді болсын!',
        characterRu: 'Спасибо! Ваш заказ будет готов через пять минут. Приятного аппетита!',
        options: [
          { text: 'Үлкен рақмет! Күні бойы жақсы көңіл-күй тілеймін!', ru: 'Большое спасибо! Желаю отличного настроения на весь день!', isCorrect: true },
          { text: 'Иә, жоқ.', ru: 'Да, нет.', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'green_bazaar',
    title: 'Жасыл базарда',
    subtitle: 'На Зелёном базаре',
    desc: 'Покупка свежих алматинских яблок «Апорт» и домашнего курта',
    character: 'Серік аға (Сатушы)',
    xpReward: 35,
    steps: [
      {
        characterText: 'Ассалаумағалейкүм, бауырым! Келіңіз, ең тәтті апорт алмалары осында!',
        characterRu: 'Мир вам, дорогой! Подходите, самые сладкие яблоки апорт здесь!',
        options: [
          { text: 'Уағалейкүмассалам! Апорт алмасының келісі қаншадан?', ru: 'И вам мир! Почём килограмм яблок апорт?', isCorrect: true },
          { text: 'Мен мектепке барамын.', ru: 'Я иду в школу.', isCorrect: false },
          { text: 'Сағат неше?', ru: 'Который час?', isCorrect: false },
        ],
      },
      {
        characterText: 'Келісі бар болғаны бір мың екі жүз теңге. Дәмін татып көріңіз, бал сияқты!',
        characterRu: 'Килограмм всего тысяча двести тенге. Попробуйте на вкус, как мёд!',
        options: [
          { text: 'Өте дәмді екен! Маған үш келі тартып беріңізші.', ru: 'Очень вкусно! Взвесьте мне три килограмма, пожалуйста.', isCorrect: true },
          { text: 'Жоқ, алма жаман.', ru: 'Нет, яблоко плохое.', isCorrect: false },
          { text: 'Кеше көрдім.', ru: 'Вчера видел.', isCorrect: false },
        ],
      },
      {
        characterText: 'Мінекей, тура үш келі. Құрт немесе сары май керек пе? Бүгін таңертең ауылдан келді!',
        characterRu: 'Вот, ровно три килограмма. Нужен курт или топлёное масло? Сегодня утром из аула!',
        options: [
          { text: 'Жаңа піскен тұзды құрттан жарты келі беріңіз.', ru: 'Дайте полкило свежего солёного курта.', isCorrect: true },
          { text: 'Мен шай іштім.', ru: 'Я пил чай.', isCorrect: false },
        ],
      },
      {
        characterText: 'Барлығы төрт мың теңге болды. Тұрақты тұтынушы ретінде екі жүз теңге түсіріп берейін!',
        characterRu: 'Всего четыре тысячи тенге. Как постоянному покупателю скину двести тенге!',
        options: [
          { text: 'Көп рақмет, берекесін берсін! Саудаңыз сәтті болсын!', ru: 'Большое спасибо, пусть будет во благо! Удачной торговли!', isCorrect: true },
          { text: 'Жоқ, рақмет жоқ.', ru: 'Нет, никакого спасибо.', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'greeting_etiquette',
    title: 'Танысу және сәлемдесу',
    subtitle: 'Знакомство и приветствие',
    desc: 'Вежливое знакомство при встрече с новыми друзьями и коллегами',
    character: 'Айгүл (Әріптес)',
    xpReward: 25,
    steps: [
      {
        characterText: 'Сәлеметсіз бе! Менің атым - Айгүл. Біздің командаға қош келдіңіз!',
        characterRu: 'Здравствуйте! Меня зовут Айгүл. Добро пожаловать в нашу команду!',
        options: [
          { text: 'Сәлеметсіз бе, Айгүл! Менің атым - Арман. Танысқаныма өте қуаныштымын!', ru: 'Здравствуйте, Айгүл! Меня зовут Арман. Очень рад познакомиться!', isCorrect: true },
          { text: 'Иә, алма бар.', ru: 'Да, есть яблоки.', isCorrect: false },
          { text: 'Қайырлы түн.', ru: 'Доброй ночи.', isCorrect: false },
        ],
      },
      {
        characterText: 'Қайдан боласыз? Қазақ тілін қайда үйреніп жүрсіз?',
        characterRu: 'Откуда вы? Где учите казахский язык?',
        options: [
          { text: 'Мен осында туып-өстім, қазір LanguAGE платформасында тіл үйреніп жүрмін!', ru: 'Я здесь родился и вырос, сейчас изучаю язык на платформе LanguAGE!', isCorrect: true },
          { text: 'Бүгін демалыс күні.', ru: 'Сегодня выходной.', isCorrect: false },
        ],
      },
      {
        characterText: 'Керемет! Сіздің қазақша сөйлегеніңіз өте таза әрі түсінікті екен!',
        characterRu: 'Замечательно! Ваша казахская речь очень чистая и понятная!',
        options: [
          { text: 'Жылы сөздеріңізге көп рақмет! Бірге жақсы жұмыс істейміз деп сенемін.', ru: 'Большое спасибо за теплые слова! Уверен, мы сработаемся.', isCorrect: true },
          { text: 'Жоқ, мен білмеймін.', ru: 'Нет, я не знаю.', isCorrect: false },
        ],
      },
    ],
  },
];

const DialoguesScreen = () => {
  const { completeLesson } = useApp();
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef(null);

  // Старт сценария
  const handleSelectDialogue = (diag) => {
    setActiveDialogue(diag);
    setCurrentStepIdx(0);
    setIsCompleted(false);
    // Добавляем первую реплику персонажа
    setDialogueHistory([
      {
        speaker: 'character',
        name: diag.character,
        kz: diag.steps[0].characterText,
        ru: diag.steps[0].characterRu,
      },
    ]);
  };

  const handleSelectOption = (opt) => {
    if (!opt.isCorrect) {
      playSoundFeedback('wrong');
      return;
    }

    playSoundFeedback('correct');

    // Добавляем реплику пользователя
    const updatedHistory = [
      ...dialogueHistory,
      {
        speaker: 'user',
        kz: opt.text,
        ru: opt.ru,
      },
    ];

    const nextStep = currentStepIdx + 1;

    if (nextStep < activeDialogue.steps.length) {
      // Следующий шаг диалога
      const nextStepData = activeDialogue.steps[nextStep];
      updatedHistory.push({
        speaker: 'character',
        name: activeDialogue.character,
        kz: nextStepData.characterText,
        ru: nextStepData.characterRu,
      });

      setDialogueHistory(updatedHistory);
      setCurrentStepIdx(nextStep);

      // Скролл вниз
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    } else {
      // Диалог завершен!
      setDialogueHistory(updatedHistory);
      setIsCompleted(true);
      playSoundFeedback('correct');
      if (completeLesson) {
        // Начисляем XP
        completeLesson(activeDialogue.id, activeDialogue.xpReward);
      }
    }
  };

  const handleVoiceInput = () => {
    if (!activeDialogue) return;
    const currentStep = activeDialogue.steps[currentStepIdx];
    const correctOpt = currentStep.options.find((o) => o.isCorrect);
    if (!correctOpt) return;

    setIsRecording(true);
    startRecognition(correctOpt.text, {
      onResult: (result) => {
        setIsRecording(false);
        if (result?.isCorrect) {
          handleSelectOption(correctOpt);
        } else {
          playSoundFeedback('wrong');
        }
      },
      onError: () => {
        setIsRecording(false);
        playSoundFeedback('wrong');
      },
    });
  };

  // ── РЕНДЕР СПИСКА ДИАЛОГОВ ──
  if (!activeDialogue) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
       keyboardShouldPersistTaps="handled">
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <MessageIcon size={26} color={Colors.text} />
            <AppText bold size={Typography.xl} color={Colors.text} style={{ marginLeft: 10 }}>
              СЦЕНАРИИ И ДИАЛОГИ
            </AppText>
          </View>
          <AppText size={Typography.sm} color={Colors.textSub} style={{ marginTop: 6 }}>
            Практикуйте живой разговорный казахский язык в реальных жизненных ситуациях
          </AppText>
        </View>

        <View style={styles.dialoguesList}>
          {DIALOGUES_DATA.map((diag, index) => (
            <AppPressable
              key={diag.id}
              onPress={() => handleSelectDialogue(diag)}
              style={({ pressed }) => [
                styles.dialogueCard,
                pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
              ]}
              accessibilityLabel={`Сценарий диалога: ${diag.title}`}
            >
              <View style={styles.dialogueCardHeader}>
                <View style={styles.dialogueBadge}>
                  <AppText bold size={Typography.xs} color={Colors.text}>
                    СЦЕНАРИЙ {index + 1}
                  </AppText>
                </View>
                <View style={styles.xpPill}>
                  <StarIcon size={14} color={Colors.text} />
                  <AppText bold size={Typography.xs} color={Colors.text} style={{ marginLeft: 4 }}>
                    +{diag.xpReward} XP
                  </AppText>
                </View>
              </View>

              <AppText bold size={Typography.lg} color={Colors.text} style={{ marginTop: 8 }}>
                {diag.title}
              </AppText>
              <AppText bold size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }}>
                {diag.subtitle}
              </AppText>
              <AppText size={Typography.xs + 1} color={Colors.textSub} style={{ marginTop: 6, lineHeight: 18 }}>
                {diag.desc}
              </AppText>

              <View style={styles.dialogueCardFooter}>
                <View style={styles.characterTag}>
                  <AppText size={11} color={Colors.text} numberOfLines={1}>
                    {diag.character}
                  </AppText>
                </View>
                <View style={styles.startBtnPill}>
                  <AppText bold size={11} color={Colors.text}>
                    БАСТАУ →
                  </AppText>
                </View>
              </View>
            </AppPressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  // ── РЕНДЕР АКТИВНОГО ДИАЛОГА (ЧАТ) ──
  const currentStepData = activeDialogue.steps[currentStepIdx];
  const progressPct = Math.round(((currentStepIdx + (isCompleted ? 1 : 0)) / activeDialogue.steps.length) * 100);

  return (
    <View style={styles.chatRoot}>
      {/* Верхняя полоса навигации диалога */}
      <View style={styles.chatHeader}>
        <AppPressable
          onPress={() => setActiveDialogue(null)}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
          ]}
          accessibilityLabel="Назад к списку диалогов"
        >
          <ArrowLeftIcon size={18} />
          <AppText bold size={Typography.xs} color={Colors.text} ru="Назад" style={{ marginLeft: 4 }}>
            АРТҚА
          </AppText>
        </AppPressable>

        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <AppText bold size={Typography.sm} color={Colors.text} numberOfLines={1}>
            {activeDialogue.title} ({activeDialogue.subtitle})
          </AppText>
          <View style={styles.chatProgressTrack}>
            <View style={[styles.chatProgressFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        <View style={styles.xpPillSmall}>
          <StarIcon size={14} color={Colors.text} />
          <AppText bold size={Typography.xs} color={Colors.text} style={{ marginLeft: 3 }}>
            +{activeDialogue.xpReward} XP
          </AppText>
        </View>
      </View>

      {/* История сообщений чата */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
       keyboardShouldPersistTaps="handled">
        {dialogueHistory.map((msg, idx) => {
          const isUser = msg.speaker === 'user';

          return (
            <View
              key={idx}
              style={[
                styles.bubbleWrap,
                isUser ? styles.bubbleWrapUser : styles.bubbleWrapCharacter,
              ]}
            >
              {!isUser && (
                <AppText bold size={Typography.xs - 2} color={Colors.textSub} style={{ marginBottom: 4, marginLeft: 4 }}>
                  {msg.name}
                </AppText>
              )}
              <View style={[styles.bubbleCard, isUser ? styles.bubbleUser : styles.bubbleCharacter]}>
                <AppText bold size={Typography.base} color={Colors.text}>
                  {msg.kz}
                </AppText>
                <AppText size={Typography.xs} color={isUser ? Colors.text : Colors.textSub} style={{ marginTop: 4 }}>
                  {msg.ru}
                </AppText>
              </View>
            </View>
          );
        })}

        {/* Экран завершения диалога */}
        {isCompleted && (
          <View style={styles.completionCard}>
            <SparklesIcon size={32} color={Colors.text} />
            <AppText bold size={Typography.lg} color={Colors.text} align="center" ru="Диалог успешно завершен!" style={{ marginTop: 8 }}>
              СҰХБАТ СӘТТІ АЯҚТАЛДЫ!
            </AppText>
            <AppText size={Typography.xs + 1} color={Colors.textSub} align="center" style={{ marginTop: 4 }}>
              Сіз сұхбатты сәтті өткіздіңіз және +{activeDialogue.xpReward} XP алдыңыз!
            </AppText>
            <AppPressable
              onPress={() => setActiveDialogue(null)}
              style={({ pressed }) => [
                styles.finishBtn,
                pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
              ]}
            >
              <AppText bold size={Typography.sm} color={Colors.text} align="center" ru="К списку сценариев">
                СЦЕНАРИЙЛЕРГЕ ҚАЙТУ →
              </AppText>
            </AppPressable>
          </View>
        )}
      </ScrollView>

      {/* ── ПАНЕЛЬ ВАРИАНТОВ ОТВЕТА ПОЛЬЗОВАТЕЛЯ ── */}
      {!isCompleted && currentStepData && (
        <View style={styles.actionPanel}>
          <View style={styles.actionHeader}>
            <AppText bold size={Typography.xs} color={Colors.text} ru="Выберите ответ или скажите в микрофон:">
              ЖАУАПТЫ ТАҢДАҢЫЗ НЕ ДАУЫСПЕН АЙТЫҢЫЗ:
            </AppText>
            <AppPressable
              onPress={handleVoiceInput}
              style={({ pressed }) => [
                styles.micBtn,
                isRecording && styles.micBtnActive,
                pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
              ]}
              accessibilityLabel="Наговорить ответ голосом"
            >
              <TargetIcon size={14} color={Colors.text} />
              <AppText bold size={Typography.xs - 1} color={Colors.text} ru={isRecording ? 'Слушаю...' : 'Ответить голосом (STT)'} style={{ marginLeft: 4 }}>
                {isRecording ? 'ТЫҢДАУДА...' : 'ДАУЫСПЕН ЖАУАП БЕРУ'}
              </AppText>
            </AppPressable>
          </View>

          <View style={styles.optionsList}>
            {currentStepData.options.map((opt, idx) => (
              <AppPressable
                key={idx}
                onPress={() => handleSelectOption(opt)}
                style={({ pressed }) => [
                  styles.optionCard,
                  pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
                ]}
                accessibilityLabel={opt.text}
              >
                <AppText bold size={Typography.sm} color={Colors.text}>
                  {opt.text}
                </AppText>
                <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }}>
                  {opt.ru}
                </AppText>
              </AppPressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: Spacing.xxl + 20,
    boxSizing: 'border-box',
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    boxSizing: 'border-box',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialoguesList: {
    gap: 12,
  },
  dialogueCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    boxSizing: 'border-box',
  },
  dialogueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  dialogueBadge: {
    backgroundColor: Colors.inactive,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dialogueCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm + 4,
    paddingTop: Spacing.sm,
    borderTopWidth: 1.5,
    borderTopColor: Colors.inactive,
    gap: 8,
  },
  characterTag: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 6,
  },
  startBtnPill: {
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  chatRoot: {
    flex: 1,
    backgroundColor: Colors.background,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    backgroundColor: Colors.white,
    borderBottomWidth: 2,
    borderBottomColor: Colors.text,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chatProgressTrack: {
    height: 6,
    backgroundColor: Colors.inactive,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.text,
    marginTop: 4,
    overflow: 'hidden',
  },
  chatProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  xpPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  bubbleWrap: {
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  bubbleWrapCharacter: {
    alignSelf: 'flex-start',
  },
  bubbleWrapUser: {
    alignSelf: 'flex-end',
  },
  bubbleCard: {
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
  },
  bubbleCharacter: {
    backgroundColor: Colors.white,
  },
  bubbleUser: {
    backgroundColor: Colors.accent,
  },
  bubbleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  bubbleAudioBtn: {
    padding: 4,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
  },
  completionCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    padding: Spacing.xl,
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  finishBtn: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  actionPanel: {
    backgroundColor: Colors.white,
    borderTopWidth: 2,
    borderTopColor: Colors.text,
    padding: Spacing.sm + 4,
    paddingBottom: Spacing.md,
    boxSizing: 'border-box',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
    flexWrap: 'wrap',
    gap: 6,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentBlue,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  micBtnActive: {
    backgroundColor: '#FF8A80',
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

export default DialoguesScreen;
