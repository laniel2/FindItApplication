import { createApp } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/main.css';
import App from './App.vue';
import router from './router';
import { useAuth } from './composables/useAuth';

// Re-check the saved login (from localStorage) with the server on every page load.
useAuth().refresh();

createApp(App).use(router).mount('#app');
