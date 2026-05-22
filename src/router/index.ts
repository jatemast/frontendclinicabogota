import { createRouter, createWebHashHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import AuthCustomerRoutes from './AuthCustomer';
import ClientRoutes from './ClientRoutes';
import { useNotification } from '@/utils/useNotification';
import { userPermissions, refreshPermissions, isMaster, isImpersonating } from '@/utils/permissions';
import { API } from '@/api/endpoints';
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
      // --- MASTER (SuperAdmin) tiene acceso TOTAL a TODO ---
      if (isMaster()) {
        return next();
      }

      // --- Validación mejorada de masterOnly contra backend ---
      if (to.meta.masterOnly) {
        try {
          const res = await axios.get(API.PERMISSIONS.VALIDATE_MASTER);
          if (res.data.status && res.data.isMaster) {
            return next();
          }
          notify('error', 'Access denied. Master only.');
          return next('/dashboard');
        } catch (err) {
          notify('error', 'Access denied. Master only.');
          return next('/dashboard');
        }
      }

      const moduleName = to.meta.module as string | undefined;
      if (moduleName) {
        // --- CACHÉ DE PERMISOS: primero revisar en memoria ---
        if (userPermissions.value.includes(moduleName)) {
          return next();
        }

        // Si no está en caché, refrescar permisos y reintentar
        await refreshPermissions();
        
        if (userPermissions.value.includes(moduleName)) {
          return next();
        }

        // --- MODO PERSONIFICACIÓN: si estamos personificando y no hay permisos cargados,
        // asumir acceso completo (el backend del cliente puede no tener endpoint de permisos)
        if (isImpersonating() && userPermissions.value.length === 0) {
          return next();
        }

        // Si aún no tiene permiso, denegar acceso
        notify('error', `No tienes permiso para acceder a este módulo`);
        return next('/dashboard');
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
