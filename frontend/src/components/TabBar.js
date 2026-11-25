// frontend/src/components/TabBar.js
// ─────────────────────────────────────────────────────────────────
// Нижний TabBar для мобильных устройств (iOS / Android / Web).
// - Кнопка «ОҚУ» расположена строго по центру (3-й таб из 5).
// - При выборе раздела «ОҚУ» кнопка остается строго внутри рамок
//   панели навигации, не наезжает на границы и не вылезает вверх.
// - Боковые кнопки равномерно сжаты и центрированы.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import AppPressable from './AppPressable';
import { MapIcon, SoundIcon, TargetIcon, UserIcon, MessageIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';

const TABS = [
  { key: 'sounds',    label: 'ДЫБЫСТАР',    ru: 'Звуки',     iconType: 'sound' },
  { key: 'dialogues', label: 'СҰХБАТ',      ru: 'Диалоги',   iconType: 'message' },
  { key: 'learn',     label: 'ОҚУ',         ru: 'Обучение',  iconType: 'map', isCenter: true },
  { key: 'quests',    label: 'ТАПСЫРМА',    ru: 'Задания',   iconType: 'target' },
  { key: 'profile',   label: 'ПРОФИЛЬ',     ru: 'Профиль',   iconType: 'user' },
];

const renderTabIcon = (type, isActive, isCenter) => {
  const iconSize = isCenter ? 22 : 18;
  switch (type) {
    case 'map':
      return <MapIcon size={iconSize} />;
    case 'sound':
      return <SoundIcon size={iconSize} animate={isActive} />;
    case 'message':
      return <MessageIcon size={iconSize} />;
    case 'target':
      return <TargetIcon size={iconSize} />;
    case 'user':
    default:
      return <UserIcon size={iconSize} />;
  }
};

/**
 * @param {object} props
 * @param {'learn' | 'sounds' | 'dialogues' | 'quests' | 'profile'} props.activeTab
 * @param {function} props.onSelectTab
 */
const TabBar = ({ activeTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const isCenter = !!tab.isCenter;

        if (isCenter) {
          return (
            <View key={tab.key} style={styles.centerTabWrapper}>
              <AppPressable
                onPress={() => onSelectTab(tab.key)}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                style={({ pressed }) => [
                  styles.centerTab,
                  isActive ? styles.centerTabActive : styles.centerTabInactive,
                  pressed && styles.centerTabPressed,
                ]}
              >
                {renderTabIcon(tab.iconType, isActive, true)}
                <AppText
                  bold
                  size={10}
                  color={Colors.text}
                  ru={tab.ru}
                  style={styles.centerLabel}
                >
                  {tab.label}
                </AppText>
              </AppPressable>
            </View>
          );
        }

        return (
          <AppPressable
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            style={({ pressed }) => [
              styles.sideTab,
              isActive && styles.sideTabActive,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
          >
            {renderTabIcon(tab.iconType, isActive, false)}
            <AppText
              bold={isActive}
              size={9}
              numberOfLines={1}
              color={isActive ? Colors.text : Colors.textSub}
              ru={tab.ru}
              style={styles.sideLabel}
            >
              {tab.label}
            </AppText>
          </AppPressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 2,
    borderTopColor: Colors.text,
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 58,
    boxSizing: 'border-box',
  },
  sideTab: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 1,
    marginHorizontal: 1,
    borderRadius: 8,
  },
  sideTabActive: {
    backgroundColor: '#FFF59D',
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.text,
  },
  sideLabel: {
    marginTop: 2,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  centerTabWrapper: {
    flex: 1.2,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  centerTab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 70,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
  },
  centerTabActive: {
    backgroundColor: Colors.accent, // #ffe640
  },
  centerTabInactive: {
    backgroundColor: Colors.white,
  },
  centerTabPressed: {
    borderBottomWidth: 1.5,
    transform: [{ translateY: 1 }],
  },
  centerLabel: {
    marginTop: 1,
    letterSpacing: 0.5,
  },
});

export default TabBar;
