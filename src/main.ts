import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueApexCharts from "vue3-apexcharts";
import VueTablerIcons from 'vue-tabler-icons';
import Maska from 'maska';
import axios from 'axios';
import Toast, { useToast } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// --- CONFIGURACIÓN DE AXIOS ---
const toast = useToast();

axios.defaults.withCredentials = true; 
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Interceptor para incluir el token de autenticación en cada solicitud
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar sesiones expiradas
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      
      // 1. Detectamos si el usuario estaba en el portal de clientes o en el de staff
      const isClientRoute = router.currentRoute.value.matched.some(record => record.meta.isClient);
      
      // 2. Limpiamos las expiraciones correspondientes
      if (isClientRoute) {
        localStorage.removeItem('customer_token_expiration');
      } else {
        localStorage.removeItem('token_expiration');
      }

      // 3. Redirección Inteligente
      // Solo redirigimos si no estamos ya en una de las pantallas de login
      const currentPath = router.currentRoute.value.path;
      if (currentPath !== '/' && currentPath !== '/customer') {
        
        toast.error('Session expired. Please log in again.');
        
        if (isClientRoute) {
          router.push('/customer'); // Login de clientes
        } else {
          router.push('/'); // Login de staff
        }
      }
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);

// Plugins
app.use(router);
app.use(PerfectScrollbar);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(Maska);

// Componentes Globales
app.component('apexchart', VueApexCharts);

// Configuración de Toast
app.use(Toast, {
  position: 'top-center',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  icon: true,
  theme: 'colored'
});

app.use(vuetify).mount('#app');
