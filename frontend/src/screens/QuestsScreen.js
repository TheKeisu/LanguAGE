// frontend/src/screens/QuestsScreen.js
// ─────────────────────────────────────────────────────────────────
// Вкладка «ЗАДАНИЯ» (Квесты и награды):
// Ежедневные испытания, стрик дней, Снежный барс (Ирбис),
// кастомные векторные иконки (БЕЗ эмодзи!).
// Двуязычный понятный интерфейс (Казахский + Русский).
// Все элементы кликабельны с тактильным откликом и hover-эффектом.
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Animated } from 'react-native';
import AppText from '../components/AppText';
import AppPressable from '../components/AppPressable';
import ProgressBar from '../components/ProgressBar';
import TactileButton from '../components/TactileButton';
import {
  TargetIcon,
  BookIcon,
  ClockIcon,
  StarIcon,
  SoundIcon,
  CheckIcon,
  ChestIcon,
  FlameIcon,
} from '../components/Icons';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../theme/theme';

const renderQuestIcon = (type) => {
  switch (type) {
    case 'book':
      return <BookIcon size={24} />;
    case 'clock':
      return <ClockIcon size={24} />;
    case 'star':
      return <StarIcon size={24} animate={false} />;
    case 'sound':
    default:
      return <SoundIcon size={24} animate={false} />;
  }
};

