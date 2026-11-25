// frontend/src/screens/OnboardingScreen.js
// ─────────────────────────────────────────────────────────────────
// Экран онбординга: Выбор ежедневной цели обучения.
// Снежный барс (Барыс) с облачком «Какую цель поставим на день?»,
// вертикальный стек тактильных карточек с кастомными иконками БЕЗ эмодзи,
// закрепленный футер с кнопкой «ДАЛЕЕ».
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import AppText from '../components/AppText';
import AppPressable from '../components/AppPressable';
import ProgressBar from '../components/ProgressBar';
import TactileButton from '../components/TactileButton';
import {
  SproutIcon,
  LightningIcon,
  FlameIcon,
  RocketIcon,
  CheckIcon,
  ArrowLeftIcon,
  ClockIcon,
} from '../components/Icons';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../theme/theme';

const GOAL_OPTIONS = [
  { minutes: 5,  label: 'Күніне 5 минут',  subtitle: 'Жеңіл',        labelRu: '5 минут в день',  subtitleRu: 'Лёгкая',      icon: 'sprout' },
  { minutes: 10, label: 'Күніне 10 минут', subtitle: 'Қалыпты',      labelRu: '10 минут в день', subtitleRu: 'Обычная',     icon: 'lightning' },
  { minutes: 15, label: 'Күніне 15 минут', subtitle: 'Жақсы қарқын', labelRu: '15 минут в день', subtitleRu: 'Серьёзная',   icon: 'flame' },
  { minutes: 20, label: 'Күніне 20 минут', subtitle: 'Қарқынды',     labelRu: '20 минут в день', subtitleRu: 'Интенсивная', icon: 'rocket' },
];

const renderGoalIcon = (type) => {
  switch (type) {
    case 'sprout':
      return <SproutIcon size={24} />;
    case 'lightning':
      return <LightningIcon size={24} />;
    case 'flame':
      return <FlameIcon size={24} animate={false} />;
    case 'rocket':
    default:
      return <RocketIcon size={24} />;
  }
};

const OnboardingScreen = () => {
  const { dailyGoal, saveGoal, navigateTo, isAuth } = useApp();
  const [selectedGoal, setSelectedGoal] = useState(dailyGoal || 10);

  const handleContinue = async () => {
    await saveGoal(selectedGoal);
    if (isAuth) {
      navigateTo('main');
    } else {
      navigateTo('auth');
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {/* Верхняя строка с кнопкой «Назад» и прогресс-баром */}
        <View style={styles.topBar}>
          <AppPressable
            onPress={() => navigateTo('landing')}
            style={({ pressed }) => [
              styles.backButton,
              pressed && { transform: [{ translateY: 2 }] },
            ]}
          >
            <ArrowLeftIcon size={18} color={Colors.text} />
          </AppPressable>

          <View style={styles.progressBarWrapper}>
            <ProgressBar progress={0.65} height={14} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Заголовок вопроса */}
          <View style={styles.goalHeaderCard}>
            <View style={styles.goalIconCircle}>
              <ClockIcon size={28} color={Colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText bold size={Typography.lg} color={Colors.text} ru="Какую цель поставим на день?">
                Күнделікті қандай мақсат қоямыз?
              </AppText>
              <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }} ru="Регулярные занятия помогают быстрее заговорить">
                Тұрақты оқу тілді тезірек меңгеруге көмектеседі
              </AppText>
            </View>
          </View>

          {/* Вертикальный стек тактильных кнопок выбора */}
          <View style={styles.optionsList}>
            {GOAL_OPTIONS.map((opt) => {
              const isSelected = selectedGoal === opt.minutes;
              return (
                <AppPressable
                  key={opt.minutes}
                  onPress={() => setSelectedGoal(opt.minutes)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    isSelected ? styles.optionCardSelected : styles.optionCardUnselected,
                    pressed && styles.optionCardPressed,
                  ]}
                >
                  <View style={styles.optionLeft}>
                    <View style={styles.iconWrapper}>
                      {renderGoalIcon(opt.icon)}
                    </View>
                    <View>
                      <AppText bold size={Typography.md} color={Colors.text} ru={opt.labelRu}>
                        {opt.label}
                      </AppText>
                      <AppText size={Typography.xs} color={Colors.textSub} ru={opt.subtitleRu}>
                        {opt.subtitle}
                      </AppText>
                    </View>
                  </View>

                  {/* Чекбокс / Индикатор выбора */}
                  <View
                    style={[
                      styles.indicatorCircle,
                      isSelected && styles.indicatorCircleSelected,
                    ]}
                  >
                    {isSelected && <CheckIcon size={14} color={Colors.text} />}
                  </View>
                </AppPressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Закрепленный нижний футер с кнопкой «ДАЛЕЕ» */}
        <View style={styles.footer}>
          <TactileButton
            label="КЕЛЕСІ"
            ru="Далее"
            variant="primary"
            size={Typography.lg}
            onPress={handleContinue}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background, // #fffde8
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'web' ? Spacing.lg : Spacing.md,
    paddingBottom: Spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
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
  backArrowLine: {
    width: 10,
    height: 10,
    borderColor: Colors.text,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    transform: [{ rotate: '45deg' }, { translateX: 2 }],
  },
  progressBarWrapper: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingVertical: Spacing.sm,
  },
  goalHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  goalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionsList: {
    width: '100%',
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text,
    marginBottom: Spacing.md,
  },
  optionCardSelected: {
    backgroundColor: Colors.accent, // #ffe640
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
  },
  optionCardUnselected: {
    backgroundColor: Colors.white,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
  },
  optionCardPressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 2 }],
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 12,
  },
  indicatorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorCircleSelected: {
    backgroundColor: Colors.white,
  },
  footer: {
    paddingTop: Spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.inactive,
  },
});

export default OnboardingScreen;
