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
 * Determina si el usuario actual está en modo personificación (impersonating).
 * Esto ocurre cuando un master ha entrado a un tenant/cliente y hay un master_token guardado.
 */
export const isImpersonating = (): boolean => {
    return !!localStorage.getItem('master_token');
};

/**
 * Refresca los permisos del usuario actual desde el backend.
 * Debe llamarse después del login y después de cambiar permisos de un rol.
 * Si estamos en modo personificación y el endpoint falla, asumimos que el
 * usuario personificado tiene acceso completo (como admin del tenant).
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
        // Si estamos personificando y el endpoint falla, asumimos acceso completo
        // porque el backend del cliente puede no tener este endpoint
        if (isImpersonating()) {
            console.warn("Modo personificación: asumiendo acceso completo por fallo en refreshPermissions");
            userPermissions.value = []; // Vacío, pero can() manejará la personificación
        } else {
            userPermissions.value = []; // Limpiar permisos ante error para evitar datos inconsistentes
        }
    }
};

/**
 * Verifica si el usuario tiene un permiso específico.
 * El MASTER (SuperAdmin) siempre tiene todos los permisos.
 * En modo personificación, si no hay permisos cargados, asume acceso completo
 * para que el usuario personificado pueda ver el sidebar y navegar.
 * Útil para mostrar/ocultar botones y acciones a nivel de UI.
 * @param permission - Nombre del permiso (ej: 'Modulo de Roles', 'Clientes')
 * @returns true si el usuario tiene el permiso o es master
 */
export const can = (permission: string): boolean => {
    if (isMaster()) return true; // Master tiene acceso total
    // En personificación, si no hay permisos cargados, asumir acceso completo
    if (isImpersonating() && userPermissions.value.length === 0) return true;
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
    if (isImpersonating() && userPermissions.value.length === 0) return true;
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
    if (isImpersonating() && userPermissions.value.length === 0) return true;
    return permissions.some(p => userPermissions.value.includes(p));
};
