<template>
  <UiParentCard title="Listado de Citas">
    <template v-slot:action>
      <div class="d-flex align-center gap-3">
        <ExpandableSearch
          v-model="search"
          label="Cliente, DNI, estado..."
        />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Estado"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          style="max-width: 160px"
        />
      </div>
    </template>

    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <v-card-item class="pa-0">
      <v-skeleton-loader v-if="loading" type="table" />

      <v-table v-else>
        <thead>
          <tr>
            <th @click="sortBy('id')" style="cursor: pointer">
              ID <v-icon v-if="sortKey === 'id'" :icon="sortIcon" size="16" />
            </th>
            <th @click="sortBy('date_appointment')" style="cursor: pointer">
              Fecha <v-icon v-if="sortKey === 'date_appointment'" :icon="sortIcon" size="16" />
            </th>
            <th @click="sortBy('time_start')" style="cursor: pointer">
              Hora <v-icon v-if="sortKey === 'time_start'" :icon="sortIcon" size="16" />
            </th>
            <th @click="sortBy('tx_customer_name')" style="cursor: pointer">
              Cliente <v-icon v-if="sortKey === 'tx_customer_name'" :icon="sortIcon" size="16" />
            </th>
            <th>Duración</th>
            <th @click="sortBy('tx_status')" style="cursor: pointer">
              Estado <v-icon v-if="sortKey === 'tx_status'" :icon="sortIcon" size="16" />
            </th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <template v-if="filteredRecords.length > 0">
            <tr v-for="record in paginatedRecords" :key="record.id">
              <td>{{ record.id }}</td>
              <td>
                <v-chip size="small" color="primary" variant="tonal">
                  {{ formatDate(record.date_appointment) }}
                </v-chip>
              </td>
              <td>
                <b>{{ record.time_start }}</b> - {{ record.time_end }}
              </td>
              <td>
                <div class="font-weight-medium">{{ record.tx_customer_name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ record.tx_dni_type || '' }} {{ record.tx_dni || '' }}
                </div>
              </td>
              <td>{{ record.in_duration }} min</td>
              <td>
                <v-chip
                  :color="getStatusColor(record.tx_status)"
                  size="small"
                  variant="flat"
                  class="text-white"
                >
                  {{ getStatusLabel(record.tx_status) }}
                </v-chip>
              </td>
              <td>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon v-bind="props" variant="text" size="small">
                      <v-icon>mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="handleEdit(record)" prepend-icon="mdi-pencil">
                      <v-list-item-title>Editar</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item
                      v-if="record.tx_status !== 'confirmed' && record.tx_status !== 'completed'"
                      @click="handleQuickStatus(record, 'confirmed')"
                      prepend-icon="mdi-check"
                    >
                      <v-list-item-title>Confirmar</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="record.tx_status === 'confirmed'"
                      @click="handleQuickStatus(record, 'completed')"
                      prepend-icon="mdi-check-all"
                    >
                      <v-list-item-title>Completar</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="record.tx_status !== 'cancelled'"
                      @click="handleQuickStatus(record, 'pending')"
                      prepend-icon="mdi-clock-outline"
                    >
                      <v-list-item-title>Pendiente</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item
                      v-if="record.tx_status !== 'cancelled'"
                      @click="handleCancel(record)"
                      prepend-icon="mdi-cancel"
                    >
                      <v-list-item-title class="text-error">Cancelar</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      @click="handleDelete(record)"
                      prepend-icon="mdi-delete"
                    >
                      <v-list-item-title class="text-error">Eliminar</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="7">
              <EmptyState
                :title="search || statusFilter ? 'Sin coincidencias' : 'Sin citas'"
                :icon="search || statusFilter ? 'mdi-magnify-close' : 'mdi-calendar-blank'"
                :description="search || statusFilter
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Aún no hay citas agendadas. ¡Crea tu primera cita!'"
              >
                <template #actions v-if="search || statusFilter">
                  <v-btn variant="text" color="primary" @click="search = ''; statusFilter = null">
                    Limpiar filtros
                  </v-btn>
                </template>
              </EmptyState>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div class="d-flex justify-end align-center mt-4 pa-4" v-if="totalPages > 1">
        <v-btn icon @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1" size="small">←</v-btn>
        <span class="mx-2 text-body-2">Pag {{ currentPage }} de {{ totalPages }}</span>
        <v-btn icon @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages" size="small">→</v-btn>
      </div>
    </v-card-item>
  </UiParentCard>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { useRouter } from 'vue-router';
