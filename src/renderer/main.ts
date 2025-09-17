import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.css';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App);

// Use Pinia for state management
const pinia = createPinia();
app.use(pinia);
app.use(ElementPlus)
app.mount('#app');
