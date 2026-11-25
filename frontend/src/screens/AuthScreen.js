// frontend/src/screens/AuthScreen.js
// ─────────────────────────────────────────────────────────────────
// Экран авторизации и регистрации:
// Интеграция с реальным API бэкенда (Supabase Auth / JWT),
// сохранение токена в AsyncStorage, тактильный дизайн Anti-AI.
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import AppText from '../components/AppText';
import AppPressable from '../components/AppPressable';
import TactileButton from '../components/TactileButton';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { loginWithEmail, registerWithEmail } from '../api';
import { Colors, Typography, Spacing } from '../theme/theme';

const AuthScreen = () => {
  const { navigateTo, handleAuthSuccess } = useApp();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Поля формы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Состояние запроса
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      if (isLoginTab) {
        const session = await loginWithEmail(email.trim(), password.trim());
        await handleAuthSuccess(session);
      } else {
        const session = await registerWithEmail(
          email.trim(),
          password.trim(),
          displayName.trim() || email.split('@')[0]
        );
        await handleAuthSuccess(session);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ошибка авторизации. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  // Быстрый гостевой ознакомительный вход (доступен 1 урок, прогресс не сохраняется)
  const handleGuestLogin = () => {
    navigateTo('main');
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {/* Кнопка Назад */}
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
          <AppText bold size={Typography.lg} color={Colors.text} ru={isLoginTab ? 'Вход в аккаунт' : 'Регистрация'}>
            {isLoginTab ? 'Жүйеге кіру' : 'Тіркелу'}
          </AppText>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Переключатель Вход / Регистрация */}
          <View style={styles.tabSwitch}>
            <AppPressable
              onPress={() => { setIsLoginTab(true); setErrorMessage(''); }}
              style={[
                styles.tabBtn,
                isLoginTab && styles.tabBtnActive,
              ]}
            >
              <AppText bold={isLoginTab} size={Typography.sm} color={Colors.text} align="center" ru="Вход">
                КІРУ
              </AppText>
            </AppPressable>

            <AppPressable
              onPress={() => { setIsLoginTab(false); setErrorMessage(''); }}
              style={[
                styles.tabBtn,
                !isLoginTab && styles.tabBtnActive,
              ]}
            >
              <AppText bold={!isLoginTab} size={Typography.sm} color={Colors.text} align="center" ru="Регистрация">
                ТІРКЕЛУ
              </AppText>
            </AppPressable>
          </View>

          {/* Сообщение об ошибке */}
          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <AppText size={Typography.xs} color="#B71C1C" align="center">
                [!] {errorMessage}
              </AppText>
            </View>
          )}

          {/* Форма */}
          <View style={styles.form}>
            {!isLoginTab && (
              <View style={styles.inputGroup}>
                <AppText bold size={Typography.xs} color={Colors.textSub} ru="Ваше имя" style={styles.label}>
                  ЕСІМІҢІЗ
                </AppText>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Алихан"
                  placeholderTextColor="#8C8C84"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <AppText bold size={Typography.xs} color={Colors.textSub} style={styles.label}>
                EMAIL
              </AppText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="learner@example.kz"
                placeholderTextColor="#8C8C84"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText bold size={Typography.xs} color={Colors.textSub} ru="Пароль" style={styles.label}>
                ҚҰПИЯСӨЗ
              </AppText>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="--------"
                  placeholderTextColor="#8C8C84"
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />
                <AppPressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  accessibilityLabel={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  {...(Platform.OS === 'web' ? { title: showPassword ? 'Скрыть пароль' : 'Показать пароль' } : {})}
                  style={({ pressed }) => [
                    styles.eyeButton,
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} color={Colors.text} />
                  ) : (
                    <EyeIcon size={20} color={Colors.text} />
                  )}
                </AppPressable>
              </View>
            </View>

            {/* Кнопка отправки */}
            <TactileButton
              label={loading ? 'ЖҮКТЕЛУДЕ...' : isLoginTab ? 'КІРУ' : 'АККАУНТ АШУ'}
              ru={isLoginTab ? 'Войти' : 'Создать аккаунт'}
              variant="primary"
              size={Typography.md}
              disabled={loading}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />

            {/* Разделитель */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText size={Typography.xs} color={Colors.textSub} ru="Или" style={styles.dividerText}>
                НЕМЕСЕ
              </AppText>
              <View style={styles.dividerLine} />
            </View>

            {/* Быстрый ознакомительный вход */}
            <TactileButton
              label="ҚОНАҚ РЕТІНДЕ БАСТАУ"
              ru="Быстрый старт (гостевой доступ, 1 урок)"
              variant="secondary"
              size={Typography.xs}
              onPress={handleGuestLogin}
            />
          </View>
        </ScrollView>
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
    maxWidth: 480,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'web' ? Spacing.lg : Spacing.md,
    paddingBottom: Spacing.md,
    overflow: 'visible',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  scroll: {
    flex: 1,
    overflow: 'visible',
  },
  scrollInner: {
    paddingBottom: Spacing.xl,
    paddingHorizontal: 4,
    overflow: 'visible',
  },
  mascotArea: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: Colors.inactive,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.accent, // #ffe640
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
  },
  errorBanner: {
    backgroundColor: '#FFCDD2',
    borderWidth: 2,
    borderColor: '#B71C1C',
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  form: {
    width: '100%',
    overflow: 'visible',
    paddingVertical: 4,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.md,
    color: Colors.text,
    fontFamily: Typography.fontRegular,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.md,
    color: Colors.text,
    fontFamily: Typography.fontRegular,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  eyeButton: {
    padding: 10,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.inactive,
  },
  dividerText: {
    marginHorizontal: Spacing.sm,
  },
});

export default AuthScreen;

