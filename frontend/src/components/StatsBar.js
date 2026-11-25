// frontend/src/components/StatsBar.js
// ─────────────────────────────────────────────────────────────────
// Панель статистики: стрик дней, опыт (XP), жизни.
// Для мобильных устройств автоматически убирает текст («күн», «ұпай», «жүрек»),
// оставляя только сочные иконки и числа (🔥 0, ⭐ 0, ❤️ 5),
// чтобы идеально помещаться в хедере без наезда на логотип или края.
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import AppText from './AppText';
import AppPressable from './AppPressable';
import { FlameIcon, StarIcon, HeartIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';
import { useTooltip } from '../context/TooltipContext';

/**
 * @param {object} props
 * @param {number} [props.streak=0]
 * @param {number} [props.xp=0]
 * @param {number} [props.hearts=5]
 * @param {boolean} [props.compact=false]
 * @param {function} [props.onPressProfile]
 * @param {object} [props.style]
 */
const StatsBar = ({
  streak = 0,
  xp = 0,
  hearts = 5,
  compact = false,
  onPressProfile,
  style,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = compact || width < 768;

  const { showTooltip, hideTooltip } = useTooltip();
  const [hoveredId, setHoveredId] = useState(null);

  const stats = [
    {
      id: 'streak',
      bg: '#FFF59D',
      icon: <FlameIcon size={isCompact ? 14 : 16} animate={streak > 0} />,
      label: isCompact ? `${streak}` : `${streak} күн`,
      ru: `${streak} дней стрика (ударный режим)`,
    },
    {
      id: 'xp',
      bg: Colors.accent,
      icon: <StarIcon size={isCompact ? 13 : 15} animate={false} />,
      label: isCompact ? `${xp}` : `${xp} ұпай`,
      ru: `${xp} очков опыта (XP)`,
    },
    {
      id: 'hearts',
      bg: '#FFCDD2',
      icon: <HeartIcon size={isCompact ? 13 : 15} animate={true} />,
      label: isCompact ? `${hearts}` : `${hearts} жүрек`,
      ru: `${hearts} жизней из 5 (энергия)`,
    },
  ];

  const handleMouseEnter = (item, e) => {
    setHoveredId(item.id);
    if (Platform.OS === 'web') {
      const rect = e?.currentTarget?.getBoundingClientRect?.();
      if (rect) {
        showTooltip(item.ru, rect);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    hideTooltip();
  };

  return (
    <View style={[styles.container, isCompact && styles.containerCompact, style]}>
      {stats.map((item) => {
        const isHovered = hoveredId === item.id;
        return (
          <AppPressable
            key={item.id}
            onPress={() => {
              hideTooltip();
              onPressProfile && onPressProfile();
            }}
            // @ts-ignore
            onMouseEnter={(e) => handleMouseEnter(item, e)}
            // @ts-ignore
            onMouseLeave={handleMouseLeave}
            accessibilityRole="button"
            accessibilityLabel={`${item.label} - ${item.ru}`}
            {...(Platform.OS === 'web' ? { title: item.ru } : {})}
            style={({ pressed }) => [
              styles.badge,
              isCompact && styles.badgeCompact,
              { backgroundColor: item.bg },
              isHovered && styles.badgeHovered,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
          >
            {item.icon}
            <AppText
              bold
              size={isCompact ? 11 : Typography.xs}
              color={Colors.text}
              style={[styles.badgeText, isCompact && styles.badgeTextCompact]}
            >
              {item.label}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: 'transparent',
    gap: 6,
  },
  containerCompact: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
  },
  badgeCompact: {
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderBottomWidth: 2.5,
  },
  badgeHovered: {
    borderBottomWidth: 3,
    transform: [{ translateY: -1 }],
  },
  badgeText: {
    marginLeft: 5,
    fontSize: 11,
  },
  badgeTextCompact: {
    marginLeft: 3,
    fontSize: 11,
  },
});

export default StatsBar;
