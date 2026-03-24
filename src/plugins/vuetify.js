import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#1DB954',
          secondary: '#191414',
          surface: '#121212',
          background: '#0a0a0a',
          'surface-variant': '#1a1a1a',
          'on-surface': '#ffffff',
          'on-background': '#b3b3b3',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'text', color: 'primary' },
    VSlider: { color: 'primary', trackColor: 'grey-darken-2' },
    VList: { bgColor: 'transparent' },
  },
})
