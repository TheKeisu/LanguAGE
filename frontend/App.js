// frontend/App.js
// ─────────────────────────────────────────────────────────────────
// Корневой компонент LanguAGE:
// Загружает JetBrains Mono (Regular + Bold), ждёт fontsLoaded,
// обеспечивает работу провайдера контекста и навигации по экранам:
// 'landing' | 'onboarding' | 'auth' | 'main' | 'lesson'.
//
// Нативная поддержка:
// - KeyboardAvoidingView для iOS (сдвиг экрана при клавиатуре)
// - SafeAreaView для правильных отступов нотча/HomeBar
// - StatusBar синхронизирован с платформой
// ─────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { JETBRAINS_REGULAR_B64, JETBRAINS_BOLD_B64 } from './src/theme/fontData';

// Внедрение полного локального TTF шрифта на Web без зависимости от Google Fonts
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('jb-mono-full-fonts')) {
    const style = document.createElement('style');
    style.id = 'jb-mono-full-fonts';
    style.textContent = `
      @font-face {
        font-family: 'JetBrainsMono';
        src: url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_REGULAR_B64}) format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: 'JetBrainsMono';
        src: url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_BOLD_B64}) format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: 'JetBrainsMono_400Regular';
        src: url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_REGULAR_B64}) format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: 'JetBrainsMono_700Bold';
        src: url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_BOLD_B64}) format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: block;
      }
      body, button, input, textarea, select {
        font-family: 'JetBrainsMono', 'JetBrainsMono_400Regular', monospace !important;
      }
      body, html, #root {
        background-color: #FFFFFF !important;
      }
    `;
    document.head.appendChild(style);
  }
}

import { AppProvider, useApp } from './src/context/AppContext';
import { TooltipProvider } from './src/context/TooltipContext';
import LandingScreen from './src/screens/LandingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import LearnScreen from './src/screens/LearnScreen';
import LessonScreen from './src/screens/LessonScreen';
import { Colors } from './src/theme/theme';

// Не скрывать SplashScreen автоматически - скроем вручную после загрузки шрифтов
try { SplashScreen.preventAutoHideAsync(); } catch (_) {}

function NavigationRouter() {
  const { screen } = useApp();

  switch (screen) {
    case 'landing':
      return <LandingScreen />;
    case 'onboarding':
      return <OnboardingScreen />;
    case 'auth':
      return <AuthScreen />;
    case 'lesson':
      return <LessonScreen />;
    case 'main':
    default:
      return <LearnScreen />;
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    JetBrainsMono_400Regular: require('./assets/fonts/JetBrainsMono-Regular.ttf'),
    JetBrainsMono_700Bold: require('./assets/fonts/JetBrainsMono-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      try { await SplashScreen.hideAsync(); } catch (_) {}
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <AppProvider>
      <TooltipProvider>
        <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
          <StatusBar
            style="dark"
            backgroundColor={Colors.background}
            translucent={false}
          />
          {/* KeyboardAvoidingView корректно сдвигает экран при клавиатуре на iOS */}
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView
              style={styles.keyboardView}
              behavior="padding"
              keyboardVerticalOffset={0}
            >
              <NavigationRouter />
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.keyboardView}>
              <NavigationRouter />
            </View>
          )}
        </SafeAreaView>
      </TooltipProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
});
