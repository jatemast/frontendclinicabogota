<template>
  <UiParentCard title="Listado de Procedimientos">
    <template v-slot:action>
        <div class="d-flex align-center gap-3">
            <ExpandableSearch 
              v-model="search" 
              label="Procedimiento" 
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
              Procedimiento
              <v-icon v-if="sortKey === 'tx_name'" :icon="getSortIcon('tx_name')" size="16" />
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
              <td>{{ record.tx_name }}</td>
              <td>
                <v-chip :color="record.in_status != 0 ? 'success' : 'error'" dark>
                  <b>{{ record.in_status != 0 ? 'Activo' : 'Inactivo' }}</b>
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
                    <!-- <v-list-item @click="handleEdit(record)">
                      <v-list-item-title>Editar</v-list-item-title>
                    </v-list-item> -->

                    <!-- <v-list-item @click="handleDelete(record.id)">
                      <v-list-item-title>Eliminar</v-list-item-title>
                    </v-list-item> -->
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
                        : 'Aún no hay nada que mostrar acá. ¡Agrega tu primer procedimiento!'"
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
  tx_name?: string;
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

const fetchUsers = async () => {
    try {
        const res = await axios.get(API.PROCEDURES.ALL);
        records.value = res.data.data;
    } catch (error) {
        console.error('Error cargando data en la tabla:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
  await fetchUsers();
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
        v.tx_name?.toString().toLowerCase() ?? '',
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

function handleEdit(user: Record) {
  router.push(`/customers-edt/${user.id}`);
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
</script>
