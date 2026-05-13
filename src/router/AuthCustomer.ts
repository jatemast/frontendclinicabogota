const AuthCustomerRoutes = {
  path: '/customer',
  component: () => import('@/layouts/blank/BlankLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [
    // {
    //   name: '',
    //   path: '',
    //   component: () => import('@/views/CustomerSystem/LoginByCode.vue')
    // },
    // {
    //   name: '',
    //   path: '/login',
    //   component: () => import('@/views/CustomerSystem/LoginByCode.vue')
    // },

  ]
};

export default AuthCustomerRoutes;