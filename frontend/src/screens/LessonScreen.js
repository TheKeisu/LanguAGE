// frontend/src/screens/LessonScreen.js
// ─────────────────────────────────────────────────────────────────
// Главный экран интерактивного урока LanguAGE
//
// Типы упражнений (по схемам бэкенда):
//   MULTIPLE_CHOICE - выбор из вариантов (тактильные карточки)
//   TEXT            - ввод текста с казахской клавиатурой
//   FILL_BLANK      - банк слов с drag-to-slot
//   PRONUNCIATION   - STT проверка произношения (локальный тип)
//
// Интеграция: бэкенд-эндпоинт /exercises/{id}/answer
// Дизайн: Anti-AI rules - #fffde8, #18181B, #ffe640, #40dfff, #E5E2C9
// Шрифт: JetBrains Mono через AppText
// ─────────────────────────────────────────────────────────────────

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';

import AppText from '../components/AppText';
import AppPressable from '../components/AppPressable';
import TactileButton from '../components/TactileButton';
import ProgressBar from '../components/ProgressBar';
import WordAnatomyModal from '../components/WordAnatomyModal';
import {
  CloseIcon,
  CheckIcon,
  SparklesIcon,
  StarIcon,
  TargetIcon,
} from '../components/Icons';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../theme/theme';
import { getExercisesForLesson, submitAnswer } from '../api/exercises';
import {
  startRecognition,
  playSoundFeedback,
} from '../services/speechService';

// ─────────────────────────────────────────────────────────────────
// КОНСТАНТЫ
// ─────────────────────────────────────────────────────────────────

// Казахские буквы, которые сложно набрать с обычной клавиатуры
const KAZAKH_SPECIAL_CHARS = [
  'ә', 'і', 'ң', 'ғ', 'ү', 'ұ', 'қ', 'ө', 'һ',
  'Ә', 'І', 'Ң', 'Ғ', 'Ү', 'Ұ', 'Қ', 'Ө', 'Һ',
];

// Тип-лейблы для бейджей
const TYPE_LABELS = {
  MULTIPLE_CHOICE: 'ЖАУАПТЫ ТАҢДАУ',
  TEXT:            'ЖАУАПТЫ ЖАЗУ',
  FILL_BLANK:      'СӨЙЛЕМДІ ҚҰРАУ',
  PRONUNCIATION:   'ДЫБЫСТАЛУ',
};

const TYPE_BADGE_COLOR = {
  MULTIPLE_CHOICE: Colors.accentBlue,
  TEXT:            Colors.accent,
  FILL_BLANK:      Colors.accentBlue,
  PRONUNCIATION:   Colors.accent,
};

// ─────────────────────────────────────────────────────────────────
// ЛОКАЛЬНЫЕ УПРАЖНЕНИЯ (FALLBACK, если бэкенд недоступен)
// ─────────────────────────────────────────────────────────────────

