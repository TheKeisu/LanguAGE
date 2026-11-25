// frontend/src/components/ProgressBar.js
// ─────────────────────────────────────────────────────────────────
// Тактильный прогресс-бар:
// Жёсткая обводка 2px #18181B, трек #E5E2C9, заполнение #ffe640 или #40dfff.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/theme';

/**
 * @param {object} props
 * @param {number} props.progress - значение от 0 до 1 (или 0..100)
 * @param {number} [props.height=14]
 * @param {string} [props.fillColor=Colors.accent]
 * @param {string} [props.trackColor=Colors.inactive]
 * @param {object} [props.style]
 */
const ProgressBar = ({
  progress = 0,
  height = 14,
  fillColor = Colors.accent,
  trackColor = Colors.inactive,
  style,
}) => {
  // Нормализуем к 0..100
  const normalized = Math.min(Math.max(progress > 1 ? progress : progress * 100, 0), 100);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${normalized}%`,
            backgroundColor: fillColor,
            borderRadius: Math.max((height - 4) / 2, 4),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: 1,
  },
  fill: {
    height: '100%',
  },
});

export default ProgressBar;

