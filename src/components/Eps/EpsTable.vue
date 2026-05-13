<template>
  <UiParentCard title="Eps disponibles">
    <template v-slot:action>
        <div class="d-flex align-center gap-3">
            <ExpandableSearch 
              v-model="search" 
              label="Eps" 
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
            <th @click="sortBy('tx_name')" style="cursor: pointer">
              Eps
              <v-icon v-if="sortKey === 'tx_name'" :icon="getSortIcon('tx_name')" size="16" />
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="paginatedRecords.length > 0">
            <tr v-for="record in paginatedRecords" :key="record.id">
              <td>{{ record.id }}</td>
              <td><b>{{ record.tx_name }}</b></td>
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

interface Record {
  id: number;
  tx_name: string;
}

const records = ref<Record[]>([]);
const search = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);
const API_BASE = import.meta.env.VITE_API_URL;

const fetchLogs = async () => {
    try {
        const res = await axios.get(`${API_BASE}api/eps/all`);
        records.value = res.data.data;
    } catch (error) {
        console.error('Error cargando data en la tabla:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
  await fetchLogs();
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
      v.id?.toString() ?? '',
      v.tx_name?.toLowerCase() ?? '',
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
      return sortOrder.value === 'asc'
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
    });
  }

  const start = (currentPage.value - 1) * itemsPerPage;
  return sorted.slice(start, start + itemsPerPage);
});

const totalPages = computed(() =>
  Math.ceil(filteredRecords.value.length / itemsPerPage) || 1
);

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

</script>