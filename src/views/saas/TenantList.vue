<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import Swal from 'sweetalert2';
import { API } from '@/api/endpoints';

interface Module {
    id: string | number;
    tx_name: string;
    tx_module: string;
}

const router = useRouter();
const { notify } = useNotification();
const loading = ref(false);
const tenants = ref<any[]>([]);
const API_BASE = import.meta.env.VITE_API_URL;
const dialog = ref(false);
const isRecycleBin = ref(false);
const search = ref('');

// Módulos disponibles
const modules = ref<Module[]>([]);
const selectedModules = ref<number[]>([]);
const loadingModules = ref(false);

const groupedModules = computed(() => {
    return modules.value.reduce((acc, item) => {
        const group = item.tx_module || 'General';
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

// Tipos de cliente / empresa
const customerTypes = ref<any[]>([]);
const fetchCustomerTypes = async () => {
    try {
        const res = await axios.get(`${API_BASE}api/saas/customer-types`);
        if (res.data.status) {
            customerTypes.value = res.data.data || [];
        }
    } catch (err) {
        console.error('Error al cargar tipos de cliente:', err);
    }
};

const form = ref({
    id: null,
    tx_name: '',
    id_customer_type: 1,
    tx_owner: '',
    tx_owner_email: '',
    tx_owner_phone: '',
    tx_address: '',
    date_validity: '',
    admin_password: '',
    tx_logo: null as File | null
});

const isEditing = computed(() => form.value.id !== null);

const fetchTenants = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${API_BASE}api/saas/businesses`);
        if (response.data.status) {
            const allTenants = response.data.data || [];
            if (isRecycleBin.value) {
                tenants.value = allTenants.filter((t: any) => t.is_deleted == 1);
            } else {
                tenants.value = allTenants.filter((t: any) => t.is_deleted == 0);
            }
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
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
    form.value = { id: null, tx_name: '', id_customer_type: 1, tx_owner: '', tx_owner_email: '', tx_owner_phone: '', tx_address: '', date_validity: '', admin_password: '', tx_logo: null };
    selectedModules.value = [];
    await Promise.all([fetchModules(), fetchCustomerTypes()]);
    dialog.value = true;
};

const extractTenantData = (item: any): any => {
    if (!item) return null;
    if (item.item && (item.item.id !== undefined)) return item.item;
    if (item.raw && (item.raw.id !== undefined)) return item.raw;
    if (item.id !== undefined) return item;
    return null;
};

const openEditModal = async (tenantInput: any) => {
    const tenant = extractTenantData(tenantInput);
    if (!tenant || !tenant.id) {
        notify('error', 'No se pudo identificar la empresa seleccionada');
        return;
    }
    form.value = {
        id: tenant.id,
        tx_name: tenant.tx_name,
        id_customer_type: Number(tenant.id_customer_type) || 1,
        tx_owner: tenant.tx_owner,
        tx_owner_email: tenant.tx_owner_email,
        tx_owner_phone: tenant.tx_owner_phone,
        tx_address: tenant.tx_address,
        date_validity: tenant.date_validity,
        admin_password: '',
        tx_logo: null
    };
    selectedModules.value = [];
    dialog.value = true;
    fetchModules();
    fetchCustomerTypes();
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
        const hasFile = form.value.tx_logo && Array.isArray(form.value.tx_logo) && form.value.tx_logo.length > 0;
        let response;
        const url = isEditing.value ? `${API_BASE}api/saas/businesses/${form.value.id}` : `${API_BASE}api/saas/businesses`;

        if (hasFile) {
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
            if (selectedModules.value.length > 0) {
                formData.append('id_modules', JSON.stringify(selectedModules.value));
            }
            response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            const payload: Record<string, any> = {};
            Object.keys(form.value).forEach(key => {
                const val = form.value[key as keyof typeof form.value];
                if (val !== null && val !== '' && key !== 'tx_logo') {
                    payload[key] = val;
                }
            });
            if (selectedModules.value.length > 0) {
                payload.id_modules = selectedModules.value;
            }
            response = await axios.post(url, payload);
        }
        
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

const softDeleteTenant = async (tenantInput: any) => {
    const tenant = extractTenantData(tenantInput);
    if (!tenant || !tenant.id) return;
    const result = await Swal.fire({
        title: '¿Mover a la papelera?',
        text: `La empresa "${tenant.tx_name || 'Sin nombre'}" podrá ser restaurada posteriormente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'Sí, mover a papelera',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.delete(`${API_BASE}api/saas/businesses/${tenant.id}`);
            if (res.data.status) {
                Swal.fire('¡En papelera!', res.data.msg, 'success');
                fetchTenants();
            }
        } catch (error) {
            notify('error', 'Hubo un problema al procesar la solicitud');
        }
    }
};

const restoreTenant = async (tenantInput: any) => {
    const tenant = extractTenantData(tenantInput);
    if (!tenant || !tenant.id) return;
    const result = await Swal.fire({
        title: '¿Restaurar empresa?',
        text: `La empresa "${tenant.tx_name || 'Sin nombre'}" volverá a estar activa.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#64748B',
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

const forceDeleteTenant = async (tenantInput: any) => {
    const tenant = extractTenantData(tenantInput);
    if (!tenant || !tenant.id) return;
    const result = await Swal.fire({
        title: '¿Eliminar permanentemente?',
        text: `¡ATENCIÓN! La empresa "${tenant.tx_name || 'Sin nombre'}" será borrada físicamente de la base de datos.`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#64748B',
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

const viewTenantDetail = (tenantInput: any) => {
    const tenant = extractTenantData(tenantInput);
    if (!tenant || !tenant.id) return;
    router.push(`/saas/tenants/${tenant.id}`);
};

const impersonateTenant = async (tenantInput: any) => {
    const tenant = extractTenantData(tenantInput);
    if (!tenant || !tenant.id) return;
    const result = await Swal.fire({
        title: `Ver como ${tenant.tx_name || 'Sin nombre'}`,
        text: `Ingresarás como administrador de esta empresa. Podrás regresar al modo Master cuando quieras.`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#18B6C9',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'Ingresar como cliente',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.post(API.SAAS.IMPERSONATE(tenant.id));
            if (res.data.status) {
                const currentToken = localStorage.getItem('access_token');
                localStorage.setItem('master_token', currentToken as string);
                localStorage.setItem('access_token', res.data.access_token);
                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('id_business', tenant.id);
                localStorage.setItem('is_master', '0');
                
                Swal.fire('Cambiando de Modo...', '', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 800);
            }
        } catch (error) {
            notify('error', 'No se pudo iniciar la impersonación');
        }
    }
};

const getRow = (item: any): any => {
    if (!item) return {};
    if (item.raw) return item.raw;
    if (item.item) return item.item;
    return item;
};

const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Sin fecha';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

onMounted(() => {
    fetchTenants();
});
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header Banner LogicSurgi Style -->
    <v-card elevation="0" rounded="xl" class="border bg-surface mb-6 pa-5">
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4">
        <div class="d-flex align-center gap-4">
          <v-avatar color="lightprimary" size="56" rounded="lg">
            <v-icon color="primary" size="28">mdi-domain</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h4 font-weight-bold text-primary mb-1">
              {{ isRecycleBin ? 'Papelera de Reciclaje' : 'Empresas Registradas (Tenants)' }}
            </h2>
            <p class="text-body-2 text-secondary mb-0">
              {{ isRecycleBin ? 'Empresas eliminadas temporalmente que pueden ser restauradas.' : 'Administra los clientes SaaS, licencias y módulos del sistema.' }}
            </p>
          </div>
        </div>

        <div class="d-flex align-center gap-3">
          <v-btn
            :color="isRecycleBin ? 'primary' : 'error'"
            variant="tonal"
            rounded="lg"
            class="font-weight-bold"
            @click="toggleRecycleBin"
          >
            <v-icon start size="18">{{ isRecycleBin ? 'mdi-arrow-left' : 'mdi-delete-outline' }}</v-icon>
            {{ isRecycleBin ? 'Ver Empresas Activas' : 'Papelera' }}
          </v-btn>

          <v-btn
            v-if="!isRecycleBin"
            color="primary"
            variant="flat"
            rounded="lg"
            class="font-weight-bold px-5"
            @click="openAddModal"
          >
            <v-icon start size="18">mdi-plus</v-icon>
            Nueva Empresa
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Content Card & Data Table -->
    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5">
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4 mb-5">
        <div class="d-flex align-center gap-2">
          <v-chip color="primary" variant="tonal" class="font-weight-bold">
            Total: {{ tenants.length }}
          </v-chip>
        </div>

        <!-- Buscador estilizado -->
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar por empresa, propietario o email..."
          single-line
          hide-details
          variant="outlined"
          density="comfortable"
          rounded="lg"
          style="max-width: 360px;"
        ></v-text-field>
      </div>

      <v-data-table
        :headers="[
          { title: 'Empresa', align: 'start', key: 'tx_name' },
          { title: 'Tipo de Empresa', align: 'start', key: 'customer_type_name' },
          { title: 'Propietario', align: 'start', key: 'tx_owner' },
          { title: 'Teléfono / Dirección', align: 'start', key: 'tx_owner_phone' },
          { title: 'Válido Hasta', align: 'start', key: 'date_validity' },
          { title: 'Estado', align: 'center', key: 'is_deleted' },
          { title: 'Acciones', align: 'end', key: 'actions', sortable: false }
        ]"
        :items="tenants"
        :search="search"
        class="elevation-0 bg-transparent"
        :loading="loading"
        loading-text="Cargando empresas..."
        no-data-text="No hay empresas registradas"
      >
        <!-- Columna Empresa con Avatar / Logo -->
        <template v-slot:item.tx_name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="42" rounded="lg" color="lightprimary" class="mr-3 border">
              <v-img v-if="getRow(item).tx_logo || getRow(item).tx_logo_url" :src="getRow(item).tx_logo_url || getRow(item).tx_logo"></v-img>
              <span v-else class="text-subtitle-1 font-weight-bold text-primary">{{ (getRow(item).tx_name || 'E').charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-subtitle-2 text-primary">{{ getRow(item).tx_name || 'Sin nombre' }}</div>
              <div class="text-caption text-secondary">{{ getRow(item).tx_owner_email || getRow(item).admin_email || getRow(item).email || 'Sin email registrado' }}</div>
            </div>
          </div>
        </template>

        <!-- Columna Tipo de Empresa -->
        <template v-slot:item.customer_type_name="{ item }">
          <v-chip color="primary" size="small" variant="tonal" class="font-weight-bold">
            {{ getRow(item).customer_type_name || 'Clínica' }}
          </v-chip>
        </template>

        <!-- Columna Propietario -->
        <template v-slot:item.tx_owner="{ item }">
          <div class="font-weight-medium text-body-2">{{ getRow(item).tx_owner || 'Sin asignar' }}</div>
        </template>

        <!-- Columna Teléfono / Dirección -->
        <template v-slot:item.tx_owner_phone="{ item }">
          <div>
            <div class="font-weight-medium text-caption">{{ getRow(item).tx_owner_phone || getRow(item).phone || getRow(item).tx_phone || 'N/A' }}</div>
            <div class="text-caption text-secondary">{{ getRow(item).tx_address || 'Sin dirección' }}</div>
          </div>
        </template>

        <!-- Columna Válido Hasta -->
        <template v-slot:item.date_validity="{ item }">
          <v-chip color="info" size="small" variant="tonal" class="font-weight-bold">
            <v-icon start size="14">mdi-calendar-clock</v-icon>
            {{ formatDateDisplay(getRow(item).date_validity) }}
          </v-chip>
        </template>

        <!-- Columna Estado -->
        <template v-slot:item.is_deleted="{ item }">
          <v-chip v-if="getRow(item).is_deleted == 1" color="error" size="small" variant="flat" class="font-weight-bold">
            Eliminado
          </v-chip>
          <v-chip v-else color="success" size="small" variant="flat" class="font-weight-bold">
            Activo
          </v-chip>
        </template>

        <!-- Columna Acciones -->
        <template v-slot:item.actions="{ item }">
          <v-menu location="bottom end" transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="tonal" color="primary" size="small" rounded="lg" v-bind="props"></v-btn>
            </template>
            <v-list density="comfortable" nav rounded="lg" class="elevation-4 border bg-surface">
              <template v-if="!isRecycleBin">
                <v-list-item prepend-icon="mdi-file-document-outline" title="Ver Información" @click="viewTenantDetail(item)"></v-list-item>
                <v-list-item prepend-icon="mdi-incognito" title="Ingresar como Cliente" @click="impersonateTenant(item)"></v-list-item>
                <v-list-item prepend-icon="mdi-pencil-outline" title="Editar Empresa" @click="openEditModal(item)"></v-list-item>
                <v-divider class="my-1"></v-divider>
                <v-list-item prepend-icon="mdi-delete-outline" base-color="error" title="Mover a Papelera" @click="softDeleteTenant(item)"></v-list-item>
              </template>
              <template v-else>
                <v-list-item prepend-icon="mdi-restore" base-color="success" title="Restaurar Empresa" @click="restoreTenant(item)"></v-list-item>
                <v-divider class="my-1"></v-divider>
                <v-list-item prepend-icon="mdi-delete-forever" base-color="error" title="Eliminar Definitivamente" @click="forceDeleteTenant(item)"></v-list-item>
              </template>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal Formulario (Estilo LogicSurgi) -->
    <v-dialog v-model="dialog" max-width="720" scrollable>
      <v-card rounded="xl" class="border bg-surface">
        <v-card-title class="pa-5 border-bottom d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-3">
            <v-avatar color="lightprimary" size="40" rounded="lg">
              <v-icon color="primary" size="20">{{ isEditing ? 'mdi-pencil-outline' : 'mdi-plus' }}</v-icon>
            </v-avatar>
            <span class="text-h5 font-weight-bold text-primary">
              {{ isEditing ? 'Actualizar Empresa' : 'Registrar Nueva Empresa' }}
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.tx_name" label="Nombre de la Empresa *" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.id_customer_type"
                :items="customerTypes.length > 0 ? customerTypes : [{ id: 1, tx_name: 'Clínica' }, { id: 2, tx_name: 'Estética' }]"
                item-title="tx_name"
                item-value="id"
                label="Tipo de Empresa *"
                variant="outlined"
                rounded="lg"
                density="comfortable"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.tx_owner" label="Propietario / Director *" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.tx_owner_email" label="Email Propietario *" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.tx_owner_phone" label="Teléfono de Contacto" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.tx_address" label="Dirección de la Clínica" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.date_validity" type="date" label="Válido Hasta" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.admin_password" :label="isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña Admin *'" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="form.tx_logo"
                accept="image/png, image/jpeg, image/jpg"
                label="Logo de la Empresa (Opcional)"
                variant="outlined"
                rounded="lg"
                prepend-inner-icon="mdi-camera"
                prepend-icon=""
                show-size
                density="comfortable"
              ></v-file-input>
            </v-col>

            <!-- Selector de Módulos -->
            <v-col cols="12">
              <v-divider class="mb-4"></v-divider>
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-subtitle-1 font-weight-bold text-primary">Módulos Habilitados</span>
                <v-chip size="small" color="primary" class="font-weight-bold">
                  {{ selectedModules.length }} seleccionados
                </v-chip>
              </div>
              <p class="text-caption text-secondary mb-3">
                Marca los módulos y funcionalidades a los que este cliente tendrá acceso.
              </p>

              <v-progress-linear v-if="loadingModules" indeterminate color="primary" class="mb-3" rounded></v-progress-linear>
              
              <v-card v-else variant="outlined" rounded="lg" class="pa-4 bg-surface">
                <div v-for="(groupItems, groupName) in groupedModules" :key="groupName" class="mb-3">
                  <div class="d-flex align-center mb-1">
                    <v-switch
                      :model-value="isGroupSelected(groupItems)"
                      @update:model-value="toggleGroup(groupItems)"
                      :label="groupName"
                      density="compact"
                      hide-details
                      color="primary"
                      class="mt-0 pt-0 font-weight-bold"
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

        <v-card-actions class="pa-5 border-top">
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="text" rounded="lg" class="font-weight-bold px-4" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" class="font-weight-bold px-6" :loading="loading" @click="saveTenant">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Empresa' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

