<template>
  <UiParentCard title="Historial de Accesos al Sistema">
    <template v-slot:action>
        <div class="d-flex align-center gap-3">
            <ExpandableSearch 
              v-model="search" 
              label="Nombre, usuario o tipo" 
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
            <th @click="sortBy('tx_full_name')" style="cursor: pointer">
              Usuario
              <v-icon v-if="sortKey === 'tx_full_name'" :icon="getSortIcon('tx_full_name')" size="16" />
            </th>
            <th @click="sortBy('tx_type')" style="cursor: pointer">
              Acción
              <v-icon v-if="sortKey === 'tx_type'" :icon="getSortIcon('tx_type')" size="16" />
            </th>
            <th @click="sortBy('access_date')" style="cursor: pointer">
              Fecha y Hora
              <v-icon v-if="sortKey === 'access_date'" :icon="getSortIcon('access_date')" size="16" />
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="paginatedLogs.length > 0">
            <tr v-for="log in paginatedLogs" :key="log.id">
              <td>{{ log.id }}</td>
              <td><b>{{ log.tx_full_name }}</b></td>
              <td>
                <v-chip :color="log.tx_type.includes('Inicio') ? 'success' : 'error'" dark>
                  <b>{{ log.tx_type }}</b>
                </v-chip>
              </td>
              <td>{{ formatToLocalTime(log.access_date) }}</td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="12" class="text-center text-muted py-4">
              No hay registros que mostrar.
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
  </UiParentCard>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import UiParentCard from '../shared/UiParentCard.vue';
import ExpandableSearch from '../shared/ExpandableSearch.vue';

interface AccessLog {
  id: number;
  id_user: string;
  tx_type: string;
  access_date: string;
  tx_full_name: string;
  tx_username: string;
}

const logs = ref<AccessLog[]>([]);
const search = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);
const API_BASE = import.meta.env.VITE_API_URL;

const fetchLogs = async () => {
  try {
    const res = await axios.get(`${API_BASE}api/users/allaccesslogs`);
    logs.value = res.data.data;
  } catch (error) {
    console.error('Error cargando data en la tabla:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchLogs();
});

const sortKey = ref<keyof AccessLog | undefined>(undefined); 
const sortOrder = ref<'asc' | 'desc'>('asc');

function sortBy(key: keyof AccessLog) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

function getSortIcon(key: keyof AccessLog) {
  if (sortKey.value !== key) return '';
  return sortOrder.value === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down';
}

const filteredLogs = computed(() => {
  const keywords = search.value.toLowerCase().split(' ').filter(k => k.trim() !== '');

  return logs.value.filter(v => {
    const target = [
      v.id?.toString() ?? '',
      v.tx_full_name?.toLowerCase() ?? '',
      v.tx_username?.toLowerCase() ?? '',
      v.tx_type?.toLowerCase() ?? '',
      formatToLocalTime(v.access_date?.toLowerCase()) ?? ''
    ].join(' ');

    return keywords.every(keyword => target.includes(keyword));
  });
});

const paginatedLogs = computed(() => {
  let sorted = [...filteredLogs.value];

  if (sortKey.value !== undefined) {
    sorted.sort((a, b) => {
      const key = sortKey.value as keyof AccessLog; 

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
  Math.ceil(filteredLogs.value.length / itemsPerPage) || 1
);

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function formatToLocalTime(utcString: string): string {
  const date = new Date(utcString + ' UTC'); 
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  });
}
</script>