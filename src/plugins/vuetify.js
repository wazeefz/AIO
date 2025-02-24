// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import 'primeicons/primeicons.css'

// Composables
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'primary',
    themes: {
      primary: {
        colors: {
          primaryBrown: '#EAE3D6',
          secondaryBrown: '#B1A184',
          thirdBrown: '#B8805F',
          primaryGrey: '#5D7285',
          secondaryGrey: '#9D9D9D',
          primaryBlack: '#1E1E1E',
          secondaryBlack: '#000000',
        },
      },
    },
  },
  typography: {
    defaultFont: 'Poppins',
  },
})
