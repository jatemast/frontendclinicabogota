const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true , isClient: false
    },
    redirect: '/main',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [

        {
            name: 'Dashboard',
            path: '/dashboard',
            component: () => import('@/views/dashboard/index.vue'),
            // meta: {
            //   requiresAuth: false,
            //   module: 'Dashboard'
            // }
        },

        {
          name: 'Eps',
          path: '/eps',
          component: () => import('@/views/Eps/Eps.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Eps'
          }
        },

        {
          name: 'Customers',
          path: '/customers',
          component: () => import('@/views/Customers/Customers.vue'),
          meta: {
            requiresAuth: true,
            module: 'Clientes',
            masterOnly: true
          }
        },
        {
          name: 'CustomersAdd',
          path: '/customers-add',
          component: () => import('@/views/Customers/Add.vue'),
          meta: {
            requiresAuth: true,
            module: 'Clientes',
            masterOnly: true
          }
        },
        {
          name: 'CustomersEdt',
          path: '/customers-edt/:id',
          component: () => import('@/views/Customers/Edt.vue'),
          meta: {
            requiresAuth: true,
            module: 'Clientes',
            masterOnly: true
          }
        },

        // Procedures
        {
          name: 'Procedures',
          path: '/procedures',
          component: () => import('@/views/Procedure/Procedure.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Procedimientos'
          }
        },
        {
          name: 'ProceduresAdd',
          path: '/procedures-add',
          component: () => import('@/views/Procedure/Add.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Procedimientos'
          }
        },

        // Coty
        {
          name: 'Coty',
          path: '/quotes',
          component: () => import('@/views/Coty/Coty.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Cotizaciones'
          }
        },
        {
          name: 'CotyAdd',
          path: '/quotes-add',
          component: () => import('@/views/Coty/Add.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Cotizaciones'
          }
        },
        {  
          name: 'CotyEdt',
          path: '/quotes-edt/:id',
          component: () => import('@/views/Coty/Edt.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Cotizaciones'
          }
        },

        // Medical History
        {
          name: 'MedicalHistory',
          path: '/medical-history',
          component: () => import('@/views/MedicalHistory/MedicalHistory.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Historias Clinicas'
          }
        },
        {
          name: 'MedicalHistoryAdd',
          path: '/medical-history-add',
          component: () => import('@/views/MedicalHistory/Add.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Historias Clinicas'
          }
        },
        {
          name: 'MedicalHistoryView',
          path: '/medical-history-view/:id',
          component: () => import('@/views/MedicalHistory/History.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Historias Clinicas'
          }
        },

        {
          name: 'Users',
          path: '/users',
          component: () => import('@/views/Users/Users.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Usuarios'
          }
        },
        {
          name: 'UsersAdd',
          path: '/users-add',
          component: () => import('@/views/Users/Add.vue'),
          meta: {
            requiresAuth: true,
            module: 'Crear Usuario'
          }
        },
        {  
          name: 'UsersEdt',
          path: '/users-edt/:id',
          component: () => import('@/views/Users/Edt.vue'),
          meta: {
            requiresAuth: true,
            module: 'Listado de Usuarios'
          }
        },

        {
          name: 'Roles',
          path: '/roles',
          component: () => import('@/views/Roles/Roles.vue'),
          meta: {
            requiresAuth: true,
            module: 'Modulo de Roles'
          }
        },
        {
          name: 'RolesAdd',
          path: '/roles-add',
          component: () => import('@/views/Roles/Add.vue'),
          meta: {
            requiresAuth: true,
            module: 'Modulo de Roles'
          }
        },
        {  
          name: 'RolesEdt',
          path: '/roles-edt/:id',
          component: () => import('@/views/Roles/Edt.vue'),
          meta: {
            requiresAuth: true,
            module: 'Modulo de Roles'
          }
        },
        {  
          name: 'RolesPermission',
          path: '/roles-permission/:id',
          component: () => import('@/views/Roles/Permission.vue'),
          meta: {
            requiresAuth: true,
            module: 'Modulo de Roles'
          }
        },

        {
          name: 'SystemConfig',
          path: '/systemconfig',
          component: () => import('@/views/SystemConfig/SystemConfig.vue'),
          meta: {
            requiresAuth: true,
            module: 'Sistema'
          }
        },

        {
          name: 'AccessLogs',
          path: '/access-logs',
          component: () => import('@/views/Users/AccessLogs.vue'),
          meta: {
            requiresAuth: true,
            module: 'Historial de Accesos'
          }
        },

        {
          name: 'SaasTenants',
          path: '/saas/tenants',
          component: () => import('@/views/saas/TenantList.vue'),
          meta: {
            requiresAuth: true,
            masterOnly: true
          }
        },
        
        {
          name: 'SaasMasters',
          path: '/saas/masters',
          component: () => import('@/views/saas/MasterList.vue'),
          meta: {
            requiresAuth: true,
            masterOnly: true
          }
        },

    ]

};

export default MainRoutes;
