<template>
  <UiParentCard title="Listado de Historias Clínicas">
    <template v-slot:action>
        <div class="d-flex align-center gap-3">
            <ExpandableSearch
              v-model="search"
              label="Nro, Cliente, Cedula..."
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
              ID
              <v-icon v-if="sortKey === 'id'" :icon="getSortIcon('id')" size="16" />
            </th>
            <th @click="sortBy('tx_nro')" style="cursor: pointer">
              Cotización #
              <v-icon v-if="sortKey === 'tx_nro'" :icon="getSortIcon('tx_nro')" size="16" />
            </th>
            <th @click="sortBy('tx_dni')" style="cursor: pointer">
              Cedula Cliente
              <v-icon v-if="sortKey === 'tx_dni'" :icon="getSortIcon('tx_dni')" size="16" />
            </th>
            <th @click="sortBy('tx_customer')" style="cursor: pointer">
              Cliente
              <v-icon v-if="sortKey === 'tx_customer'" :icon="getSortIcon('tx_customer')" size="16" />
            </th>
            <th @click="sortBy('in_status')" style="cursor: pointer">
              Estado
              <v-icon v-if="sortKey === 'in_status'" :icon="getSortIcon('in_status')" size="16" />
            </th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <template v-if="paginatedRecords.length > 0">
            <tr v-for="record in paginatedRecords" :key="record.id">
              <td>{{ record.id }}</td>
              <td>{{ record.tx_nro }}</td>
              <td>{{ record.tx_dni }}</td>
              <td>{{ record.tx_customer }}</td>
              <td>
                <v-chip
                  :color="getStatusColor(record.in_status)"
                  dark
                  :prepend-icon="getStatusIcon(record.in_status)"
                >
                  <b>{{ getStatusLabel(record.in_status) }}</b>
                </v-chip>
              </td>
              <td>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon v-bind="props" variant="text">
                      <v-icon>mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="handleEdit(record)">
                      <v-list-item-title>
                        <v-icon start size="18">mdi-eye</v-icon> Abrir
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item v-if="record.in_status === 1" @click="handleApprove(record)">
                      <v-list-item-title>
                        <v-icon start size="18" color="success">mdi-check-circle</v-icon> Validar HC
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item v-if="record.in_status === 1 || record.in_status === 2" @click="handleClose(record)">
                      <v-list-item-title>
                        <v-icon start size="18" color="error">mdi-lock</v-icon> Cerrar HC
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="handleTimeline(record)">
                      <v-list-item-title>
                        <v-icon start size="18" color="info">mdi-timeline</v-icon> Línea de Tiempo
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </template>

            <tr v-else>
                <td colspan="12">
                    <EmptyState
                    :title="search ? 'Sin coincidencias' : 'Sin registros'"
                    :icon="search ? 'mdi-magnify-close' : 'mdi-cloud-off-outline'"
                    :description="search
                        ? `No encontramos nada para '${search}'`
                        : 'Aún no hay nada que mostrar acá. ¡Inicia tu primera historia clínica!'"
                    >
                    <template #actions v-if="search">
                        <v-btn
                        variant="text"
                        color="primary"
                        prepend-icon="mdi-filter-off-outline"
                        @click="search = ''"
                        >
                        Limpiar búsqueda
                        </v-btn>
                    </template>
                    </EmptyState>
                </td>
            </tr>
        </tbody>
      </v-table>

      <div class="d-flex justify-end align-center mt-4">
        <v-btn
          icon
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          ←
        </v-btn>

        <span class="mx-2">Pag {{ currentPage }} de {{ totalPages }}</span>

        <v-btn
          icon
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          →
        </v-btn>
      </div>
    </v-card-item>

    <!-- Dialog para confirmar validación médica -->
    <v-dialog v-model="showApproveDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4 pb-0">
          <v-icon start color="success" size="28">mdi-check-circle</v-icon>
          <span class="text-h6 font-weight-bold">Validar Historia Clínica</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" size="small" @click="showApproveDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Al validar esta historia clínica, confirmas que has revisado y aprobado
            toda la información registrada. Esta acción quedará registrada con tu firma digital.
          </p>
          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="text-caption mb-3"
            icon="mdi-alert-circle"
          >
            Una vez validada, la historia clínica pasará a estado "Validada" y no podrá ser modificada sin autorización.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey-darken-1" @click="showApproveDialog = false" :disabled="approving">
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            :loading="approving"
            prepend-icon="mdi-check-circle"
            @click="confirmApprove"
          >
            Validar HC
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para confirmar cierre definitivo -->
    <v-dialog v-model="showCloseDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4 pb-0">
          <v-icon start color="error" size="28">mdi-lock</v-icon>
          <span class="text-h6 font-weight-bold">Cerrar Historia Clínica</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" size="small" @click="showCloseDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            El cierre definitivo de la historia clínica es una acción <strong>irreversible</strong>.
            Una vez cerrada, no se podrán agregar ni modificar datos.
          </p>
          <v-textarea
            v-model="closeReason"
            label="Motivo del cierre"
            placeholder="Indique la razón del cierre (ej. tratamiento completado, paciente dado de alta)"
            variant="outlined"
            rounded="lg"
            rows="3"
            density="comfortable"
            :rules="[v => !!v || 'El motivo es obligatorio']"
            hide-details="auto"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey-darken-1" @click="showCloseDialog = false" :disabled="closing">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            :loading="closing"
            :disabled="!closeReason.trim()"
            prepend-icon="mdi-lock"
            @click="confirmClose"
          >
            Cerrar Definitivamente
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiParentCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { useRouter } from 'vue-router';
import { API } from '@/api/endpoints';
import UiParentCard from '../shared/UiParentCard.vue';
import ExpandableSearch from '../shared/ExpandableSearch.vue';
import EmptyState from '@/components/shared/EmptyState.vue';

