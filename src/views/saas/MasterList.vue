<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const { notify } = useNotification();
const loading = ref(false);
const masters = ref<any[]>([]);
const API_BASE = import.meta.env.VITE_API_URL;

// Diálogo crear
const dialogCreate = ref(false);
const formCreate = ref({
    tx_first_name: '',
    tx_last_name: '',
    tx_email: '',
    tx_password: ''
});

// Diálogo editar
const dialogEdit = ref(false);
const editingId = ref<number | null>(null);
const formEdit = ref({
    tx_first_name: '',
    tx_last_name: '',
    tx_email: '',
    tx_password: '',
    in_status: 1
});

// Diálogo eliminar
const dialogDelete = ref(false);
const deletingId = ref<number | null>(null);
const deletingName = ref('');

const page = ref({ title: 'Gestión de Masters' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '/dashboard' },
    { text: 'SaaS Admin', disabled: true, href: '#' },
    { text: 'Masters', disabled: true, href: '#' }
]);

// Obtener ID del usuario actual desde el token JWT (almacenado en cookie)
const getCurrentUserId = (): number | null => {
    try {
        const cookies = document.cookie.split('; ');
        const tokenCookie = cookies.find(c => c.startsWith('access_token='));
        if (!tokenCookie) return null;
        const token = tokenCookie.split('=')[1];
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload?.data?.id_user || null;
    } catch {
        return null;
    }
};

const currentUserId = ref<number | null>(getCurrentUserId());

