const ClientRoutes = {
  path: '/portal',
  component: () => import('@/layouts/full/LayoutCustomer.vue'),// Un layout diferente para clientes
  meta: { requiresAuth: true, isClient: true }, // Marcamos que es ruta de cliente
  children: [
    // {
    //   path: 'dashboard',
    //   component: () => import('@/views/CustomerSystem/Dashboard.vue')
    // },

  ]
};
export default ClientRoutes;