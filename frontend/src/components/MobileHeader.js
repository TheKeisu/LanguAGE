// frontend/src/components/MobileHeader.js
// ─────────────────────────────────────────────────────────────────
// Верхний хедер для мобильных устройств (iOS / Android).
// Показывает логотип LanguAGE + компактный StatsBar (стрик, XP, жизни).
// Все элементы аккуратно вмещаются без горизонтального переполнения.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import AppPressable from './AppPressable';
import SnowLeopardLogo from './SnowLeopardLogo';
import StatsBar from './StatsBar';
import { CameraIcon, SparklesIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';

/**
 * @param {object} props
 * @param {number} props.streak
 * @param {number} props.xp
 * @param {number} props.hearts
 * @param {function} [props.onPressProfile]
 * @param {function} [props.onPressCamera]
 */
const MobileHeader = ({ streak, xp, hearts, onPressProfile, onPressCamera }) => {
  return (
    <View style={styles.header}>
      {/* Логотип */}
      <View style={styles.brand}>
        <SnowLeopardLogo size={26} style={{ marginRight: 6 }} />
        <AppText bold size={Typography.sm + 1} color={Colors.text}>
          LanguAGE
        </AppText>
      </View>

      {/* Правая часть: AI-Камера + Статистика */}
      <View style={styles.rightSection}>
        {/* Кнопка инновационной AI Камеры */}
        <AppPressable
          onPress={onPressCamera}
          style={({ pressed }) => [
            styles.aiCameraBtn,
            pressed && { borderBottomWidth: 1.5, transform: [{ translateY: 1 }] },
          ]}
          accessibilityLabel="Открыть ИИ-камеру для распознавания предметов"
        >
          <CameraIcon size={14} color={Colors.text} />
          <AppText bold size={9} color={Colors.text} style={{ marginLeft: 3 }}>
            AI ТАНУ
          </AppText>
        </AppPressable>

        {/* Компактная статистика для мобайла */}
        <StatsBar
          streak={streak}
          xp={xp}
          hearts={hearts}
          compact={true}
          onPressProfile={onPressProfile}
          style={styles.stats}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.background,
    borderBottomWidth: 2,
    borderBottomColor: Colors.text,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  aiCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.text,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  stats: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexShrink: 0,
  },
});

export default MobileHeader;
