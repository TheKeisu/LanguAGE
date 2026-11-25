// frontend/src/components/AppText.js
// Принудительно применяет JetBrains Mono ко всем текстам.
// Поддерживает prop ru для умного глобального всплывающего перевода при наведении > 0.75 сек.

import React, { useEffect } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { Typography, Colors } from '../theme/theme';
import { useTooltip } from '../context/TooltipContext';

/**
 * @param {object}  props
 * @param {boolean} [props.bold]        - использовать жирное начертание
 * @param {number}  [props.size]        - размер шрифта (Typography.*)
 * @param {string}  [props.color]       - цвет текста (Colors.*)
 * @param {object}  [props.style]       - дополнительные стили (без fontFamily!)
 * @param {string}  [props.align]       - 'left' | 'center' | 'right'
 * @param {boolean} [props.selectable]  - разрешить выделение текста
 * @param {string}  [props.ru]          - русский перевод при наведении > 0.55 сек
 * @param {*}       props.children      - содержимое
 */
const AppText = ({
  bold = false,
  size = Typography.md,
  color = Colors.text,
  style,
  align = 'left',
  selectable = false,
  ru,
  children,
  ...rest
}) => {
  const { showTooltip, hideTooltip } = useTooltip();

  // При размонтировании текста обязательно убираем подсказку, исключая залипания
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && ru) {
        hideTooltip();
      }
    };
  }, [hideTooltip, ru]);

  const handleMouseEnter = (e) => {
    if (Platform.OS === 'web' && ru) {
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

  return (
    <Text
      selectable={selectable}
      // @ts-ignore
      title={ru || rest.title}
      // @ts-ignore
      onMouseEnter={ru ? handleMouseEnter : undefined}
      // @ts-ignore
      onMouseLeave={ru ? handleMouseLeave : undefined}
      style={[
        styles.base,
        {
          fontFamily: bold ? Typography.fontBold : Typography.fontRegular,
          fontWeight: bold ? '700' : '400',
          fontSize:   size,
          color,
          textAlign:  align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fontRegular,
    includeFontPadding: false,
    textAlignVertical:  'center',
  },
});

export default AppText;
