// frontend/src/components/KazakhOrnament.js
// ─────────────────────────────────────────────────────────────────
// Аутентичный казахский национальный орнамент («Қошқар мүйіз» / «Тұмар» / «Күн»):
// Векторный полупрозрачный серый узор для извилистой тропы уроков.
// Рисуется строго ЗА тактильными кнопками уроков, подчеркивая национальную эстетику.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';

/**
 * @param {object} props
 * @param {'connector' | 'halo'} [props.type='connector']
 * @param {string} [props.color='#18181B']
 * @param {number} [props.opacity=0.22]
 * @param {object} [props.style]
 */
const KazakhOrnament = ({
  type = 'connector',
  color = '#18181B',
  opacity = 0.22,
  style,
}) => {
  if (type === 'halo') {
    // Круговой казахский солярный орнамент за кнопкой урока
    return (
      <View style={[styles.haloContainer, style]} pointerEvents="none">
        <Svg width={110} height={110} viewBox="0 0 110 110" fill="none">
          <G opacity={opacity} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Внешний тонкий декоративный контур с лепестками */}
            <Circle cx="55" cy="55" r="48" strokeDasharray="3 5" />
            
            {/* 4 луча казахского узора «Төртқұлақ» (четырехлистник) */}
            {/* Верхний завиток */}
            <Path d="M55 22 C50 14, 40 12, 38 18 C36 24, 46 25, 51 20" />
            <Path d="M55 22 C60 14, 70 12, 72 18 C74 24, 64 25, 59 20" />
            
            {/* Нижний завиток */}
            <Path d="M55 88 C50 96, 40 98, 38 92 C36 86, 46 85, 51 90" />
            <Path d="M55 88 C60 96, 70 98, 72 92 C74 86, 64 85, 59 90" />

            {/* Левый завиток */}
            <Path d="M22 55 C14 50, 12 40, 18 38 C24 36, 25 46, 20 51" />
            <Path d="M22 55 C14 60, 12 70, 18 72 C24 74, 25 64, 20 59" />

            {/* Правый завиток */}
            <Path d="M88 55 C96 50, 98 40, 92 38 C86 36, 85 46, 90 51" />
            <Path d="M88 55 C96 60, 98 70, 92 72 C86 74, 85 64, 90 59" />

            {/* Декоративные точки по диагоналям */}
            <Circle cx="30" cy="30" r="2" fill={color} />
            <Circle cx="80" cy="30" r="2" fill={color} />
            <Circle cx="30" cy="80" r="2" fill={color} />
            <Circle cx="80" cy="80" r="2" fill={color} />
          </G>
        </Svg>
      </View>
    );
  }

  // Тип 'connector' - вертикальный орнаментальный соединитель между уроками
  return (
    <View style={[styles.connectorContainer, style]} pointerEvents="none">
      <Svg width={60} height={56} viewBox="0 0 60 56" fill="none">
        <G opacity={opacity} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Центральная плавная витая линия */}
          <Path d="M30 0 L30 56" strokeDasharray="3 4" strokeWidth="1.8" />

          {/* Верхний парный рог «Қошқар мүйіз» */}
          <Path d="M30 14 C24 6, 12 5, 10 11 C8 17, 18 18, 24 13" />
          <Path d="M30 14 C36 6, 48 5, 50 11 C52 17, 42 18, 36 13" />

          {/* Ромб «Тұмар» по центру */}
          <Path d="M30 20 L37 28 L30 36 L23 28 Z" strokeWidth="2" />
          <Circle cx="30" cy="28" r="2" fill={color} />

          {/* Нижний парный рог «Қошқар мүйіз» */}
          <Path d="M30 42 C24 50, 12 51, 10 45 C8 39, 18 38, 24 43" />
          <Path d="M30 42 C36 50, 48 51, 50 45 C52 39, 42 38, 36 43" />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  connectorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
});

export default KazakhOrnament;
