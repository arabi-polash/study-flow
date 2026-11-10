import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useApp } from './app-store';

export const lightColors = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E9EBF2',
  text: '#15171E',
  muted: '#707585',
  primary: '#4F46E5',
  primarySoft: '#EDEFFE',
  onPrimary: '#FFFFFF',
  success: '#12A150',
  successSoft: '#E6F6ED',
  disabled: '#C9CCD6',
};

export const darkColors: Palette = {
  bg: '#0E1014',
  card: '#171A21',
  border: '#272C37',
  text: '#F2F4F8',
  muted: '#9AA2B1',
  primary: '#8C8AF8',
  primarySoft: '#22243F',
  onPrimary: '#0E1014',
  success: '#3DD68C',
  successSoft: '#123021',
  disabled: '#3A4050',
};

export type Palette = typeof lightColors;

export type Theme = { colors: Palette; dark: boolean };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

const ThemeContext = createContext<Theme>({ colors: lightColors, dark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const value = useMemo<Theme>(
    () => ({ colors: settings.darkMode ? darkColors : lightColors, dark: settings.darkMode }),
    [settings.darkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Build a StyleSheet for the active theme, recreated only when the theme changes. */
export function useStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
