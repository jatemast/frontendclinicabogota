<template>
  <UiParentCard title="Listado de Usuarios">
    <template v-slot:action>
        <div class="d-flex align-center gap-3">
            <ExpandableSearch 
              v-model="search" 
              label="Nombre, email, correo cargo o rol" 
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
            <th @click="sortBy('tx_first_name')" style="cursor: pointer">
              Nombre
              <v-icon v-if="sortKey === 'tx_first_name'" :icon="getSortIcon('tx_first_name')" size="16" />
            </th>
            <th @click="sortBy('tx_last_name')" style="cursor: pointer">
              Apellido
              <v-icon v-if="sortKey === 'tx_last_name'" :icon="getSortIcon('tx_last_name')" size="16" />
            </th>
            <th @click="sortBy('tx_phone')" style="cursor: pointer">
              Telefono
              <v-icon v-if="sortKey === 'tx_phone'" :icon="getSortIcon('tx_phone')" size="16" />
            </th>
            <th @click="sortBy('tx_email')" style="cursor: pointer">
              Correo
              <v-icon v-if="sortKey === 'tx_email'" :icon="getSortIcon('tx_email')" size="16" />
            </th>

            <th @click="sortBy('tx_user_type')" style="cursor: pointer">
              Cargo
              <v-icon v-if="sortKey === 'tx_user_type'" :icon="getSortIcon('tx_user_type')" size="16" />
            </th>

            <th @click="sortBy('tx_rol')" style="cursor: pointer">
              Rol
              <v-icon v-if="sortKey === 'tx_rol'" :icon="getSortIcon('tx_rol')" size="16" />
            </th>
            <th @click="sortBy('in_status')" style="cursor: pointer">
              Estado
              <v-icon v-if="sortKey === 'in_status'" :icon="getSortIcon('in_status')" size="16" />
            </th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <template v-if="paginatedusers.length > 0">
            <tr v-for="user in paginatedusers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.tx_first_name }}</td>
              <td>{{ user.tx_last_name }}</td>
              <td>{{ user.tx_phone }}</td>
              <td>{{ user.tx_email }}</td>
              <td>{{ user.tx_user_type }}</td>
              <td>{{ user.tx_rol }}</td>
              <td>
                <v-chip :color="user.in_status != 0 ? 'success' : 'error'" dark>
                  <b>{{ user.in_status != 0 ? 'Activo' : 'Inactivo' }}</b>
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
                    <v-list-item @click="handleEdit(user)">
                      <v-list-item-title>Editar</v-list-item-title>
                    </v-list-item>

                    <!-- <v-list-item @click="handleDelete(user.id)">
                      <v-list-item-title>Eliminar</v-list-item-title>
                    </v-list-item> -->
                  </v-list>
                </v-menu>
              </td>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { useRouter } from 'vue-router';
import UiParentCard from '../shared/UiParentCard.vue';
import ExpandableSearch from '../shared/ExpandableSearch.vue';

interface user {
  id: number;
  tx_first_name?: string;
  tx_last_name?: string;
  tx_phone?: string;
  tx_email?: string;
  in_status?: number;
  tx_rol?: string;
  tx_user_type?: string;
}

const idBusiness = localStorage.getItem('id_business');

const users = ref<user[]>([]);
const search = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);
const { notify } = useNotification();
const router = useRouter();
const API_BASE = import.meta.env.VITE_API_URL;

const fetchUsers = async () => {
  try {
    const res = await axios.get(`${API_BASE}api/users/all`);
    users.value = res.data.data;
  } catch (error) {
    console.error('Error cargando data en la tabla:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchUsers();
});

const sortKey = ref<keyof user | undefined>(undefined); 
const sortOrder = ref<'asc' | 'desc'>('asc');

function sortBy(key: keyof user) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

function getSortIcon(key: keyof user) {
  if (sortKey.value !== key) return '';
  return sortOrder.value === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down';
}

const filteredusers = computed(() => {
  const keywords = search.value.toLowerCase().split(' ').filter(k => k.trim() !== '');

  return users.value.filter(v => {
    const target = [
      v.tx_first_name?.toString().toLowerCase() ?? '',
      v.tx_last_name?.toLowerCase() ?? '',
      v.tx_phone?.toLowerCase() ?? '',
      v.tx_email?.toLowerCase() ?? '',
      v.in_status?.toString().toLowerCase() ?? '',
      v.tx_rol?.toString().toLowerCase() ?? '',
      v.tx_user_type?.toString().toLowerCase() ?? ''
    ].join(' ');

    return keywords.every(keyword => target.includes(keyword));
  });
});

const paginatedusers = computed(() => {
  let sorted = [...filteredusers.value];

  if (sortKey.value !== undefined) {
    sorted.sort((a, b) => {
      const key = sortKey.value as keyof user; 

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
  Math.ceil(filteredusers.value.length / itemsPerPage)
);

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function handleEdit(user: user) {
  router.push(`/users-edt/${user.id}`);
}

async function handleDelete(userId: number) {
notify('confirm', 'Está seguro de eliminar este registro?', {
    onConfirm: async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/users/del/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.status === true) {
          notify('success', response.data.msg);
          users.value = users.value.filter(u => u.id !== userId);
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
