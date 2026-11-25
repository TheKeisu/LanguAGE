// frontend/src/components/HandbookModal.js
// ─────────────────────────────────────────────────────────────────
// Модальное окно «Справочник по грамматике и фонетике»:
// Подробный разбор 9 специфических казахских букв, закон сингармонизма
// и базовые правила (БЕЗ эмодзи, только кастомная иконографика).
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AppText from './AppText';
import AppPressable from './AppPressable';
import TactileButton from './TactileButton';
import { BookIcon, CloseIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';

const KAZAKH_LETTERS = [
  { char: 'Ә ә', sound: '[æ]', desc: 'Мягкий «а», как в англ. «cat».', example: 'Әке (отец)' },
  { char: 'І і', sound: '[ɪ]', desc: 'Краткий мягкий «и».', example: 'Іні (младший брат)' },
  { char: 'Ң ң', sound: '[ŋ]', desc: 'Носовой сонорный «н» (англ. «sing»).', example: 'Жаңа (новый)' },
  { char: 'Ғ ғ', sound: '[ʁ]', desc: 'Гортанный звонкий «г».', example: 'Ғалым (ученый)' },
  { char: 'Ү ү', sound: '[ʏ]', desc: 'Мягкий «у», губы округлены.', example: 'Үй (дом)' },
  { char: 'Ұ ұ', sound: '[ʊ]', desc: 'Твердый краткий «у».', example: 'Ұл (сын)' },
  { char: 'Қ қ', sound: '[q]', desc: 'Твердый глубокий «к».', example: 'Қала (город)' },
  { char: 'Ө ө', sound: '[œ]', desc: 'Мягкий «о», как в нем. «schön».', example: 'Көл (озеро)' },
  { char: 'Һ һ', sound: '[h]', desc: 'Выдыхаемый гортанный «х».', example: 'Гауһар (алмаз)' },
];

/**
 * @param {object} props
 * @param {boolean} props.visible
 * @param {function} props.onClose
 */
const HandbookModal = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Шапка модалки */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BookIcon size={24} color={Colors.text} style={{ marginRight: 10 }} />
              <View>
                <AppText bold size={Typography.lg} color={Colors.text} ru="Справочник модуля">
                  Модуль анықтамалығы
                </AppText>
                <AppText size={Typography.xs} color={Colors.textSub} ru="Фонетика и специфика алфавита">
                  Фонетика және әліпби ерекшеліктері
                </AppText>
              </View>
            </View>

            <AppPressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { borderBottomWidth: 2, transform: [{ translateY: 2 }] },
              ]}
            >
              <CloseIcon size={18} color={Colors.text} />
            </AppPressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Раздел 1: Буквы */}
            <AppText bold size={Typography.md} color={Colors.text} style={styles.sectionTitle} ru="9 специфических букв">
              9 ерекше дыбыс пен әріп
            </AppText>

            <View style={styles.lettersGrid}>
              {KAZAKH_LETTERS.map((item, idx) => (
                <View key={idx} style={styles.letterCard}>
                  <View style={styles.letterBadge}>
                    <AppText bold size={Typography.lg} color={Colors.text}>
                      {item.char}
                    </AppText>
                  </View>
                  <View style={styles.letterInfo}>
                    <AppText bold size={Typography.sm} color={Colors.textSub}>
                      {item.sound}
                    </AppText>
                    <AppText size={Typography.xs} color={Colors.text}>
                      {item.desc}
                    </AppText>
                    <AppText bold size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }}>
                      Мысалы: {item.example}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>

            {/* Раздел 2: Сингармонизм */}
            <View style={styles.ruleCard}>
              <AppText bold size={Typography.md} color={Colors.text} ru="Закон сингармонизма">
                Үндестік заңы (сингармонизм)
              </AppText>
              <AppText size={Typography.xs} color={Colors.text} style={{ marginTop: 6, lineHeight: 18 }}>
                Қазақ сөзіндегі барлық дауысты дыбыстар не тек <AppText bold color={Colors.text}>жуан</AppText> (А, О, Ұ, Ы),
                не тек <AppText bold color={Colors.text}>жіңішке</AppText> (Ә, Ө, Ү, І, Е) болады. Жалғанатын қосымшалар да осыған байланысты таңдалады!
              </AppText>
            </View>
          </ScrollView>

          <TactileButton
            label="ТҮСІНІКТІ"
            ru="Понятно"
            variant="primary"
            style={styles.bottomBtn}
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 680,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: Colors.text,
    borderRadius: 16,
    borderBottomWidth: 6,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.inactive,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  closeIconCross1: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: Colors.text,
    transform: [{ rotate: '45deg' }],
  },
  closeIconCross2: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: Colors.text,
    transform: [{ rotate: '-45deg' }],
  },
  scroll: {
    marginVertical: Spacing.xs,
  },
  sectionTitle: {
    marginVertical: Spacing.xs,
  },
  lettersGrid: {
    marginTop: Spacing.xs,
  },
  letterCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  letterBadge: {
    width: 60,
    paddingVertical: 4,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  letterInfo: {
    flex: 1,
  },
  ruleCard: {
    backgroundColor: '#E0F7FA',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bottomBtn: {
    marginTop: Spacing.sm,
  },
});

export default HandbookModal;