const LESSON_EXERCISES = {
  // УРОК 1: Ә, Ө, Ү, Ұ - Мягкие и твердые гласные
  1: [
    {
      id: 1001,
      prompt: 'Какой звук обозначает казахская буква «Ә»?',
      type: 'MULTIPLE_CHOICE',
      options: ['Мягкое «а» (как в слове «яблоко»)', 'Твердое «а» (как в слове «машина»)', 'Звук «е»', 'Звук «э»'],
      correctAnswer: 'Мягкое «а» (как в слове «яблоко»)',
      explanation: '«Ә» - мягкий передний гласный казахского языка, произносится как смягченное «а». В русской аналогии ближе всего звучит в слове «яблоко».',
      rememberTip: 'Ә - это «а» с хвостиком: оно мягкое и тянется вперед!',
    },
    {
      id: 1002,
      prompt: 'Выберите слово, в котором буква «Ү» произносится правильно:',
      type: 'MULTIPLE_CHOICE',
      options: ['Үй (дом)', 'Ул (сын, татарский)', 'Юрта', 'У (устрашение)'],
      correctAnswer: 'Үй (дом)',
      explanation: '«Ү» - мягкий огубленный гласный. В слове «Үй» (дом) звучит как французское «u» или немецкое «ü».',
      rememberTip: 'Скажи «и», но при этом округли губы - получится Ү!',
    },
    {
      id: 1003,
      prompt: 'Как произносится слово «Ұл» (сын)?',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Ұл',
      correctAnswer: 'Ұл',
      explanation: '«Ұ» - твёрдый огубленный гласный, произносится глубже, чем «у».',
      rememberTip: 'Ұ - «у» из глубины горла!',
    },
    {
      id: 1004,
      prompt: 'Какая из этих пар правильно описывает казахскую гармонию гласных?',
      type: 'MULTIPLE_CHOICE',
      options: [
        'Мягкие: ә, ө, ү, і - Твердые: а, о, у, ы',
        'Мягкие: а, о, у - Твердые: ы, і, е',
        'Нет разделения на мягкие/твердые',
        'Только 3 мягких и 5 твердых гласных',
      ],
      correctAnswer: 'Мягкие: ә, ө, ү, і - Твердые: а, о, у, ы',
      explanation: 'Закон сингармонизма: в казахском слове все гласные принадлежат к одному ряду - либо все мягкие (передний ряд), либо все твёрдые (задний ряд).',
      rememberTip: 'Запомни пары: а↔ә, о↔ө, у↔ү. Слово может содержать только одну из пар!',
    },
    {
      id: 1005,
      prompt: 'Переведите слово «Өмір»:',
      type: 'MULTIPLE_CHOICE',
      options: ['Жизнь', 'Любовь', 'Счастье', 'Мечта'],
      correctAnswer: 'Жизнь',
      explanation: 'Өмір - жизнь. Одно из красивейших слов казахского языка!',
      rememberTip: 'Өмір - жизнь. Запомни: «о» с хвостиком - мягкий Ө, слово про жизнь!',
    },
    {
      id: 1006,
      prompt: 'Сұрақ құрастырыңыз (Как дела?):',
      type: 'FILL_BLANK',
      prompt_phrase: 'Қалың ___?',
      word_bank: ['қалай', 'жақсы', 'ма', 'сіз'],
      correctAnswer: 'қалай',
      explanation: '«Қалың қалай?» - қазақ тіліндегі табиғи сұрақ: «Қалайсың?», «Қал-жағдайың қалай?».',
      rememberTip: 'Қалың қалай? = Как дела?',
    },
  ],

  // УРОК 2: Қ, Ғ, Ң, Һ - Гортанные и носовые
  2: [
    {
      id: 2001,
      prompt: 'Чем отличается казахская «Қ» от русской «К»?',
      type: 'MULTIPLE_CHOICE',
      options: [
        'Қ произносится глубже в горле (увулярная)',
        'Қ произносится мягче и выше',
        'Нет отличий, это одно и то же',
        'Қ произносится как «Х»',
      ],
      correctAnswer: 'Қ произносится глубже в горле (увулярная)',
      explanation: '«Қ» - увулярная (горловая) согласная. Произносится у самого основания языка, глубже русского «к».',
      rememberTip: 'Скажи «к», но как будто хочешь прокашляться - вот и «Қ»!',
    },
    {
      id: 2002,
      prompt: 'Произнесите слово «Қазақ» (казах):',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Қазақ',
      correctAnswer: 'Қазақ',
      explanation: '«Қ» в начале и конце слова - мягкие горловые согласные. Гласные «а» твёрдые.',
      rememberTip: 'Қ-а-З-а-Қ. Запомни: горловые Қ обрамляют слово!',
    },
    {
      id: 2003,
      prompt: 'Что обозначает буква «Ң»?',
      type: 'MULTIPLE_CHOICE',
      options: [
        'Носовой «нг» - как в английском «sing»',
        'Носовой «м» - как в слове «гамма»',
        'Горловой согласный, как немецкое «ch»',
        'Мягкий «н» - нет отличий от русской «н»',
      ],
      correctAnswer: 'Носовой «нг» - как в английском «sing»',
      explanation: '«Ң» - носовой велярный согласный. Аналог английского «ng» в словах «sing», «ring».',
      rememberTip: 'Скажи «нг» из «ринг» - это и есть Ң! Ортаң = средний.',
    },
    {
      id: 2004,
      prompt: 'Как звучит слово «Мың» (тысяча)?',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Мың',
      correctAnswer: 'Мың',
      explanation: 'Мың - тысяча. Буква Ң в конце произносится как «нг», без «г».',
      rememberTip: 'Мың - тысяча, заканчивается на носовое -ңг!',
    },
    {
      id: 2005,
      prompt: 'Переведите «Ғылым»:',
      type: 'MULTIPLE_CHOICE',
      options: ['Наука', 'Музыка', 'Природа', 'Знание'],
      correctAnswer: 'Наука',
      explanation: 'Ғылым - наука. «Ғ» - звонкий горловой, произносится как звонкое «г» из глубины горла.',
      rememberTip: 'Ғ - звонкий брат немой Қ. Ғылым = наука!',
    },
    {
      id: 2006,
      prompt: 'Составьте слово из слогов:',
      type: 'FILL_BLANK',
      prompt_phrase: '___ - алфавит казахского языка',
      word_bank: ['Әліп', 'Алиф', 'би', 'ши'],
      correctAnswer: 'Әліпби',
      explanation: 'Әліпби - казахский алфавит (от арабских «алиф» и «би»).',
      rememberTip: 'Әліпби = алфавит. Як ABC для казахского!',
    },
  ],

  // УРОК 3: Сәлемдесу - Приветствия
  3: [
    {
      id: 3001,
      prompt: 'Как будет «Доброе утро!» по-казахски?',
      type: 'MULTIPLE_CHOICE',
      options: ['Қайырлы таң!', 'Қайырлы кеш!', 'Сәлеметсіз бе!', 'Қош келдіңіз!'],
      correctAnswer: 'Қайырлы таң!',
      explanation: 'Таң - утро, Қайырлы - доброе/благое. Қайырлы таң = Доброе утро!',
      rememberTip: 'Таң = утро (рассвет). Қайырлы таң - приветствие на рассвете!',
    },
    {
      id: 3002,
      prompt: 'Произнесите приветствие «Сәлеметсіз бе?»:',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Сәлеметсіз бе?',
      correctAnswer: 'Сәлеметсіз бе?',
      explanation: 'Вежливая форма приветствия (к старшему/незнакомому). Дословно: «Вы здоровы?»',
      rememberTip: 'Сәлемет = здоровье, сіз = вы (уважительно)!',
    },
    {
      id: 3003,
      prompt: 'Как попрощаться: «До свидания!»?',
      type: 'MULTIPLE_CHOICE',
      options: ['Сау болыңыз!', 'Рақмет!', 'Кешіріңіз!', 'Иә!'],
      correctAnswer: 'Сау болыңыз!',
      explanation: 'Сау болыңыз - до свидания (дословно: «Будьте здоровы!»). Мягкая и теплая форма прощания.',
      rememberTip: 'Сау = здоровый. Прощаясь, желай здоровья!',
    },
    {
      id: 3004,
      prompt: 'Что ответить на «Қалыңыз қалай?» (Как ваши дела?):',
      type: 'MULTIPLE_CHOICE',
      options: ['Жақсы, рақмет!', 'Иә, болады!', 'Кешіріңіз!', 'Жоқ, рақмет!'],
      correctAnswer: 'Жақсы, рақмет!',
      explanation: 'Жақсы - хорошо, рақмет - спасибо. Стандартный вежливый ответ.',
      rememberTip: 'Жақсы = хорошо (противоположность - жаман = плохо)!',
    },
    {
      id: 3005,
      prompt: 'Произнесите «Рақмет!» (Спасибо!):',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Рақмет!',
      correctAnswer: 'Рақмет!',
      explanation: 'Рақмет - спасибо. Горловая Қ в середине слова произносится глубоко.',
      rememberTip: 'Рак-ул-мет → Рақмет. Всегда приятно услышать!',
    },
    {
      id: 3006,
      prompt: 'Сыпайы сұрақ құрастырыңыз (Как ваше самочувствие?):',
      type: 'FILL_BLANK',
      prompt_phrase: 'Қал-жағдайыңыз ___?',
      word_bank: ['қалай', 'жақсы', 'қайда', 'қандай'],
      correctAnswer: 'қалай',
      explanation: '«Қал-жағдайыңыз қалай?» - үлкендер мен бейтаныс адамдарға сыпайы амандасу сұрағы.',
      rememberTip: 'Қал-жағдайыңыз қалай? = Как ваши дела/самочувствие?',
    },
  ],

  // УРОК 4: Танысу - Знакомство
  4: [
    {
      id: 4001,
      prompt: 'Как сказать «Меня зовут Аида»?',
      type: 'MULTIPLE_CHOICE',
      options: ['Менің атым Аида', 'Мен Аидамын', 'Атым бар Аида', 'Аида атты мен'],
      correctAnswer: 'Менің атым Аида',
      explanation: 'Менің - моё/моя, атым - имя (моё имя). Менің атым Аида = Моё имя Аида.',
      rememberTip: 'Менің атым = моё имя. Ат = конь и имя - одно слово!',
    },
    {
      id: 4002,
      prompt: 'Как спросить «Как вас зовут?» (вежливо)?',
      type: 'MULTIPLE_CHOICE',
      options: ['Сіздің атыңыз кім?', 'Сенің атың кім?', 'Аты-жөні кім?', 'Есімі кім?'],
      correctAnswer: 'Сіздің атыңыз кім?',
      explanation: 'Сіздің - ваше (от сіз - вы), атыңыз - ваше имя (притяжательное от ат + ыңыз). Кім - кто.',
      rememberTip: 'Кім? = Кто? Сіздің атыңыз кім? = Кто вы по имени?',
    },
    {
      id: 4003,
      prompt: 'Произнесите «Мен Қазақстаннанмын» (Я из Казахстана):',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Мен Қазақстаннанмын',
      correctAnswer: 'Мен Қазақстаннанмын',
      explanation: 'Мен - я, Қазақстаннан - из Казахстана (исходный падеж -нан), -мын - окончание 1-го лица.',
      rememberTip: '-нан = из (откуда?). Қазақстаннан = из Казахстана!',
    },
    {
      id: 4004,
      prompt: 'Переведите «Таныстырайын» (позвольте представить):',
      type: 'MULTIPLE_CHOICE',
      options: ['Позвольте представить', 'Рад познакомиться', 'Не знаю', 'До свидания'],
      correctAnswer: 'Позвольте представить',
      explanation: 'Таныстыру - знакомить/представлять. Таныстырайын = Позвольте я представлю!',
      rememberTip: 'Таныс = знакомый. Таныстыру = знакомить!',
    },
    {
      id: 4005,
      prompt: 'Что означает «Өте қуаныштымын!»?',
      type: 'MULTIPLE_CHOICE',
      options: ['Очень рад познакомиться!', 'Мне всё равно!', 'Я тороплюсь!', 'Рад снова встретиться!'],
      correctAnswer: 'Очень рад познакомиться!',
      explanation: 'Өте - очень, қуаныш - радость, -тымын - окончание личного глагола 1-го лица.',
      rememberTip: 'Қуаныш = радость. Өте қуаныштымын = Очень рад!',
    },
    {
      id: 4006,
      prompt: 'Составьте фразу знакомства:',
      type: 'FILL_BLANK',
      prompt_phrase: 'Менің ___ Данияр',
      word_bank: ['атым', 'атыңыз', 'атымыз', 'атты'],
      correctAnswer: 'атым',
      explanation: 'Менің атым Данияр = Моё имя Данияр. Атым - моё имя (притяжательное 1-го лица).',
      rememberTip: 'Менің атым = моё имя!',
    },
  ],

  // УРОК 5: Алғашқы сөздер - Базовый словарь
  5: [
    {
      id: 5001,
      prompt: 'Как сказать «Да» и «Нет» по-казахски?',
      type: 'MULTIPLE_CHOICE',
      options: ['Иә / Жоқ', 'Да / Нет', 'Ия / Йоқ', 'Иәу / Жоқпа'],
      correctAnswer: 'Иә / Жоқ',
      explanation: 'Иә = да (утвердительный ответ). Жоқ = нет (отрицание, также «нет» в смысле «нет в наличии»).',
      rememberTip: 'Иә = Да! Жоқ = Нет. Запомни пару навсегда!',
    },
    {
      id: 5002,
      prompt: 'Что означает «Мархабат»?',
      type: 'MULTIPLE_CHOICE',
      options: ['Пожалуйста / Добро пожаловать', 'Спасибо', 'Прости', 'Привет'],
      correctAnswer: 'Пожалуйста / Добро пожаловать',
      explanation: 'Мархабат - вежливое «пожалуйста» и «добро пожаловать». Теплое гостеприимное слово.',
      rememberTip: 'Мархабат - казахское гостеприимство в одном слове!',
    },
    {
      id: 5003,
      prompt: 'Произнесите «Кешіріңіз» (Извините):',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Кешіріңіз',
      correctAnswer: 'Кешіріңіз',
      explanation: 'Кешіру - прощать. Кешіріңіз - извините (вежливая форма).',
      rememberTip: 'Кеш = поздно, кешіру = прощать за опоздание!',
    },
    {
      id: 5004,
      prompt: 'Переведите «Болады!»:',
      type: 'MULTIPLE_CHOICE',
      options: ['Хорошо! / Договорились!', 'Нельзя!', 'Не знаю!', 'Возможно!'],
      correctAnswer: 'Хорошо! / Договорились!',
      explanation: 'Болады = хорошо, годится, договорились! Универсальный ответ согласия.',
      rememberTip: 'Болады = «идёт!» «договорились!» «ок!» - всё в одном слове!',
    },
    {
      id: 5005,
      prompt: 'Что означает «Білмеймін»?',
      type: 'MULTIPLE_CHOICE',
      options: ['Не знаю', 'Знаю', 'Понимаю', 'Слышу'],
      correctAnswer: 'Не знаю',
      explanation: 'Білу - знать/уметь. Білмеймін = Я не знаю (-мей- отрицание, -мін - я).',
      rememberTip: 'Білемін = Я знаю. Білмеймін = Не знаю. -мей- делает отрицание!',
    },
    {
      id: 5006,
      prompt: 'Составьте вежливый отказ:',
      type: 'FILL_BLANK',
      prompt_phrase: 'Жоқ, ___',
      word_bank: ['рақмет', 'иә', 'болады', 'кешіріңіз'],
      correctAnswer: 'рақмет',
      explanation: '«Жоқ, рақмет» = «Нет, спасибо» - вежливый отказ от предложения.',
      rememberTip: 'Жоқ рақмет = Нет, спасибо - вежливость в двух словах!',
    },
  ],

  // УРОК 6: Сандар - Числа от 1 до 10
  6: [
    {
      id: 6001,
      prompt: 'Как будет «Пять» по-казахски?',
      type: 'MULTIPLE_CHOICE',
      options: ['Бес', 'Алты', 'Үш', 'Жеті'],
      correctAnswer: 'Бес',
      explanation: 'Бес = 5. Запомни числа: бір(1), екі(2), үш(3), төрт(4), бес(5).',
      rememberTip: 'Бес = 5 - как пять пальцев на руке!',
    },
    {
      id: 6002,
      prompt: 'Переведите «Алты»:',
      type: 'MULTIPLE_CHOICE',
      options: ['6', '7', '8', '9'],
      correctAnswer: '6',
      explanation: 'Алты = 6. Жеті = 7. Сегіз = 8. Тоғыз = 9.',
      rememberTip: 'Алты = 6. Аналогия: аль-ты - шесть стогов!',
    },
    {
      id: 6003,
      prompt: 'Произнесите «Бір, екі, үш» (Раз, два, три):',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Бір, екі, үш',
      correctAnswer: 'Бір, екі, үш',
      explanation: 'Бір = 1, екі = 2, үш = 3. Счёт с мягкими гласными!',
      rememberTip: 'Бір-екі-үш - как раз-два-три на казахский манер!',
    },
    {
      id: 6004,
      prompt: 'Переведите «Үш алма» (три яблока):',
      type: 'MULTIPLE_CHOICE',
      options: ['Три яблока', 'Два яблока', 'Пять яблок', 'Одно яблоко'],
      correctAnswer: 'Три яблока',
      explanation: '«Үш» - 3, «алма» - яблоко. Үш алма = три яблока.',
      rememberTip: 'Үш = 3. Алма = яблоко. Запомни: үш алма = три яблока.',
    },
    {
      id: 6005,
      prompt: 'Какое число завершает десятку: «Он»?',
      type: 'MULTIPLE_CHOICE',
      options: ['10', '9', '8', '100'],
      correctAnswer: '10',
      explanation: '«Он» - круглое число десять (10).',
      rememberTip: '10 из 10 - это десятка! По-казахски звучит коротко: ОН.',
    },
    {
      id: 6006,
      prompt: 'Составьте счёт:',
      type: 'FILL_BLANK',
      prompt_phrase: 'Бір, екі, ___, төрт',
      word_bank: ['үш', 'бес', 'алты', 'жеті'],
      correctAnswer: 'үш',
      explanation: 'Бір(1), екі(2), үш(3), төрт(4) - порядковый счёт.',
      rememberTip: 'Запомни тройку: БІР - ЕКІ - ҮШ!',
    },
  ],

  // УРОК 7: Финальный тест раздела 1
  7: [
    {
      id: 7001,
      prompt: 'Переведите «Сәлеметсіз бе?»:',
      type: 'MULTIPLE_CHOICE',
      options: ['Вы здоровы? (приветствие)', 'Как ваше имя?', 'Добрый вечер!', 'Спасибо за визит!'],
      correctAnswer: 'Вы здоровы? (приветствие)',
      explanation: 'Сәлеметсіз бе - вежливое приветствие (дословно «Вы здоровы?»).',
      rememberTip: 'Сәлемет = здоровье, сіз = вы. Вежливый вопрос о здоровье!',
    },
    {
      id: 7002,
      prompt: 'Переведите фразу: «Менің атым Нұрлан, мен Қазақстаннанмын».',
      type: 'MULTIPLE_CHOICE',
      options: [
        'Меня зовут Нурлан, я из Казахстана',
        'Я - Нурлан, говорю по-казахски',
        'Нурлан - мое прозвище',
        'Мой друг Нурлан - казах',
      ],
      correctAnswer: 'Меня зовут Нурлан, я из Казахстана',
      explanation: 'Менің атым = моё имя, Қазақстаннанмын = я из Казахстана.',
      rememberTip: 'Менің атым + имя + Қазақстаннанмын = полное представление!',
    },
    {
      id: 7003,
      prompt: 'Произнесите фразу знакомства «Менің атым Айгерім»:',
      type: 'PRONUNCIATION',
      prompt_phrase: 'Менің атым Айгерім',
      correctAnswer: 'Менің атым Айгерім',
      explanation: 'Менің атым - моё имя. Мягкие гласные і, ы в слове требуют мягкого произношения.',
      rememberTip: 'Произноси атым с мягким Ы - не «ату м», а «аты м»!',
    },
    {
      id: 7004,
      prompt: 'Что означает фраза: «Мен қазақ тілін үйренемін»?',
      type: 'MULTIPLE_CHOICE',
      options: ['Я изучаю казахский язык', 'Я говорю по-казахски', 'Я люблю Казахстан', 'Я преподаю язык'],
      correctAnswer: 'Я изучаю казахский язык',
      explanation: '«Қазақ тілі» - казахский язык. «Үйрену» - учиться, осваивать знания.',
      rememberTip: 'Үйренемін = Я учусь! Гордо заявляй эту фразу каждому собеседнику.',
    },
    {
      id: 7005,
      prompt: 'В чем суть закона сингармонизма в казахском языке?',
      type: 'MULTIPLE_CHOICE',
      options: [
        'Гласные в слове и окончаниях должны быть одинаковыми по ряду (все мягкие или все твердые)',
        'Все слова должны рифмоваться в конце предложения',
        'Первая буква предложения всегда гласная',
        'После цифр всегда пишется множественное число',
      ],
      correctAnswer: 'Гласные в слове и окончаниях должны быть одинаковыми по ряду (все мягкие или все твердые)',
      explanation: 'Сингармонизм - гармония гласных. Слово «үй» (мягкий ряд) берет суффикс «-дің», а «қала» (твёрдый) - «-ның».',
      rememberTip: 'Мягкое слово берет мягкое окончание, твёрдое - твёрдое!',
    },
    {
      id: 7006,
      prompt: 'Составьте прощание:',
      type: 'FILL_BLANK',
      prompt_phrase: 'Сау ___!',
      word_bank: ['болыңыз', 'жүріңіз', 'болсын', 'кел'],
      correctAnswer: 'болыңыз',
      explanation: '«Сау болыңыз!» - до свидания (Будьте здоровы!).',
      rememberTip: 'Сау = здоровый, болыңыз = будьте!',
    },
  ],

  // УРОКИ 8-16: полные данные из предыдущей версии
  8: [
    { id: 8001, prompt: 'Как переводится слово «Әке»?', type: 'MULTIPLE_CHOICE', options: ['Отец (папа)', 'Мама', 'Брат', 'Дедушка'], correctAnswer: 'Отец (папа)', explanation: '«Әке» - отец.', rememberTip: 'Ә-ке начинается с мягкой буквы Ә. Әке - глава семьи!' },
    { id: 8002, prompt: 'Как сказать «Моя мама» по-казахски?', type: 'MULTIPLE_CHOICE', options: ['Менің анам', 'Менің әкем', 'Менің ағам', 'Менің үйім'], correctAnswer: 'Менің анам', explanation: 'Ана - мать. Менің анам - моя мама.', rememberTip: 'Ана = мама. «Ана тілі» - родной язык!' },
    { id: 8003, prompt: 'Произнесите «Менің отбасым» (Моя семья):', type: 'PRONUNCIATION', prompt_phrase: 'Менің отбасым', correctAnswer: 'Менің отбасым', explanation: 'Отбасы - семья (от «от» - огонь/очаг и «басы» - голова).', rememberTip: 'Отбасы = семья как домашний очаг!' },
    { id: 8004, prompt: 'Как сказать «У меня большая семья»?', type: 'MULTIPLE_CHOICE', options: ['Менің отбасым үлкен', 'Менде отбасы бар', 'Отбасым кішкентай', 'Отбасы көп'], correctAnswer: 'Менің отбасым үлкен', explanation: 'Отбасы - семья. Үлкен - большой.', rememberTip: 'Үлкен = большой!', },
    { id: 8005, prompt: 'Как переводится «Апа»?', type: 'MULTIPLE_CHOICE', options: ['Старшая сестра', 'Младшая сестра', 'Тетя', 'Бабушка'], correctAnswer: 'Старшая сестра', explanation: '«Апа» - старшая сестра или почтительное обращение к пожилой женщине.', rememberTip: 'Апа - уважительно к старшей сестре!' },
    { id: 8006, prompt: 'Составьте обращение:', type: 'FILL_BLANK', prompt_phrase: 'Менің ___ Асем', word_bank: ['апам', 'атам', 'анам', 'ағам'], correctAnswer: 'апам', explanation: 'Менің апам Асем = Моя старшая сестра Асем.', rememberTip: 'Апа + м = апам (моя старшая сестра)!' },
  ],
  9: [
    { id: 9001, prompt: 'Как переводится «Үй»?', type: 'MULTIPLE_CHOICE', options: ['Дом', 'Работа', 'Школа', 'Улица'], correctAnswer: 'Дом', explanation: 'Үй - дом, жилье.', rememberTip: 'Үйге кел - приходи домой!' },
    { id: 9002, prompt: 'Что означает слово «Бөлме»?', type: 'MULTIPLE_CHOICE', options: ['Комната', 'Окно', 'Дверь', 'Крыша'], correctAnswer: 'Комната', explanation: 'Бөлме - комната (от бөлу - разделять).', rememberTip: 'Дом разделен на бөлме (комнаты)!' },
    { id: 9003, prompt: 'Произнесите «Менің үйім үлкен» (Мой дом большой):', type: 'PRONUNCIATION', prompt_phrase: 'Менің үйім үлкен', correctAnswer: 'Менің үйім үлкен', explanation: 'Үй - дом, үлкен - большой.', rememberTip: 'Üй + ім = үйім (мой дом)!' },
    { id: 9004, prompt: 'Как сказать «Открой дверь»?', type: 'MULTIPLE_CHOICE', options: ['Есікті аш', 'Терезені жап', 'Үйге кір', 'Бөлмені тазала'], correctAnswer: 'Есікті аш', explanation: 'Есік - дверь, ашу - открывать.', rememberTip: 'Есік - дверь, аш - открой!' },
    { id: 9005, prompt: 'Что такое «Ас үй»?', type: 'MULTIPLE_CHOICE', options: ['Кухня', 'Гостиная', 'Спальня', 'Балкон'], correctAnswer: 'Кухня', explanation: 'Ас - еда, үй - помещение. Ас үй - кухня!', rememberTip: 'Ас (еда) + Үй = кухня!' },
    { id: 9006, prompt: 'Составьте слово:', type: 'FILL_BLANK', prompt_phrase: '___ - это место для отдыха в доме', word_bank: ['Жатын бөлме', 'Ас үй', 'Терезе', 'Есік'], correctAnswer: 'Жатын бөлме', explanation: 'Жатын бөлме - спальня (жату - лежать/спать, бөлме - комната).', rememberTip: 'Жату = лежать, жатын бөлме = спальня!' },
  ],
  10: [
    { id: 10001, prompt: 'Что означает «Мен ерте оянамын»?', type: 'MULTIPLE_CHOICE', options: ['Я рано просыпаюсь', 'Я поздно ложусь', 'Я иду на работу', 'Я завтракаю'], correctAnswer: 'Я рано просыпаюсь', explanation: 'Ерте - рано, ояну - просыпаться.', rememberTip: 'Ерте = рано!' },
    { id: 10002, prompt: 'Как сказать «Завтрак»?', type: 'MULTIPLE_CHOICE', options: ['Таңғы ас', 'Түскі ас', 'Кешкі ас', 'Шай ішу'], correctAnswer: 'Таңғы ас', explanation: 'Таң - утро. Таңғы ас - завтрак.', rememberTip: 'Таң + Ас = Таңғы ас (завтрак)!' },
    { id: 10003, prompt: 'Произнесите «Мен жұмысқа барамын» (Я иду на работу):', type: 'PRONUNCIATION', prompt_phrase: 'Мен жұмысқа барамын', correctAnswer: 'Мен жұмысқа барамын', explanation: 'Жұмыс - работа, бару - идти.', rememberTip: 'Жұмыс = работа!' },
    { id: 10004, prompt: 'Что означает «Кешкі ас»?', type: 'MULTIPLE_CHOICE', options: ['Ужин', 'Обед', 'Полдник', 'Завтрак'], correctAnswer: 'Ужин', explanation: 'Кеш - вечер. Кешкі ас - ужин.', rememberTip: 'Кеш + Ас = ужин!' },
    { id: 10005, prompt: 'Как спросить сколько времени?', type: 'MULTIPLE_CHOICE', options: ['Сағат неше болды?', 'Не уақытта?', 'Қашан?', 'Қанша уақыт?'], correctAnswer: 'Сағат неше болды?', explanation: 'Сағат - часы/время, неше - сколько.', rememberTip: 'Сағат неше? = Который час?' },
    { id: 10006, prompt: 'Составьте распорядок:', type: 'FILL_BLANK', prompt_phrase: 'Мен ___ оянамын', word_bank: ['ерте', 'кеш', 'күндіз', 'кешке'], correctAnswer: 'ерте', explanation: 'Мен ерте оянамын = Я рано просыпаюсь.', rememberTip: 'Ерте = рано!' },
  ],
  11: [
    { id: 11001, prompt: 'Какое традиционное мучное блюдо казахов?', type: 'MULTIPLE_CHOICE', options: ['Бауырсақ', 'Қазы', 'Шұбат', 'Сорпа'], correctAnswer: 'Бауырсақ', explanation: 'Бауырсақ - пышные обжаренные кусочки теста.', rememberTip: 'Бауырсақ - символ гостеприимства!' },
    { id: 11002, prompt: 'Что значит «Шай ішейік!»?', type: 'MULTIPLE_CHOICE', options: ['Давайте попьем чаю!', 'Давайте пообедаем!', 'Принесите счет!', 'Чай горячий'], correctAnswer: 'Давайте попьем чаю!', explanation: 'Шай - чай, ішу - пить.', rememberTip: 'Шай ішейік = выпьем чаю!' },
    { id: 11003, prompt: 'Произнесите «Өте дәмді!» (Очень вкусно!):', type: 'PRONUNCIATION', prompt_phrase: 'Өте дәмді!', correctAnswer: 'Өте дәмді!', explanation: 'Дәм - вкус, дәмді - вкусный, өте - очень.', rememberTip: 'Дәмді = вкусный!' },
    { id: 11004, prompt: 'Что такое «Қымыз»?', type: 'MULTIPLE_CHOICE', options: ['Кумыс (кобылье молоко)', 'Верблюжье молоко', 'Айран', 'Чай с молоком'], correctAnswer: 'Кумыс (кобылье молоко)', explanation: 'Қымыз - целебный напиток из кобыльего молока.', rememberTip: 'Қымыз - кумыс из кобыльего молока!' },
    { id: 11005, prompt: 'Как сказать «Приятного аппетита!»?', type: 'MULTIPLE_CHOICE', options: ['Ас болсын!', 'Қош келдіңіз!', 'Сау болыңыз!', 'Рақмет!'], correctAnswer: 'Ас болсын!', explanation: 'Ас болсын - пусть еда пойдет на пользу!', rememberTip: 'Ас болсын = приятного аппетита!' },
    { id: 11006, prompt: 'Составьте приглашение:', type: 'FILL_BLANK', prompt_phrase: 'Шай ___, достарым!', word_bank: ['ішейік', 'жейік', 'барайық', 'айтайық'], correctAnswer: 'ішейік', explanation: 'Шай ішейік, достарым! = Выпьем чаю, друзья!', rememberTip: 'Іш = пей, ішейік = давайте выпьем!' },
  ],
  12: [
    { id: 12001, prompt: 'Как переводится «Дүкен»?', type: 'MULTIPLE_CHOICE', options: ['Магазин', 'Аптека', 'Больница', 'Вокзал'], correctAnswer: 'Магазин', explanation: 'Дүкен - магазин.', rememberTip: 'Дүкен - магазин!' },
    { id: 12002, prompt: 'Как попросить скидку?', type: 'MULTIPLE_CHOICE', options: ['Жеңілдік бар ма?', 'Қолма-қол беремін', 'Шот беріңіз', 'Арзандату болады?'], correctAnswer: 'Жеңілдік бар ма?', explanation: 'Жеңілдік - скидка (от жеңіл - легкий).', rememberTip: 'Жеңілдік = скидка!' },
    { id: 12003, prompt: 'Произнесите «Бұл қанша тұрады?» (Сколько стоит?):', type: 'PRONUNCIATION', prompt_phrase: 'Бұл қанша тұрады?', correctAnswer: 'Бұл қанша тұрады?', explanation: 'Қанша - сколько, тұрады - стоит.', rememberTip: 'Қанша тұрады = сколько стоит?' },
    { id: 12004, prompt: 'Как сказать «Я оплачу картой»?', type: 'MULTIPLE_CHOICE', options: ['Картамен төлеймін', 'Қолма-қол беремін', 'Ақшам жоқ', 'Шотты әкеліңіз'], correctAnswer: 'Картамен төлеймін', explanation: 'Картамен - картой, төлеу - платить.', rememberTip: 'Төлеу = платить!' },
    { id: 12005, prompt: 'Что означает «Қолма-қол»?', type: 'MULTIPLE_CHOICE', options: ['Наличными', 'Переводом', 'В рассрочку', 'По QR'], correctAnswer: 'Наличными', explanation: 'Қол - рука. Из руки в руку - наличными.', rememberTip: 'Қол = рука, қолма-қол = из рук в руки = наличными!' },
    { id: 12006, prompt: 'Вежливо попросите пакет:', type: 'FILL_BLANK', prompt_phrase: 'Пакет ___', word_bank: ['беріңізші', 'алыңыз', 'жоқ', 'бар ма?'], correctAnswer: 'беріңізші', explanation: 'Беріңізші = дайте пожалуйста (-ші - вежливая просьба).', rememberTip: '-Ші делает просьбу вежливой!' },
  ],
  13: [
    { id: 13001, prompt: 'Что означает «Аялдама»?', type: 'MULTIPLE_CHOICE', options: ['Остановка', 'Перекресток', 'Светофор', 'Переход'], correctAnswer: 'Остановка', explanation: 'Аялдама - транспортная остановка.', rememberTip: 'Аялдама - где останавливается автобус!' },
    { id: 13002, prompt: 'Как спросить про следующую остановку?', type: 'MULTIPLE_CHOICE', options: ['Келесі аялдама қандай?', 'Аялдамада тұру', 'Маршрут бар ма?', 'Автобус неше?'], correctAnswer: 'Келесі аялдама қандай?', explanation: 'Келесі - следующий, қандай - какой.', rememberTip: 'Келесі = следующий!' },
    { id: 13003, prompt: 'Произнесите «Осында тоқтатыңызшы» (Остановите здесь):', type: 'PRONUNCIATION', prompt_phrase: 'Осында тоқтатыңызшы', correctAnswer: 'Осында тоқтатыңызшы', explanation: 'Осында - здесь, тоқтату - остановить.', rememberTip: 'Тоқта = стоп!' },
    { id: 13004, prompt: 'Как переводится «Көлік»?', type: 'MULTIPLE_CHOICE', options: ['Транспорт', 'Дорога', 'Билет', 'Пешеход'], correctAnswer: 'Транспорт', explanation: 'Көлік - транспорт, средство передвижения.', rememberTip: 'Көлік - всё на чём ездят!' },
    { id: 13005, prompt: 'Что означает «Есік жабылады»?', type: 'MULTIPLE_CHOICE', options: ['Двери закрываются', 'Осторожно ступенька', 'Следующая станция', 'Уступайте места'], correctAnswer: 'Двери закрываются', explanation: 'Есік - дверь, жабылу - закрываться.', rememberTip: 'Жабу = закрывать!' },
    { id: 13006, prompt: 'Составьте объявление:', type: 'FILL_BLANK', prompt_phrase: 'Автобус билеті ___ теңге', word_bank: ['100', '1000', 'тегін', 'жоқ'], correctAnswer: '100', explanation: 'Автобус билеті 100 теңге = Билет на автобус 100 тенге.', rememberTip: 'Теңге - валюта Казахстана!' },
  ],
  14: [
    { id: 14001, prompt: 'Как сказать «Направо и налево»?', type: 'MULTIPLE_CHOICE', options: ['Оңға және солға', 'Тура және артқа', 'Жақын және алыс', 'Жоғары және төмен'], correctAnswer: 'Оңға және солға', explanation: 'Оң - правый, сол - левый.', rememberTip: 'Оң қол - правая рука!' },
    { id: 14002, prompt: 'Что значит «Тура жүріңіз»?', type: 'MULTIPLE_CHOICE', options: ['Идите прямо', 'Поверните назад', 'Остановитесь', 'Перейдите улицу'], correctAnswer: 'Идите прямо', explanation: 'Тура - прямо, жүріңіз - идите.', rememberTip: 'Тура = прямо!' },
    { id: 14003, prompt: 'Произнесите «Вокзал қайда орналасқан?»:', type: 'PRONUNCIATION', prompt_phrase: 'Вокзал қайда орналасқан?', correctAnswer: 'Вокзал қайда орналасқан?', explanation: 'Қайда - где, орналасқан - находится.', rememberTip: 'Қайда = где?' },
    { id: 14004, prompt: 'Что означает «Жақын»?', type: 'MULTIPLE_CHOICE', options: ['Близко', 'Далеко', 'Быстро', 'Медленно'], correctAnswer: 'Близко', explanation: 'Жақын - близко (рядом), Алыс - далеко.', rememberTip: 'Жақын = близко, Алыс = далеко!' },
    { id: 14005, prompt: 'Как понять «Жаяу бес минуттық жер»?', type: 'MULTIPLE_CHOICE', options: ['5 минут пешком', '5 остановок на автобусе', '5 км по трассе', 'Такси через 5 минут'], correctAnswer: '5 минут пешком', explanation: 'Жаяу - пешком, бес минут - 5 минут.', rememberTip: 'Жаяу = пешком!' },
    { id: 14006, prompt: 'Составьте указание:', type: 'FILL_BLANK', prompt_phrase: 'Бағдаршамнан кейін ___ бұрылыңыз', word_bank: ['оңға', 'солға', 'тура', 'артқа'], correctAnswer: 'оңға', explanation: 'Оңға бұрылыңыз = поверните направо.', rememberTip: 'Оңға = направо!' },
  ],
  15: [
    { id: 15001, prompt: 'Кто такой «Дәрігер»?', type: 'MULTIPLE_CHOICE', options: ['Врач', 'Учитель', 'Водитель', 'Строитель'], correctAnswer: 'Врач', explanation: 'Дәрі - лекарство. Дәрігер - врач.', rememberTip: 'Дәрі = лекарство, дәрігер = врач!' },
    { id: 15002, prompt: 'Как переводится «Мұғалім»?', type: 'MULTIPLE_CHOICE', options: ['Учитель', 'Студент', 'Директор', 'Писатель'], correctAnswer: 'Учитель', explanation: 'Мұғалім - учитель.', rememberTip: 'Мұғалім = учитель!' },
    { id: 15003, prompt: 'Произнесите «Мен дәрігермін» (Я врач):', type: 'PRONUNCIATION', prompt_phrase: 'Мен дәрігермін', correctAnswer: 'Мен дәрігермін', explanation: 'Дәрігер + мін = я врач.', rememberTip: 'Мен ...мін = Я ...' },
    { id: 15004, prompt: 'Как сказать «Я инженер»?', type: 'MULTIPLE_CHOICE', options: ['Мен инженермін', 'Мен оқимын', 'Мен фирмадамын', 'Мамандығым жоқ'], correctAnswer: 'Мен инженермін', explanation: 'Инженер + мін = я инженер.', rememberTip: 'Мен + профессия + мін = Я ...' },
    { id: 15005, prompt: 'Кто такой «Аспаз»?', type: 'MULTIPLE_CHOICE', options: ['Повар', 'Официант', 'Пекарь', 'Менеджер'], correctAnswer: 'Повар', explanation: 'Ас - еда. Аспаз - мастер еды, повар.', rememberTip: 'Ас + паз = повар!' },
    { id: 15006, prompt: 'Представьтесь по профессии:', type: 'FILL_BLANK', prompt_phrase: 'Мен ___', word_bank: ['мұғаліммін', 'дәрігерсіз', 'оқимыз', 'барады'], correctAnswer: 'мұғаліммін', explanation: 'Мен мұғаліммін = Я учитель (мұғалім + мін = мұғаліммін).', rememberTip: 'Мен + мамандық + мін!' },
  ],
  16: [
    { id: 16001, prompt: 'Что означает «Бос уақыт»?', type: 'MULTIPLE_CHOICE', options: ['Свободное время', 'Рабочее время', 'Опоздание', 'Выходной'], correctAnswer: 'Свободное время', explanation: 'Бос - свободный, уақыт - время.', rememberTip: 'Бос уақыт = свободное время!' },
    { id: 16002, prompt: 'Переведите «Мен кітап оқығанды жақсы көремін»:', type: 'MULTIPLE_CHOICE', options: ['Я люблю читать книги', 'Я покупаю книги', 'Я пишу книгу', 'У меня много книг'], correctAnswer: 'Я люблю читать книги', explanation: 'Жақсы көру - любить/нравиться.', rememberTip: 'Жақсы көру = любить!' },
    { id: 16003, prompt: 'Произнесите «Мен спортпен шұғылданамын»:', type: 'PRONUNCIATION', prompt_phrase: 'Мен спортпен шұғылданамын', correctAnswer: 'Мен спортпен шұғылданамын', explanation: 'Шұғылдану - заниматься регулярно.', rememberTip: 'Шұғылдану = регулярно заниматься!' },
    { id: 16004, prompt: 'Что значит «Ән тыңдау»?', type: 'MULTIPLE_CHOICE', options: ['Слушать музыку', 'Петь в хоре', 'Играть на домбре', 'Сочинять стихи'], correctAnswer: 'Слушать музыку', explanation: 'Ән - песня, тыңдау - слушать.', rememberTip: 'Тыңдау = слушать!' },
    { id: 16005, prompt: 'На чём играют казахские кюи «Домбыра тарту»?', type: 'MULTIPLE_CHOICE', options: ['На домбре', 'На кобызе', 'На гитаре', 'На пианино'], correctAnswer: 'На домбре', explanation: 'Домбыра - двухструнный щипковый инструмент казахов.', rememberTip: 'Домбыра - душа казахской музыки!' },
    { id: 16006, prompt: 'Составьте финальную фразу победителя:', type: 'FILL_BLANK', prompt_phrase: 'Мен қазақша ___ сөйлеймін!', word_bank: ['еркін', 'жай', 'ақырын', 'қате'], correctAnswer: 'еркін', explanation: 'Мен қазақша еркін сөйлеймін = Я свободно говорю по-казахски!', rememberTip: 'Еркін = свободно!' },
  ],
};

