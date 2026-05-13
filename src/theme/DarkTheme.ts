import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

export const DARK_THEME: ThemeTypes = {
  name: 'DARK_THEME',
  dark: true,
  variables: {
    'border-color': '#fff'
  },
  colors: {
    primary: '#2eced5',
    info: '#eacc83',

    secondary: '#fff',
    success: '#43cc58ff',
    warning: '#ffa726',
    error: '#ef5350',
    indigo: '#b39ddb',

    lightprimary: '#1e2a38',
    lightinfo: '#1c2b36',
    lightsecondary: '#2c3e50',
    lightsuccess: '#38795eff',
    lighterror: '#3c1f1f',
    lightwarning: '#3c2f1f',
    lightindigo: '#2e2540',

    textPrimary: '#e0e0e0',
    textSecondary: '#b0bec5',
    borderColor: '#fff',
    inputBorder: '#3c4a5a',
    containerBg: '#1e1e1e',
    background: '#121212',
    hoverColor: '#1f1f1f',
    surface: '#1e1e1e',

    grey100: '#fff',//'#b0bec5',
    grey200: '#fff',
    darkbg: '#fff',//'#121212',
    bglight: '#fff',//'#1e1e1e',
    bgdark: '#fff',//'#0d1117'
  }
};

