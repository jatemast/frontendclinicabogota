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
    UPLOAD_SIGNATURE: `${BASE}api/users/uploadsignature`,
    ME: `${BASE}api/users/me`,
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
    DELETE: (id: number | string) => `${BASE}api/customers/del/${id}`,
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
    ALL: `${BASE}api/coty/all`,
    ADD: `${BASE}quotes/add`,
    EDIT: (id: number | string) => `${BASE}quotes/edt/${id}`,
    UPDATE: (id: number | string) => `${BASE}quotes/upd/${id}`,
  },

  // ============ HISTORIAS CLÍNICAS ============
  MEDICAL_HISTORY: {
    ALL: `${BASE}api/medicalhistory/all`,
    GET: (id: number | string) => `${BASE}api/medicalhistory/get/${id}`,
    ADD: `${BASE}api/medicalhistory/add`,
    UPDATE: `${BASE}api/medicalhistory/upd`,
    APPROVE: (id: number | string) => `${BASE}api/medicalhistory/approve/${id}`,
    CLOSE: (id: number | string) => `${BASE}api/medicalhistory/close/${id}`,
    TIMELINE: (id: number | string) => `${BASE}api/medicalhistory/timeline/${id}`,
    HABITS: {
      ALL: (id: number | string) => `${BASE}api/medicalhistory/habits/all/${id}`,
      ADD: `${BASE}api/medicalhistory/habits/add`,
      DELETE: (id: number | string) => `${BASE}api/medicalhistory/habits/del/${id}`,
    },
    PRESCRIPTIONS: {
      ALL: (id: number | string) => `${BASE}api/medicalhistory/prescriptions/all/${id}`,
      ADD: `${BASE}api/medicalhistory/prescriptions/add`,
      DELETE: (id: number | string) => `${BASE}api/medicalhistory/prescriptions/del/${id}`,
    },
    PRESCRIPTION_PDF: (id: number | string) => `${BASE}api/medicalhistory/prescription-pdf/${id}`,
    PDF: (id: number | string) => `${BASE}api/medicalhistory/pdf/${id}`,
  },

  // ============ PRECLÍNICA ============
  PRECLINICA: {
    ALL: `${BASE}api/preclinica/all`,
    GET: (id: number | string) => `${BASE}api/preclinica/get/${id}`,
    ADD: `${BASE}api/preclinica/add`,
    UPDATE: `${BASE}api/preclinica/upd`,
    DELETE: (id: number | string) => `${BASE}api/preclinica/del/${id}`,
    BY_HISTORY: (id: number | string) => `${BASE}api/preclinica/byhistory/${id}`,
  },

  // ============ POSTOPERATORIOS (Postclínica) ============
  POSTCLINICA: {
    ALL: `${BASE}api/postclinica/all`,
    GET: (id: number | string) => `${BASE}api/postclinica/get/${id}`,
    ADD: `${BASE}api/postclinica/add`,
    UPDATE: `${BASE}api/postclinica/upd`,
    CLOSE: (id: number | string) => `${BASE}api/postclinica/close/${id}`,
    DELETE: (id: number | string) => `${BASE}api/postclinica/del/${id}`,
    BY_HISTORY: (id: number | string) => `${BASE}api/postclinica/byhistory/${id}`,
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
