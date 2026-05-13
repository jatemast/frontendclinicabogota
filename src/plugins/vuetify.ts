import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { BLUE_THEME } from '@/theme/LightTheme';
import { DARK_THEME } from '@/theme/DarkTheme';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

export default createVuetify({
  components,
  directives,

  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },

  theme: {
    defaultTheme: 'BLUE_THEME',
    themes: {
      BLUE_THEME,
      DARK_THEME,
    }
  },

  defaults: {
    VCard: { rounded: 'xl' },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VListItem: { minHeight: '45px' },
    VTooltip: { location: 'top' }
  }
});

