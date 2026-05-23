<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import Swal from 'sweetalert2';
import { API } from '@/api/endpoints';

const { notify } = useNotification();
const route = useRoute();
const router = useRouter();
const API_BASE = import.meta.env.VITE_API_URL;
const loading = ref(false);
const saving = ref(false);
const tenant = ref<any>(null);
const tab = ref('info');

// Formulario de edición
const editForm = ref({
    tx_name: '',
    tx_owner: '',
    tx_owner_email: '',
    tx_owner_phone: '',
    tx_address: '',
    date_validity: '',
    admin_password: '',
    tx_logo: null as File | null
});

const tenantId = computed(() => Number(route.params.id));

const fetchTenantDetail = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${API_BASE}api/saas/businesses/${tenantId.value}`);
        if (response.data.status) {
            tenant.value = response.data.data;
            // Llenar formulario de edición
            editForm.value = {
                tx_name: tenant.value.tx_name || '',
                tx_owner: tenant.value.tx_owner || '',
                tx_owner_email: tenant.value.tx_owner_email || '',
                tx_owner_phone: tenant.value.tx_owner_phone || '',
                tx_address: tenant.value.tx_address || '',
                date_validity: tenant.value.date_validity || '',
                admin_password: '',
                tx_logo: null
            };
        } else {
            notify('error', response.data.msg || 'Error al cargar detalle');
        }
    } catch (error) {
        notify('error', 'Error al cargar información del cliente');
    } finally {
        loading.value = false;
    }
};

const updateTenant = async () => {
    saving.value = true;
    try {
        const hasFile = editForm.value.tx_logo !== null && editForm.value.tx_logo !== undefined;
        let response;
        const url = `${API_BASE}api/saas/businesses/${tenantId.value}`;

        if (hasFile) {
            // Si hay archivo, usar FormData
            const formData = new FormData();
            const fields: (keyof typeof editForm.value)[] = [
                'tx_name', 'tx_owner', 'tx_owner_email', 'tx_owner_phone',
                'tx_address', 'date_validity', 'admin_password'
            ];
            
            fields.forEach(key => {
                const val = editForm.value[key];
                if (val !== null && val !== '') {
                    formData.append(key, val as string);
                }
            });

            if (editForm.value.tx_logo) {
                formData.append('tx_logo', editForm.value.tx_logo);
            }

            response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            // Sin archivo, enviar como JSON
            const payload: Record<string, any> = {};
            const fields: (keyof typeof editForm.value)[] = [
                'tx_name', 'tx_owner', 'tx_owner_email', 'tx_owner_phone',
                'tx_address', 'date_validity', 'admin_password'
            ];
            
            fields.forEach(key => {
                const val = editForm.value[key];
                if (val !== null && val !== '') {
                    payload[key] = val;
                }
            });

            response = await axios.post(url, payload);
        }

        if (response.data.status) {
            notify('success', response.data.msg);
            await fetchTenantDetail();
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al actualizar empresa');
    } finally {
        saving.value = false;
    }
};

const confirmDeleteUser = async (user: any) => {
    const result = await Swal.fire({
        title: '¿Desactivar usuario?',
        text: `El usuario "${user.tx_first_name} ${user.tx_last_name}" será desactivado.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.post(`${API_BASE}api/users/upd/${user.id}`, {
                ...user,
                in_status: 0
            });
            if (res.data.status) {
                Swal.fire('¡Desactivado!', res.data.msg, 'success');
                await fetchTenantDetail();
            }
        } catch (error) {
            notify('error', 'Error al desactivar usuario');
        }
    }
};

const confirmActivateUser = async (user: any) => {
    try {
        const res = await axios.post(`${API_BASE}api/users/upd/${user.id}`, {
            ...user,
            in_status: 1
        });
        if (res.data.status) {
            notify('success', 'Usuario activado exitosamente');
            await fetchTenantDetail();
        }
    } catch (error) {
        notify('error', 'Error al activar usuario');
    }
};

const goBack = () => {
    router.push('/saas/tenants');
};

const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const isExpired = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
};

