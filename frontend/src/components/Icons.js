// frontend/src/components/Icons.js
// ─────────────────────────────────────────────────────────────────
// Кастомные профессиональные векторные иконки LanguAGE (Magnific / Lucide):
// Четкие контуры 2-2.5px, эстетика чистых линий, плавная тактильная анимация.
// Полный отказ от эмодзи и примитивных псевдо-форм!
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import {
  Flame,
  Star,
  Heart,
  BookOpen,
  Target,
  Volume2,
  Compass,
  User,
  Lock,
  Check,
  Trophy,
  Clock,
  Sprout,
  Zap,
  Rocket,
  ArrowLeft,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Shield,
  Gift,
  Award,
  Globe,
  GraduationCap,
  MessageSquare,
  Camera,
  Crop,
} from 'lucide-react-native';
import { Colors } from '../theme/theme';

/**
 * 1. ОГОНЬ (СТРИК) - плавное тактильное мерцание
 */
export const FlameIcon = ({ size = 22, color = '#FF7043', animate = true, style }) => {
  const flicker = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.95, duration: 350, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 1.08, duration: 450, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [animate, flicker]);

  return (
    <Animated.View style={[{ transform: animate ? [{ scale: flicker }] : [] }, style]}>
      <Flame size={size} color={color} fill={Colors.accent} strokeWidth={2.2} />
    </Animated.View>
  );
};

/**
 * 2. ЗВЕЗДА (ОПЫТ / XP) - мягкая пульсация
 */
export const StarIcon = ({ size = 22, color = Colors.text, fill = Colors.accent, animate = false, style }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [animate, pulse]);

  return (
    <Animated.View style={[{ transform: animate ? [{ scale: pulse }] : [] }, style]}>
      <Star size={size} color={color} fill={fill} strokeWidth={2.2} />
    </Animated.View>
  );
};

/**
 * 3. СЕРДЦЕ (ЖИЗНИ) - сердцебиение
 */
export const HeartIcon = ({ size = 22, color = '#E53935', fill = '#EF5350', animate = true, style }) => {
  const beat = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(beat, { toValue: 1.2, duration: 250, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 1.12, duration: 250, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [animate, beat]);

  return (
    <Animated.View style={[{ transform: animate ? [{ scale: beat }] : [] }, style]}>
      <Heart size={size} color={color} fill={fill} strokeWidth={2.2} />
    </Animated.View>
  );
};

/**
 * 4. КНИГА (СПРАВОЧНИК / ТЕОРИЯ)
 */
export const BookIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <BookOpen size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 5. МИШЕНЬ (ЗАДАНИЯ ДНЯ / ЦЕЛЬ)
 */
export const TargetIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <Target size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 6. ЗВУК (ФОНЕТИКА / ДИНАМИК) - с анимацией звука
 */
export const SoundIcon = ({ size = 22, color = Colors.text, animate = false, style }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [animate, pulse]);

  return (
    <Animated.View style={[{ transform: animate ? [{ scale: pulse }] : [] }, style]}>
      <Volume2 size={size} color={color} strokeWidth={2.2} />
    </Animated.View>
  );
};

/**
 * 7. КАРТА / ОБУЧЕНИЕ
 */
export const MapIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <Compass size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 8. ПРОФИЛЬ / ПОЛЬЗОВАТЕЛЬ
 */
export const UserIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <User size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 9. ЗАМОК (БЛОКИРОВКА УРОКА)
 */
export const LockIcon = ({ size = 22, color = Colors.textSub, style }) => (
  <View style={style}>
    <Lock size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 10. ГАЛОЧКА (ЗАВЕРШЕНО)
 */
export const CheckIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <Check size={size} color={color} strokeWidth={2.8} />
  </View>
);

/**
 * 11. КУБОК (ФИНАЛ РАЗДЕЛА)
 */
export const TrophyIcon = ({ size = 24, color = Colors.text, style }) => (
  <View style={style}>
    <Trophy size={size} color={color} fill={Colors.accent} strokeWidth={2.2} />
  </View>
);

/**
 * 12. ЧАСЫ / ТАЙМЕР
 */
export const ClockIcon = ({ size = 20, color = Colors.text, style }) => (
  <View style={style}>
    <Clock size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 13. РОСТОК (ЛЕГКАЯ ЦЕЛЬ - 5 МИНУТ)
 */
export const SproutIcon = ({ size = 22, color = '#2E7D32', style }) => (
  <View style={style}>
    <Sprout size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 14. МОЛНИЯ (ОБЫЧНАЯ ЦЕЛЬ - 10 МИНУТ)
 */
export const LightningIcon = ({ size = 22, color = '#F57F17', style }) => (
  <View style={style}>
    <Zap size={size} color={color} fill={Colors.accent} strokeWidth={2.2} />
  </View>
);

/**
 * 15. РАКЕТА (ИНТЕНСИВНАЯ ЦЕЛЬ - 20 МИНУТ)
 */
export const RocketIcon = ({ size = 22, color = '#0288D1', style }) => (
  <View style={style}>
    <Rocket size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 16. СТРЕЛКА НАЗАД
 */
export const ArrowLeftIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <ArrowLeft size={size} color={color} strokeWidth={2.4} />
  </View>
);

/**
 * 17. КРЕСТИК ЗАКРЫТЬ
 */
export const CloseIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <X size={size} color={color} strokeWidth={2.4} />
  </View>
);

/**
 * 18. ИСКРЫ / СИЯНИЕ
 */
export const SparklesIcon = ({ size = 22, color = Colors.accent, style }) => (
  <View style={style}>
    <Sparkles size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 19. ГЛАЗ (ПОКАЗАТЬ / СКРЫТЬ ПАРОЛЬ)
 */
export const EyeIcon = ({ size = 20, color = Colors.text, style }) => (
  <View style={style}>
    <Eye size={size} color={color} strokeWidth={2.2} />
  </View>
);

export const EyeOffIcon = ({ size = 20, color = Colors.text, style }) => (
  <View style={style}>
    <EyeOff size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 20. ЩИТ (ЛИГИ И РЕЙТИНГИ)
 */
export const ShieldIcon = ({ size = 22, color = Colors.text, fill = 'transparent', style }) => (
  <View style={style}>
    <Shield size={size} color={color} fill={fill} strokeWidth={2.2} />
  </View>
);

/**
 * 21. СУНДУЧОК С НАГРАДАМИ / ПОДАРОК
 */
export const ChestIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <Gift size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 22. НАУЧНЫЙ ПОДХОД / АКАДЕМИЧЕСКАЯ ШАПОЧКА
 */
export const AcademicIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <GraduationCap size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 23. ПЛАНЕТА / ДОСТУПНО ВЕЗДЕ
 */
export const GlobeIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <Globe size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 24. МЕДАЛЬ / НАГРАДА
 */
export const AwardIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <Award size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 25. ДИАЛОГИ / СООБЩЕНИЯ (ЧАТ)
 */
export const MessageIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <MessageSquare size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 26. КАМЕРА / AI CAMERA
 */
export const CameraIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <Camera size={size} color={color} strokeWidth={2.2} />
  </View>
);

/**
 * 27. КАДРИРОВАНИЕ / ВЫДЕЛЕНИЕ ОБЛАСТИ
 */
export const CropIcon = ({ size = 22, color = Colors.text, style }) => (
  <View style={style}>
    <Crop size={size} color={color} strokeWidth={2.2} />
  </View>
);

const styles = StyleSheet.create({});
