// frontend/src/components/WebSidebar.js
// ─────────────────────────────────────────────────────────────────
// Левая панель навигации для Web (ПК браузер):
// Логотип со Снежным барсом (Ирбисом), кастомные иконки разделов (БЕЗ эмодзи).
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AppText from './AppText';
import AppPressable from '../components/AppPressable';
import SnowLeopardLogo from './SnowLeopardLogo';
import { MapIcon, SoundIcon, TargetIcon, UserIcon, MessageIcon, CameraIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';

const NAV_ITEMS = [
  { key: 'learn',     label: 'ОҚУ',         ru: 'Обучение', iconType: 'map',     tooltip: 'ОҚУ (Обучение) - сабақтар картасы' },
  { key: 'sounds',    label: 'ДЫБЫСТАР',    ru: 'Звуки',    iconType: 'sound',   tooltip: 'ДЫБЫСТАР (Звуки) - дыбысталу тренажері' },
  { key: 'dialogues', label: 'СҰХБАТТАР',   ru: 'Диалоги',  iconType: 'message', tooltip: 'СҰХБАТТАР (Диалоги) - шынайы сұхбаттар' },
  { key: 'quests',    label: 'ТАПСЫРМАЛАР', ru: 'Задания',  iconType: 'target',  tooltip: 'ТАПСЫРМАЛАР (Задания) - күнделікті мақсаттар' },
  { key: 'profile',   label: 'ПРОФИЛЬ',     ru: 'Профиль',  iconType: 'user',    tooltip: 'ПРОФИЛЬ (Профиль) - жетістіктер мен баптаулар' },
];

const renderNavIcon = (type, isActive) => {
  switch (type) {
    case 'camera':
      return <CameraIcon size={22} color={Colors.text} />;
    case 'map':
      return <MapIcon size={22} />;
    case 'sound':
      return <SoundIcon size={22} animate={isActive} />;
    case 'message':
      return <MessageIcon size={22} />;
    case 'target':
      return <TargetIcon size={22} />;
    case 'user':
    default:
      return <UserIcon size={22} />;
  }
};

/**
 * @param {object} props
 * @param {'learn' | 'sounds' | 'quests' | 'profile'} props.activeTab
 * @param {function} props.onSelectTab
 * @param {boolean} props.isAuthenticated
 * @param {function} props.onPressAuth
 */
const WebSidebar = ({
  activeTab,
  onSelectTab,
  isAuthenticated,
  onPressAuth,
  onPressCamera,
}) => {
  return (
    <View style={styles.sidebar}>
      {/* Логотип со Снежным барсом */}
      <View style={styles.logoRow}>
        <SnowLeopardLogo size={38} style={{ marginRight: 10 }} />
        <View style={{ flexShrink: 1 }}>
          <AppText bold size={Typography.xl} color={Colors.text}>
            LanguAGE
          </AppText>
          <AppText size={Typography.xs} color={Colors.textSub} numberOfLines={1}>
            Қазақ тілі - Платформа
          </AppText>
        </View>
      </View>

      {/* Меню навигации */}
      <View style={styles.navMenu}>
        {/* Эксклюзивная кнопка AI Vision / AI Камера */}
        <AppPressable
          onPress={onPressCamera}
          accessibilityLabel="ИИ Камера распознавания предметов"
          {...(Platform.OS === 'web' ? { title: 'ИИ Камера распознавания предметов' } : {})}
          style={({ pressed }) => [
            styles.navItem,
            styles.aiCameraNavItem,
            pressed && styles.navItemPressed,
          ]}
        >
          <View style={[styles.iconBox, styles.aiCameraIconBox]}>
            <CameraIcon size={20} color={Colors.text} />
          </View>
          <View style={styles.navLabelWrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText bold size={Typography.sm} color={Colors.text} style={styles.navLabel}>
                AI КАМЕРА
              </AppText>
              <View style={styles.newBadge}>
                <AppText bold size={9} color={Colors.text}>
                  ЖАҢА
                </AppText>
              </View>
            </View>
            <AppText size={Typography.xs - 1} color={Colors.textSub} style={styles.navSubLabel}>
              ИИ-распознавание
            </AppText>
          </View>
        </AppPressable>

        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <AppPressable
              key={item.key}
              onPress={() => onSelectTab(item.key)}
              accessibilityLabel={item.tooltip}
              {...(Platform.OS === 'web' ? { title: item.tooltip } : {})}
              style={({ pressed }) => [
                styles.navItem,
                isActive && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <View style={styles.iconBox}>
                {renderNavIcon(item.iconType, isActive)}
              </View>
              <View style={styles.navLabelWrapper}>
                <AppText
                  bold={isActive}
                  size={Typography.sm}
                  color={Colors.text}
                  ru={item.ru}
                  style={styles.navLabel}
                >
                  {item.label}
                </AppText>
                <AppText size={Typography.xs - 1} color={Colors.textSub} style={styles.navSubLabel}>
                  {item.ru}
                </AppText>
              </View>
            </AppPressable>
          );
        })}
      </View>

      {/* Нижняя плашка авторизации / профиля */}
      <View style={styles.footer}>
        <AppPressable
          onPress={onPressAuth}
          accessibilityLabel={isAuthenticated ? 'Выйти из аккаунта' : 'Войти в аккаунт'}
          {...(Platform.OS === 'web' ? { title: isAuthenticated ? 'Выйти из аккаунта LanguAGE' : 'Войти в аккаунт LanguAGE' } : {})}
          style={({ pressed }) => [
            styles.authBtn,
            pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
          ]}
        >
          <AppText
            bold
            size={Typography.xs}
            color={Colors.text}
            align="center"
            ru={isAuthenticated ? 'Выйти из аккаунта' : 'Войти в аккаунт'}
          >
            {isAuthenticated ? 'АККАУНТТАН ШЫҒУ' : 'ЖҮЙЕГЕ КІРУ'}
          </AppText>
        </AppPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRightWidth: 2,
    borderRightColor: Colors.inactive,
    backgroundColor: Colors.background,
    height: '100%',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.inactive,
  },
  navMenu: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: Colors.accent, // #ffe640
    borderColor: Colors.text,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
  },
  navItemPressed: {
    transform: [{ translateY: 2 }],
  },
  aiCameraNavItem: {
    backgroundColor: '#FFF9C4',
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    marginBottom: Spacing.md,
  },
  aiCameraIconBox: {
    backgroundColor: Colors.accent,
  },
  newBadge: {
    backgroundColor: Colors.accentBlue,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  iconBox: {
    marginRight: 6,
  },
  navLabelWrapper: {
    marginLeft: 6,
    justifyContent: 'center',
  },
  navLabel: {
    letterSpacing: 0.8,
  },
  navSubLabel: {
    marginTop: 2,
    fontSize: 10,
  },
  footer: {
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.inactive,
  },
  authBtn: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
});

export default WebSidebar;
