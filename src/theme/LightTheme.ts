import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const BLUE_THEME: ThemeTypes = {
    name: 'BLUE_THEME',
    dark: false,
    variables: {
        'border-color': '#e5eaef'
    },
    colors: {
        primary: '#2eced5',
        info: '#eacc83',
        
        secondary: '#707a82',
        
        success: '#4bd08b',
        warning: '#ffa726',
        error: '#8e1b22', 
        indigo:'#8763da',
        lightprimary: '#e5f3fb',
        lightinfo:'#e1f5fa',
        lightsecondary: '#e7ecf0',
        lightsuccess: '#dffff3',
        lighterror: '#ffede9',
        lightwarning: '#fff6ea',
        lightindigo:'#f1ebff',
        textPrimary: '#2A3547',
        textSecondary: '#2A3547',
        borderColor: '#e5eaef',
        inputBorder: '#DFE5EF',
        containerBg: '#ffffff',
        background: '#f0f5f9',
        hoverColor: '#f6f9fc',
        surface: '#fff',
        grey100: '#707a82',
        grey200: '#111c2d',
        darkbg:'#2a3447',
        bglight:'#f5f8fb',
        bgdark:'#111c2d'
       
    }
};


export { BLUE_THEME};
