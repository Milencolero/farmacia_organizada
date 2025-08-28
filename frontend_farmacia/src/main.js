import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import './assets/css/base.css'
import './assets/css/layout.css';
import '@/assets/css/modal.css';
import '@/assets/css/buttons.css';

const app = createApp(App);

app.use(createPinia()); // Estado global
app.use(router);        // Rutas

app.mount('#app');
