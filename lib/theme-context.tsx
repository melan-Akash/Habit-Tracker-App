import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MD3LightTheme, MD3DarkTheme, PaperProvider, configureFonts } from 'react-native-paper';

export interface AppTheme {
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    cardBorder: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    gold: string;
    silver: string;
    bronze: string;
    surfaceVariant: string;
    gradientPrimary: readonly [string, string, ...string[]];
    gradientCard: readonly [string, string, ...string[]];
    gradientAccent: readonly [string, string, ...string[]];
    success: string;
    error: string;
    inputBg: string;
    tabBarBg: string;
    tabBarActive: string;
    tabBarInactive: string;
  };
  toggleTheme: () => void;
}

const darkColors = {
  background: '#0B0D1B',
  card: '#16192E',
  cardBorder: '#272B4A',
  primary: '#7C4DFF',
  secondary: '#FF6584',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#00E676',
  gold: '#FFD700',
  silver: '#E2E8F0',
  bronze: '#CD7F32',
  surfaceVariant: '#1F2442',
  gradientPrimary: ['#6C5CE7', '#7C4DFF'] as const,
  gradientCard: ['#16192E', '#1F2442'] as const,
  gradientAccent: ['#00B894', '#00E676'] as const,
  success: '#00E676',
  error: '#FF5252',
  inputBg: '#1C203B',
  tabBarBg: '#121426',
  tabBarActive: '#8C7CFF',
  tabBarInactive: '#64748B',
};

const lightColors = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  primary: '#6C5CE7',
  secondary: '#FF6584',
  text: '#0F172A',
  textSecondary: '#64748B',
  accent: '#10B981',
  gold: '#F59E0B',
  silver: '#94A3B8',
  bronze: '#D97706',
  surfaceVariant: '#F1F5F9',
  gradientPrimary: ['#6C5CE7', '#8C7CFF'] as const,
  gradientCard: ['#FFFFFF', '#F8FAFC'] as const,
  gradientAccent: ['#10B981', '#34D399'] as const,
  success: '#10B981',
  error: '#EF4444',
  inputBg: '#F1F5F9',
  tabBarBg: '#FFFFFF',
  tabBarActive: '#6C5CE7',
  tabBarInactive: '#94A3B8',
};

const fontConfig = {
  fontFamily: 'Outfit_400Regular',
};

const ThemeContext = createContext<AppTheme>({
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState<boolean>(true);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const activeColors = isDark ? darkColors : lightColors;

  const paperTheme = isDark
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: darkColors.primary,
          background: darkColors.background,
          surface: darkColors.card,
        },
        fonts: configureFonts({ config: fontConfig }),
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: lightColors.primary,
          background: lightColors.background,
          surface: lightColors.card,
        },
        fonts: configureFonts({ config: fontConfig }),
      };

  return (
    <ThemeContext.Provider value={{ isDark, colors: activeColors, toggleTheme }}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
