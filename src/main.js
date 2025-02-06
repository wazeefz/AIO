/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import vuetify from './plugins/vuetify'

//CSS
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@/styles/settings.scss' // Import the SCSS settings

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)

app.use(vuetify)

app.mount('#app')