const getFallbackForLesson = (lessonId) =>
  LESSON_EXERCISES[lessonId] || LESSON_EXERCISES[1];

// ═══════════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ═══════════════════════════════════════════════════════════════════

// ── Кнопка TTS (динамик) ─────────────────────────────────────────
// ── Компонент упражнения PRONUNCIATION (STT) ──────────────────────
const PronunciationExercise = ({ phrase, onSuccess }) => {
  const [status, setStatus] = useState('idle'); // idle | recording | analyzing | done
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const recRef = useRef(null);
  const timerRef = useRef(null);
  const barAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0.2))
  ).current;

  // Анимация эквалайзера
  useEffect(() => {
    if (status === 'recording') {
      const animations = barAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.4 + Math.random() * 0.6,
              duration: 200 + i * 60,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.15 + Math.random() * 0.3,
              duration: 180 + i * 50,
              useNativeDriver: true,
            }),
          ])
        )
      );
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    }
  }, [status]);

  // Таймер записи
  useEffect(() => {
    if (status === 'recording') {
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t >= 29) {
            handleStop();
            return 0;
          }
          return t + 1;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleStart = () => {
    setStatus('recording');
    setResult(null);

    recRef.current = startRecognition(phrase, {
      onStart: () => setStatus('recording'),
      onResult: (res) => {
        setStatus('analyzing');
        setTimeout(() => {
          setResult(res);
          setStatus('done');
          if (res?.isCorrect) {
            playSoundFeedback('correct');
            onSuccess?.();
          } else {
            playSoundFeedback('wrong');
          }
        }, 500);
      },
      onError: (err) => {
        setStatus('done');
        setResult({
          score: 0,
          isCorrect: false,
          feedback: typeof err === 'string' ? err : 'Голос не распознан. Попробуйте еще раз четко в микрофон.',
        });
        playSoundFeedback('wrong');
      },
      maxDuration: 4000,
    });
  };

  const handleStop = () => {
    recRef.current?.stop();
    setStatus('analyzing');
  };

  const handleRetry = () => {
    setStatus('idle');
    setResult(null);
  };

  return (
    <View style={sttStyles.container}>
      {/* Фраза для произношения */}
      <View style={sttStyles.phraseCard}>
        <AppText size={Typography.xs} color={Colors.textSub} ru="Произнесите вслух:" style={{ marginBottom: 4 }}>
          Дауыстап айтыңыз:
        </AppText>
        <AppText bold size={Typography.xl} color={Colors.text} style={{ textAlign: 'center', letterSpacing: 1 }}>
          {phrase}
        </AppText>
      </View>

      {/* Статус и анимация */}
      {status === 'recording' && (
        <View style={sttStyles.equalizerRow}>
          {barAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                sttStyles.eqBar,
                {
                  backgroundColor: i % 2 === 0 ? Colors.accentBlue : Colors.accent,
                  transform: [{ scaleY: anim }],
                },
              ]}
            />
          ))}
          <AppText size={Typography.xs} color={Colors.textSub} style={sttStyles.timerText}>
            {(timer / 10).toFixed(1)}s
          </AppText>
        </View>
      )}

      {status === 'analyzing' && (
        <View style={sttStyles.analyzingRow}>
          <ActivityIndicator size="small" color={Colors.text} />
          <AppText size={Typography.sm} color={Colors.textSub} ru="Анализ произношения..." style={{ marginLeft: 8 }}>
            Дыбыс талдануда...
          </AppText>
        </View>
      )}

      {/* Результат */}
      {status === 'done' && result && (
        <View style={sttStyles.resultCard}>
          <View style={sttStyles.scoreRow}>
            <AppText bold size={Typography.xxl} color={result.isCorrect ? '#2E7D32' : '#C62828'}>
              {result.score}%
            </AppText>
            <View style={[sttStyles.scoreBadge, !result.isCorrect && { borderColor: '#C62828', backgroundColor: '#FFEBEE' }]}>
              {result.isCorrect ? (
                <>
                  <CheckIcon size={16} color="#2E7D32" />
                  <AppText bold size={Typography.xs} color="#2E7D32" ru="Правильно" style={{ marginLeft: 4 }}>
                    ДҰРЫС
                  </AppText>
                </>
              ) : (
                <>
                  <CloseIcon size={16} color="#C62828" />
                  <AppText bold size={Typography.xs} color="#C62828" ru="Неверно" style={{ marginLeft: 4 }}>
                    ҚАТЕ
                  </AppText>
                </>
              )}
            </View>
          </View>

          {result.feedback ? (
            <AppText size={Typography.xs} color={result.isCorrect ? Colors.textSub : '#C62828'} style={{ marginTop: 6, lineHeight: 18 }}>
              {result.feedback}
            </AppText>
          ) : null}

          <AppPressable
            onPress={handleRetry}
            style={({ pressed }) => [sttStyles.retryBtn, pressed && { transform: [{ translateY: 1 }] }]}
          >
            <AppText size={Typography.xs} color={Colors.text} ru="Повторить произношение">Қайталау</AppText>
          </AppPressable>
        </View>
      )}

      {/* Кнопка микрофона */}
      {(status === 'idle' || status === 'recording') && (
        <AppPressable
          onPress={status === 'idle' ? handleStart : handleStop}
          style={({ pressed }) => [
            sttStyles.micBtn,
            status === 'recording' && sttStyles.micBtnActive,
            pressed && { transform: [{ translateY: 2 }] },
          ]}
        >
          {/* Микрофон SVG-иконка через View */}
          <View style={sttStyles.micIcon}>
            <View style={sttStyles.micBody} />
            <View style={sttStyles.micStand} />
            <View style={sttStyles.micBase} />
          </View>
          <AppText bold size={Typography.sm} color={Colors.text} ru={status === 'idle' ? 'Нажмите и говорите' : 'Остановить'}>
            {status === 'idle' ? 'БАСЫП, СӨЙЛЕҢІЗ' : 'ТОҚТАТУ'}
          </AppText>
        </AppPressable>
      )}
    </View>
  );
};

const sttStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.md },
  phraseCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 60,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  eqBar: {
    width: 10,
    height: 50,
    borderRadius: 4,
  },
  timerText: { marginLeft: 10, alignSelf: 'center' },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.inactive,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  wordScoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  wordScoreBadge: {
    alignItems: 'center',
    minWidth: 60,
  },
  wordScoreBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 3,
    minWidth: 20,
  },
  retryBtn: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inactive,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    backgroundColor: Colors.accent,
  },
  micBtnActive: {
    backgroundColor: '#FF8A80',
    borderColor: Colors.text,
  },
  micIcon: { width: 20, height: 32, alignItems: 'center' },
  micBody: {
    width: 14, height: 20, borderRadius: 7,
    borderWidth: 2.5, borderColor: Colors.text,
    backgroundColor: Colors.accentBlue,
  },
  micStand: { width: 2, height: 7, backgroundColor: Colors.text, marginTop: 1 },
  micBase: { width: 14, height: 2, backgroundColor: Colors.text, borderRadius: 1 },
});

// ── Банк слов (FILL_BLANK) ────────────────────────────────────────
const WordBankExercise = ({ exercise, onSelect, currentAnswer }) => {
  const { word_bank = [], prompt_phrase = '' } = exercise;
  const [slots, setSlots] = useState(['']);
  const [bankWords, setBankWords] = useState(word_bank);
  const [filled, setFilled] = useState('');

  useEffect(() => {
    setSlots(['']);
    setBankWords(word_bank);
    setFilled('');
  }, [exercise.id]);

  const handleBankWord = (word, idx) => {
    const newBank = [...bankWords];
    newBank.splice(idx, 1);
    setBankWords(newBank);
    setFilled(word);
    setSlots([word]);
    onSelect?.(word);
  };

  const handleSlotPress = () => {
    if (!filled) return;
    setBankWords((prev) => [...prev, filled]);
    setFilled('');
    setSlots(['']);
    onSelect?.('');
  };

  const parts = prompt_phrase.split('___');

  return (
    <View style={wbStyles.container}>
      {/* Шаблон фразы */}
      <View style={wbStyles.phraseRow}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <AppText size={Typography.lg} color={Colors.text}>{part}</AppText>
            {i < parts.length - 1 && (
              <AppPressable
                onPress={handleSlotPress}
                style={[wbStyles.slot, filled && wbStyles.slotFilled]}
              >
                <AppText
                  bold
                  size={Typography.lg}
                  color={filled ? Colors.text : Colors.inactive}
                >
                  {filled || '_____'}
                </AppText>
              </AppPressable>
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Банк слов */}
      <View style={wbStyles.bank}>
        {bankWords.map((word, idx) => (
          <AppPressable
            key={`${word}-${idx}`}
            onPress={() => handleBankWord(word, idx)}
            style={({ pressed }) => [
              wbStyles.chip,
              pressed && { transform: [{ translateY: 2 }] },
            ]}
          >
            <AppText bold size={Typography.md} color={Colors.text}>{word}</AppText>
          </AppPressable>
        ))}
        {/* Пустые слоты вместо вытащенных слов */}
        {word_bank.length - bankWords.length > 0 &&
          Array.from({ length: word_bank.length - bankWords.length }).map((_, i) => (
            <View key={`empty-${i}`} style={wbStyles.chipEmpty} />
          ))}
      </View>
    </View>
  );
};

const wbStyles = StyleSheet.create({
  container: { paddingVertical: Spacing.sm },
  phraseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    minHeight: 56,
  },
  slot: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.inactive,
    paddingHorizontal: 10,
    paddingBottom: 2,
    minWidth: 70,
    alignItems: 'center',
  },
  slotFilled: {
    borderBottomColor: Colors.text,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipEmpty: {
    width: 72,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.inactive,
    borderStyle: 'dashed',
  },
});

