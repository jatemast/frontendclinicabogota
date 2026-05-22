/**
 * Archivo centralizado de endpoints de la API.
 * Todas las rutas deben definirse aquí para mantener consistencia.
 */
const BASE = import.meta.env.VITE_API_URL;

export const API = {
  // ============ AUTENTICACIÓN ============
  LOGIN: `${BASE}login`,

  // ============ USUARIOS ============
  USERS: {
    ALL: `${BASE}api/users/all`,
    ADD: `${BASE}api/users/add`,
    EDIT: (id: number | string) => `${BASE}api/users/edt/${id}`,
    UPDATE: (id: number | string) => `${BASE}api/users/upd/${id}`,
    DELETE: (id: number | string) => `${BASE}api/users/del/${id}`,
  },

  // ============ PERMISOS ============
  PERMISSIONS: {
    LIST: `${BASE}api/users/permissions/list`,
    VALIDATE: (moduleName: string) => `${BASE}api/users/validatepermission/${moduleName}`,
    VALIDATE_MASTER: `${BASE}api/users/validateMaster`,
  },

  // ============ ROLES ============
  ROLES: {
    ALL: `${BASE}api/roles/all`,
    ADD: `${BASE}api/roles/add`,
    EDIT: (id: number | string) => `${BASE}api/roles/edt/${id}`,
    UPDATE: (id: number | string) => `${BASE}api/roles/upd/${id}`,
    DELETE: (id: number | string) => `${BASE}api/roles/del/${id}`,
    ALL_MODULES: `${BASE}api/roles/allmodules`,
    PERMISSIONS: (id: number | string) => `${BASE}api/roles/allpermission/${id}`,
    ASSIGN_PERMISSIONS: (id: number | string) => `${BASE}api/roles/addpermission/${id}`,
  },

  // ============ CLIENTES ============
  CUSTOMERS: {
    ALL: `${BASE}api/customers/all`,
    ALL_FOR_COTY: `${BASE}api/customers/allforcoty`,
    ADD: `${BASE}api/customers/add`,
    EDIT: (id: number | string) => `${BASE}api/customers/edt/${id}`,
    UPDATE: (id: number | string) => `${BASE}api/customers/upd/${id}`,
  },

  // ============ EPS ============
  EPS: {
    ALL: `${BASE}api/eps/all`,
  },

  // ============ PROCEDIMIENTOS ============
  PROCEDURES: {
    ALL: `${BASE}api/procedures/all`,
    ALL_FOR_COTY: `${BASE}api/procedures/allforcoty`,
    ADD: `${BASE}api/procedures/add`,
  },

  // ============ COTIZACIONES ============
  QUOTES: {
    ALL: `${BASE}api/quotes/all`,
    ADD: `${BASE}api/quotes/add`,
    EDIT: (id: number | string) => `${BASE}api/quotes/edt/${id}`,
    UPDATE: (id: number | string) => `${BASE}api/quotes/upd/${id}`,
  },

  // ============ HISTORIAS CLÍNICAS ============
  MEDICAL_HISTORY: {
    ALL: `${BASE}api/medicalhistory/all`,
    GET: (id: number | string) => `${BASE}api/medicalhistory/get/${id}`,
    ADD: `${BASE}api/medicalhistory/add`,
    UPDATE: `${BASE}api/medicalhistory/upd`,
    HABITS: {
      ALL: (id: number | string) => `${BASE}api/medicalhistory/habits/all/${id}`,
      ADD: `${BASE}api/medicalhistory/habits/add`,
      DELETE: (id: number | string) => `${BASE}api/medicalhistory/habits/del/${id}`,
    },
  },

  // ============ DASHBOARD ============
  DASHBOARD: {
    FULL: `${BASE}api/dashboard/full`,
    MASTER: `${BASE}api/dashboard/master`,
  },

  // ============ CONTROL DE ACCESO ============
  ACCESS_CONTROL: {
    VERIFY_CODE: `${BASE}api/accesscontrol/verifycode`,
    ADD_LOG: `${BASE}api/accesscontrol/addlog`,
  },

  // ============ SAAS ============
  SAAS: {
    TENANTS: `${BASE}api/saas/tenants`,
    TENANT_DETAIL: (id: number | string) => `${BASE}api/saas/tenants/${id}`,
    MASTERS: `${BASE}api/saas/masters`,
    IMPERSONATE: (id: number | string) => `${BASE}api/saas/impersonate/${id}`,
  },
};
