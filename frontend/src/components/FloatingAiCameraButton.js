// frontend/src/components/FloatingAiCameraButton.js
// ─────────────────────────────────────────────────────────────────
// Плавающая тактильная кнопка «AI КАМЕРА» (FAB):
// Закреплена в правом нижнем углу экрана (над TabBar),
// гарантируя, что кнопка видна пользователю В ЛЮБОМ РЕЖИМЕ
// (на мобилке, на планшете, на десктопе, на любой вкладке).
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AppText from './AppText';
import AppPressable from './AppPressable';
import { CameraIcon, SparklesIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';

/**
 * @param {object} props
 * @param {function} props.onPress
 */
const FloatingAiCameraButton = ({ onPress }) => {
  return (
    <View style={styles.fabContainer} pointerEvents="box-none">
      <AppPressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="ИИ-камера для распознавания предметов"
        {...(Platform.OS === 'web' ? { title: 'ИИ-камера распознавания предметов пальцем' } : {})}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <View style={styles.iconCircle}>
          <CameraIcon size={20} color={Colors.text} />
        </View>
        <View style={styles.textWrap}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText bold size={Typography.xs + 1} color={Colors.text}>
              AI КАМЕРА
            </AppText>
            <View style={styles.badge}>
              <AppText bold size={8} color={Colors.text}>
                ИИ
              </AppText>
            </View>
          </View>
          <AppText size={9} color={Colors.textSub}>
            Тану / Наведи
          </AppText>
        </View>
      </AppPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 74, // строго над нижним TabBar (58px)
    right: 16,
    zIndex: 9999,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE640', // фирменный яркий тактильный желтый
    borderWidth: 2.5,
    borderColor: Colors.text,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  fabPressed: {
    borderBottomWidth: 2.5,
    transform: [{ translateY: 2.5 }],
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#40DFFF', // голубой акцент
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 0.5,
    marginLeft: 5,
  },
});

export default FloatingAiCameraButton;
