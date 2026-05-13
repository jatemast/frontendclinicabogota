const AuthRoutes = {
  path: '/',
  component: () => import('@/layouts/blank/BlankLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [

    {
      name: 'PublicLogin', 
      path: '', 
      component: () => import('@/views/Login/BoxedLogin.vue')
    },
    {
      name: 'LoginPath', 
      path: 'login', 
      component: () => import('@/views/Login/BoxedLogin.vue')
    },

    {
      name: 'EmployeeLoginFace',
      path: '/employee-login-face',
      component: () => import('@/components/auth/EmployeeLoginFace.vue')
    },

    // {
    //   name: 'Login',
    //   path: '/login',
    //   component: () => import('@/views/Technician/Login.vue')
    // },
    

    {
      name: 'AccessControl',
      path: '/access-control',
      component: () => import('@/views/AccessControl/AccessControl.vue')
    },
    {
      name: 'Register',
      path: '/register-business',
      component: () => import('@/views/Login/RegisterBusiness.vue')
    },

  ]
};

export default AuthRoutes;