// ── Казахская клавиатура (панель быстрого ввода) ──────────────────
const KazakhKeyboard = ({ onChar }) => (
  <View style={kbStyles.container}>
    <AppText size={Typography.xs} color={Colors.textSub} style={kbStyles.label}>
      Казахские буквы:
    </AppText>
    <View style={kbStyles.row}>
      {KAZAKH_SPECIAL_CHARS.map((ch) => (
        <AppPressable
          key={ch}
          onPress={() => onChar?.(ch)}
          style={({ pressed }) => [
            kbStyles.key,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
        >
          <AppText bold size={Typography.sm} color={Colors.text}>{ch}</AppText>
        </AppPressable>
      ))}
    </View>
  </View>
);

const kbStyles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.inactive,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    padding: Spacing.sm,
  },
  label: { marginBottom: 6 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  key: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 6,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    paddingHorizontal: 8,
    paddingVertical: 5,
    minWidth: 32,
    alignItems: 'center',
  },
});

// ═══════════════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ ЭКРАНА
// ═══════════════════════════════════════════════════════════════════

const LessonScreen = () => {
  const { activeLessonId, lessons, navigateTo, completeLesson, hearts, xp, isAuth } = useApp();

  const currentLessonId = activeLessonId || 1;

  const lesson = lessons.find((l) => l.id === currentLessonId) || {
    id: currentLessonId,
    title: '1-сабақ',
    description: '',
    type: 'PRACTICE',
  };

  // Гость может проходить только Урок 1
  useEffect(() => {
    if (!isAuth && lesson?.id > 1) {
      navigateTo('main');
    }
  }, [isAuth, lesson?.id, navigateTo]);

  // ── Состояние урока ──
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakesQueue, setMistakesQueue] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [initialTotal, setInitialTotal] = useState(0);
  const [anatomyWord, setAnatomyWord] = useState(null);

  // ── Ответы ──
  const [selectedOption, setSelectedOption] = useState('');
  const [textInputAnswer, setTextInputAnswer] = useState('');
  const [wordBankAnswer, setWordBankAnswer] = useState('');
  const [pronunciationDone, setPronunciationDone] = useState(false);
  const textInputRef = useRef(null);

  // ── Проверка ──
  const [checking, setChecking] = useState(false);
  const [resultState, setResultState] = useState(null);
  const [finished, setFinished] = useState(false);
  const [correctFirstTryCount, setCorrectFirstTryCount] = useState(0);

  // ── Анимация нижней панели ──
  const bottomSlideAnim = useRef(new Animated.Value(100)).current;

  // ─────────────────────────────────────────────────────────────────
  // ЗАГРУЗКА УПРАЖНЕНИЙ
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const reset = () => {
      setLoading(true);
      setCurrentIndex(0);
      setMistakesQueue([]);
      setIsReviewMode(false);
      setResultState(null);
      setSelectedOption('');
      setTextInputAnswer('');
      setWordBankAnswer('');
      setPronunciationDone(false);
      setFinished(false);
      setCorrectFirstTryCount(0);
    };

    const fetchExercises = async () => {
      reset();
      const targetId = activeLessonId || 1;
      try {
        const data = await getExercisesForLesson(targetId);
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setExercises(data);
            setInitialTotal(data.length);
          } else {
            const fb = getFallbackForLesson(targetId);
            setExercises(fb);
            setInitialTotal(fb.length);
          }
        }
      } catch (_) {
        if (isMounted) {
          const fb = getFallbackForLesson(targetId);
          setExercises(fb);
          setInitialTotal(fb.length);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExercises();
    return () => { isMounted = false; };
  }, [activeLessonId]);

  // ─────────────────────────────────────────────────────────────────
  // АНИМАЦИЯ НИЖНЕЙ ПАНЕЛИ
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (resultState !== null) {
      Animated.spring(bottomSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } else {
      Animated.timing(bottomSlideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [resultState]);

  // ─────────────────────────────────────────────────────────────────
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ─────────────────────────────────────────────────────────────────
  const currentExercise = exercises[currentIndex];
  const progressPercent = initialTotal > 0
    ? Math.min(currentIndex / initialTotal, 1)
    : 0;

  const getAnswer = useCallback(() => {
    if (!currentExercise) return '';
    switch (currentExercise.type) {
      case 'MULTIPLE_CHOICE': return selectedOption;
      case 'FILL_BLANK':      return wordBankAnswer;
      case 'PRONUNCIATION':   return pronunciationDone ? (currentExercise.prompt_phrase || currentExercise.correctAnswer) : '';
      default:                return textInputAnswer.trim();
    }
  }, [currentExercise, selectedOption, wordBankAnswer, textInputAnswer, pronunciationDone]);

  const hasAnswer = useCallback(() => {
    if (!currentExercise) return false;
    switch (currentExercise.type) {
      case 'MULTIPLE_CHOICE': return !!selectedOption;
      case 'FILL_BLANK':      return !!wordBankAnswer;
      case 'PRONUNCIATION':   return pronunciationDone;
      default:                return textInputAnswer.trim().length > 0;
    }
  }, [currentExercise, selectedOption, wordBankAnswer, textInputAnswer, pronunciationDone]);

  // ─────────────────────────────────────────────────────────────────
  // ПРОВЕРКА ОТВЕТА
  // ─────────────────────────────────────────────────────────────────
  const handleCheckAnswer = async () => {
    if (!currentExercise || !hasAnswer()) return;

    const answer = getAnswer();
    setChecking(true);

    let isCorrect = false;
    let correctAnswer = null;

    try {
      const res = await submitAnswer(currentExercise.id, answer);
      isCorrect = res.isCorrect;
      correctAnswer = isCorrect ? null : (res.correctAnswer || currentExercise.correctAnswer);
    } catch (_) {
      // Локальная проверка при недоступном бэкенде
      const expected = (currentExercise.correctAnswer || '').toLowerCase().trim();
      const given = answer.toLowerCase().trim();
      isCorrect = expected === given ||
        given.includes(expected) ||
        expected.includes(given);
      correctAnswer = isCorrect ? null : currentExercise.correctAnswer;
    }

    if (!isCorrect) {
      if (!mistakesQueue.some((e) => e.id === currentExercise.id)) {
        setMistakesQueue((prev) => [...prev, currentExercise]);
      }
      playSoundFeedback('wrong');
    } else {
      if (!isReviewMode) setCorrectFirstTryCount((prev) => prev + 1);
      playSoundFeedback('correct');
    }

    setResultState({
      isCorrect,
      correctAnswer,
      explanation: currentExercise.explanation,
      rememberTip: currentExercise.rememberTip,
    });

    setChecking(false);
  };

  // ─────────────────────────────────────────────────────────────────
  // СЛЕДУЮЩИЙ ВОПРОС
  // ─────────────────────────────────────────────────────────────────
  const handleNext = () => {
    setResultState(null);
    setSelectedOption('');
    setTextInputAnswer('');
    setWordBankAnswer('');
    setPronunciationDone(false);

    let pendingMistakes = [...mistakesQueue];
    if (isReviewMode && resultState?.isCorrect) {
      pendingMistakes = pendingMistakes.filter((e) => e.id !== currentExercise.id);
      setMistakesQueue(pendingMistakes);
    }

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Пул закончен
    if (!isReviewMode && resultState && !resultState.isCorrect) {
      if (!pendingMistakes.some((e) => e.id === currentExercise.id)) {
        pendingMistakes.push(currentExercise);
      }
    }

    if (pendingMistakes.length > 0) {
      setIsReviewMode(true);
      setExercises(pendingMistakes);
      setCurrentIndex(0);
      setMistakesQueue([]);
    } else {
      setFinished(true);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // ПРОПУСТИТЬ
  // ─────────────────────────────────────────────────────────────────
  const handleSkip = () => {
    if (resultState) {
      handleNext();
      return;
    }
    // Добавляем в ошибки и идём дальше
    if (currentExercise && !mistakesQueue.some((e) => e.id === currentExercise.id)) {
      setMistakesQueue((prev) => [...prev, currentExercise]);
    }
    setResultState({
      isCorrect: false,
      correctAnswer: currentExercise?.correctAnswer,
      explanation: currentExercise?.explanation,
      rememberTip: currentExercise?.rememberTip,
    });
  };

  // ─────────────────────────────────────────────────────────────────
  // ВСТАВКА КАЗАХСКОЙ БУКВЫ В ТЕКСТОВОЕ ПОЛЕ
  // ─────────────────────────────────────────────────────────────────
  const handleInsertChar = (ch) => {
    setTextInputAnswer((prev) => prev + ch);
    textInputRef.current?.focus();
  };

  // ─────────────────────────────────────────────────────────────────
  // ЗАВЕРШЕНИЕ УРОКА
  // ─────────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    const accuracy = initialTotal > 0 ? (correctFirstTryCount / initialTotal) : 1;
    const earnedXp = Math.round(accuracy * 35) + 15;
    playSoundFeedback('success');
    await completeLesson(lesson.id, earnedXp);
  };

  // ─────────────────────────────────────────────────────────────────
  // ЭКРАН ФИНАЛЬНОГО РЕЗУЛЬТАТА
  // ─────────────────────────────────────────────────────────────────
  if (finished) {
    const accuracy = initialTotal > 0
      ? Math.round((correctFirstTryCount / initialTotal) * 100)
      : 100;
    const earnedXp = Math.round((accuracy / 100) * 35) + 15;

    return (
      <View style={styles.root}>
        <View style={styles.finishContainer}>
          <View style={styles.victoryCircle}>
            <StarIcon size={46} color={Colors.text} fill={Colors.accent} animate />
          </View>

          <AppText bold size={Typography.xxl} color={Colors.text} style={styles.finishTitle}>
            Керемет!
          </AppText>
          <AppText size={Typography.md} color={Colors.textSub} style={styles.finishSub}>
            Все задания урока «{lesson.title}» пройдены!
          </AppText>

          <View style={styles.rewardCard}>
            <View style={styles.rewardItem}>
              <StarIcon size={28} animate style={{ marginBottom: 4 }} />
              <AppText bold size={Typography.lg} color={Colors.text}>+{earnedXp}</AppText>
              <AppText size={Typography.xs} color={Colors.textSub}>XP</AppText>
            </View>
            <View style={styles.rewardDivider} />
            <View style={styles.rewardItem}>
              <TargetIcon size={28} style={{ marginBottom: 4 }} />
              <AppText bold size={Typography.lg} color={Colors.text}>{accuracy}%</AppText>
              <AppText size={Typography.xs} color={Colors.textSub}>С 1-й попытки</AppText>
            </View>
            <View style={styles.rewardDivider} />
            <View style={styles.rewardItem}>
              <CheckIcon size={28} style={{ marginBottom: 4 }} />
              <AppText bold size={Typography.lg} color={Colors.text}>100%</AppText>
              <AppText size={Typography.xs} color={Colors.textSub}>Усвоено</AppText>
            </View>
          </View>

          {!isAuth && (
            <View style={styles.guestSaveBox}>
              <AppText bold size={Typography.sm} color={Colors.text} align="center" ru="Вы завершили 1-й урок!">
                Сіз 1-сабақты сәтті аяқтадыңыз!
              </AppText>
              <AppText size={Typography.xs} color={Colors.textSub} align="center" style={{ marginTop: 4, lineHeight: 18 }} ru="Войдите, чтобы сохранить результаты">
                Келесі сабақтарды ашу және нәтижені сақтап қалу үшін жүйеге тіркеліңіз немесе кіріңіз.
              </AppText>
              <TactileButton
                label="ПРОГРЕСТІ САҚТАУ"
                ru="Сохранить прогресс (Вход / Регистрация)"
                variant="secondary"
                size={Typography.sm}
                onPress={() => navigateTo('auth')}
                style={{ marginTop: 12, width: '100%' }}
              />
            </View>
          )}

          <TactileButton
            label="САБАҚТАР КАРТАСЫНА"
            ru="На карту уроков"
            variant="primary"
            size={Typography.lg}
            onPress={handleFinish}
            style={{ width: '100%', maxWidth: 380, marginTop: Spacing.xl }}
          />
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ОСНОВНОЙ ЭКРАН УРОКА
  // ─────────────────────────────────────────────────────────────────
  const exType = currentExercise?.type || 'MULTIPLE_CHOICE';
  const typeBadgeLabel = TYPE_LABELS[exType] || 'ЗАДАНИЕ';
  const typeBadgeColor = TYPE_BADGE_COLOR[exType] || Colors.accentBlue;

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {/* ── ВЕРХНЯЯ ПАНЕЛЬ ── */}
        <View style={styles.topBar}>
          <AppPressable
            onPress={() => navigateTo('main')}
            accessibilityLabel="Выйти из урока"
            style={({ pressed }) => [styles.closeBtn, pressed && { transform: [{ translateY: 2 }] }]}
          >
            <CloseIcon size={18} color={Colors.text} />
          </AppPressable>

          <View style={styles.progressBarWrapper}>
            <ProgressBar progress={progressPercent} height={14} />
          </View>

          {/* Счётчик вопросов / режим повтора */}
          <View style={[styles.counterBadge, isReviewMode && styles.reviewBadge]}>
            <AppText bold size={Typography.xs} color={Colors.text}>
              {isReviewMode ? 'ҚАЙТАЛАУ' : `${currentIndex + 1}/${initialTotal}`}
            </AppText>
          </View>
        </View>

        {/* Баннер режима работы над ошибками */}
        {isReviewMode && (
          <View style={styles.reviewBanner}>
            <SparklesIcon size={16} color={Colors.text} style={{ marginRight: 6 }} />
            <AppText bold size={Typography.xs} color={Colors.text}>
              РАБОТА НАД ОШИБКАМИ - ответь правильно, чтобы закрепить!
            </AppText>
          </View>
        )}

        {/* ── ТЕЛО УРОКА ── */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={Colors.text} />
            <AppText size={Typography.sm} color={Colors.textSub} style={{ marginTop: 12 }}>
              Загружаем упражнения...
            </AppText>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Лейбл урока */}
            <AppText size={Typography.xs} color={Colors.textSub} style={styles.lessonLabel}>
              {lesson.title}
            </AppText>

            {/* Бейдж типа задания */}
            <View style={[styles.typeBadge, { backgroundColor: typeBadgeColor }]}>
              <AppText bold size={Typography.xs} color={Colors.text}>
                {typeBadgeLabel}
              </AppText>
            </View>

            {/* Карточка вопроса с TTS */}
            <View style={styles.promptCard}>
              <AppText bold size={Typography.md} color={Colors.text} style={{ marginBottom: Spacing.sm }}>
                {currentExercise?.prompt}
              </AppText>

              {/* Контрольная фраза */}
              {currentExercise?.prompt_phrase ? (
                <AppText bold size={Typography.xl} color={Colors.text} style={{ marginTop: 4, marginBottom: 6 }}>
                  {currentExercise.prompt_phrase}
                </AppText>
              ) : null}

              {/* Кнопка «Анатомия казахского слова» */}
              {(currentExercise?.prompt_phrase || currentExercise?.correctAnswer) && (
                <AppPressable
                  onPress={() => setAnatomyWord(currentExercise.prompt_phrase || currentExercise.correctAnswer)}
                  style={({ pressed }) => [
                    styles.anatomyBtn,
                    pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
                  ]}
                  accessibilityLabel="Разобрать казахское слово по составу"
                >
                  <AppText bold size={Typography.xs} color={Colors.text} ru="Разобрать по составу">
                    ҚҰРАМЫН ТАЛДАУ
                  </AppText>
                </AppPressable>
              )}
            </View>

            {/* ── ЗОНА ОТВЕТА ── */}

            {/* 1. Выбор из вариантов */}
            {exType === 'MULTIPLE_CHOICE' && (
              <View style={styles.optionsGrid}>
                {currentExercise?.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isAnswered = resultState !== null;
                  const isCorrectOpt = opt === currentExercise.correctAnswer;

                  let optStyle = [styles.optionButton];
                  if (isAnswered && isCorrectOpt) optStyle = [styles.optionButton, styles.optionCorrect];
                  else if (isAnswered && isSelected && !isCorrectOpt) optStyle = [styles.optionButton, styles.optionWrong];
                  else if (isSelected) optStyle = [styles.optionButton, styles.optionButtonSelected];

                  return (
                    <AppPressable
                      key={idx}
                      disabled={isAnswered}
                      onPress={() => setSelectedOption(opt)}
                      style={({ pressed }) => [
                        ...optStyle,
                        pressed && !isAnswered && { transform: [{ translateY: 2 }] },
                      ]}
                    >
                      <View style={styles.optionKeyBadge}>
                        <AppText bold size={Typography.xs} color={Colors.text}>{idx + 1}</AppText>
                      </View>
                      <AppText
                        bold={isSelected}
                        size={Typography.md}
                        color={Colors.text}
                        style={{ flex: 1 }}
                      >
                        {opt}
                      </AppText>
                      {isAnswered && isCorrectOpt && <CheckIcon size={18} color="#2E7D32" />}
                    </AppPressable>
                  );
                })}
              </View>
            )}

            {/* 2. Банк слов (FILL_BLANK) */}
            {exType === 'FILL_BLANK' && (
              <WordBankExercise
                exercise={currentExercise}
                onSelect={setWordBankAnswer}
                currentAnswer={wordBankAnswer}
              />
            )}

            {/* 3. Ввод текста */}
            {exType === 'TEXT' && (
              <View style={styles.inputContainer}>
                <AppText size={Typography.xs} color={Colors.textSub} style={{ marginBottom: 6 }}>
                  Введите ответ:
                </AppText>
                <TextInput
                  ref={textInputRef}
                  value={textInputAnswer}
                  onChangeText={setTextInputAnswer}
                  placeholder="Введите ответ..."
                  placeholderTextColor="#8C8C84"
                  style={[
                    styles.textInput,
                    Platform.OS === 'web' && { outlineStyle: 'none', outlineWidth: 0 },
                  ]}
                  autoCapitalize="none"
                  editable={resultState === null}
                  returnKeyType="done"
                  onSubmitEditing={hasAnswer() && !resultState ? handleCheckAnswer : undefined}
                />
                {/* Казахская клавиатура */}
                {resultState === null && (
                  <KazakhKeyboard onChar={handleInsertChar} />
                )}
              </View>
            )}

            {/* 4. Произношение STT */}
            {exType === 'PRONUNCIATION' && !resultState && (
              <PronunciationExercise
                phrase={currentExercise?.prompt_phrase || currentExercise?.correctAnswer || ''}
                onSuccess={() => setPronunciationDone(true)}
              />
            )}

            {/* ── РАЗБОР ОШИБКИ ── */}
            {resultState && !resultState.isCorrect && (
              <View style={styles.mistakeCard}>
                <View style={styles.mistakeHeader}>
                  <CloseIcon size={18} color="#C62828" style={{ marginRight: 6 }} />
                  <AppText bold size={Typography.sm} color="#B71C1C">
                    Разбор ошибки:
                  </AppText>
                </View>

                {resultState.explanation ? (
                  <AppText size={Typography.sm} color={Colors.text} style={{ marginTop: 6, lineHeight: 20 }}>
                    {resultState.explanation}
                  </AppText>
                ) : null}

                {resultState.rememberTip ? (
                  <View style={styles.rememberTipBox}>
                    <AppText bold size={Typography.xs} color={Colors.text}>
                      Как запомнить на будущее:
                    </AppText>
                    <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 3, lineHeight: 18 }}>
                      {resultState.rememberTip}
                    </AppText>
                  </View>
                ) : null}

                <View style={styles.repeatNotice}>
                  <AppText bold size={Typography.xs} color="#1565C0">
                    Этот вопрос вернётся в конце теста - ответь правильно!
                  </AppText>
                </View>
              </View>
            )}

            {/* Правильный ответ при успехе */}
            {resultState?.isCorrect && exType !== 'PRONUNCIATION' && (
              <View style={styles.correctCard}>
                <CheckIcon size={18} color="#2E7D32" style={{ marginRight: 6 }} />
                <AppText size={Typography.sm} color="#2E7D32">
                  {resultState.explanation || 'Правильно! Отличная работа!'}
                </AppText>
              </View>
            )}
          </ScrollView>
        )}

        {/* ── НИЖНИЙ ФУТЕР ── */}
        <View
          style={[
            styles.bottomBar,
            resultState?.isCorrect && styles.bottomBarCorrect,
            resultState?.isCorrect === false && styles.bottomBarIncorrect,
          ]}
        >
          {/* Результат */}
          {resultState && (
            <View style={styles.resultBanner}>
              {resultState.isCorrect ? (
                <View style={styles.resultRow}>
                  <CheckIcon size={22} color="#2E7D32" style={{ marginRight: 6 }} />
                  <AppText bold size={Typography.lg} color="#2E7D32" ru="Отлично! Правильно!">
                    Керемет! Дұрыс!
                  </AppText>
                </View>
              ) : (
                <View style={styles.resultRow}>
                  <CloseIcon size={22} color="#C62828" style={{ marginRight: 6 }} />
                  <AppText bold size={Typography.md} color="#C62828" ru="Правильный ответ:" style={{ flex: 1 }}>
                    Дұрыс жауап: {resultState.correctAnswer}
                  </AppText>
                </View>
              )}
            </View>
          )}

          {/* Кнопки */}
          <View style={styles.footerButtons}>
            {!resultState && (
              <AppPressable
                onPress={handleSkip}
                style={({ pressed }) => [styles.skipBtn, pressed && { transform: [{ translateY: 1 }] }]}
              >
                <AppText bold size={Typography.sm} color={Colors.textSub} ru="Пропустить">
                  ӨТКІЗУ
                </AppText>
              </AppPressable>
            )}

            <TactileButton
              label={
                resultState
                  ? 'КЕЛЕСІ →'
                  : checking
                  ? 'ТЕКСЕРУДЕ...'
                  : 'ТЕКСЕРУ'
              }
              ru={
                resultState
                  ? 'Далее'
                  : checking
                  ? 'Проверка...'
                  : 'Проверить'
              }
              variant={
                resultState?.isCorrect
                  ? 'primary'
                  : resultState?.isCorrect === false
                  ? 'secondary'
                  : 'primary'
              }
              size={Typography.md}
              disabled={(!hasAnswer() && !resultState) || checking}
              onPress={resultState ? handleNext : handleCheckAnswer}
              style={{ flex: resultState ? 1 : undefined, minWidth: 160 }}
            />
          </View>
        </View>

        {/* Модальное окно «Анатомия казахского слова» */}
        <WordAnatomyModal
          visible={!!anatomyWord}
          word={anatomyWord}
          onClose={() => setAnatomyWord(null)}
        />
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// СТИЛИ
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 820,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'web' ? Spacing.lg : Spacing.md,
  },
  guestSaveBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },

  // Верхняя панель
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  progressBarWrapper: { flex: 1 },
  counterBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.inactive,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text,
  },
  reviewBadge: { backgroundColor: Colors.accent },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    marginHorizontal: Spacing.md,
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
  },

  // Загрузка
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Прокручиваемое содержимое
  content: { flex: 1, paddingHorizontal: Spacing.md },
  contentInner: { paddingVertical: Spacing.sm, paddingBottom: Spacing.xl },

  lessonLabel: {
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },

  // Бейдж типа
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text,
    marginBottom: Spacing.sm,
  },

  // Карточка вопроса
  promptCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  anatomyBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentBlue, // #40dfff
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
  },

  // Варианты (MULTIPLE_CHOICE)
  optionsGrid: { width: '100%' },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  optionButtonSelected: {
    backgroundColor: Colors.accent,
    borderBottomWidth: 5,
  },
  optionCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
    borderBottomColor: '#2E7D32',
  },
  optionWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: '#C62828',
    borderBottomColor: '#C62828',
  },
  optionKeyBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    backgroundColor: Colors.background,
  },

  // Текстовый ввод
  inputContainer: { marginVertical: Spacing.sm },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    fontSize: Typography.md,
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.text,
  },

  // Разбор ошибки
  mistakeCard: {
    marginTop: Spacing.sm,
    backgroundColor: '#FFFDE7',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
  },
  mistakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberTipBox: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 8,
    padding: Spacing.sm,
  },
  repeatNotice: {
    marginTop: Spacing.sm,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
    borderRadius: 6,
    padding: 6,
  },
  correctCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderRadius: 10,
    padding: Spacing.sm,
  },

  // Нижний футер
  bottomBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.inactive,
    backgroundColor: Colors.background,
  },
  bottomBarCorrect: {
    backgroundColor: '#E8F5E9',
    borderTopColor: '#2E7D32',
  },
  bottomBarIncorrect: {
    backgroundColor: '#FFEBEE',
    borderTopColor: '#C62828',
  },
  resultBanner: { marginBottom: Spacing.sm },
  resultRow: { flexDirection: 'row', alignItems: 'center' },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.inactive,
  },

  // Финальный экран
  finishContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    maxWidth: 500,
    width: '100%',
  },
  victoryCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF59D',
    borderWidth: 3,
    borderColor: Colors.text,
    borderBottomWidth: 6,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  finishTitle: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  finishSub: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  rewardCard: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    padding: Spacing.lg,
  },
  rewardItem: { alignItems: 'center' },
  rewardDivider: {
    width: 2,
    height: 48,
    backgroundColor: Colors.inactive,
    borderRadius: 1,
  },
});

export default LessonScreen;
