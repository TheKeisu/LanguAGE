// frontend/src/components/AppPressable.js
// Кроссплатформенная кнопка-обёртка: на Android/iOS использует TouchableOpacity
// (стабильная обработка нажатий в Expo Go), на Web — Pressable с поддержкой hover/pressed.

import React from 'react';
import { Platform, Pressable, TouchableOpacity } from 'react-native';

/**
 * @param {object} props
 * @param {function|object|Array} [props.style]
 * @param {number} [props.activeOpacity=0.7]
 */
const AppPressable = ({ style, activeOpacity = 0.7, children, ...rest }) => {
  if (Platform.OS !== 'web') {
    const resolvedStyle =
      typeof style === 'function' ? style({ pressed: false }) : style;

    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={resolvedStyle}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <Pressable style={style} {...rest}>
      {children}
    </Pressable>
  );
};

export default AppPressable;
