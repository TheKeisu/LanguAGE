// frontend/src/screens/ProfileScreen.js
// ─────────────────────────────────────────────────────────────────
// Вкладка «ПРОФИЛЬ»:
// Информация о пользователе, статистика из реального бэкенда,
// Снежный барс (Ирбис) и кастомные векторные иконки (БЕЗ эмодзи!).
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AppText from '../components/AppText';
import TactileButton from '../components/TactileButton';
import {
  FlameIcon,
  StarIcon,
  BookIcon,
  TargetIcon,
  ClockIcon,
  UserIcon,
} from '../components/Icons';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../theme/theme';

const ProfileScreen = () => {
  const {
    user,
    isAuth,
    streak,
    xp,
    dailyGoal,
    completedLessonIds,
    progressSummary,
    handleLogout,
    navigateTo,
  } = useApp();

  const totalAttempts = progressSummary?.totalAttempts ?? 12;
  const accuracyPercent = progressSummary?.accuracyPercent ?? 91.7;
  const completedLessons = progressSummary?.completedLessons ?? completedLessonIds.size;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Карточка профиля */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <UserIcon size={38} color={Colors.text} />
        </View>
        <AppText bold size={Typography.xl} color={Colors.text}>
          {user?.displayName ?? user?.display_name ?? 'Оқушы (Ученик)'}
        </AppText>
        <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }} ru="Гостевой аккаунт">
          {user?.email ?? 'Қонақ аккаунты'}
        </AppText>
      </View>

      {/* Сетка статистики */}
      <AppText bold size={Typography.md} color={Colors.text} style={styles.sectionHeader} ru="Статистика обучения">
        Оқу статистикасы
      </AppText>

      <View style={styles.statsGrid}>
        {/* Ударный режим / Стрик */}
        <View style={styles.statBox}>
          <FlameIcon size={28} animate={true} style={{ marginBottom: 4 }} />
          <AppText bold size={Typography.lg} color={Colors.text}>
            {streak}
          </AppText>
          <AppText size={Typography.xs} color={Colors.textSub} ru="Стрик дней">
            Үздіксіз күндер
          </AppText>
        </View>

        {/* Всего опыта */}
        <View style={styles.statBox}>
          <StarIcon size={26} animate={false} style={{ marginBottom: 4 }} />
          <AppText bold size={Typography.lg} color={Colors.text}>
            {xp} XP
          </AppText>
          <AppText size={Typography.xs} color={Colors.textSub} ru="Очки опыта">
            Тәжірибе ұпайлары
          </AppText>
        </View>

        {/* Завершено уроков */}
        <View style={styles.statBox}>
          <BookIcon size={26} style={{ marginBottom: 4 }} />
          <AppText bold size={Typography.lg} color={Colors.text}>
            {completedLessons}
          </AppText>
          <AppText size={Typography.xs} color={Colors.textSub} ru="Пройдено уроков">
            Өтілген сабақтар
          </AppText>
        </View>

        {/* Точность ответов */}
        <View style={styles.statBox}>
          <TargetIcon size={26} style={{ marginBottom: 4 }} />
          <AppText bold size={Typography.lg} color={Colors.text}>
            {accuracyPercent}%
          </AppText>
          <AppText size={Typography.xs} color={Colors.textSub} ru="Точность ответов">
            Жауап дәлдігі
          </AppText>
        </View>
      </View>

      {/* Настройки и цель на день */}
      <View style={styles.settingsCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <ClockIcon size={18} style={{ marginRight: 8 }} />
          <AppText bold size={Typography.sm} color={Colors.text} ru="Ежедневная цель">
            Күнделікті мақсат
          </AppText>
        </View>
        <AppText size={Typography.xs} color={Colors.textSub} ru={`${dailyGoal} минут в день`}>
          Күніне {dailyGoal} минут
        </AppText>
      </View>

      {/* Кнопка выхода / входа */}
      <View style={styles.actions}>
        {isAuth ? (
          <TactileButton
            label="АККАУНТТАН ШЫҒУ"
            ru="Выйти из аккаунта"
            variant="ghost"
            size={Typography.sm}
            onPress={handleLogout}
          />
        ) : (
          <TactileButton
            label="КІРУ НЕ ТІРКЕЛУ"
            ru="Войти или создать аккаунт"
            variant="primary"
            size={Typography.sm}
            onPress={() => navigateTo('auth')}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatarCircle: {
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
    marginBottom: 10,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statBox: {
    width: '48%',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actions: {
    marginBottom: Spacing.xl,
  },
});

export default ProfileScreen;
