// frontend/src/components/AiCameraModal.js
// ─────────────────────────────────────────────────────────────────
// Настоящая «AI-Камера LanguAGE»:
// 1. Делает реальное фото с камеры телефона или берёт фото из галереи (expo-image-picker).
// 2. Позволяет пальцем нарисовать прямоугольную область выделения прямо поверх фото.
// 3. Отправляет выделенную область на FastAPI + локальную нейросеть Vision (BLIP),
//    которая определяет предмет или группу предметов и даёт:
//    - название и описание на казахском языке
//    - кнопку перевода на русский язык
//    - пример предложения и морфемный разбор.
// ─────────────────────────────────────────────────────────────────

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  PanResponder,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppText from './AppText';
import AppPressable from './AppPressable';
import TactileButton from './TactileButton';
import { CloseIcon, CameraIcon, SparklesIcon, CropIcon, StarIcon } from './Icons';
import { Colors, Typography, Spacing } from '../theme/theme';
import { recognizeObjectArea } from '../services/aiVisionService';
import { triggerSuccessHaptic, triggerLightHaptic, triggerErrorHaptic } from '../services/hapticsService';

const AiCameraModal = ({ visible, onClose }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  // Размер области видоискателя для нормализации координат (0..1)
  const [viewSize, setViewSize] = useState({ width: 320, height: 260 });
  const viewSizeRef = useRef({ width: 320, height: 260 });

  // Рамка выделения в пикселях внутри видоискателя
  const [box, setBox] = useState({ x: 40, y: 40, width: 200, height: 160 });
  const boxRef = useRef({ x: 40, y: 40, width: 200, height: 160 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRussian, setShowRussian] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const updateBox = (nextBox) => {
    boxRef.current = nextBox;
    setBox(nextBox);
  };

  // Рисование области пальцем: приложил палец и повёл -> рисуется рамка!
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        setIsDrawing(true);
        const { locationX, locationY } = evt.nativeEvent;
        dragStartRef.current = { x: locationX, y: locationY };
        const clampedX = Math.max(0, Math.min(viewSizeRef.current.width - 20, locationX));
        const clampedY = Math.max(0, Math.min(viewSizeRef.current.height - 20, locationY));
        updateBox({ x: clampedX, y: clampedY, width: 24, height: 24 });
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const start = dragStartRef.current;
        const maxW = viewSizeRef.current.width;
        const maxH = viewSizeRef.current.height;

        const currX = Math.max(0, Math.min(maxW, locationX));
        const currY = Math.max(0, Math.min(maxH, locationY));

        const x = Math.min(start.x, currX);
        const y = Math.min(start.y, currY);
        const width = Math.max(24, Math.abs(currX - start.x));
        const height = Math.max(24, Math.abs(currY - start.y));

        updateBox({ x, y, width, height });
      },
      onPanResponderRelease: () => {
        setIsDrawing(false);
        // Если пользователь просто тапнул без протяжки — делаем удобную среднюю рамку вокруг точки
        const b = boxRef.current;
        if (b.width < 36 && b.height < 36) {
          const maxW = viewSizeRef.current.width;
          const maxH = viewSizeRef.current.height;
          const w = 140;
          const h = 140;
          const x = Math.max(0, Math.min(maxW - w, b.x - w / 2));
          const y = Math.max(0, Math.min(maxH - h, b.y - h / 2));
          updateBox({ x, y, width: w, height: h });
        }
      },
      onPanResponderTerminate: () => {
        setIsDrawing(false);
      },
    })
  ).current;

  // Сделать реальное фото на камеру телефона
  const handleTakePhoto = async () => {
    triggerLightHaptic();
    setErrorMsg('');
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Рұқсат керек', 'Камераны қолдану үшін рұқсат беріңіз (Разрешите доступ к камере)');
        return;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.3,
        base64: true,
        exif: false,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0]) {
        const asset = pickerResult.assets[0];
        setPhotoUri(asset.uri);
        setPhotoBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
        setResult(null);
        setShowRussian(false);
        // Сбрасываем рамку в центр нового фото
        updateBox({
          x: viewSizeRef.current.width * 0.15,
          y: viewSizeRef.current.height * 0.15,
          width: viewSizeRef.current.width * 0.7,
          height: viewSizeRef.current.height * 0.7,
        });
      }
    } catch (err) {
      setErrorMsg(`Камера қатесі: ${err.message}`);
    }
  };

  // Выбрать реальное фото из галереи телефона
  const handlePickGallery = async () => {
    triggerLightHaptic();
    setErrorMsg('');
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Рұқсат керек', 'Галереяға рұқсат беріңіз (Разрешите доступ к фото)');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.3,
        base64: true,
        exif: false,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0]) {
        const asset = pickerResult.assets[0];
        setPhotoUri(asset.uri);
        setPhotoBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
        setResult(null);
        setShowRussian(false);
        updateBox({
          x: viewSizeRef.current.width * 0.15,
          y: viewSizeRef.current.height * 0.15,
          width: viewSizeRef.current.width * 0.7,
          height: viewSizeRef.current.height * 0.7,
        });
      }
    } catch (err) {
      setErrorMsg(`Галерея қатесі: ${err.message}`);
    }
  };

  // Запуск реального AI Vision анализа на бэкенде
  const handleScan = async () => {
    if (!photoUri) {
      setErrorMsg('Алдымен суретке түсіріңіз немесе галереядан таңдаңыз');
      return;
    }
    triggerLightHaptic();
    setAnalyzing(true);
    setErrorMsg('');
    setResult(null);
    setShowRussian(false);

    try {
      const vw = Math.max(1, viewSizeRef.current.width);
      const vh = Math.max(1, viewSizeRef.current.height);
      const normalizedCrop = {
        x: Math.max(0, Math.min(1, boxRef.current.x / vw)),
        y: Math.max(0, Math.min(1, boxRef.current.y / vh)),
        width: Math.max(0.05, Math.min(1, boxRef.current.width / vw)),
        height: Math.max(0.05, Math.min(1, boxRef.current.height / vh)),
      };

      console.log('[AI-Camera] photoBase64 present:', !!photoBase64, 'len:', photoBase64 ? photoBase64.length : 0);
      console.log('[AI-Camera] photoUri:', photoUri);
      console.log('[AI-Camera] crop:', JSON.stringify(normalizedCrop));

      const data = await recognizeObjectArea({
        imageBase64: photoBase64,
        imageUri: photoUri,
        crop: normalizedCrop,
      });
      setResult(data);
      triggerSuccessHaptic();
    } catch (err) {
      triggerErrorHaptic();
      const detail = `${err.name}: ${err.message}`;
      console.error('[AI-Camera] ERROR:', detail);
      setErrorMsg(detail);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* ── Шапка модалки ── */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.aiBadge}>
                <SparklesIcon size={16} color={Colors.text} />
                <AppText bold size={11} color={Colors.text} style={{ marginLeft: 4 }}>
                  AI VISION
                </AppText>
              </View>
              <AppText bold size={Typography.md} color={Colors.text} style={{ marginLeft: 8 }}>
                ИИ-Камера LanguAGE
              </AppText>
            </View>

            <AppPressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Закрыть">
              <CloseIcon size={18} color={Colors.text} />
            </AppPressable>
          </View>

          <ScrollView scrollEnabled={!isDrawing} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* ── Кнопки: Камера и Галерея ── */}
            <View style={styles.actionButtonsRow}>
              <AppPressable
                onPress={handleTakePhoto}
                style={({ pressed }) => [
                  styles.sourceBtn,
                  styles.cameraBtn,
                  pressed && styles.sourceBtnPressed,
                ]}
              >
                <CameraIcon size={18} color={Colors.text} />
                <AppText bold size={11} color={Colors.text} style={{ marginLeft: 6 }}>
                  СУРЕТКЕ ТҮСІРУ
                </AppText>
              </AppPressable>

              <AppPressable
                onPress={handlePickGallery}
                style={({ pressed }) => [
                  styles.sourceBtn,
                  styles.galleryBtn,
                  pressed && styles.sourceBtnPressed,
                ]}
              >
                <CropIcon size={18} color={Colors.text} />
                <AppText bold size={11} color={Colors.text} style={{ marginLeft: 6 }}>
                  ГАЛЕРЕЯДАН
                </AppText>
              </AppPressable>
            </View>

            {/* ── Видоискатель с рисованием рамки пальцем ── */}
            {photoUri ? (
              <View>
                <AppText size={Typography.xs} color={Colors.textSub} align="center" style={styles.hintText}>
                  Саусағыңызбен заттың үстінен жүргізіп аймақты белгілеңіз
                </AppText>
                <View
                  style={styles.viewfinder}
                  onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    if (width > 0 && height > 0) {
                      viewSizeRef.current = { width, height };
                      setViewSize({ width, height });
                    }
                  }}
                  {...panResponder.panHandlers}
                >
                  <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />

                  {/* Рамка выделения пальцем */}
                  <View
                    pointerEvents="none"
                    style={[
                      styles.cropBox,
                      {
                        left: box.x,
                        top: box.y,
                        width: box.width,
                        height: box.height,
                      },
                    ]}
                  >
                    <View style={styles.cropCornerTL} />
                    <View style={styles.cropCornerTR} />
                    <View style={styles.cropCornerBL} />
                    <View style={styles.cropCornerBR} />
                    <View style={styles.cropLabelBadge}>
                      <CropIcon size={12} color={Colors.text} />
                      <AppText bold size={9} color={Colors.text} style={{ marginLeft: 3 }}>
                        ТАҢДАЛҒАН АЙМАҚ
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* ── Кнопка «РАСПОЗНАТЬ» ── */}
                <TactileButton
                  label={analyzing ? 'НЕЙРОЖЕЛІ ТАЛДАП ЖАТЫР...' : 'ОБЛЫСТЫ ТАНУ (РАСПОЗНАТЬ)'}
                  variant="primary"
                  size={Typography.sm}
                  disabled={analyzing}
                  onPress={handleScan}
                  style={{ marginTop: 12, width: '100%' }}
                />
              </View>
            ) : (
              <AppPressable onPress={handleTakePhoto} style={styles.emptyCameraBox}>
                <View style={styles.emptyIconCircle}>
                  <CameraIcon size={34} color={Colors.text} />
                </View>
                <AppText bold size={Typography.md} color={Colors.text} align="center">
                  Камераны ашып, затты суретке түсіріңіз
                </AppText>
                <AppText size={Typography.xs} color={Colors.textSub} align="center" style={{ marginTop: 4 }}>
                  Нажмите «СУРЕТКЕ ТҮСІРУ», сфотографируйте любой предмет вокруг и обведите его пальцем!
                </AppText>
              </AppPressable>
            )}

            {/* Ошибка */}
            {!!errorMsg && (
              <View style={styles.errorBox}>
                <AppText bold size={Typography.xs} color="#991B1B" align="center">
                  {errorMsg}
                </AppText>
              </View>
            )}

            {/* Индикатор загрузки нейросети */}
            {analyzing && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={Colors.text} />
                <AppText size={Typography.xs} color={Colors.textSub} style={{ marginLeft: 8 }}>
                  ИИ анализирует выделенную область...
                </AppText>
              </View>
            )}

            {/* ── Результат работы ИИ ── */}
            {result && !analyzing && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={styles.categoryBadge}>
                      <AppText bold size={9} color={Colors.text}>
                        {result.category}
                      </AppText>
                    </View>
                    <AppText bold size={Typography.xl} color={Colors.text} style={{ marginTop: 4 }}>
                      {result.kazakh}
                    </AppText>
                    <AppText size={Typography.xs} color={Colors.textSub}>
                      [{result.transcription}]
                    </AppText>
                  </View>

                  <View style={styles.matchBadge}>
                    <StarIcon size={14} color={Colors.text} fill={Colors.accent} />
                    <AppText bold size={10} color={Colors.text} style={{ marginLeft: 3 }}>
                      {result.confidence || 95}%
                    </AppText>
                  </View>
                </View>

                {/* Кнопка перевода на русский */}
                <AppPressable
                  onPress={() => {
                    triggerLightHaptic();
                    setShowRussian((prev) => !prev);
                  }}
                  style={styles.translateToggleBtn}
                >
                  <AppText bold size={11} color={Colors.text}>
                    {showRussian ? 'Орысша аудармасын жасыру ▲' : 'Орысша аудару (Перевести на русский) ▼'}
                  </AppText>
                </AppPressable>

                {showRussian && (
                  <View style={styles.russianBox}>
                    <AppText bold size={Typography.md} color={Colors.text}>
                      {result.russian}
                    </AppText>
                    <AppText size={Typography.xs} color={Colors.textSub} style={{ marginTop: 2 }}>
                      {result.descriptionRu}
                    </AppText>
                    {result.detectedRaw ? (
                      <AppText size={9} color={Colors.textSub} style={{ marginTop: 4 }}>
                        AI Vision: {result.detectedRaw}
                      </AppText>
                    ) : null}
                  </View>
                )}

                {/* Описание на казахском */}
                <View style={styles.descBox}>
                  <AppText bold size={11} color={Colors.text}>
                    Сипаттамасы (Қазақша):
                  </AppText>
                  <AppText size={Typography.xs} color={Colors.text} style={{ marginTop: 2, lineHeight: 18 }}>
                    {result.description}
                  </AppText>
                </View>

                {/* Пример в живом предложении */}
                <View style={styles.exampleBox}>
                  <AppText bold size={11} color={Colors.text}>
                    Сөйлемде қолданылуы:
                  </AppText>
                  <AppText bold size={Typography.xs} color={Colors.text} style={{ marginTop: 2 }}>
                    «{result.exampleSentence}»
                  </AppText>
                  {showRussian && (
                    <AppText size={Typography.xs - 1} color={Colors.textSub} style={{ marginTop: 2 }}>
                      «{result.exampleTranslation}»
                    </AppText>
                  )}
                </View>

                {/* Морфемная анатомия слова */}
                {result.anatomy && result.anatomy.length > 0 && (
                  <View style={styles.anatomyBox}>
                    <AppText bold size={11} color={Colors.text} style={{ marginBottom: 6 }}>
                      Сөз анатомиясы:
                    </AppText>
                    <View style={styles.morphemesRow}>
                      {result.anatomy.map((m, idx) => (
                        <View key={idx} style={styles.morphemePill}>
                          <AppText bold size={11} color={Colors.text}>
                            {m.morph}
                          </AppText>
                          <AppText size={8} color={Colors.textSub}>
                            {m.role}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
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
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 18,
    borderBottomWidth: 5,
    borderBottomColor: Colors.text,
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.inactive,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.text,
  },
  scrollBody: {
    paddingVertical: Spacing.sm,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  sourceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  cameraBtn: {
    backgroundColor: Colors.accent,
  },
  galleryBtn: {
    backgroundColor: Colors.accentBlue,
  },
  sourceBtnPressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 2 }],
  },
  emptyCameraBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.text,
    borderRadius: 14,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.text,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  hintText: {
    marginVertical: 4,
    lineHeight: 16,
  },
  viewfinder: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.text,
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.accent,
    backgroundColor: 'rgba(255, 230, 64, 0.18)',
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  cropCornerTL: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 12,
    height: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.text,
  },
  cropCornerTR: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.text,
  },
  cropCornerBL: {
    position: 'absolute',
    bottom: -3,
    left: -3,
    width: 12,
    height: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.text,
  },
  cropCornerBR: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 12,
    height: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.text,
  },
  cropLabelBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#991B1B',
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  resultCard: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.text,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: Colors.text,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  translateToggleBtn: {
    backgroundColor: Colors.accentBlue,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.text,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  russianBox: {
    backgroundColor: '#FFF9C4',
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  descBox: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  exampleBox: {
    backgroundColor: '#E0F7FA',
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  anatomyBox: {
    marginTop: 8,
  },
  morphemesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  morphemePill: {
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.text,
    borderRadius: 6,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.text,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
  },
});

export default AiCameraModal;
