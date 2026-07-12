<template>
  <UiParentCard title="Listado de Cotizaciones Médicas">
    <template v-slot:action>
        <div class="d-flex align-center gap-3">
            <ExpandableSearch 
              v-model="search" 
              label="Nro, Cliente, Cédula..." 
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
            <th @click="sortBy('tx_cotizacion_nro')" style="cursor: pointer">
              Cotización #
              <v-icon v-if="sortKey === 'tx_cotizacion_nro'" :icon="getSortIcon('tx_cotizacion_nro')" size="16" />
            </th>
            <th @click="sortBy('tx_dni')" style="cursor: pointer">
              Documento
              <v-icon v-if="sortKey === 'tx_dni'" :icon="getSortIcon('tx_dni')" size="16" />
            </th>
            <th @click="sortBy('tx_full_name')" style="cursor: pointer">
              Paciente
              <v-icon v-if="sortKey === 'tx_full_name'" :icon="getSortIcon('tx_full_name')" size="16" />
            </th>
            <th @click="sortBy('fl_total_cost')" style="cursor: pointer; text-align: right;">
              Total
              <v-icon v-if="sortKey === 'fl_total_cost'" :icon="getSortIcon('fl_total_cost')" size="16" />
            </th>
            <th @click="sortBy('in_status')" style="cursor: pointer">
              Estado
              <v-icon v-if="sortKey === 'in_status'" :icon="getSortIcon('in_status')" size="16" />
            </th>
            <th @click="sortBy('date_add')" style="cursor: pointer">
              Fecha
              <v-icon v-if="sortKey === 'date_add'" :icon="getSortIcon('date_add')" size="16" />
            </th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <template v-if="paginatedRecords.length > 0">
            <tr v-for="record in paginatedRecords" :key="record.id">
              <td>{{ record.id }}</td>
              <td>
                <span class="font-weight-bold text-primary">{{ record.tx_cotizacion_nro || record.tx_nro }}</span>
              </td>
              <td>{{ record.tx_dni }}</td>
              <td>{{ record.tx_full_name }}</td>
              <td class="text-right font-weight-bold">
                $ {{ formatMoney(record.fl_total_cost) }}
              </td>
              <td>
                <v-chip :color="getStatusColor(record.in_status)" size="small" variant="flat" class="font-weight-bold">
                  {{ getStatusLabel(record.in_status) }}
                </v-chip>
              </td>
              <td class="text-caption">{{ formatDate(record.date_add) }}</td>
              <td>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon v-bind="props" variant="text">
                      <v-icon>mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="handleEdit(record)" prepend-icon="mdi-pencil">
                      <v-list-item-title>Editar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="handlePrint(record)" prepend-icon="mdi-eye">
                      <v-list-item-title>Vista Previa</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="handleDownload(record)" prepend-icon="mdi-download">
                      <v-list-item-title>Descargar PDF</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="handleChangeStatus(record, 1)" prepend-icon="mdi-check-circle" v-if="record.in_status === 0">
                      <v-list-item-title>Aprobar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="handleChangeStatus(record, 2)" prepend-icon="mdi-close-circle" v-if="record.in_status === 0">
                      <v-list-item-title>Rechazar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="handleChangeStatus(record, 3)" prepend-icon="mdi-calendar-remove" v-if="record.in_status === 0 || record.in_status === 1">
                      <v-list-item-title>Marcar Vencida</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="12">
              <EmptyState 
                :title="search ? 'Sin coincidencias' : 'Sin cotizaciones'"
                :icon="search ? 'mdi-magnify-close' : 'mdi-file-document-outline'"
                :description="search 
                    ? `No se encontraron resultados para '${search}'` 
                    : 'No hay cotizaciones médicas registradas. ¡Cree la primera!'"
              >
                <template #actions v-if="search">
                  <v-btn variant="text" color="primary" prepend-icon="mdi-filter-off-outline" @click="search = ''">
                    Limpiar búsqueda
                  </v-btn>
                </template>
              </EmptyState>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div class="d-flex justify-end align-center mt-4 pa-4">
        <v-btn icon @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" variant="text">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <span class="mx-2 text-body-2">Pág {{ currentPage }} de {{ totalPages }}</span>
        <v-btn icon @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" variant="text">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
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
import UiParentCard from '../shared/UiParentCard.vue';
import ExpandableSearch from '../shared/ExpandableSearch.vue';
import EmptyState from '@/components/shared/EmptyState.vue';

