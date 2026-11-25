// frontend/src/components/LessonNode.js
// ─────────────────────────────────────────────────────────────────
// Тактильный узел урока для извилистой тропы (S-образное смещение).
// Использует Снежного барса (Ирбиса) и кастомные векторные иконки (БЕЗ эмодзи).
// - Активный: круг #ffe640, контурное кольцо, прыгающая плашка «НАЧАТЬ».
// - Пройденный: круг #40dfff с кастомной галочкой CheckIcon.
// - Заблокированный: круг #E5E2C9 с кастомным замком LockIcon.
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import AppText from './AppText';
import AppPressable from './AppPressable';
import { StarIcon, CheckIcon, LockIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';

/**
 * @param {object} props
 * @param {object} props.lesson - { id, title, description, type }
 * @param {'active' | 'completed' | 'locked'} props.status
 * @param {number} [props.offsetX=0] - горизонтальное смещение по S-кривой
 * @param {number} props.index
 * @param {boolean} [props.showMascot=false]
 * @param {function} props.onPress - (lesson) => void
 * @param {function} [props.onPressLocked] - (lesson) => void
 */
const LessonNode = ({
  lesson,
  status = 'locked',
  offsetX = 0,
  index = 0,
  showMascot = false,
  onPress,
  onPressLocked,
}) => {
  const [pressed, setPressed] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const bounceBadgeAnim = useRef(new Animated.Value(0)).current;
  const hoverScaleAnim = useRef(new Animated.Value(1)).current;

  // Прыгающая сверху плашка «НАЧАТЬ» для активного урока
  useEffect(() => {
    if (status !== 'active') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceBadgeAnim, {
          toValue: -6,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceBadgeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status, bounceBadgeAnim]);

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') {
      Animated.spring(hoverScaleAnim, {
        toValue: 1.05,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === 'web') {
      Animated.spring(hoverScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (status === 'locked') {
      if (onPressLocked) {
        onPressLocked(lesson);
      }
      return;
    }
    onPress && onPress(lesson);
  };

  const getNodeConfig = () => {
    switch (status) {
      case 'completed':
        return {
          bg: Colors.accentBlue, // #40dfff
          size: 82,
          borderBottom: 6,
        };
      case 'active':
        return {
          bg: Colors.accent, // #ffe640
          size: 90,
          borderBottom: 7,
        };
      case 'locked':
      default:
        return {
          bg: Colors.inactive, // #E5E2C9
          size: 78,
          borderBottom: 5,
        };
    }
  };

  const config = getNodeConfig();

  const renderNodeIcon = () => {
    if (status === 'completed') {
      return <CheckIcon size={26} color={Colors.text} />;
    }
    if (status === 'active') {
      return <StarIcon size={28} color={Colors.white} animate={true} />;
    }
    return <LockIcon size={24} />;
  };

  return (
    <View style={[styles.rowContainer, { transform: [{ translateX: offsetX }] }]}>
      <View style={styles.nodeWrapper}>
        {/* Прыгающая сверху плашка «НАЧАТЬ» */}
        {status === 'active' && (
          <Animated.View
            style={[
              styles.startBadge,
              { transform: [{ translateY: bounceBadgeAnim }] },
            ]}
          >
            <AppText bold size={Typography.xs} color={Colors.text} ru="Начать">
              БАСТАУ
            </AppText>
            <View style={styles.startBadgeTail} />
          </Animated.View>
        )}

        {/* Основной тактильный круг-кнопка с hover-эффектом и тактильным нажатием */}
        <Animated.View
          style={{
            transform: [
              { scale: hoverScaleAnim },
              { translateY: pressed ? 3 : 0 },
            ],
          }}
        >
          <AppPressable
            onPress={handlePress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            // @ts-ignore
            onMouseEnter={handleMouseEnter}
            // @ts-ignore
            onMouseLeave={handleMouseLeave}
            accessibilityLabel={
              status === 'locked'
                ? `Урок закрыт: ${lesson.title}`
                : status === 'completed'
                ? `Пройденный урок: ${lesson.title}. Нажми чтобы пройти снова`
                : `Начать урок: ${lesson.title}`
            }
            {...(Platform.OS === 'web' ? {
              title: status === 'locked'
                ? `Урок заблокирован - сначала пройди предыдущие уроки`
                : status === 'completed'
                ? `${lesson.title} - пройдено! Нажми чтобы повторить`
                : `${lesson.title} - нажми чтобы начать`,
            } : {})}
            style={[
              styles.circle,
              {
                width: config.size,
                height: config.size,
                borderRadius: config.size / 2,
                backgroundColor: config.bg,
                borderBottomWidth: pressed ? 2 : config.borderBottom,
              },
            ]}
          >
            {renderNodeIcon()}
          </AppPressable>
        </Animated.View>

        {/* Подпись названия урока под узлом с плавной анимацией при наведении на 3 точки */}
        <View style={styles.titleWrapper}>
          <AppPressable
            // @ts-ignore
            onMouseEnter={() => setIsTitleHovered(true)}
            // @ts-ignore
            onMouseLeave={() => setIsTitleHovered(false)}
            onPress={() => setIsTitleHovered((prev) => !prev)}
            style={[
              styles.titleCard,
              isTitleHovered && styles.titleCardHovered,
            ]}
          >
            <AppText
              bold={status === 'active' || isTitleHovered}
              size={Typography.xs}
              color={status === 'locked' && !isTitleHovered ? Colors.textSub : Colors.text}
              align="center"
              numberOfLines={isTitleHovered ? undefined : 2}
            >
              {lesson.title}
            </AppText>
          </AppPressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    position: 'relative',
  },
  nodeWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  startBadge: {
    position: 'absolute',
    top: -36,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 10,
    alignItems: 'center',
  },
  startBadgeTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.text,
    position: 'absolute',
    bottom: -6,
  },
  circle: {
    borderWidth: 3,
    borderColor: Colors.text,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  titleWrapper: {
    marginTop: 6,
    width: 150,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 20,
    position: 'relative',
  },
  titleCard: {
    maxWidth: 140,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  titleCardHovered: {
    position: 'absolute',
    top: -2,
    maxWidth: 240,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 9999,
  },
});

export default LessonNode;
