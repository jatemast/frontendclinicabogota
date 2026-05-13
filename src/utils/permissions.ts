import { ref } from 'vue';
import axios from 'axios';

// Estado global reactivo
export const userPermissions = ref<string[]>([]);

// Función para refrescar los permisos que puede ser llamada desde cualquier lugar
export const refreshPermissions = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/users/permissions/list`);
        if (res.data.status) {
            userPermissions.value = res.data.data;
        }
    } catch (error) {
        console.error("Error actualizando los permisos del menú", error);
    }
};