// frontend/src/screens/LandingScreen.js
// ─────────────────────────────────────────────────────────────────
// Главная страница LanguAGE:
// На мобильном: строго помещается на 1 экран БЕЗ СКРОЛЛА.
// На десктопе: полноразмерная десктопная версия.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import AppText from '../components/AppText';
import TactileButton from '../components/TactileButton';
import AppPressable from '../components/AppPressable';
import SnowLeopardLogo from '../components/SnowLeopardLogo';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../theme/theme';

const LandingScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;
  const { navigateTo, isAuth } = useApp();

  // ── Мобильная версия: 100% на один экран, БЕЗ СКРОЛЛА ───────────
  if (!isDesktop) {
    return (
      <View style={styles.mobileRoot}>
        {/* Верх: Логотип + Название */}
        <View style={styles.mobileTop}>
          <SnowLeopardLogo size={48} style={{ marginBottom: 6 }} />
          <AppText bold size={Typography.xl} color={Colors.text} align="center">
            LanguAGE
          </AppText>
          <AppText size={Typography.xs} color={Colors.textSub} align="center">
            Қазақ тілін үйрену платформасы
          </AppText>
        </View>

        {/* Центр: Компактная карточка призыва */}
        <View style={styles.mobileCenterCard}>
          <View style={styles.mobileBadge}>
            <AppText
              bold
              size={Typography.lg}
              color={Colors.text}
              align="center"
              style={styles.mobileBadgeTitle}
            >
              Қазақ тілінде{'\n'}сөйлеуге дайынсыз ба?
            </AppText>
          </View>

          <AppText
            size={Typography.sm}
            color={Colors.textSub}
            align="center"
            style={styles.mobileSubtitle}
          >
            LanguAGE платформасына қосылыңыз — мүлдем тегін.
          </AppText>

          {/* Быстрые фичи плашками в одну строку */}
          <View style={styles.mobileMiniPillsRow}>
            <View style={styles.miniPill}>
              <AppText bold size={10} color={Colors.text}>
                4 БӨЛІМ
              </AppText>
            </View>
            <View style={styles.miniPill}>
              <AppText bold size={10} color={Colors.text}>
                ИНТЕРАКТИВТІ
              </AppText>
            </View>
            <View style={styles.miniPill}>
              <AppText bold size={10} color={Colors.text}>
                ТЕГІН
              </AppText>
            </View>
          </View>
        </View>

        {/* Низ: Кнопки действий + Копирайт */}
        <View style={styles.mobileBottom}>
          <TactileButton
            label="ОҚУДЫ БАСТАУ"
            ru="Начать обучение"
            variant="primary"
            size={Typography.md}
            onPress={() => navigateTo('onboarding')}
            style={styles.mobileBtnPrimary}
          />

          <TactileButton
            label={isAuth ? 'КАБИНЕТКЕ' : 'КІРУ'}
            ru={isAuth ? 'В кабинет' : 'Войти в аккаунт'}
            variant="ghost"
            size={Typography.sm}
            onPress={() => (isAuth ? navigateTo('main') : navigateTo('auth'))}
            style={styles.mobileBtnSecondary}
          />

          <AppText size={10} color={Colors.textSub} align="center" style={styles.mobileCopyright}>
            © 2026 LanguAGE
          </AppText>
        </View>
      </View>
    );
  }

  // ── Десктопная версия (web) ───────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Фиксированная верхняя шапка */}
      <View style={styles.navbar}>
        <View style={styles.navContainer}>
          <AppPressable
            onPress={() => navigateTo('landing')}
            style={styles.navBrand}
          >
            <SnowLeopardLogo size={46} style={{ marginRight: 12 }} />
            <View>
              <AppText bold size={Typography.xl} color={Colors.text}>
                LanguAGE
              </AppText>
              <AppText
                size={Typography.xs}
                color={Colors.textSub}
                ru="Казахский язык - Интерактивная платформа"
              >
                Қазақ тілі - Платформа
              </AppText>
            </View>
          </AppPressable>

          <View style={styles.navActions}>
            <TactileButton
              label={isAuth ? 'КАБИНЕТКЕ' : 'КІРУ'}
              ru={isAuth ? 'В кабинет' : 'Войти'}
              variant="ghost"
              size={Typography.sm}
              onPress={() => (isAuth ? navigateTo('main') : navigateTo('auth'))}
              style={{ marginRight: Spacing.md }}
            />
            <TactileButton
              label="БАСТАУ"
              ru="Начать"
              variant="primary"
              size={Typography.sm}
              onPress={() => navigateTo('onboarding')}
            />
          </View>
        </View>
      </View>

      {/* Центральный блок */}
      <View style={styles.centerContainer}>
        <View style={styles.ctaBox}>
          <AppText
            bold
            size={42}
            color={Colors.text}
            align="center"
            ru="Готовы заговорить на казахском языке?"
            style={styles.ctaTitle}
          >
            Қазақ тілінде сөйлеуге дайынсыз ба?
          </AppText>

          <AppText
            size={Typography.lg}
            color={Colors.textSub}
            align="center"
            ru="Присоединяйтесь к платформе LanguAGE прямо сейчас - абсолютно бесплатно."
            style={styles.ctaSubtitle}
          >
            LanguAGE платформасына қазір қосылыңыз - мүлдем тегін.
          </AppText>

          <View style={styles.buttonWrapper}>
            <TactileButton
              label="ОҚУДЫ БАСТАУ"
              ru="Начать обучение сейчас"
              variant="primary"
              size={Typography.xl}
              onPress={() => navigateTo('onboarding')}
              style={styles.ctaButton}
            />
          </View>
        </View>
      </View>

      {/* Футер */}
      <View style={styles.footer}>
        <AppText
          size={Typography.xs}
          color={Colors.textSub}
          align="center"
          ru="© 2026 LanguAGE - Интерактивная платформа изучения казахского языка."
        >
          © 2026 LanguAGE - Қазақ тілін үйренудің интерактивті платформасы.
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Мобильный стиль (1 экран, БЕЗ скролла) ───────────────────
  mobileRoot: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    // App.js уже добавляет paddingTop через SafeAreaView + RNStatusBar.currentHeight
    // Не дублируем его здесь — просто небольшой отступ сверху
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 16,
  },
  mobileTop: {
    alignItems: 'center',
    paddingTop: 8,
  },
  mobileCenterCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  mobileBadge: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    width: '100%',
    maxWidth: 340,
  },
  mobileBadgeTitle: {
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  mobileSubtitle: {
    lineHeight: 20,
    maxWidth: 290,
    marginBottom: Spacing.md,
  },
  mobileMiniPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  miniPill: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.text,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mobileBottom: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  mobileBtnPrimary: {
    width: '100%',
    marginBottom: 10,
  },
  mobileBtnSecondary: {
    width: '100%',
  },
  mobileCopyright: {
    marginTop: 12,
  },

  // ── Десктоп ─────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  navbar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: Colors.text,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    zIndex: 100,
  },
  navContainer: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  ctaBox: {
    width: '100%',
    maxWidth: 820,
    alignItems: 'center',
  },
  ctaTitle: {
    marginBottom: Spacing.lg,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  ctaSubtitle: {
    marginBottom: Spacing.xxl,
    lineHeight: 26,
    maxWidth: 680,
  },
  buttonWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  ctaButton: {
    minWidth: 320,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.inactive,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default LandingScreen;