const loadMasters = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${API_BASE}api/saas/masters`);
        if (response.data.status) {
            masters.value = response.data.data;
        } else {
            notify('error', response.data.msg || 'Error al cargar masters');
        }
    } catch (error: any) {
        notify('error', error.response?.data?.msg || 'Error al cargar lista de masters');
    } finally {
        loading.value = false;
    }
};

const saveMaster = async () => {
    loading.value = true;
    try {
        const response = await axios.post(`${API_BASE}api/saas/master`, formCreate.value);
        if (response.data.status) {
            notify('success', response.data.msg);
            dialogCreate.value = false;
            Object.keys(formCreate.value).forEach(key => formCreate.value[key as keyof typeof formCreate.value] = '');
            await loadMasters();
        } else {
            notify('error', response.data.msg);
        }
    } catch (error: any) {
        notify('error', error.response?.data?.msg || 'Error al crear usuario master');
    } finally {
        loading.value = false;
    }
};

const openEditDialog = async (id: number) => {
    loading.value = true;
    try {
        const response = await axios.get(`${API_BASE}api/saas/masters/${id}`);
        if (response.data.status) {
            const master = response.data.data;
            editingId.value = master.id;
            formEdit.value = {
                tx_first_name: master.tx_first_name || '',
                tx_last_name: master.tx_last_name || '',
                tx_email: master.tx_email || '',
                tx_password: '',
                in_status: master.in_status ?? 1
            };
            dialogEdit.value = true;
        } else {
            notify('error', response.data.msg);
        }
    } catch (error: any) {
        notify('error', error.response?.data?.msg || 'Error al cargar datos del master');
    } finally {
        loading.value = false;
    }
};

const updateMaster = async () => {
    if (!editingId.value) return;
    
    // Protección: no permitir modificarse a sí mismo
    if (editingId.value === currentUserId.value) {
        notify('error', 'No puedes modificar tu propio usuario. Solicita a otro SuperAdmin que lo haga.');
        return;
    }

    loading.value = true;
    try {
        const payload: any = {
            tx_first_name: formEdit.value.tx_first_name,
            tx_last_name: formEdit.value.tx_last_name,
            tx_email: formEdit.value.tx_email,
            in_status: formEdit.value.in_status
        };
        if (formEdit.value.tx_password) {
            payload.tx_password = formEdit.value.tx_password;
        }

        const response = await axios.post(`${API_BASE}api/saas/masters/upd/${editingId.value}`, payload);
        if (response.data.status) {
            notify('success', response.data.msg);
            dialogEdit.value = false;
            await loadMasters();
        } else {
            notify('error', response.data.msg);
        }
    } catch (error: any) {
        notify('error', error.response?.data?.msg || 'Error al actualizar master');
    } finally {
        loading.value = false;
    }
};

const confirmDelete = (id: number, name: string) => {
    // Protección: no permitir eliminarse a sí mismo
    if (id === currentUserId.value) {
        notify('error', 'No puedes eliminar tu propio usuario. Solicita a otro SuperAdmin que lo haga.');
        return;
    }
    deletingId.value = id;
    deletingName.value = name;
    dialogDelete.value = true;
};

const deleteMaster = async () => {
    if (!deletingId.value) return;
    loading.value = true;
    try {
        const response = await axios.post(`${API_BASE}api/saas/masters/del/${deletingId.value}`);
        if (response.data.status) {
            notify('success', response.data.msg);
            dialogDelete.value = false;
            deletingId.value = null;
            deletingName.value = '';
            await loadMasters();
        } else {
            notify('error', response.data.msg);
        }
    } catch (error: any) {
        notify('error', error.response?.data?.msg || 'Error al eliminar master');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadMasters();
});
</script>

<template>
    <div class="mb-4 text-h5 font-weight-bold">
        {{ page.title }}
    </div>

    <v-row>
        <v-col cols="12">
            <UiParentCard title="Usuarios SuperAdmin (Master)">
                <template v-slot:action>
                    <v-btn color="primary" @click="dialogCreate = true">Nuevo Master</v-btn>
                </template>

                <v-data-table
                    :headers="[
                        { title: 'ID', key: 'id', align: 'center', sortable: true },
                        { title: 'Nombre', key: 'tx_first_name', sortable: true },
                        { title: 'Apellido', key: 'tx_last_name', sortable: true },
                        { title: 'Email', key: 'tx_email', sortable: true },
                        { title: 'Usuario', key: 'tx_username', sortable: true },
                        { title: 'Estado', key: 'in_status', align: 'center', sortable: true },
                        { title: 'Acciones', key: 'actions', align: 'center', sortable: false }
                    ]"
                    :items="masters"
                    :loading="loading"
                    loading-text="Cargando masters..."
                    no-data-text="No hay usuarios master registrados"
                    class="elevation-1"
                >
                    <template v-slot:item.in_status="{ item }">
                        <v-chip
                            :color="item.in_status == 1 ? 'success' : 'error'"
                            size="small"
                            variant="flat"
                        >
                            {{ item.in_status == 1 ? 'Activo' : 'Inactivo' }}
                        </v-chip>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex ga-2 justify-center">
                            <v-btn
                                icon="mdi-pencil"
                                size="small"
                                color="primary"
                                variant="text"
                                @click="openEditDialog(item.id)"
                                :title="'Editar ' + item.tx_first_name"
                            ></v-btn>
                            <v-btn
                                icon="mdi-delete"
                                size="small"
                                color="error"
                                variant="text"
                                @click="confirmDelete(item.id, item.tx_first_name + ' ' + item.tx_last_name)"
                                :title="'Eliminar ' + item.tx_first_name"
                            ></v-btn>
                        </div>
                    </template>
                </v-data-table>
            </UiParentCard>
        </v-col>
    </v-row>

    <!-- Diálogo Crear Master -->
    <v-dialog v-model="dialogCreate" max-width="500">
        <v-card>
            <v-card-title>Crear Nuevo Master</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="formCreate.tx_first_name" label="Nombre" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="formCreate.tx_last_name" label="Apellido" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="formCreate.tx_email" label="Correo Electrónico" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="formCreate.tx_password" type="password" label="Contraseña" variant="outlined"></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="text" @click="dialogCreate = false">Cancelar</v-btn>
                <v-btn color="primary" :loading="loading" @click="saveMaster">Crear</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Diálogo Editar Master -->
    <v-dialog v-model="dialogEdit" max-width="500">
        <v-card>
            <v-card-title>Editar Master</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="formEdit.tx_first_name" label="Nombre" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="formEdit.tx_last_name" label="Apellido" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="formEdit.tx_email" label="Correo Electrónico" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="formEdit.tx_password" type="password" label="Nueva Contraseña (dejar vacío para no cambiar)" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-select
                            v-model="formEdit.in_status"
                            :items="[
                                { title: 'Activo', value: 1 },
                                { title: 'Inactivo', value: 0 }
                            ]"
                            label="Estado"
                            variant="outlined"
                            item-title="title"
                            item-value="value"
                        ></v-select>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="text" @click="dialogEdit = false">Cancelar</v-btn>
                <v-btn color="primary" :loading="loading" @click="updateMaster">Guardar Cambios</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Diálogo Confirmar Eliminación -->
    <v-dialog v-model="dialogDelete" max-width="400">
        <v-card>
            <v-card-title class="text-error">
                <v-icon color="error" class="me-2">mdi-alert-circle</v-icon>
                Confirmar Eliminación
            </v-card-title>
            <v-card-text>
                ¿Estás seguro de eliminar al usuario master <strong>{{ deletingName }}</strong>?
                <br><br>
                <small class="text-medium-emphasis">Esta acción no se puede deshacer.</small>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="secondary" variant="text" @click="dialogDelete = false">Cancelar</v-btn>
                <v-btn color="error" :loading="loading" @click="deleteMaster">Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
