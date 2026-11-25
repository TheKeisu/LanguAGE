// frontend/src/context/TooltipContext.js
// ─────────────────────────────────────────────────────────────────
// Глобальный провайдер умных тактильных подсказок (Anti-AI Tooltips):
// - Рендерится на самом верхнем уровне приложения (вне всех overflow: hidden).
// - Ни при каких условиях не обрезается рамками или родительскими блоками.
// - Автоматически разворачивается вниз, если элемент у верхнего края экрана.
// - Автоматически удерживается в пределах экрана слева и справа.
// - Появляется ровно через 0.55 секунды (550 мс).
// - Защита от залипаний: мгновенно скрывается при клике, скролле,
//   смене страницы или потере фокуса.
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Colors, Typography } from '../theme/theme';

const TooltipContext = createContext(null);

export const TooltipProvider = ({ children }) => {
  const [activeTooltip, setActiveTooltip] = useState(null); // { text, rect }
  const timerRef = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const hideTooltip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActiveTooltip(null);
  }, []);

  const showTooltip = useCallback((text, rect) => {
    if (!text || !rect) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setActiveTooltip({ text, rect });
    }, 550); // Ровно 0.55 секунды (550 мс)
  }, []);

  // Глобальная защита от залипания подсказок при любых действиях пользователя в вебе
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleGlobalDismiss = () => {
      hideTooltip();
    };

    // При любом скролле, клике, нажатии клавиши или смене страницы подсказка сразу скрывается
    window.addEventListener('scroll', handleGlobalDismiss, true);
    window.addEventListener('click', handleGlobalDismiss, true);
    window.addEventListener('pointerdown', handleGlobalDismiss, true);
    window.addEventListener('blur', handleGlobalDismiss);
    window.addEventListener('keydown', handleGlobalDismiss);
    window.addEventListener('popstate', handleGlobalDismiss);

    return () => {
      window.removeEventListener('scroll', handleGlobalDismiss, true);
      window.removeEventListener('click', handleGlobalDismiss, true);
      window.removeEventListener('pointerdown', handleGlobalDismiss, true);
      window.removeEventListener('blur', handleGlobalDismiss);
      window.removeEventListener('keydown', handleGlobalDismiss);
      window.removeEventListener('popstate', handleGlobalDismiss);
    };
  }, [hideTooltip]);

  // Вычисление умного позиционирования
  let tooltipStyle = null;
  if (activeTooltip) {
    const { rect, text } = activeTooltip;
    // Оцениваем примерную ширину подсказки с учетом шрифта и отступов
    const estimatedWidth = Math.min(380, Math.max(90, text.length * 8.5 + 24));
    
    // Если над элементом мало места (ближе 50px к верху экрана) — показываем ПОД ним!
    const isNearTop = rect.top < 50;
    
    let topPos;
    if (isNearTop) {
      topPos = rect.bottom + 8;
    } else {
      topPos = rect.top - 42;
    }

    // Защита от вылета за нижний край окна
    if (topPos > windowHeight - 48) {
      topPos = Math.max(8, windowHeight - 48);
    }

    // Центрируем относительно элемента, но строго удерживаем в границах экрана [12px, windowWidth - 12px]
    const idealLeft = rect.left + rect.width / 2 - estimatedWidth / 2;
    const leftPos = Math.max(12, Math.min(windowWidth - estimatedWidth - 12, idealLeft));

    tooltipStyle = {
      position: 'fixed',
      top: topPos,
      left: leftPos,
      maxWidth: 380,
      zIndex: 99999999,
      pointerEvents: 'none',
    };
  }

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {/* Tooltip отображается ТОЛЬКО на Web — на нативе position:'fixed' не работает
          и рендерит невидимый View со zIndex:99999999, который блокирует все тапы */}
      {Platform.OS === 'web' && activeTooltip && (
        <View style={[styles.tooltipBubble, tooltipStyle]} pointerEvents="none">
          <Text style={styles.tooltipText}>{activeTooltip.text}</Text>
        </View>
      )}
    </TooltipContext.Provider>
  );
};

export const useTooltip = () => {
  const ctx = useContext(TooltipContext);
  return ctx || { showTooltip: () => {}, hideTooltip: () => {} };
};

const styles = StyleSheet.create({
  tooltipBubble: {
    backgroundColor: '#ffe640',
    borderWidth: 2,
    borderColor: '#18181B',
    borderRadius: 8,
    borderBottomWidth: 4,
    borderBottomColor: '#18181B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    // @ts-ignore
    boxShadow: '0 4px 0 #18181B',
  },
  tooltipText: {
    fontFamily: Typography.fontBold,
    fontSize: 12,
    color: '#18181B',
    fontWeight: '700',
    textAlign: 'center',
  },
});
