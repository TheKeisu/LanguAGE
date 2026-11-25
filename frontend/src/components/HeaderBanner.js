// frontend/src/components/HeaderBanner.js
// ─────────────────────────────────────────────────────────────────
// Крупная тактильная плашка текущего модуля и раздела:
// Фон #40dfff, обводка 2px #18181B, грань 5px #18181B, кнопка «СПРАВОЧНИК».
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import AppPressable from './AppPressable';
import { BookIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';

/**
 * @param {object} props
 * @param {string} [props.sectionTitle='РАЗДЕЛ 1']
 * @param {string} [props.moduleTitle='Казахский алфавит и базовые фразы']
 * @param {function} props.onPressHandbook
 * @param {object} [props.style]
 */
const HeaderBanner = ({
  sectionTitle = 'РАЗДЕЛ 1',
  moduleTitle = 'Казахский алфавит и базовые фразы',
  onPressHandbook,
  style,
}) => {
  return (
    <View style={[styles.banner, style]}>
      <View style={styles.textContainer}>
        <AppText bold size={Typography.xs} color={Colors.textSub} ru="Раздел курса" style={styles.sectionLabel}>
          {sectionTitle}
        </AppText>
        <AppText bold size={Typography.lg} color={Colors.text} ru="Тема модуля" style={styles.moduleTitle}>
          {moduleTitle}
        </AppText>
      </View>

      <AppPressable
        onPress={onPressHandbook}
        style={({ pressed }) => [
          styles.handbookButton,
          pressed && styles.handbookButtonPressed,
        ]}
      >
        <BookIcon size={18} color={Colors.accentBlue} />
        <AppText bold size={Typography.xs} color={Colors.text} ru="Теория / Справочник" style={styles.handbookText}>
          АНЫҚТАМА
        </AppText>
      </AppPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.accentBlue, // #40dfff
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  textContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  sectionLabel: {
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  moduleTitle: {
    lineHeight: 22,
  },
  handbookButton: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
  },
  handbookButtonPressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 2 }],
  },
  handbookText: {
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});

export default HeaderBanner;

