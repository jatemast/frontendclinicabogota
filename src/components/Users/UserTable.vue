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
            <th @click="sortBy('id')" style="cursor: pointer; width: 50px;">
              ID
              <v-icon v-if="sortKey === 'id'" :icon="getSortIcon('id')" size="16" />
            </th>
            <th @click="sortBy('tx_first_name')" style="cursor: pointer; min-width: 120px;">
              Nombre
              <v-icon v-if="sortKey === 'tx_first_name'" :icon="getSortIcon('tx_first_name')" size="16" />
            </th>
            <th @click="sortBy('tx_last_name')" style="cursor: pointer; min-width: 120px;">
              Apellido
              <v-icon v-if="sortKey === 'tx_last_name'" :icon="getSortIcon('tx_last_name')" size="16" />
            </th>
            <th @click="sortBy('tx_username')" style="cursor: pointer; min-width: 100px;">
              Usuario
              <v-icon v-if="sortKey === 'tx_username'" :icon="getSortIcon('tx_username')" size="16" />
            </th>
            <th @click="sortBy('tx_phone')" style="cursor: pointer; min-width: 120px;">
              Telefono
              <v-icon v-if="sortKey === 'tx_phone'" :icon="getSortIcon('tx_phone')" size="16" />
            </th>
            <th @click="sortBy('tx_email')" style="cursor: pointer; min-width: 180px;">
              Correo
              <v-icon v-if="sortKey === 'tx_email'" :icon="getSortIcon('tx_email')" size="16" />
            </th>

            <th @click="sortBy('tx_user_type')" style="cursor: pointer; min-width: 100px;">
              Cargo
              <v-icon v-if="sortKey === 'tx_user_type'" :icon="getSortIcon('tx_user_type')" size="16" />
            </th>

            <th @click="sortBy('tx_rol')" style="cursor: pointer; min-width: 100px;">
              Rol
              <v-icon v-if="sortKey === 'tx_rol'" :icon="getSortIcon('tx_rol')" size="16" />
            </th>
            <th @click="sortBy('in_status')" style="cursor: pointer; width: 90px;">
              Estado
              <v-icon v-if="sortKey === 'in_status'" :icon="getSortIcon('in_status')" size="16" />
            </th>
            <th style="text-align: center; width: 70px;">Firma</th>
            <th style="width: 80px;">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <template v-if="paginatedusers.length > 0">
            <tr v-for="user in paginatedusers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.tx_first_name }}</td>
              <td>{{ user.tx_last_name }}</td>
              <td><b>{{ user.tx_username }}</b></td>
              <td>{{ user.tx_phone }}</td>
              <td>{{ user.tx_email }}</td>
              <td>{{ user.tx_user_type }}</td>
              <td>{{ user.tx_rol }}</td>
              <td>
                <v-chip :color="user.in_status != 0 ? 'success' : 'error'" dark>
                  <b>{{ user.in_status != 0 ? 'Activo' : 'Inactivo' }}</b>
                </v-chip>
              </td>
              <td style="text-align: center;">
                <v-avatar v-if="user.tx_signature" size="36" class="border rounded">
                  <v-img
                    :src="user.tx_signature"
                    alt="Firma"
                    contain
                    style="background: white; padding: 2px;"
                  ></v-img>
                </v-avatar>
                <v-icon v-else color="grey-lighten-1" size="20">mdi-file-sign</v-icon>
              </td>
              <td>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon v-bind="props" variant="text">
                      <v-icon>mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="handleViewDetail(user)">
                      <v-list-item-title>
                        <v-icon start size="18">mdi-eye-outline</v-icon> Ver más
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="handleEdit(user)">
                      <v-list-item-title>
                        <v-icon start size="18">mdi-pencil-outline</v-icon> Editar
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="13" class="text-center text-muted py-4">
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

    <!-- MODAL DE DETALLE DEL USUARIO -->
    <v-dialog v-model="detailDialog" max-width="750">
      <v-card v-if="selectedUser" class="pa-4">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          <v-icon start size="28" color="primary">mdi-account-circle</v-icon>
          <span class="text-h5 font-weight-bold">Detalle del Usuario</span>
          <v-spacer />
          <v-btn icon variant="text" @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="mx-4"></v-divider>

        <v-card-text class="pa-4">
          <!-- Información Personal -->
          <div class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <v-icon start size="20">mdi-account-details</v-icon> Información Personal
          </div>
          <v-row class="mb-4">
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">ID</div>
              <div class="text-body-2 font-weight-medium">{{ selectedUser.id }}</div>
            </v-col>
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">Nombre</div>
              <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_first_name }}</div>
            </v-col>
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">Apellido</div>
              <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_last_name }}</div>
            </v-col>
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">Correo Electrónico</div>
              <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_email }}</div>
            </v-col>
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">Teléfono</div>
              <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_phone }}</div>
            </v-col>
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">Nombre de Usuario</div>
              <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_username }}</div>
            </v-col>
          </v-row>

          <!-- Firma Digital -->
          <template v-if="selectedUser.tx_signature">
            <v-divider class="my-3"></v-divider>
            <div class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
              <v-icon start size="20">mdi-file-sign</v-icon> Firma Digital
            </div>
            <v-row>
              <v-col cols="12" sm="6">
                <v-img
                  :src="selectedUser.tx_signature"
                  max-height="120"
                  contain
                  class="border rounded-lg pa-2"
                  style="background: white;"
                ></v-img>
              </v-col>
            </v-row>
          </template>

          <!-- Información del Sistema -->
          <v-divider class="my-3"></v-divider>
          <div class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <v-icon start size="20">mdi-shield-account</v-icon> Información del Sistema
          </div>
          <v-row class="mb-4">
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">Tipo de Usuario</div>
              <v-chip size="small" color="primary" variant="tonal">{{ selectedUser.tx_user_type }}</v-chip>
            </v-col>
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">Rol del Sistema</div>
              <v-chip size="small" color="secondary" variant="tonal">{{ selectedUser.tx_rol }}</v-chip>
            </v-col>
            <v-col cols="6" sm="4" class="py-1">
              <div class="text-caption text-grey">Estado</div>
              <v-chip :color="selectedUser.in_status != 0 ? 'success' : 'error'" size="small">
                {{ selectedUser.in_status != 0 ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </v-col>
          </v-row>

          <!-- Información Profesional (solo si no es Administrativo) -->
          <template v-if="selectedUser.tx_user_type !== 'Administrativo'">
            <v-divider class="my-3"></v-divider>
            <div class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
              <v-icon start size="20">mdi-school-outline</v-icon> Información Profesional
            </div>
            <v-row class="mb-4">
              <v-col cols="6" sm="4" class="py-1">
                <div class="text-caption text-grey">Cédula / ID Document</div>
                <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_document_id || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4" class="py-1">
                <div class="text-caption text-grey">Número RETHUS</div>
                <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_rethus_number || '—' }}</div>
              </v-col>

              <template v-if="selectedUser.tx_user_type === 'Médico'">
                <v-col cols="6" sm="4" class="py-1">
                  <div class="text-caption text-grey">Registro Médico</div>
                  <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_medical_registration || '—' }}</div>
                </v-col>
                <v-col cols="6" sm="4" class="py-1">
                  <div class="text-caption text-grey">Especialidad</div>
                  <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_specialty || '—' }}</div>
                </v-col>
                <v-col cols="6" sm="4" class="py-1">
                  <div class="text-caption text-grey">Subespecialidad</div>
                  <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_subspecialty || '—' }}</div>
                </v-col>
                <v-col cols="6" sm="4" class="py-1">
                  <div class="text-caption text-grey">Universidad</div>
                  <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_university || '—' }}</div>
                </v-col>
                <v-col cols="6" sm="4" class="py-1">
                  <div class="text-caption text-grey">Año de Grado</div>
                  <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_graduation_year || '—' }}</div>
                </v-col>
              </template>

              <template v-if="selectedUser.tx_user_type === 'Enfermero'">
                <v-col cols="6" sm="4" class="py-1">
                  <div class="text-caption text-grey">Nivel de Enfermería</div>
                  <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_nursing_level || '—' }}</div>
                </v-col>
                <v-col cols="6" sm="4" class="py-1">
                  <div class="text-caption text-grey">Certificaciones</div>
                  <div class="text-body-2 font-weight-medium">{{ selectedUser.tx_certifications || '—' }}</div>
                </v-col>
              </template>
            </v-row>
          </template>
        </v-card-text>

        <v-divider class="mx-4"></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" color="primary" @click="handleEdit(selectedUser)">
            <v-icon start>mdi-pencil-outline</v-icon> Editar Usuario
          </v-btn>
          <v-btn variant="text" color="grey" @click="detailDialog = false">Cerrar</v-btn>
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

interface user {
  id: number;
  tx_first_name?: string;
  tx_last_name?: string;
  tx_username?: string;
  tx_phone?: string;
  tx_email?: string;
  in_status?: number;
  tx_rol?: string;
  tx_user_type?: string;
  tx_signature?: string;
  tx_document_id?: string;
  tx_rethus_number?: string;
  tx_medical_registration?: string;
  tx_specialty?: string;
  tx_subspecialty?: string;
  tx_university?: string;
  tx_graduation_year?: number | string;
  tx_nursing_level?: string;
  tx_certifications?: string;
  tx_photo?: string;
}

const idBusiness = localStorage.getItem('id_business');

const users = ref<user[]>([]);
const search = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);
const { notify } = useNotification();
const router = useRouter();

// Modal de detalle
const detailDialog = ref(false);
const selectedUser = ref<user | null>(null);

const fetchUsers = async () => {
  try {
    const res = await axios.get(API.USERS.ALL);
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
      v.tx_username?.toLowerCase() ?? '',
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

function handleViewDetail(user: user) {
  selectedUser.value = user;
  detailDialog.value = true;
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
