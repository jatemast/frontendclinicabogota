<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import Swal from 'sweetalert2';

interface CustomerType {
    id: number;
    tx_name: string;
    tx_slug: string;
    tx_history_singular: string;
    tx_history_plural: string;
    in_status: number;
    date_add?: string;
}

const { notify } = useNotification();
const loading = ref(false);
const customerTypes = ref<CustomerType[]>([]);
const API_BASE = import.meta.env.VITE_API_URL;
const dialog = ref(false);
const search = ref('');

const form = ref({
    id: null as number | null,
    tx_name: '',
    tx_history_singular: '',
    tx_history_plural: ''
});

const isEditing = computed(() => form.value.id !== null);

const fetchCustomerTypes = async () => {
    loading.value = true;
    try {
        const res = await axios.get(`${API_BASE}api/saas/customer-types`);
        if (res.data.status) {
            customerTypes.value = res.data.data || [];
        } else {
            notify('error', res.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al cargar tipos de empresas');
    } finally {
        loading.value = false;
    }
};

const openAddModal = () => {
    form.value = { id: null, tx_name: '', tx_history_singular: 'Historia Médica', tx_history_plural: 'Historias Médicas' };
    dialog.value = true;
};

const openEditModal = (type: CustomerType) => {
    form.value = {
        id: type.id,
        tx_name: type.tx_name,
        tx_history_singular: type.tx_history_singular,
        tx_history_plural: type.tx_history_plural
    };
    dialog.value = true;
};

const saveCustomerType = async () => {
    if (!form.value.tx_name || !form.value.tx_history_singular || !form.value.tx_history_plural) {
        notify('error', 'Todos los campos son obligatorios');
        return;
    }

    loading.value = true;
    try {
        const url = isEditing.value 
            ? `${API_BASE}api/saas/customer-types/${form.value.id}`
            : `${API_BASE}api/saas/customer-types`;

        const res = await axios.post(url, form.value);
        if (res.data.status) {
            notify('success', res.data.msg);
            dialog.value = false;
            fetchCustomerTypes();
        } else {
            notify('error', res.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al guardar tipo de empresa');
    } finally {
        loading.value = false;
    }
};

const toggleStatus = async (type: CustomerType) => {
    try {
        const res = await axios.post(`${API_BASE}api/saas/customer-types/${type.id}/toggle`);
        if (res.data.status) {
            notify('success', res.data.msg);
            fetchCustomerTypes();
        }
    } catch (error) {
        notify('error', 'Error al cambiar estado');
    }
};

onMounted(() => {
    fetchCustomerTypes();
});
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header Banner -->
    <v-card elevation="0" rounded="xl" class="border bg-surface mb-6 pa-5">
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4">
        <div class="d-flex align-center gap-4">
          <v-avatar color="lightprimary" size="56" rounded="lg">
            <v-icon color="primary" size="28">mdi-shape-outline</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h4 font-weight-bold text-primary mb-1">
              Tipos de Cliente / Empresa
            </h2>
            <p class="text-body-2 text-secondary mb-0">
              Administra los tipos de clientes (Clínica, Estética, Odontología, etc.) y la nomenclatura de sus historias.
            </p>
          </div>
        </div>

        <div class="d-flex align-center gap-3">
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="font-weight-bold px-5"
            @click="openAddModal"
          >
            <v-icon start size="18">mdi-plus</v-icon>
            Nuevo Tipo
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Data Table Card -->
    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5">
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4 mb-5">
        <v-chip color="primary" variant="tonal" class="font-weight-bold">
          Total: {{ customerTypes.length }}
        </v-chip>

        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar tipo de cliente..."
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
          { title: 'ID', align: 'start', key: 'id' },
          { title: 'Nombre', align: 'start', key: 'tx_name' },
          { title: 'Historia Singular', align: 'start', key: 'tx_history_singular' },
          { title: 'Historia Plural', align: 'start', key: 'tx_history_plural' },
          { title: 'Estado', align: 'center', key: 'in_status' },
          { title: 'Acciones', align: 'end', key: 'actions', sortable: false }
        ]"
        :items="customerTypes"
        :search="search"
        class="elevation-0 bg-transparent"
        :loading="loading"
        loading-text="Cargando tipos de empresa..."
        no-data-text="No hay tipos de empresa registrados"
      >
        <template v-slot:item.tx_name="{ item }">
          <div class="font-weight-bold text-primary py-2">{{ item.tx_name }}</div>
        </template>

        <template v-slot:item.tx_history_singular="{ item }">
          <v-chip size="small" color="info" variant="tonal" class="font-weight-medium">
            {{ item.tx_history_singular }}
          </v-chip>
        </template>

        <template v-slot:item.tx_history_plural="{ item }">
          <v-chip size="small" color="primary" variant="tonal" class="font-weight-medium">
            {{ item.tx_history_plural }}
          </v-chip>
        </template>

        <template v-slot:item.in_status="{ item }">
          <v-chip :color="item.in_status == 1 ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
            {{ item.in_status == 1 ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center justify-end gap-2">
            <v-btn icon="mdi-pencil-outline" variant="tonal" color="primary" size="small" rounded="lg" @click="openEditModal(item)"></v-btn>
            <v-btn icon="mdi-power" variant="tonal" :color="item.in_status == 1 ? 'error' : 'success'" size="small" rounded="lg" @click="toggleStatus(item)"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal Form -->
    <v-dialog v-model="dialog" max-width="560">
      <v-card rounded="xl" class="border bg-surface">
        <v-card-title class="pa-5 border-bottom d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-3">
            <v-avatar color="lightprimary" size="40" rounded="lg">
              <v-icon color="primary" size="20">{{ isEditing ? 'mdi-pencil-outline' : 'mdi-plus' }}</v-icon>
            </v-avatar>
            <span class="text-h5 font-weight-bold text-primary">
              {{ isEditing ? 'Editar Tipo de Cliente' : 'Nuevo Tipo de Cliente' }}
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.tx_name"
                label="Nombre del Tipo de Cliente *"
                placeholder="Ej: Clínica, Estética, Odontología"
                variant="outlined"
                rounded="lg"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.tx_history_singular"
                label="Nomenclatura Historia (Singular) *"
                placeholder="Ej: Historia Clínica / Historia Estética"
                variant="outlined"
                rounded="lg"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.tx_history_plural"
                label="Nomenclatura Historia (Plural) *"
                placeholder="Ej: Historias Clínicas / Historias Estéticas"
                variant="outlined"
                rounded="lg"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-5 border-top">
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="text" rounded="lg" class="font-weight-bold px-4" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" class="font-weight-bold px-6" :loading="loading" @click="saveCustomerType">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Tipo' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
