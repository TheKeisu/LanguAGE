// frontend/src/components/SpeechBubble.js
// ─────────────────────────────────────────────────────────────────
// Тактильная карточка вопроса / реплики (чистая, БЕЗ хвостиков и стрелок).
// Белый фон, четкий контур 2px #18181B, грань 4px.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { Colors, Typography, Spacing } from '../theme/theme';

/**
 * @param {object} props
 * @param {string} [props.text]
 * @param {object} [props.style]
 * @param {*}      [props.children]
 */
const SpeechBubble = ({
  text,
  style,
  children,
}) => {
  return (
    <View style={[styles.bubble, style]}>
      {children ?? (
        <AppText bold size={Typography.md} color={Colors.text} align="center">
          {text}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SpeechBubble;
