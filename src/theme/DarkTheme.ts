import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

export const DARK_THEME: ThemeTypes = {
  name: 'DARK_THEME',
  dark: true,
  variables: {
    'border-color': 'rgba(255, 255, 255, 0.12)'
  },
  colors: {
    primary: '#18B6C9',
    secondary: '#0F766E',
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    indigo: '#818CF8',

    lightprimary: 'rgba(24, 182, 201, 0.18)',
    lightinfo: 'rgba(59, 130, 246, 0.18)',
    lightsecondary: 'rgba(15, 118, 110, 0.18)',
    lightsuccess: 'rgba(16, 185, 129, 0.18)',
    lighterror: 'rgba(239, 68, 68, 0.18)',
    lightwarning: 'rgba(245, 158, 11, 0.18)',
    lightindigo: 'rgba(129, 140, 248, 0.18)',

    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    inputBorder: 'rgba(255, 255, 255, 0.18)',
    containerBg: '#111A2E',
    background: '#0B1120',
    hoverColor: '#1E293B',
    surface: '#111A2E',

    grey100: '#94A3B8',
    grey200: '#F8FAFC',
    darkbg: '#0B1120',
    bglight: '#1E293B',
    bgdark: '#070C18'
  }
};


