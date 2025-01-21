/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import 'primeicons/primeicons.css'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'primary',
    themes: {
      primary: {
        colors: {
          primaryBrown: '#EAE3D6',
          secondaryBrown: '#B1A184',
          primaryGrey: '#5D7285',
          secondaryGrey: '#9D9D9D',
          primaryBlack: '#1E1E1E',
          secondaryBlack: '#000000',
        },
      },
    },
  },
})