interface Record {
  id: number;
  tx_nro?: string;
  tx_cotizacion_nro?: string;
  tx_dni?: string;
  tx_full_name: string;
  fl_total_cost?: number;
  in_status?: number;
  date_add?: string;
  date_vencimiento?: string;
}

const records = ref<Record[]>([]);
const search = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);
const { notify } = useNotification();
const router = useRouter();

const fetchQuotes = async () => {
  try {
    const res = await axios.get(API.QUOTES.ALL);
    records.value = res.data.data;
  } catch (error) {
    console.error('Error cargando cotizaciones:', error);
    notify('error', 'Error al cargar cotizaciones');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchQuotes();
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

const filteredRecords = computed(() => {
  const keywords = search.value.toLowerCase().split(' ').filter(k => k.trim() !== '');
  return records.value.filter(v => {
    const target = [
      v.tx_nro?.toString().toLowerCase() ?? '',
      v.tx_cotizacion_nro?.toString().toLowerCase() ?? '',
      v.tx_dni?.toString().toLowerCase() ?? '',
      v.tx_full_name?.toString().toLowerCase() ?? '',
      getStatusLabel(v.in_status ?? 0).toLowerCase(),
    ].join(' ');
    return keywords.every(keyword => target.includes(keyword));
  });
});

const paginatedRecords = computed(() => {
  let sorted = [...filteredRecords.value];
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
      return sortOrder.value === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }
  const start = (currentPage.value - 1) * itemsPerPage;
  return sorted.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / itemsPerPage)));

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

// Helpers
const getStatusLabel = (status: number): string => {
  const labels: Record<number, string> = { 0: 'Pendiente', 1: 'Aprobada', 2: 'Rechazada', 3: 'Vencida', 4: 'Convertida' };
  return labels[status] ?? 'Desconocido';
};

const getStatusColor = (status: number): string => {
  const colors: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'error', 3: 'grey', 4: 'info' };
  return colors[status] ?? 'grey';
};

const formatMoney = (value?: number): string => {
  if (!value) return '0';
  return value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatDate = (date?: string): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Acciones
function handleEdit(quote: Record) {
  router.push(`/quotes-edt/${quote.id}`);
}

function handlePrint(quote: Record) {
  router.push(`/quotes-print/${quote.id}`);
}

async function handleDownload(quote: Record) {
  try {
    notify('info', 'Generando PDF...');
    const res = await axios.get(API.QUOTES.PDF(quote.id));
    if (res.data.status && res.data.data) {
      // Convertir base64 a Blob y descargar
      const byteCharacters = atob(res.data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = res.data.filename || `Cotizacion-${quote.tx_cotizacion_nro || quote.tx_nro}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify('success', 'PDF descargado correctamente');
    } else {
      notify('error', res.data.msg || 'Error al generar el PDF');
    }
  } catch (error) {
    console.error('Error descargando PDF:', error);
    notify('error', 'Error al descargar el PDF');
  }
}

async function handleChangeStatus(quote: Record, newStatus: number) {
  try {
    const res = await axios.post(API.QUOTES.STATUS(quote.id), { in_status: newStatus });
    if (res.data.status) {
      notify('success', res.data.msg);
      await fetchQuotes();
    } else {
      notify('error', res.data.msg || 'Error al cambiar estado');
    }
  } catch (error) {
    notify('error', 'Error de conexión');
  }
}
</script>
