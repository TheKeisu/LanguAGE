// frontend/src/components/WebRightSidebar.js
// ─────────────────────────────────────────────────────────────────
// Правая колонка для Web (в эстетике Duolingo, в Anti-AI цветах):
// 1. Верхний бар статистики (Стрик, XP, Сердца).
// 2. Карточка «Лиги и рейтинги» (иконка щита, прогресс до открытия лиги).
// 3. Карточка «Задания дня» (прогресс, сундучок с наградой).
// 4. Карточка создания аккаунта (если гость/неавторизован).
// 5. Футер со ссылками.
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AppText from './AppText';
import AppPressable from '../components/AppPressable';
import StatsBar from './StatsBar';
import ProgressBar from './ProgressBar';
import TactileButton from './TactileButton';
import { TargetIcon, FlameIcon, ShieldIcon, ChestIcon } from './Icons';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../theme/theme';

/**
 * @param {object} props
 * @param {number} [props.streak=1]
 * @param {number} [props.xp=50]
 * @param {number} [props.hearts=5]
 * @param {number} [props.dailyGoalMinutes=10]
 * @param {number} [props.completedLessonsCount=1]
 * @param {function} [props.onSelectTab]
 */
const WebRightSidebar = ({
  streak = 1,
  xp = 50,
  hearts = 5,
  dailyGoalMinutes = 10,
  completedLessonsCount = 1,
  onSelectTab,
}) => {
  const { isAuth, navigateTo } = useApp();
  const [hoveredCard, setHoveredCard] = useState(null);

  const questLessonsProgress = Math.min(completedLessonsCount / 2, 1);
  const questXpProgress = Math.min(xp / 50, 1);

  return (
    <View style={styles.container}>
      {/* ── Верхний блок статистики (Стрик, XP, Жизни) ── */}
      <StatsBar streak={streak} xp={xp} hearts={hearts} style={styles.statsBar} />

      {/* ── Карточка 1: Лиги и рейтинги ── */}
      <AppPressable
        onPress={() => onSelectTab && onSelectTab('quests')}
        // @ts-ignore
        onMouseEnter={() => setHoveredCard('league')}
        // @ts-ignore
        onMouseLeave={() => setHoveredCard(null)}
        accessibilityRole="button"
        accessibilityLabel="Лига Снежного барса"
        style={[
          styles.card,
          hoveredCard === 'league' && styles.cardHovered,
        ]}
      >
        <View style={styles.cardHeader}>
          <AppText bold size={Typography.sm + 1} color={Colors.text} ru="Лига и рейтинги">
            Лига мен рейтингтер
          </AppText>
        </View>

        <View style={styles.leagueRow}>
          <View style={styles.leagueShieldBox}>
            <ShieldIcon size={26} color={Colors.text} fill={Colors.accent} />
          </View>
          <View style={styles.leagueText}>
            <AppText size={Typography.xs + 1} color={Colors.text} style={{ lineHeight: 18 }} ru={completedLessonsCount >= 5 ? 'Вы открыли Бронзовую Лигу!' : 'Пройдите ещё уроки для входа в Лигу'}>
              {completedLessonsCount >= 5
                ? 'Қола лигасы ашылды!'
                : `Тағы ${Math.max(1, 5 - completedLessonsCount)} сабақтан кейін`}
            </AppText>
          </View>
        </View>

        {hoveredCard === 'league' && (
          <View style={styles.cardTipBox}>
            <AppText size={Typography.xs} color={Colors.textSub} align="center" ru="Каждую неделю топ-10 учеников переходят в высшую лигу!">
              Апта сайын үздік 10 оқушы жоғары лигаға өтеді!
            </AppText>
          </View>
        )}
      </AppPressable>

      {/* ── Карточка 2: Задания дня ── */}
      <AppPressable
        onPress={() => onSelectTab && onSelectTab('quests')}
        // @ts-ignore
        onMouseEnter={() => setHoveredCard('quests')}
        // @ts-ignore
        onMouseLeave={() => setHoveredCard(null)}
        accessibilityRole="button"
        accessibilityLabel="Күн тапсырмалары"
        style={[
          styles.card,
          hoveredCard === 'quests' && styles.cardHovered,
        ]}
      >
        <View style={styles.cardHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0, marginRight: 8 }}>
            <TargetIcon size={20} style={{ marginRight: 8, flexShrink: 0 }} />
            <AppText bold size={Typography.sm + 1} color={Colors.text} numberOfLines={1} ru="Задания дня">
              Күн тапсырмалары
            </AppText>
          </View>
          <View style={styles.allLinkButton}>
            <AppText bold size={Typography.xs} color={Colors.text} ru="Все задания">
              БАРЛЫҒЫ
            </AppText>
          </View>
        </View>

        {/* Задание 1: Уроки */}
        <View style={styles.questItem}>
          <View style={styles.questRow}>
            <AppText size={Typography.xs + 1} color={Colors.text} numberOfLines={1} ru="Пройти 2 урока">
              2 сабақты аяқтау
            </AppText>
            <AppText bold size={Typography.xs} color={Colors.textSub}>
              {completedLessonsCount} / 2
            </AppText>
          </View>
          <ProgressBar progress={questLessonsProgress} height={9} style={{ marginTop: 6 }} />
        </View>

        {/* Задание 2: Очки опыта + сундучок */}
        <View style={styles.questItem}>
          <View style={styles.questRow}>
            <AppText size={Typography.xs + 1} color={Colors.text} numberOfLines={1} ru="Набрать 50 очков опыта">
              50 XP жинау
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ChestIcon size={16} color={Colors.text} style={{ marginRight: 4 }} />
              <AppText bold size={Typography.xs} color={Colors.textSub}>
                {Math.min(xp, 50)} / 50
              </AppText>
            </View>
          </View>
          <ProgressBar progress={questXpProgress} height={9} style={{ marginTop: 6 }} />
        </View>
      </AppPressable>

      {/* ── Карточка 3: Создайте аккаунт (для гостя / неавторизованного) ── */}
      {!isAuth && (
        <View style={[styles.card, styles.authPromoCard]}>
          <AppText bold size={Typography.md} color={Colors.text} style={{ marginBottom: 8 }} ru="Сохраните прогресс">
            Прогресті сақтау
          </AppText>
          <AppText size={Typography.xs + 1} color={Colors.textSub} style={{ lineHeight: 20, marginBottom: Spacing.md + 2 }} ru="Создайте аккаунт, чтобы не потерять стрик и очки">
            Стрик пен ұпайларды жоғалтпау үшін аккаунт ашыңыз.
          </AppText>

          <TactileButton
            label="АККАУНТ АШУ"
            ru="Создать аккаунт"
            variant="primary"
            size={Typography.sm}
            onPress={() => navigateTo('auth')}
            style={{ marginBottom: Spacing.md }}
          />

          <TactileButton
            label="КІРУ"
            ru="Войти в систему"
            variant="secondary"
            size={Typography.xs + 1}
            onPress={() => navigateTo('auth')}
          />
        </View>
      )}

      {/* ── Карточка 4: Стрик / Ударный режим ── */}
      <View style={[styles.card, styles.streakCard]}>
        <View style={styles.streakRow}>
          <FlameIcon size={32} animate={streak > 0} style={{ marginRight: 12 }} />
          <View style={styles.streakText}>
            <AppText bold size={Typography.sm + 1} color={Colors.text} ru={`${streak} дней ударного режима`}>
              {streak} күн үздіксіз оқу
            </AppText>
            <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 3 }} ru="Ежедневные занятия поддерживают стрик">
              Күнделікті жаттығу нәтиже береді
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.background,
  },
  statsBar: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    marginBottom: Spacing.lg,
    zIndex: 1000,
    position: 'relative',
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.lg,
    marginBottom: Spacing.lg + 2,
    transitionDuration: '150ms',
  },
  cardHovered: {
    borderBottomWidth: 5,
    transform: [{ translateY: -2 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  allLinkButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.text,
    flexShrink: 0,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueShieldBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  leagueText: {
    flex: 1,
  },
  questItem: {
    marginVertical: 8,
  },
  questRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authPromoCard: {
    backgroundColor: '#FFFDF0',
  },
  streakCard: {
    backgroundColor: '#FFF9C4',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    flex: 1,
  },
  cardTipBox: {
    marginTop: Spacing.sm + 2,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inactive,
  },
  footerLinks: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
});

export default WebRightSidebar;
