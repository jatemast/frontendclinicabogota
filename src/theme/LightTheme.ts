import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const BLUE_THEME: ThemeTypes = {
    name: 'BLUE_THEME',
    dark: false,
    variables: {
        'border-color': '#E5E7EB'
    },
    colors: {
        primary: '#18B6C9',
        secondary: '#0F766E',
        info: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444', 
        indigo: '#6366F1',
        lightprimary: '#E6F7F9',
        lightinfo: '#EFF6FF',
        lightsecondary: '#CCFBF1',
        lightsuccess: '#ECFDF5',
        lighterror: '#FEF2F2',
        lightwarning: '#FFFBEB',
        lightindigo: '#EEF2FF',
        textPrimary: '#1F2937',
        textSecondary: '#64748B',
        borderColor: '#E5E7EB',
        inputBorder: '#E5E7EB',
        containerBg: '#FFFFFF',
        background: '#F7F9FC',
        hoverColor: '#F1F5F9',
        surface: '#FFFFFF',
        grey100: '#64748B',
        grey200: '#1F2937',
        darkbg: '#1E293B',
        bglight: '#F8FAFC',
        bgdark: '#0F172A'
    }
};

export { BLUE_THEME };

