// frontend/src/components/SnowLeopard.js
// ─────────────────────────────────────────────────────────────────
// Официальный маскот и символ LanguAGE:
// Символ и логотип платформы LanguAGE: Снежный барс (Ирбис).
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/theme';

/**
 * @param {object} props
 * @param {'small' | 'medium' | 'large'} [props.size='medium']
 * @param {boolean} [props.animate=true]
 * @param {object}  [props.style]
 */
const SnowLeopard = ({
  size = 'medium',
  animate = true,
  style,
}) => {
  const breathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: -6, duration: 1200, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animate, breathAnim]);

  const dimension = size === 'small' ? 56 : size === 'large' ? 140 : 96;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension * 0.28,
          transform: animate ? [{ translateY: breathAnim }] : [],
        },
        style,
      ]}
    >
      <Image
        source={require('../../assets/snow_leopard.jpg')}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: dimension * 0.24,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#DFD3BC',
    borderWidth: 2.5,
    borderColor: Colors.text,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SnowLeopard;
