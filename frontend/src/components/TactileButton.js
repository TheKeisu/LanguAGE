// frontend/src/components/TactileButton.js
// Переиспользуемая тактильная кнопка с жёсткой 3D-гранью.
// Anti-AI rules: никаких градиентов, blur-теней, glassmorphism.
// Поддерживает prop ru для автоматического тактильного перевода при наведении > 0.55 сек.

import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  Pressable,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import AppText from './AppText';
import { Colors, Typography, TactileEdge } from '../theme/theme';
import { useTooltip } from '../context/TooltipContext';
import { triggerLightHaptic } from '../services/hapticsService';

/**
 * @param {object}   props
 * @param {string}   [props.label]          - текст кнопки (если нет children)
 * @param {boolean}  [props.bold]           - жирный текст
 * @param {string}   [props.color]          - цвет фона кнопки (по умолчанию accent)
 * @param {string}   [props.textColor]      - цвет текста
 * @param {number}   [props.size]           - размер шрифта
 * @param {boolean}  [props.disabled]       - заблокировать кнопку
 * @param {function} [props.onPress]        - обработчик нажатия
 * @param {object}   [props.style]          - доп. стили контейнера
 * @param {*}        [props.children]       - произвольный контент вместо label
 * @param {string}   [props.variant]        - 'primary' | 'secondary' | 'ghost'
 * @param {string}   [props.ru]             - русский перевод при наведении > 0.55 сек
 */
const TactileButton = ({
  label,
  bold = true,
  color,
  textColor,
  size = Typography.md,
  disabled = false,
  onPress,
  style,
  children,
  variant = 'primary',
  ru,
}) => {
  const { showTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && ru) {
        hideTooltip();
      }
    };
  }, [hideTooltip, ru]);

  const resolveColors = () => {
    if (disabled) {
      return { bg: Colors.inactive, txt: Colors.textSub };
    }
    switch (variant) {
      case 'secondary':
        return { bg: color ?? Colors.accentBlue, txt: textColor ?? Colors.text };
      case 'ghost':
        return { bg: Colors.transparent, txt: textColor ?? Colors.text };
      case 'primary':
      default:
        return { bg: color ?? Colors.accent, txt: textColor ?? Colors.text };
    }
  };

  const { bg, txt } = resolveColors();

  const handlePress = () => {
    console.log('[TactileButton] pressed:', label || 'children', 'disabled:', disabled);
    if (disabled) return;
    hideTooltip();
    triggerLightHaptic();
    if (onPress) {
      onPress();
    }
  };

  const handleMouseEnter = (e) => {
    if (Platform.OS === 'web' && !disabled && ru) {
      const rect = e?.currentTarget?.getBoundingClientRect?.();
      if (rect) {
        showTooltip(ru, rect);
      }
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === 'web' && ru) {
      hideTooltip();
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.outerContainer, style]}>
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          style={[
            styles.button,
            {
              backgroundColor: bg,
              borderBottomWidth: 5,
            },
            variant === 'ghost' && styles.ghostBorder,
          ]}
        >
          {children ?? (
            <AppText bold={bold} size={size} color={txt} align="center">
              {label}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.outerContainer, style]}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        // @ts-ignore
        onMouseEnter={handleMouseEnter}
        // @ts-ignore
        onMouseLeave={handleMouseLeave}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        // @ts-ignore
        title={ru}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: bg,
            borderBottomWidth: pressed && !disabled ? 2 : 5,
            transform: [{ translateY: pressed && !disabled ? 3 : 0 }],
          },
          variant === 'ghost' && styles.ghostBorder,
        ]}
      >
        {children ?? (
          <AppText bold={bold} size={size} color={txt} align="center">
            {label}
          </AppText>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  button: {
    borderWidth: TactileEdge.borderWidth,
    borderColor: TactileEdge.borderColor,
    borderRadius: TactileEdge.borderRadius,
    borderBottomColor: TactileEdge.borderBottomColor,
    paddingVertical: 14,
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBorder: {
    borderColor: Colors.text,
    borderBottomColor: Colors.text,
  },
});

export default TactileButton;