interface Record {
  id: number;
  tx_nro?: string;
  tx_dni?: string;
  tx_customer: string;
  in_status?: number;
}

const idBusiness = localStorage.getItem('id_business');

const records = ref<Record[]>([]);
const search = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);
const { notify } = useNotification();
const router = useRouter();

// --- Estados para diálogos ---
const showApproveDialog = ref(false);
const showCloseDialog = ref(false);
const approving = ref(false);
const closing = ref(false);
const selectedRecord = ref<Record | null>(null);
const closeReason = ref('');

// --- Helpers de estado ---
function normalizeStatus(status: any): number {
  const num = Number(status);
  return (num >= 0 && num <= 3) ? num : -1;
}

function getStatusLabel(status: number | undefined): string {
  switch (normalizeStatus(status)) {
    case 0: return 'Inactivo';
    case 1: return 'Iniciada';
    case 2: return 'Validada';
    case 3: return 'Cerrada';
    default: return 'Desconocido';
  }
}

function getStatusColor(status: number | undefined): string {
  switch (normalizeStatus(status)) {
    case 0: return 'grey';
    case 1: return 'primary';
    case 2: return 'success';
    case 3: return 'error';
    default: return 'grey';
  }
}

function getStatusIcon(status: number | undefined): string {
  switch (normalizeStatus(status)) {
    case 0: return 'mdi-cancel';
    case 1: return 'mdi-progress-check';
    case 2: return 'mdi-check-circle';
    case 3: return 'mdi-lock';
    default: return 'mdi-help-circle';
  }
}

const fetchUsers = async () => {
    try {
        const res = await axios.get(API.MEDICAL_HISTORY.ALL);
        // Normalizar in_status a número para evitar problemas de tipo (string vs number)
        records.value = (res.data.data || []).map((r: any) => ({
            ...r,
            in_status: Number(r.in_status)
        }));
    } catch (error) {
        console.error('Error cargando data en la tabla:', error);
    } finally {
        loading.value = false;
    }
};

let pollingInterval: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  await fetchUsers();
  // Polling AJAX: actualizar datos cada 15 segundos
  pollingInterval = setInterval(() => {
    fetchUsers();
  }, 15000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
});

const sortKey = ref<keyof Record | undefined>(undefined);
const sortOrder = ref<'asc' | 'desc'>('asc');

function sortBy(key: keyof Record) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

function getSortIcon(key: keyof Record) {
  if (sortKey.value !== key) return '';
  return sortOrder.value === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down';
}

