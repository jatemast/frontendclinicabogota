import { ref } from 'vue';
import axios from 'axios';
import { API } from '@/api/endpoints';

// Estado global reactivo
export const userPermissions = ref<string[]>([]);

/**
 * Determina si el usuario actual es master (SuperAdmin).
 * El master tiene acceso TOTAL a todo sin restricción de permisos.
 */
export const isMaster = (): boolean => {
    return localStorage.getItem('is_master') === 'true';
};

/**
 * Refresca los permisos del usuario actual desde el backend.
 * Debe llamarse después del login y después de cambiar permisos de un rol.
 */
export const refreshPermissions = async () => {
    try {
        const res = await axios.get(API.PERMISSIONS.LIST);
        if (res.data.status && Array.isArray(res.data.data)) {
            userPermissions.value = res.data.data;
        } else {
            userPermissions.value = [];
        }
    } catch (error) {
        console.error("Error actualizando los permisos del menú", error);
        userPermissions.value = []; // Limpiar permisos ante error para evitar datos inconsistentes
    }
};

/**
 * Verifica si el usuario tiene un permiso específico.
 * El MASTER (SuperAdmin) siempre tiene todos los permisos.
 * Útil para mostrar/ocultar botones y acciones a nivel de UI.
 * @param permission - Nombre del permiso (ej: 'Modulo de Roles', 'Clientes')
 * @returns true si el usuario tiene el permiso o es master
 */
export const can = (permission: string): boolean => {
    if (isMaster()) return true; // Master tiene acceso total
    return userPermissions.value.includes(permission);
};

/**
 * Verifica si el usuario tiene TODOS los permisos especificados.
 * El MASTER (SuperAdmin) siempre retorna true.
 * @param permissions - Array de nombres de permisos
 * @returns true si el usuario tiene todos los permisos o es master
 */
export const canAll = (...permissions: string[]): boolean => {
    if (isMaster()) return true; // Master tiene acceso total
    return permissions.every(p => userPermissions.value.includes(p));
};

/**
 * Verifica si el usuario tiene ALGUNO de los permisos especificados.
 * El MASTER (SuperAdmin) siempre retorna true.
 * @param permissions - Array de nombres de permisos
 * @returns true si el usuario tiene al menos uno o es master
 */
export const canAny = (...permissions: string[]): boolean => {
    if (isMaster()) return true; // Master tiene acceso total
    return permissions.some(p => userPermissions.value.includes(p));
};