import { API } from '@/api/endpoints';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ExpandableSearch from '@/components/shared/ExpandableSearch.vue';
import EmptyState from '@/components/shared/EmptyState.vue';

interface Record {
  id: number;
  date_appointment: string;
  time_start: string;
  time_end: string;
  in_duration: number;
  tx_customer_name: string;
  tx_dni?: string;
  tx_dni_type?: string;
  tx_notes?: string;
  tx_status: string;
}

const { notify } = useNotification();
const router = useRouter();
const records = ref<Record[]>([]);
const search = ref('');
const statusFilter = ref<string | null>(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);

const statusOptions = [
  { title: 'Confirmada', value: 'confirmed' },
  { title: 'Pendiente', value: 'pending' },
  { title: 'Cancelada', value: 'cancelled' },
  { title: 'Completada', value: 'completed' },
];

const getStatusColor = (s: string) => {
  const m: Record<string, string> = { confirmed: 'success', pending: 'warning', cancelled: 'error', completed: 'info' };
  return m[s] || 'grey';
};

const getStatusLabel = (s: string) => {
  const m: Record<string, string> = { confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada', completed: 'Completada' };
  return m[s] || s;
};

const formatDate = (d: string) => {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(API.APPOINTMENTS.ALL);
    if (res.data.status) records.value = res.data.data;
  } catch (err) {
    notify('error', 'Error al cargar citas');
  } finally {
    loading.value = false;
  }
};

// Sorting
const sortKey = ref<keyof Record | ''>('');
const sortOrder = ref<'asc' | 'desc'>('asc');
const sortIcon = computed(() => sortOrder.value === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down');

const sortBy = (key: keyof Record) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

// Filtering
const filteredRecords = computed(() => {
  let list = [...records.value];

  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(r =>
      r.tx_customer_name.toLowerCase().includes(q) ||
      (r.tx_dni || '').toLowerCase().includes(q) ||
      getStatusLabel(r.tx_status).toLowerCase().includes(q)
    );
  }

  if (statusFilter.value) {
    list = list.filter(r => r.tx_status === statusFilter.value);
  }

  if (sortKey.value) {
    list.sort((a: any, b: any) => {
      const va = a[sortKey.value] ?? '';
      const vb = b[sortKey.value] ?? '';
      const cmp = String(va).localeCompare(String(vb));
      return sortOrder.value === 'asc' ? cmp : -cmp;
    });
  }

  return list;
});

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / itemsPerPage) || 1);

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredRecords.value.slice(start, start + itemsPerPage);
});

// Actions
const handleEdit = (r: Record) => router.push({ name: 'AppointmentsEdt', params: { id: r.id } });

const handleQuickStatus = async (r: Record, status: string) => {
  try {
    await axios.post(API.APPOINTMENTS.STATUS(r.id), { tx_status: status });
    notify('success', `Cita ${getStatusLabel(status).toLowerCase()}.`);
    fetchData();
  } catch (err: any) {
    notify('error', err.response?.data?.msg || 'Error');
  }
};

const handleCancel = async (r: Record) => {
  try {
    await axios.post(API.APPOINTMENTS.CANCEL(r.id));
    notify('success', 'Cita cancelada.');
    fetchData();
  } catch (err: any) {
    notify('error', err.response?.data?.msg || 'Error');
  }
};

const handleDelete = async (r: Record) => {
  try {
    await axios.delete(API.APPOINTMENTS.DELETE(r.id));
    notify('success', 'Cita eliminada.');
    fetchData();
  } catch (err: any) {
    notify('error', err.response?.data?.msg || 'Error');
  }
};

onMounted(fetchData);
</script>