const softDeleteTenant = async () => {
    if (!tenant.value) return;
    const result = await Swal.fire({
        title: '¿Mover a la papelera?',
        text: `La empresa "${tenant.value.tx_name}" podrá ser restaurada posteriormente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, mover a papelera',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.delete(`${API_BASE}api/saas/businesses/${tenantId.value}`);
            if (res.data.status) {
                Swal.fire('¡Eliminado!', res.data.msg, 'success');
                goBack();
            }
        } catch (error) {
            notify('error', 'Hubo un problema al procesar la solicitud');
        }
    }
};

const impersonateTenant = async () => {
    if (!tenant.value) return;
    const result = await Swal.fire({
        title: `Ver como ${tenant.value.tx_name}`,
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
            const res = await axios.post(API.SAAS.IMPERSONATE(tenantId.value));
            if (res.data.status) {
                const currentToken = localStorage.getItem('access_token');
                localStorage.setItem('master_token', currentToken as string);
                localStorage.setItem('access_token', res.data.access_token);
                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('id_business', tenantId.value.toString());
                localStorage.setItem('is_master', '0');

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
    fetchTenantDetail();
});
</script>

<template>
    <div>
        <!-- Header -->
        <div class="d-flex align-center mb-4">
            <v-btn icon="mdi-arrow-left" variant="text" class="mr-2" @click="goBack"></v-btn>
            <div class="flex-grow-1">
                <div class="text-h5 font-weight-bold" v-if="tenant">
                    {{ tenant.tx_name }}
                </div>
                <div class="text-caption text-medium-emphasis" v-if="tenant">
                    ID: {{ tenant.id }} • Creado: {{ formatDate(tenant.date_add) }}
                </div>
            </div>
            <!-- Acciones rápidas -->
            <div v-if="tenant">
                <v-btn
                    color="info"
                    variant="outlined"
                    prepend-icon="mdi-eye-outline"
                    class="mr-2"
                    @click="impersonateTenant"
                >
                    Ver como Cliente
                </v-btn>
                <v-btn
                    color="error"
                    variant="outlined"
                    prepend-icon="mdi-delete-outline"
                    @click="softDeleteTenant"
                >
                    Mover a Papelera
                </v-btn>
            </div>
        </div>

        <v-row>
            <v-col cols="12">
                <v-card v-if="loading" class="d-flex justify-center pa-10">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-card>

                <template v-if="!loading && tenant">
                    <!-- Tabs -->
                    <v-card>
                        <v-tabs v-model="tab" color="primary" grow>
                            <v-tab value="info">
                                <v-icon start>mdi-information-outline</v-icon>
                                Información General
                            </v-tab>
                            <v-tab value="edit">
                                <v-icon start>mdi-pencil-outline</v-icon>
                                Editar / Actualizar
                            </v-tab>
                            <v-tab value="users">
                                <v-icon start>mdi-account-group-outline</v-icon>
                                Usuarios ({{ tenant.users?.length || 0 }})
                            </v-tab>
                        </v-tabs>

                        <v-divider></v-divider>

                        <!-- Tab: Información General -->
                        <v-tabs-window v-model="tab">
                            <v-tabs-window-item value="info">
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12" md="4" class="text-center">
                                            <v-avatar size="120" color="grey-lighten-3" class="mb-3">
                                                <v-img v-if="tenant.tx_logo" :src="tenant.tx_logo" cover></v-img>
                                                <span v-else class="text-h3">{{ tenant.tx_name?.charAt(0) }}</span>
                                            </v-avatar>
                                        </v-col>
                                        <v-col cols="12" md="8">
                                            <v-row>
                                                <v-col cols="12" md="6">
                                                    <div class="text-caption text-medium-emphasis">Nombre de la Empresa</div>
                                                    <div class="text-body-1 font-weight-medium mb-3">{{ tenant.tx_name }}</div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <div class="text-caption text-medium-emphasis">Propietario</div>
                                                    <div class="text-body-1 font-weight-medium mb-3">{{ tenant.tx_owner }}</div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <div class="text-caption text-medium-emphasis">Email del Propietario</div>
                                                    <div class="text-body-1 font-weight-medium mb-3">{{ tenant.tx_owner_email }}</div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <div class="text-caption text-medium-emphasis">Teléfono</div>
                                                    <div class="text-body-1 font-weight-medium mb-3">{{ tenant.tx_owner_phone }}</div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <div class="text-caption text-medium-emphasis">Dirección</div>
                                                    <div class="text-body-1 font-weight-medium mb-3">{{ tenant.tx_address || '—' }}</div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <div class="text-caption text-medium-emphasis">Válido Hasta</div>
                                                    <div class="text-body-1 font-weight-medium mb-3">
                                                        <v-chip
                                                            :color="isExpired(tenant.date_validity) ? 'error' : 'success'"
                                                            size="small"
                                                            variant="flat"
                                                        >
                                                            {{ formatDate(tenant.date_validity) }}
                                                        </v-chip>
                                                    </div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <div class="text-caption text-medium-emphasis">Usuario Admin</div>
                                                    <div class="text-body-1 font-weight-medium mb-3">{{ tenant.tx_username || '—' }}</div>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <div class="text-caption text-medium-emphasis">Email Admin</div>
                                                    <div class="text-body-1 font-weight-medium mb-3">{{ tenant.admin_email || '—' }}</div>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>

                                    <v-divider class="my-4"></v-divider>

                                    <!-- Stats Cards -->
                                    <v-row>
                                        <v-col cols="12" md="4">
                                            <v-card variant="outlined" class="pa-4 text-center">
                                                <v-icon color="primary" size="40" class="mb-2">mdi-account-group</v-icon>
                                                <div class="text-h4 font-weight-bold">{{ tenant.users?.length || 0 }}</div>
                                                <div class="text-caption text-medium-emphasis">Usuarios del Sistema</div>
                                            </v-card>
                                        </v-col>
                                        <v-col cols="12" md="4">
                                            <v-card variant="outlined" class="pa-4 text-center">
                                                <v-icon color="success" size="40" class="mb-2">mdi-account-heart</v-icon>
                                                <div class="text-h4 font-weight-bold">{{ tenant.customers_count || 0 }}</div>
                                                <div class="text-caption text-medium-emphasis">Clientes (Pacientes)</div>
                                            </v-card>
                                        </v-col>
                                        <v-col cols="12" md="4">
                                            <v-card variant="outlined" class="pa-4 text-center">
                                                <v-icon color="warning" size="40" class="mb-2">mdi-file-document-outline</v-icon>
                                                <div class="text-h4 font-weight-bold">{{ tenant.quotes_count || 0 }}</div>
                                                <div class="text-caption text-medium-emphasis">Cotizaciones</div>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-tabs-window-item>

                            <!-- Tab: Editar -->
                            <v-tabs-window-item value="edit">
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editForm.tx_name" label="Nombre de la Empresa" variant="outlined"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editForm.tx_owner" label="Propietario" variant="outlined"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editForm.tx_owner_email" label="Email Propietario" variant="outlined"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editForm.tx_owner_phone" label="Teléfono" variant="outlined"></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field v-model="editForm.tx_address" label="Dirección" variant="outlined"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editForm.date_validity" type="date" label="Válido Hasta" variant="outlined"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                v-model="editForm.admin_password"
                                                type="password"
                                                label="Nueva Contraseña Admin (Opcional)"
                                                variant="outlined"
                                                hint="Dejar vacío para no cambiar la contraseña"
                                                persistent-hint
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-file-input
                                                v-model="editForm.tx_logo"
                                                accept="image/png, image/jpeg, image/jpg"
                                                label="Logo de la Empresa (Opcional)"
                                                variant="outlined"
                                                prepend-icon="mdi-camera"
                                                show-size
                                            ></v-file-input>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="text" @click="tab = 'info'">Cancelar</v-btn>
                                    <v-btn color="primary" :loading="saving" @click="updateTenant">
                                        <v-icon start>mdi-content-save</v-icon>
                                        Guardar Cambios
                                    </v-btn>
                                </v-card-actions>
                            </v-tabs-window-item>

                            <!-- Tab: Usuarios -->
                            <v-tabs-window-item value="users">
                                <v-card-text>
                                    <v-data-table
                                        :headers="[
                                            { title: 'ID', key: 'id', align: 'center', sortable: true, width: '70px' },
                                            { title: 'Nombre', key: 'tx_first_name', sortable: true },
                                            { title: 'Apellido', key: 'tx_last_name', sortable: true },
                                            { title: 'Email', key: 'tx_email', sortable: true },
                                            { title: 'Usuario', key: 'tx_username', sortable: true },
                                            { title: 'Tipo', key: 'tx_user_type', sortable: true },
                                            { title: 'Rol', key: 'tx_rol', sortable: true },
                                            { title: 'Estado', key: 'in_status', align: 'center', sortable: true },
                                            { title: 'Acciones', key: 'actions', align: 'center', sortable: false }
                                        ]"
                                        :items="tenant.users || []"
                                        :loading="loading"
                                        loading-text="Cargando usuarios..."
                                        no-data-text="No hay usuarios registrados para esta empresa"
                                        class="elevation-0"
                                    >
                                        <template v-slot:item.tx_first_name="{ item }">
                                            <div class="d-flex align-center">
                                                <v-avatar size="32" color="primary" class="mr-2">
                                                    <span class="text-white text-caption">{{ item?.raw?.tx_first_name?.charAt(0) }}{{ item?.raw?.tx_last_name?.charAt(0) }}</span>
                                                </v-avatar>
                                                <span class="font-weight-medium">{{ item?.raw?.tx_first_name }}</span>
                                            </div>
                                        </template>

                                        <template v-slot:item.in_status="{ item }">
                                            <v-chip
                                                :color="item?.raw?.in_status == 1 ? 'success' : 'error'"
                                                size="small"
                                                variant="flat"
                                            >
                                                {{ item?.raw?.in_status == 1 ? 'Activo' : 'Inactivo' }}
                                            </v-chip>
                                        </template>

                                        <template v-slot:item.actions="{ item }">
                                            <div class="d-flex ga-1 justify-center">
                                                <v-btn
                                                    v-if="item?.raw?.in_status == 1"
                                                    icon="mdi-block-helper"
                                                    size="small"
                                                    color="error"
                                                    variant="text"
                                                    title="Desactivar usuario"
                                                    @click="confirmDeleteUser(item?.raw)"
                                                ></v-btn>
                                                <v-btn
                                                    v-else
                                                    icon="mdi-check-circle-outline"
                                                    size="small"
                                                    color="success"
                                                    variant="text"
                                                    title="Activar usuario"
                                                    @click="confirmActivateUser(item?.raw)"
                                                ></v-btn>
                                            </div>
                                        </template>
                                    </v-data-table>
                                </v-card-text>
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-card>
                </template>
            </v-col>
        </v-row>
    </div>
</template>