const filteredrecords = computed(() => {
  const keywords = search.value.toLowerCase().split(' ').filter(k => k.trim() !== '');

  return records.value.filter(v => {
    const target = [
        v.tx_nro?.toString().toLowerCase() ?? '',
        v.tx_dni?.toString().toLowerCase() ?? '',
        v.tx_customer?.toString().toLowerCase() ?? '',
        v.in_status?.toString().toLowerCase() ?? '',
    ].join(' ');

    return keywords.every(keyword => target.includes(keyword));
  });
});

const paginatedRecords = computed(() => {
  let sorted = [...filteredrecords.value];

  if (sortKey.value !== undefined) {
    sorted.sort((a, b) => {
      const key = sortKey.value as keyof Record; 

      const valA = a[key];
      const valB = b[key];

      const numA = Number(valA);
      const numB = Number(valB);
      const isNumeric = !isNaN(numA) && !isNaN(numB);

      if (isNumeric) {
        return sortOrder.value === 'asc' ? numA - numB : numB - numA;
      }

      const strA = valA?.toString().toLowerCase() ?? '';
      const strB = valB?.toString().toLowerCase() ?? '';
      return sortOrder.value === 'asc'
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
    });
  }

  const start = (currentPage.value - 1) * itemsPerPage;
  return sorted.slice(start, start + itemsPerPage);
});

const totalPages = computed(() =>
  Math.ceil(filteredrecords.value.length / itemsPerPage)
);

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function handleEdit(history: Record) {
  router.push(`/medical-history-view/${history.id}`);
}

async function handleDelete(userId: number) {
notify('confirm', 'Está seguro de eliminar este registro?', {
    onConfirm: async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.post(
          API.USERS.DELETE(userId),
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.status === true) {
          notify('success', response.data.msg);
          records.value = records.value.filter(u => u.id !== userId);
        } else if( response.data.status === "Expired") {

          notify('error', 'Su sesión venció. Por favor inicie sesión nuevamente.');
          router.push('/login');

        }else{
          notify('error', response.data.msg || 'Ocurrió un error.');
        }
      } catch (error) {
        notify('error', 'Error de conexión al servidor');
        console.error(error);
      }
    },
    onCancel: () => {
      notify('info', 'Cancelado');
    }
  });
}

// --- Acciones de Validación Médica (Regla 5) ---
function handleApprove(record: Record) {
  selectedRecord.value = record;
  showApproveDialog.value = true;
}

async function confirmApprove() {
  if (!selectedRecord.value) return;
  approving.value = true;
  try {
    const response = await axios.post(API.MEDICAL_HISTORY.APPROVE(selectedRecord.value.id));
    if (response.data.status) {
      notify('success', response.data.msg || 'Historia clínica validada correctamente');
      showApproveDialog.value = false;
      selectedRecord.value = null;
      await fetchUsers(); // Recargar lista
    } else {
      notify('error', response.data.msg || 'Error al validar la historia clínica');
    }
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
    notify('error', msg);
  } finally {
    approving.value = false;
  }
}

// --- Acciones de Cierre Definitivo (Regla 6) ---
function handleClose(record: Record) {
  selectedRecord.value = record;
  closeReason.value = '';
  showCloseDialog.value = true;
}

async function confirmClose() {
  if (!selectedRecord.value || !closeReason.value.trim()) return;
  closing.value = true;
  try {
    const response = await axios.post(API.MEDICAL_HISTORY.CLOSE(selectedRecord.value.id), {
      tx_close_reason: closeReason.value
    });
    if (response.data.status) {
      notify('success', response.data.msg || 'Historia clínica cerrada correctamente');
      showCloseDialog.value = false;
      selectedRecord.value = null;
      closeReason.value = '';
      await fetchUsers(); // Recargar lista
    } else {
      notify('error', response.data.msg || 'Error al cerrar la historia clínica');
    }
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
    notify('error', msg);
  } finally {
    closing.value = false;
  }
}

// --- Acción de Línea de Tiempo (Regla 8) ---
function handleTimeline(record: Record) {
  router.push(`/medical-history-view/${record.id}?tab=timeline`);
}
</script>
