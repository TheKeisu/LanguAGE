// frontend/src/components/SnowLeopardLogo.js
// ─────────────────────────────────────────────────────────────
// Официальное лого платформы LanguAGE:
// Символ платформы LanguAGE: Снежный барс (Ирбис).
// Четкая тактильная рамка 2px #18181B, грань 3px.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors } from '../theme/theme';

/**
 * @param {object} props
 * @param {number} [props.size=48]
 * @param {object} [props.style]
 * @param {boolean} [props.bordered=true]
 */
const SnowLeopardLogo = ({ size = 48, bordered = true, style }) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
        },
        bordered && styles.bordered,
        style,
      ]}
    >
      <Image
        source={require('../../assets/logo.jpg')}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: bordered ? size * 0.24 : size * 0.28,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: {
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
  },
});

export default SnowLeopardLogo;
