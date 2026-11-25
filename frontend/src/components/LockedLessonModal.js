// frontend/src/components/LockedLessonModal.js
// ─────────────────────────────────────────────────────────────────
// Фирменное тактильное модальное окно при нажатии на закрытый урок.
// Для гостей: предлагает войти/зарегистрироваться, чтобы открыть уроки 2-16.
// Anti-AI дизайн: #FFFFFF, #18181B, #ffe640, JetBrains Mono, без размытия.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import AppText from './AppText';
import AppPressable from './AppPressable';
import TactileButton from './TactileButton';
import { LockIcon, CloseIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';
import { useApp } from '../context/AppContext';

/**
 * @param {object} props
 * @param {boolean} props.visible
 * @param {object} [props.lesson]
 * @param {function} props.onClose
 */
const LockedLessonModal = ({ visible, lesson, onClose }) => {
  const { isAuth, navigateTo } = useApp();
  if (!visible) return null;

  const isGuestLock = !isAuth && (lesson?.id > 1);

  const handleAuthRedirect = () => {
    onClose();
    navigateTo('auth');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <AppPressable style={styles.overlay} onPress={onClose}>
        <AppPressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Кнопка закрытия в углу */}
          <AppPressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { transform: [{ translateY: 1 }] },
            ]}
          >
            <CloseIcon size={16} color={Colors.text} />
          </AppPressable>

          {/* Желтый бейдж с замочком */}
          <View style={styles.iconCircle}>
            <LockIcon size={32} color={Colors.text} />
          </View>

          {/* Заголовок */}
          <AppText
            bold
            size={Typography.lg}
            color={Colors.text}
            align="center"
            ru="Урок заблокирован"
            style={styles.title}
          >
            САБАҚ ЖАБЫҚ
          </AppText>

          {/* Название урока */}
          {lesson?.title ? (
            <View style={styles.lessonTitleBox}>
              <AppText bold size={Typography.sm} color={Colors.text} align="center">
                «{lesson.title}»
              </AppText>
            </View>
          ) : null}

          {/* Объяснение */}
          <AppText
            size={Typography.sm}
            color={Colors.textSub}
            align="center"
            style={styles.message}
            ru={isGuestLock
              ? 'В гостевом режиме доступен только 1-й урок. Войдите в аккаунт, чтобы открыть все 16 уроков!'
              : 'Чтобы открыть этот урок, сначала пройдите предыдущие уроки на карте!'}
          >
            {isGuestLock
              ? 'Қонақ режимінде тек 1-сабақ қолжетімді. Барлық 16 сабақты ашу және прогресті сақтау үшін аккаунтқа кіріңіз!'
              : 'Бұл сабақты ашу үшін алдымен оқу картасындағы алдыңғы сабақтарды аяқтаңыз!'}
          </AppText>

          {/* Кнопки действия */}
          {isGuestLock ? (
            <View style={styles.buttonsColumn}>
              <TactileButton
                label="ЖҮЙЕГЕ КІРУ / ТІРКЕЛУ"
                ru="Войти в систему / Регистрация"
                variant="primary"
                size={Typography.sm}
                onPress={handleAuthRedirect}
                style={{ width: '100%', marginBottom: Spacing.sm }}
              />
              <TactileButton
                label="ЖАБУ"
                ru="Закрыть"
                variant="ghost"
                size={Typography.xs}
                onPress={onClose}
                style={{ width: '100%' }}
              />
            </View>
          ) : (
            <TactileButton
              label="ТҮСІНІКТІ, САБАҚҚА БАРАМЫН!"
              ru="Понятно, иду учиться!"
              variant="primary"
              size={Typography.md}
              onPress={onClose}
              style={{ width: '100%', marginTop: Spacing.md }}
            />
          )}
        </AppPressable>
      </AppPressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    zIndex: 99999,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 18,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    padding: Spacing.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    backgroundColor: Colors.inactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  title: {
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  lessonTitleBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginVertical: Spacing.sm,
    width: '100%',
  },
  message: {
    lineHeight: 20,
    marginVertical: Spacing.md,
  },
  buttonsColumn: {
    width: '100%',
    marginTop: Spacing.sm,
  },
});

export default LockedLessonModal;
