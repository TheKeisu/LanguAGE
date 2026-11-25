// frontend/src/screens/LearnScreen.js
// ─────────────────────────────────────────────────────────────────
// Главный экран «Обучение» (в духе Duolingo со Скриншота 1):
// - Все 4 раздела программы обучения видны при вертикальном скролле.
// - Тактильные плашки каждого раздела с кнопкой «СПРАВОЧНИК».
// - Стильные горизонтальные разделители между разделами («ПЕРЕЙТИ СЮДА»).
// - Тактильные узлы уроков, бонусные сундучки с XP и кубки финалов разделов.
// - Скролл работает В ЛЮБОЙ ТОЧКЕ ЭКРАНА (колесико мыши листает уроки отовсюду).
// - Сайдбары закреплены через position: sticky на Web.
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import AppText from '../components/AppText';
import AppPressable from '../components/AppPressable';
import StatsBar from '../components/StatsBar';
import MobileHeader from '../components/MobileHeader';
import HeaderBanner from '../components/HeaderBanner';
import LessonNode from '../components/LessonNode';
import HandbookModal from '../components/HandbookModal';
import LockedLessonModal from '../components/LockedLessonModal';
import AiCameraModal from '../components/AiCameraModal';
import FloatingAiCameraButton from '../components/FloatingAiCameraButton';
import WebSidebar from '../components/WebSidebar';
import WebRightSidebar from '../components/WebRightSidebar';
import TabBar from '../components/TabBar';
import { TrophyIcon, ChestIcon, StarIcon, CheckIcon, BookIcon } from '../components/Icons';
import SoundsScreen from './SoundsScreen';
import DialoguesScreen from './DialoguesScreen';
import QuestsScreen from './QuestsScreen';
import ProfileScreen from './ProfileScreen';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../theme/theme';

// Шаблон S-образного горизонтального смещения узлов
const S_PATTERN = [0, -45, -75, -45, 0, 45, 75, 45];

// Описание 4 разделов курса
const SECTIONS_META = [
  {
    id: 1,
    number: '1 БӨЛІМ',
    numberRu: 'Раздел 1',
    title: 'Қазақ әліпбиі және негізгі сөздер',
    titleRu: 'Казахский алфавит и базовые фразы',
    description: 'Освойте специфические гласные, носовые звуки и первые фразы этикета',
    bg: Colors.accentBlue, // #40dfff
  },
  {
    id: 2,
    number: '2 БӨЛІМ',
    numberRu: 'Раздел 2',
    title: 'Отбасы, үй және күн тәртібі',
    titleRu: 'Семья, дом и распорядок дня',
    description: 'Расскажите о своих близких, уютном доме, любимой еде и обычном дне',
    bg: Colors.accent, // #ffe640
  },
  {
    id: 3,
    number: '3 БӨЛІМ',
    numberRu: 'Раздел 3',
    title: 'Қала, сауда және бағыт-бағдар',
    titleRu: 'Город, покупки и ориентирование',
    description: 'Уверенно делайте покупки на базаре, заказывайте такси и спрашивайте дорогу',
    bg: Colors.accentBlue, // #40dfff
  },
  {
    id: 4,
    number: '4 БӨЛІМ',
    numberRu: 'Раздел 4',
    title: 'Мамандықтар және еркін сөйлесу',
    titleRu: 'Профессии, хобби и свободная беседа',
    description: 'Общайтесь на любые жизненные темы, делитесь увлечениями и целями',
    bg: Colors.accent, // #ffe640
  },
];

const LearnScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  const {
    tab,
    setTab,
    lessons,
    completedLessonIds,
    streak,
    xp,
    hearts,
    dailyGoal,
    isAuth,
    handleLogout,
    navigateTo,
  } = useApp();

  const [handbookVisible, setHandbookVisible] = useState(false);
  const [lockedModalLesson, setLockedModalLesson] = useState(null);
  const [chestModalVisible, setChestModalVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  // Определение активного (текущего) урока
  let foundActive = false;
  const nodesWithStatus = lessons.map((lesson, index) => {
    const isCompleted = completedLessonIds.has(lesson.id);
    let status = 'locked';

    if (isCompleted) {
      status = 'completed';
    } else if (!foundActive) {
      status = 'active';
      foundActive = true;
    }

    return {
      lesson,
      status,
      offsetX: S_PATTERN[index % S_PATTERN.length],
    };
  });

  const handleLessonPress = (lesson) => {
    if (!isAuth && lesson.id > 1) {
      setLockedModalLesson(lesson);
      return;
    }
    navigateTo('lesson', lesson.id);
  };

  // Группировка уроков по разделам
  const section1Nodes = nodesWithStatus.filter((n) => (n.lesson.sectionId || 1) === 1);
  const section2Nodes = nodesWithStatus.filter((n) => n.lesson.sectionId === 2);
  const section3Nodes = nodesWithStatus.filter((n) => n.lesson.sectionId === 3);
  const section4Nodes = nodesWithStatus.filter((n) => n.lesson.sectionId === 4);

  // Рендер цепочки уроков одного раздела
  const renderSectionTrail = (sectionMeta, sectionNodes, isFirst = false) => {
    const isUnlocked = sectionNodes.some((n) => n.status === 'completed' || n.status === 'active');

    return (
      <View key={sectionMeta.id} style={styles.sectionBlock}>
        {/* Разделитель между разделами */}
        {!isFirst && (
          <View style={styles.sectionDividerWrap}>
            <View style={styles.sectionDividerLine} />
            <View style={styles.sectionDividerBadge}>
              <AppText
                bold
                size={Typography.xs}
                color={Colors.textSub}
                align="center"
                ru={`${sectionMeta.numberRu}: ${sectionMeta.titleRu}`}
              >
                {sectionMeta.number} ({sectionMeta.numberRu}): {sectionMeta.title}
              </AppText>
            </View>
            <View style={styles.sectionDividerLine} />
          </View>
        )}

        {/* Крупная тактильная плашка текущего модуля с кнопкой «СПРАВОЧНИК» */}
        <HeaderBanner
          sectionTitle={`${sectionMeta.number} (${sectionMeta.numberRu})`}
          moduleTitle={`${sectionMeta.title} / ${sectionMeta.titleRu}`}
          onPressHandbook={() => setHandbookVisible(true)}
        />

        {/* Извилистая тропа уроков раздела */}
        <View style={styles.nodesList}>
          {sectionNodes.map((item, index) => {
            // Вставляем бонусный сундучок в середину раздела (после 3 урока)
            const showChestAfterThis = index === 2;

            return (
              <React.Fragment key={item.lesson.id}>
                <View style={styles.nodeWrapperRow}>
                  <LessonNode
                    lesson={item.lesson}
                    status={item.status}
                    offsetX={item.offsetX}
                    index={index}
                    onPress={handleLessonPress}
                    onPressLocked={(lockedLesson) => setLockedModalLesson(lockedLesson)}
                  />
                </View>

                {/* Бонусный узел: Сундучок с XP со Скриншота 1 */}
                {showChestAfterThis && (
                  <View style={[styles.chestNodeRow, { transform: [{ translateX: item.offsetX * 0.4 }] }]}>
                    <AppPressable
                      onPress={() => setChestModalVisible(true)}
                      style={({ pressed }) => [
                        styles.chestButton,
                        pressed && { transform: [{ translateY: 2 }] },
                      ]}
                      accessibilityLabel="Бонусный сундучок с сокровищами"
                      {...(Platform.OS === 'web' ? { title: 'Бонусный сундучок с очками опыта XP!' } : {})}
                    >
                      <ChestIcon size={26} color={Colors.text} />
                    </AppPressable>
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Завершающий бейдж / Кубок раздела */}
        <View style={styles.finishBadge}>
          <TrophyIcon size={32} />
          <AppText
            bold
            size={Typography.xs}
            color={Colors.text}
            ru={`${sectionMeta.numberRu}: Финал раздела`}
            style={{ marginTop: 6 }}
          >
            {sectionMeta.number}: ФИНАЛ
          </AppText>
        </View>
      </View>
    );
  };

  // Контент вкладок
  const renderTabContent = () => {
    switch (tab) {
      case 'sounds':
        return <SoundsScreen />;
      case 'dialogues':
        return <DialoguesScreen />;
      case 'quests':
        return <QuestsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'learn':
      default:
        return (
          <View style={styles.trailContainer}>
            {/* РАЗДЕЛ 1 */}
            {renderSectionTrail(SECTIONS_META[0], section1Nodes, true)}

            {/* РАЗДЕЛ 2 */}
            {renderSectionTrail(SECTIONS_META[1], section2Nodes, false)}

            {/* РАЗДЕЛ 3 */}
            {renderSectionTrail(SECTIONS_META[2], section3Nodes, false)}

            {/* РАЗДЕЛ 4 */}
            {renderSectionTrail(SECTIONS_META[3], section4Nodes, false)}
          </View>
        );
    }
  };

  return (
    <View style={styles.root}>
      {/* ── ДЕСКТОПНЫЙ РЕЖИМ (ПК Веб): Скролл на весь сайт ── */}
      {isDesktop ? (
        <ScrollView
          style={styles.desktopOuterScroll}
          contentContainerStyle={styles.desktopScrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.desktopLayout}>
            {/* Левая колонка - меню навигации (прикреплена через sticky) */}
            <View style={styles.desktopSidebarSticky}>
              <WebSidebar
                activeTab={tab}
                onSelectTab={setTab}
                isAuthenticated={isAuth}
                onPressAuth={isAuth ? handleLogout : () => navigateTo('auth')}
                onPressCamera={() => setCameraVisible(true)}
              />
            </View>

            {/* Центральная колонка - масштабная полоса уроков */}
            <View style={styles.desktopCenter}>
              {renderTabContent()}
            </View>

            {/* Правая колонка - статистика, лиги, квесты дня (sticky) */}
            <View style={styles.desktopRightSticky}>
              <WebRightSidebar
                streak={streak}
                xp={xp}
                hearts={hearts}
                dailyGoalMinutes={dailyGoal}
                completedLessonsCount={completedLessonIds.size}
                onSelectTab={setTab}
              />
            </View>
          </View>
        </ScrollView>
      ) : (
        /* ── МОБИЛЬНЫЙ РЕЖИМ (iOS / Android / узкий экран) ── */
        <View style={styles.mobileLayout}>
          {/* Верхний хедер с логотипом, AI-камерой и статистикой */}
          <MobileHeader
            streak={streak}
            xp={xp}
            hearts={hearts}
            onPressProfile={() => setTab('profile')}
            onPressCamera={() => setCameraVisible(true)}
          />

          {/* Основной скролл */}
          <ScrollView
            style={styles.mobileCenter}
            contentContainerStyle={styles.mobileCenterInner}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderTabContent()}
          </ScrollView>

          {/* Нижний TabBar */}
          <TabBar activeTab={tab} onSelectTab={setTab} />

          {/* Плавающая кнопка быстрого запуска AI Камеры */}
          <FloatingAiCameraButton onPress={() => setCameraVisible(true)} />
        </View>
      )}

      {/* Модальное окно справочника по грамматике */}
      <HandbookModal
        visible={handbookVisible}
        onClose={() => setHandbookVisible(false)}
      />

      {/* Инновационная AI-Камера распознавания объектов с выделением пальцем */}
      <AiCameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
      />

      {/* Фирменное модальное окно при клике на заблокированный урок */}
      <LockedLessonModal
        visible={!!lockedModalLesson}
        lesson={lockedModalLesson}
        onClose={() => setLockedModalLesson(null)}
      />

      {/* Модальное окно бонусного сундучка */}
      {chestModalVisible && (
        <View style={styles.chestModalOverlay}>
          <View style={styles.chestModalCard}>
            <View style={styles.chestIconCircle}>
              <ChestIcon size={36} color={Colors.text} />
            </View>
            <AppText bold size={Typography.lg} color={Colors.text} align="center" style={{ marginBottom: 4 }}>
              СУНДУЧОК С НАГРАДОЙ!
            </AppText>
            <AppText size={Typography.sm} color={Colors.textSub} align="center" style={{ lineHeight: 20, marginBottom: Spacing.md }}>
              Пройдите все предыдущие уроки раздела, чтобы открыть этот сундучок и получить +30 XP очков опыта!
            </AppText>
            <AppPressable
              onPress={() => setChestModalVisible(false)}
              style={styles.chestCloseBtn}
            >
              <AppText bold size={Typography.sm} color={Colors.text}>
                ПОНЯТНО
              </AppText>
            </AppPressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background, // #fffde8
  },
  desktopOuterScroll: {
    flex: 1,
    width: '100%',
  },
  desktopScrollContent: {
    width: '100%',
    paddingBottom: 0,
  },
  desktopLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: Colors.background,
  },
  desktopSidebarSticky: {
    width: 250,
    // sticky только на web
    ...(Platform.OS === 'web' ? { position: 'sticky', top: 0, height: '100vh' } : {}),
    alignSelf: 'flex-start',
    flexShrink: 0,
    zIndex: 10,
  },
  desktopRightSticky: {
    width: 330,
    // sticky только на web
    ...(Platform.OS === 'web' ? { position: 'sticky', top: 0, height: '100vh' } : {}),
    alignSelf: 'flex-start',
    flexShrink: 0,
    zIndex: 10,
    borderLeftWidth: 2,
    borderLeftColor: Colors.inactive,
  },
  desktopCenter: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderLeftColor: Colors.inactive,
    borderRightColor: Colors.inactive,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 110,
    alignItems: 'center',
  },
  mobileLayout: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mobileCenter: {
    flex: 1,
  },
  mobileCenterInner: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  trailContainer: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  sectionBlock: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  sectionDividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  sectionDividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.inactive,
  },
  sectionDividerBadge: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inactive,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginHorizontal: Spacing.sm,
  },
  nodesList: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  nodeWrapperRow: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 6,
  },
  chestNodeRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  chestButton: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFF9C4',
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBadge: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    alignSelf: 'center',
  },
  chestModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    zIndex: 99999,
  },
  chestModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 18,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  chestIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  chestCloseBtn: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
  },
});

export default LearnScreen;
