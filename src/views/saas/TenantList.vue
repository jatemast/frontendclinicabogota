<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import Swal from 'sweetalert2';

interface Module {
    id: string | number;
    tx_name: string;
    tx_module: string;
}

const router = useRouter();

const { notify } = useNotification();
const loading = ref(false);
const tenants = ref([]);
const API_BASE = import.meta.env.VITE_API_URL;
const dialog = ref(false);
const isRecycleBin = ref(false); // Toggle to show deleted tenants
const search = ref(''); // Real-time search

// Módulos disponibles para asignar permisos
const modules = ref<Module[]>([]);
const selectedModules = ref<number[]>([]);
const loadingModules = ref(false);

// Agrupar módulos por tx_module (ej: Gestión, Reportes, etc.)
const groupedModules = computed(() => {
    return modules.value.reduce((acc, item) => {
        const group = item.tx_module || 'Otros';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {} as Record<string, Module[]>);
});

const isGroupSelected = (groupItems: Module[]) => {
    return groupItems.every(item => selectedModules.value.includes(Number(item.id)));
};

const toggleGroup = (groupItems: Module[]) => {
    const ids = groupItems.map(item => Number(item.id));
    if (isGroupSelected(groupItems)) {
        selectedModules.value = selectedModules.value.filter(id => !ids.includes(id));
    } else {
        const newIds = ids.filter(id => !selectedModules.value.includes(id));
        selectedModules.value.push(...newIds);
    }
};

const form = ref({
    id: null,
    tx_name: '',
    tx_owner: '',
    tx_owner_email: '',
    tx_owner_phone: '',
    tx_address: '',
    date_validity: '',
    admin_password: '',
    tx_logo: null as File | null
});

const isEditing = computed(() => form.value.id !== null);
const page = computed(() => ({ title: isRecycleBin.value ? 'Papelera de Reciclaje' : 'Empresas (Tenants)' }));

const fetchTenants = async () => {
    loading.value = true;
    try {
        console.log('🔄 Fetching tenants...');
        const response = await axios.get(`${API_BASE}api/saas/businesses`);
        console.log('📦 API Response:', response.data);
        if (response.data.status) {
            const allTenants = response.data.data;
            console.log('📋 All tenants from API:', allTenants);
            if (isRecycleBin.value) {
                tenants.value = allTenants.filter((t: any) => t.is_deleted == 1);
            } else {
                tenants.value = allTenants.filter((t: any) => t.is_deleted == 0);
            }
            console.log('✅ Tenants asignados:', tenants.value);
            console.log('🔢 Cantidad:', tenants.value.length);
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        console.error('❌ Error en fetchTenants:', error);
        notify('error', 'Error al cargar empresas');
    } finally {
        loading.value = false;
    }
};

const toggleRecycleBin = () => {
    isRecycleBin.value = !isRecycleBin.value;
    fetchTenants();
};

const fetchModules = async () => {
    loadingModules.value = true;
    try {
        const res = await axios.get(`${API_BASE}api/saas/modules`);
        if (res.data.status) {
            modules.value = res.data.data || [];
        }
    } catch (error) {
        console.error('Error al cargar módulos:', error);
    } finally {
        loadingModules.value = false;
    }
};

const openAddModal = async () => {
    form.value = { id: null, tx_name: '', tx_owner: '', tx_owner_email: '', tx_owner_phone: '', tx_address: '', date_validity: '', admin_password: '', tx_logo: null };
    selectedModules.value = [];
    // Cargar módulos disponibles
    await fetchModules();
    dialog.value = true;
};

const openEditModal = async (tenant: any) => {
    if (!tenant || !tenant.id) {
        notify('error', 'No se pudo identificar la empresa seleccionada');
        return;
    }
    form.value = {
        id: tenant.id,
        tx_name: tenant.tx_name,
        tx_owner: tenant.tx_owner,
        tx_owner_email: tenant.tx_owner_email,
        tx_owner_phone: tenant.tx_owner_phone,
        tx_address: tenant.tx_address,
        date_validity: tenant.date_validity,
        admin_password: '', // Leave blank unless they want to change
        tx_logo: null
    };
    selectedModules.value = [];
    // Abrir el modal inmediatamente
    dialog.value = true;
    // Cargar módulos disponibles y los permisos actuales del tenant en segundo plano
    fetchModules();
    try {
        const res = await axios.get(`${API_BASE}api/saas/businesses/${tenant.id}/permissions`);
        if (res.data.status) {
            selectedModules.value = res.data.data || [];
        }
    } catch (error) {
        console.error('Error al cargar permisos del tenant:', error);
    }
};

const saveTenant = async () => {
    loading.value = true;
    try {
        const formData = new FormData();
        Object.keys(form.value).forEach(key => {
            const val = form.value[key as keyof typeof form.value];
            if (val !== null && val !== '') {
                if (key === 'tx_logo' && Array.isArray(val) && val.length > 0) {
                    formData.append(key, val[0]);
                } else if (key !== 'tx_logo') {
                    formData.append(key, val as string);
                }
            }
        });

        // Agregar módulos seleccionados como JSON string (para FormData)
        if (selectedModules.value.length > 0) {
            formData.append('id_modules', JSON.stringify(selectedModules.value));
        }

        const url = isEditing.value ? `${API_BASE}api/saas/businesses/${form.value.id}` : `${API_BASE}api/saas/businesses`;
        const response = await axios.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.status) {
            notify('success', response.data.msg);
            dialog.value = false;
            fetchTenants();
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al guardar empresa');
    } finally {
        loading.value = false;
    }
};

const softDeleteTenant = async (tenant: any) => {
    if (!tenant || !tenant.id) {
        notify('error', 'No se pudo identificar la empresa seleccionada');
        return;
    }
    const result = await Swal.fire({
        title: '¿Mover a la papelera?',
        text: `La empresa "${tenant.tx_name || 'Sin nombre'}" podrá ser restaurada posteriormente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, mover a papelera',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.delete(`${API_BASE}api/saas/businesses/${tenant.id}`);
            if (res.data.status) {
                Swal.fire('¡Eliminado!', res.data.msg, 'success');
                fetchTenants();
            }
        } catch (error) {
            notify('error', 'Hubo un problema al procesar la solicitud');
        }
    }
};

const restoreTenant = async (tenant: any) => {
    if (!tenant || !tenant.id) {
        notify('error', 'No se pudo identificar la empresa seleccionada');
        return;
    }
    const result = await Swal.fire({
        title: '¿Restaurar empresa?',
        text: `La empresa "${tenant.tx_name || 'Sin nombre'}" volverá a estar activa.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.post(`${API_BASE}api/saas/businesses/${tenant.id}/restore`);
            if (res.data.status) {
                Swal.fire('¡Restaurada!', res.data.msg, 'success');
                fetchTenants();
            }
        } catch (error) {
            notify('error', 'Hubo un problema al restaurar');
        }
    }
};

const forceDeleteTenant = async (tenant: any) => {
    if (!tenant || !tenant.id) {
        notify('error', 'No se pudo identificar la empresa seleccionada');
        return;
    }
    const result = await Swal.fire({
        title: '¿Eliminar permanentemente?',
        text: `¡ATENCIÓN! La empresa "${tenant.tx_name || 'Sin nombre'}" será borrada físicamente de la base de datos junto con toda su información. Esta acción NO se puede deshacer.`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'ELIMINAR DEFINITIVAMENTE',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.delete(`${API_BASE}api/saas/businesses/${tenant.id}/force`);
            if (res.data.status) {
                Swal.fire('Borrado', res.data.msg, 'success');
                fetchTenants();
            }
        } catch (error) {
            notify('error', 'Hubo un problema con la eliminación permanente');
        }
    }
};

const viewTenantDetail = (tenant: any) => {
    if (!tenant || !tenant.id) {
        notify('error', 'No se pudo identificar la empresa seleccionada');
        return;
    }
    router.push(`/saas/tenants/${tenant.id}`);
};

const impersonateTenant = async (tenant: any) => {
    if (!tenant || !tenant.id) {
        notify('error', 'No se pudo identificar la empresa seleccionada');
        return;
    }
    const result = await Swal.fire({
        title: `Ver como ${tenant.tx_name || 'Sin nombre'}`,
        text: `Vas a ingresar al sistema como administrador de esta empresa. Podrás regresar al modo Master en cualquier momento.`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#17a2b8',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Entrar como cliente',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.post(`${API_BASE}api/saas/impersonate/${tenant.id}`);
            if (res.data.status) {
                const currentToken = localStorage.getItem('access_token');
                // Guardar el token maestro para poder volver
                localStorage.setItem('master_token', currentToken as string);
                
                // Reemplazar la sesión actual
                localStorage.setItem('access_token', res.data.access_token);
                localStorage.setItem('id_business', tenant.id);
                localStorage.setItem('is_master', '0'); // Ya no eres master en la sesión actual
                
                Swal.fire('Cambiando de Modo...', '', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (error) {
            notify('error', 'No se pudo iniciar la impersonación');
        }
    }
};

onMounted(() => {
    fetchTenants();
});
</script>

<template>
    <div class="d-flex justify-space-between align-center mb-4">
        <div class="text-h5 font-weight-bold">
            {{ page.title }}
        </div>
        <div>
            <v-btn 
                :color="isRecycleBin ? 'primary' : 'error'" 
                :prepend-icon="isRecycleBin ? 'mdi-arrow-left' : 'mdi-delete'" 
                variant="outlined" 
                class="mr-2"
                @click="toggleRecycleBin"
            >
                {{ isRecycleBin ? 'Ver Empresas Activas' : 'Papelera de Reciclaje' }}
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddModal" v-if="!isRecycleBin">
                Nueva Empresa
            </v-btn>
        </div>
    </div>

    <v-row>
        <v-col cols="12">
            <UiParentCard title="Administración de Clientes">
                <!-- Buscador rápido -->
                <template v-slot:action>
                    <v-text-field
                        v-model="search"
                        append-inner-icon="mdi-magnify"
                        label="Buscar cliente..."
                        single-line
                        hide-details
                        variant="outlined"
                        density="compact"
                        style="max-width: 300px;"
                    ></v-text-field>
                </template>

                <v-data-table
                    :headers="[
                        { title: 'ID', align: 'start', key: 'id' },
                        { title: 'Empresa', align: 'start', key: 'tx_name' },
                        { title: 'Propietario', align: 'start', key: 'tx_owner' },
                        { title: 'Admin Login', align: 'start', key: 'tx_username' },
                        { title: 'Válido Hasta', align: 'start', key: 'date_validity' },
                        { title: 'Estado', align: 'center', key: 'is_deleted' },
                        { title: 'Acciones', align: 'end', key: 'actions', sortable: false }
                    ]"
                    :items="tenants"
                    :search="search"
                    class="elevation-0"
                    :loading="loading"
                    loading-text="Cargando empresas..."
                    no-data-text="No hay empresas registradas"
                >
                    <template v-slot:item.tx_name="{ item }">
                        <div class="d-flex align-center">
                            <v-avatar size="32" class="mr-2" color="grey-lighten-3">
                                <v-img v-if="item?.raw?.tx_logo" :src="item?.raw?.tx_logo"></v-img>
                                <span v-else>{{ item?.raw?.tx_name?.charAt(0) }}</span>
                            </v-avatar>
                            <div>
                                <div class="font-weight-medium">{{ item?.raw?.tx_name }}</div>
                                <div class="text-caption text-medium-emphasis">{{ item?.raw?.admin_email }}</div>
                            </div>
                        </div>
                    </template>

                    <template v-slot:item.is_deleted="{ item }">
                        <v-chip v-if="item?.raw?.is_deleted == 1" color="error" size="small" variant="flat">
                            Eliminado
                        </v-chip>
                        <v-chip v-else color="success" size="small" variant="flat">
                            Activo
                        </v-chip>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-menu location="start">
                            <template v-slot:activator="{ props }">
                                <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
                            </template>
                            <v-list density="compact" nav>
                                <template v-if="!isRecycleBin">
                                    <v-list-item prepend-icon="mdi-file-document-outline" title="Ver Información Completa" @click="() => viewTenantDetail(item?.raw)"></v-list-item>
                                    <v-list-item prepend-icon="mdi-eye-outline" title="Ver como Cliente" @click="() => impersonateTenant(item?.raw)"></v-list-item>
                                    <v-list-item prepend-icon="mdi-pencil-outline" title="Editar / Actualizar" @click="() => openEditModal(item?.raw)"></v-list-item>
                                    <v-divider></v-divider>
                                    <v-list-item prepend-icon="mdi-delete-outline" base-color="error" title="Mover a Papelera" @click="() => softDeleteTenant(item?.raw)"></v-list-item>
                                </template>
                                <template v-else>
                                    <v-list-item prepend-icon="mdi-restore" base-color="success" title="Restaurar Empresa" @click="() => restoreTenant(item?.raw)"></v-list-item>
                                    <v-divider></v-divider>
                                    <v-list-item prepend-icon="mdi-delete-forever" base-color="error" title="Eliminar Permanentemente" @click="() => forceDeleteTenant(item?.raw)"></v-list-item>
                                </template>
                            </v-list>
                        </v-menu>
                    </template>
                </v-data-table>
            </UiParentCard>
        </v-col>
    </v-row>

    <!-- Modal Formulario -->
    <v-dialog v-model="dialog" max-width="750" scrollable>
        <v-card>
            <v-card-title>{{ isEditing ? 'Actualizar Empresa' : 'Registrar Nueva Empresa' }}</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_name" label="Nombre de la Empresa" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_owner" label="Propietario" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_owner_email" label="Email Propietario" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_owner_phone" label="Teléfono" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="form.tx_address" label="Dirección" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.date_validity" type="date" label="Válido Hasta" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.admin_password" :label="isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña del Admin'" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-file-input
                            v-model="form.tx_logo"
                            accept="image/png, image/jpeg, image/jpg"
                            label="Logo de la Empresa (Opcional)"
                            variant="outlined"
                            prepend-icon="mdi-camera"
                            show-size
                        ></v-file-input>
                    </v-col>

                    <!-- Selector de Módulos -->
                    <v-col cols="12">
                        <v-divider class="mb-3"></v-divider>
                        <div class="text-subtitle-1 font-weight-bold mb-2">
                            Módulos del Sistema
                            <v-chip size="small" color="primary" class="ml-2">
                                {{ selectedModules.length }} seleccionados
                            </v-chip>
                        </div>
                        <div class="text-caption text-medium-emphasis mb-3">
                            Selecciona los módulos a los que el cliente tendrá acceso
                        </div>
                        <v-progress-linear v-if="loadingModules" indeterminate color="primary" class="mb-3"></v-progress-linear>
                        <div v-else-if="modules.length === 0" class="text-caption text-medium-emphasis">
                            No hay módulos disponibles
                        </div>
                        <v-card v-else variant="outlined" class="pa-3">
                            <div v-for="(groupItems, groupName) in groupedModules" :key="groupName" class="mb-2">
                                <div class="d-flex align-center mb-1">
                                    <v-switch
                                        :model-value="isGroupSelected(groupItems)"
                                        @update:model-value="toggleGroup(groupItems)"
                                        :label="groupName"
                                        density="compact"
                                        hide-details
                                        color="primary"
                                        class="mt-0 pt-0"
                                        style="flex: 1;"
                                    ></v-switch>
                                </div>
                                <div class="d-flex flex-wrap ml-4">
                                    <div v-for="mod in groupItems" :key="mod.id" class="mr-4 mb-1">
                                        <v-checkbox
                                            v-model="selectedModules"
                                            :value="Number(mod.id)"
                                            :label="mod.tx_name"
                                            density="compact"
                                            hide-details
                                            color="primary"
                                            class="mt-0 pt-0"
                                        ></v-checkbox>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="text" @click="dialog = false">Cancelar</v-btn>
                <v-btn color="primary" :loading="loading" @click="saveTenant">Guardar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
