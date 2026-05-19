import { createRouter, createWebHashHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import AuthCustomerRoutes from './AuthCustomer'; // El que tú creaste
import ClientRoutes from './ClientRoutes'; // El nuevo portal
import { useNotification } from '@/utils/useNotification';
import axios from 'axios';

const { notify } = useNotification();

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/Login/Error.vue')
    },
    MainRoutes,
    AuthRoutes,
    AuthCustomerRoutes,
    ClientRoutes
  ]
});

router.beforeEach(async (to, from, next) => {

  // Obtenemos si la ruta destino es de cliente o staff
  // Usamos find para buscar en la jerarquía de rutas matcheadas
  const isClientRoute = to.matched.some(record => record.meta.isClient);
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // CORRECCIÓN DE SCOPE: Declaramos la variable fuera de los bloques
  let expiration: number = 0;

  if (isClientRoute) {
    expiration = Number(localStorage.getItem('customer_token_expiration'));
  } else {
    expiration = Number(localStorage.getItem('token_expiration'));
  }

  const isAuthenticated = expiration && Date.now() < expiration;

  // 1. SI LA RUTA REQUIERE AUTENTICACIÓN
  if (requiresAuth) {
    if (!isAuthenticated) {
      localStorage.clear();
      if (from.path !== '/' && from.path !== '/customer/') notify('error', 'Session expired.');
      
      // Si falló en una ruta de cliente, vuelve a su login, si no al login de staff
      return isClientRoute ? next('/customer/') : next('/');
    }

    // 2. LOGICA PARA RUTAS DE STAFF (isClient: false o undefined)
    if (!isClientRoute) {
      if (to.meta.masterOnly) {
        const isMaster = localStorage.getItem('is_master');
        // Acepta 'true' (booleano) o '1' (numérico) como master
        if (isMaster !== 'true' && isMaster !== '1') {
          notify('error', 'Access denied. Master only.');
          return next('/dashboard');
        }
        return next();
      }

      const moduleName = to.meta.module;
      if (moduleName) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}api/users/validatepermission/${moduleName}`);
          if (res.data.status) return next();
          
          notify('error', res.data.msg || 'Access denied');
          return next('/dashboard'); 
        } catch (err) {
          // Si hay error de red o 401/403, limpiar y sacar
          return next('/');
        }
      }
      return next();
    }

    // 3. LOGICA PARA RUTAS DE CLIENTE (isClient: true)
    if (isClientRoute) {
        // Aquí no validamos módulos, solo que esté autenticado
        return next();
    }

  } else {
    // 4. RUTAS PÚBLICAS (Logins)
    if (isAuthenticated) {
      // Si el usuario ya está logueado e intenta ir a un Login...
      if (to.path === '/') return next('/dashboard'); 
      if (to.path === '/login') return next('/dashboard'); 
      
      if (to.path === '/customer/') return next('/portal/dashboard');
    }
    next();
  }
});