const QuestsScreen = () => {
  const { streak, xp, completedLessonIds, dailyGoal, addXp, setTab } = useApp();
  const [claimedQuests, setClaimedQuests] = useState(new Set());
  const [claimToast, setClaimToast] = useState(null);
  const [hoveredQuest, setHoveredQuest] = useState(null);

  const quests = [
    {
      id: 1,
      title: 'Бүгін 2 сабақты аяқтау',
      titleRu: 'Пройти 2 урока сегодня',
      unitRu: 'урока',
      reward: 30,
      rewardText: '+30 XP',
      current: Math.min(completedLessonIds.size, 2),
      target: 2,
      iconType: 'book',
      actionTab: 'learn',
    },
    {
      id: 2,
      title: `Күнделікті ${dailyGoal} минут оқу`,
      titleRu: `Заниматься ${dailyGoal} минут в день`,
      unitRu: 'мин.',
      reward: 20,
      rewardText: '+20 XP',
      current: Math.min(15, dailyGoal),
      target: dailyGoal,
      iconType: 'clock',
      actionTab: 'learn',
    },
    {
      id: 3,
      title: 'Күніне 100 XP жинау',
      titleRu: 'Набрать 100 очков опыта за день',
      unitRu: 'XP',
      reward: 50,
      rewardText: '+50 XP',
      current: Math.min(xp, 100),
      target: 100,
      iconType: 'star',
      actionTab: 'learn',
    },
    {
      id: 4,
      title: 'Тренажерде 3 жаңа дыбыс өту',
      titleRu: 'Изучить 3 звука в тренажере',
      unitRu: 'звука',
      reward: 15,
      rewardText: '+15 XP',
      current: 3,
      target: 3,
      iconType: 'sound',
      actionTab: 'sounds',
    },
  ];

  const handleClaim = (q) => {
    if (claimedQuests.has(q.id)) return;
    const updated = new Set(claimedQuests);
    updated.add(q.id);
    setClaimedQuests(updated);
    addXp && addXp(q.reward);

    setClaimToast(`Сыйлық алынды! +${q.reward} XP / Награда получена!`);
    setTimeout(() => {
      setClaimToast(null);
    }, 3000);
  };

  const handleQuestCardPress = (q) => {
    const isDone = q.current >= q.target;
    if (isDone) {
      handleClaim(q);
    } else if (setTab && q.actionTab) {
      setTab(q.actionTab);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Всплывающее тактильное уведомление о награде */}
      {claimToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <ChestIcon size={20} color={Colors.text} style={{ marginRight: 8 }} />
            <AppText bold size={Typography.sm} color={Colors.text}>
              {claimToast}
            </AppText>
          </View>
        </View>
      )}

      {/* Шапка квестов с понятным русским переводом */}
      <View style={styles.headerCard}>
        <View style={styles.headerIconCircle}>
          <TargetIcon size={28} color={Colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText bold size={Typography.lg} color={Colors.text} ru="Ежедневные цели">
            КҮНДЕЛІКТІ МАҚСАТТАР
          </AppText>
          <AppText bold size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }}>
            Ежедневные цели и награды
          </AppText>
          <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 4 }} ru="Выполняйте задания каждый день, чтобы поддерживать стрик!">
            Тапсырмаларды орындап, ұпай жинаңыз және деңгейіңізді көтеріңіз
          </AppText>
        </View>
      </View>

      {/* Список квестов */}
      <View style={styles.list}>
        {quests.map((q) => {
          const isDone = q.current >= q.target;
          const isClaimed = claimedQuests.has(q.id);
          const isHovered = hoveredQuest === q.id;

          return (
            <AppPressable
              key={q.id}
              onPress={() => handleQuestCardPress(q)}
              // @ts-ignore
              onMouseEnter={() => setHoveredQuest(q.id)}
              // @ts-ignore
              onMouseLeave={() => setHoveredQuest(null)}
              accessibilityRole="button"
              accessibilityLabel={`${q.title} - ${q.titleRu}`}
              style={[
                styles.questCard,
                isDone && styles.questCardDone,
                isHovered && styles.questCardHovered,
              ]}
            >
              <View style={styles.questTop}>
                <View style={styles.questIconTitle}>
                  <View style={[styles.questIconBox, isDone && styles.questIconBoxDone]}>
                    {renderQuestIcon(q.iconType)}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText bold size={Typography.md} color={Colors.text} ru={q.titleRu}>
                      {q.title}
                    </AppText>
                    <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }}>
                      {q.titleRu}
                    </AppText>
                    <AppText bold size={Typography.xs} color={isDone ? Colors.accentBlue : Colors.textSub} style={{ marginTop: 4 }}>
                      Прогресс: {q.current} / {q.target} {q.unitRu}
                    </AppText>
                  </View>
                </View>

                {/* Тактильная кнопка действия / награды */}
                <View style={{ marginLeft: 12 }}>
                  {isClaimed ? (
                    <View style={styles.badgeClaimed}>
                      <CheckIcon size={14} color={Colors.text} style={{ marginRight: 4 }} />
                      <AppText bold size={Typography.xs} color={Colors.text}>
                        АЛЫНДЫ
                      </AppText>
                    </View>
                  ) : isDone ? (
                    <TactileButton
                      label="АЛУ (+XP)"
                      ru="Забрать награду"
                      variant="secondary"
                      size={Typography.xs}
                      onPress={() => handleClaim(q)}
                      style={{ minWidth: 105 }}
                    />
                  ) : (
                    <View style={styles.rewardBadge}>
                      <AppText bold size={Typography.xs} color={Colors.text} ru="Награда за выполнение">
                        {q.rewardText}
                      </AppText>
                    </View>
                  )}
                </View>
              </View>

              <ProgressBar
                progress={q.current / q.target}
                height={10}
                fillColor={isDone ? Colors.accentBlue : Colors.accent}
                style={{ marginTop: 12 }}
              />
            </AppPressable>
          );
        })}
      </View>

      {/* Информационный тактильный блок Лиги и Стрика */}
      <View style={styles.infoBanner}>
        <FlameIcon size={28} animate={true} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <AppText bold size={Typography.sm} color={Colors.text} ru="Ударный режим">
            {streak} КҮН БОЙЫ ҮЗДІКСІЗ ОҚУ / {streak} ДНЕЙ СТРИКА
          </AppText>
          <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }} ru="Занимайтесь каждый день по 15 минут, чтобы не потерять стрик!">
            Күнделікті 15 минут оқу стрик пен деңгейіңізді сақтайды. Тұрақтылық жеңіске жетелейді!
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  toastContainer: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  list: {
    width: '100%',
  },
  questCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  questCardHovered: {
    borderBottomWidth: 5,
    transform: [{ translateY: -2 }, { scale: 1.01 }],
  },
  questCardDone: {
    backgroundColor: '#F8FDF6',
    borderColor: Colors.text,
  },
  questTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questIconBoxDone: {
    backgroundColor: Colors.accentBlue,
  },
  rewardBadge: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeClaimed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inactive,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});

export default QuestsScreen;
