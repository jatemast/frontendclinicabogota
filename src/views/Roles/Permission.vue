<template>
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Asignación de Permisos">
        <v-card-text class="pa-6">
          <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

          <div v-if="!loading">
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center">
              <v-icon start size="20">mdi-shield-lock-outline</v-icon>
              Configure los accesos para este rol
            </div>

            <v-row>
              <v-col v-for="(items, moduleName) in groupedModules" :key="moduleName" cols="12">
                <v-card variant="outlined" class="mb-4 border-opacity-50 compact-card">
                  <v-toolbar density="compact" color="grey-lighten-4" flat height="60">
                    <v-toolbar-title class="text-caption font-weight-bold text-uppercase">
                      {{ moduleName }}
                    </v-toolbar-title>
                    <v-spacer />
                    <v-btn variant="text" size="small" color="primary" @click="toggleGroup(items)">
                      {{ isGroupSelected(items) ? 'Desmarcar todo' : 'Marcar todo' }}
                    </v-btn>
                  </v-toolbar>
                  
                  <v-card-text class="pa-3">
                    <v-row dense>
                      <v-col 
                        v-for="mod in items" 
                        :key="mod.id" 
                        cols="12" 
                        sm="6" 
                        md="4"
                      >
                        <v-switch
                          v-model="selectedModules"
                          :value="Number(mod.id)"
                          :label="mod.tx_name"
                          color="primary"
                          inset
                          hide-details
                          density="compact"
                          class="compact-switch"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn 
            color="primary" 
            variant="text"
            :loading="isSubmitting" 
            :disabled="loading"
            @click="savePermissions"
          >
            Guardar
          </v-btn>
          <v-btn 
            variant="text" 
            color="error" 
            @click="cancel"
          >
            Cancelar
          </v-btn>
        </v-card-actions>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { useRouter, useRoute } from 'vue-router';
import { refreshPermissions } from '@/utils/permissions';
import { API } from '@/api/endpoints';

interface Module {
  id: string | number;
  tx_name: string;
  tx_module: string;
}

interface RolePermission {
  id_module: number;
}

const modules = ref<Module[]>([]);
const selectedModules = ref<number[]>([]);
const selectedRoleId = ref<number | null>(null);
const loading = ref(true);
const isSubmitting = ref(false);

const { notify } = useNotification();
const router = useRouter();
const route = useRoute();

const groupedModules = computed(() => {
  return modules.value.reduce((acc, item) => {
    const group = item.tx_module || 'Otros';
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

onMounted(async () => {
  try {
    selectedRoleId.value = Number(route.params.id);

    const [resModules, resPerms] = await Promise.all([
      axios.get(API.ROLES.ALL_MODULES),
      axios.get(API.ROLES.PERMISSIONS(selectedRoleId.value))
    ]);

    modules.value = resModules.data.data || [];
    const permissions = resPerms.data.data as RolePermission[];
    selectedModules.value = permissions.map(p => Number(p.id_module));

  } catch (error) {
    notify('error', 'Error al cargar la información');
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const savePermissions = async () => {
  if (!selectedRoleId.value) return;
  isSubmitting.value = true;

  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      API.ROLES.ASSIGN_PERMISSIONS(selectedRoleId.value),
      { id_modules: selectedModules.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.status === true) {
      notify('success', res.data.msg || 'Actualizados correctamente');
      await refreshPermissions();
      router.push('/roles');
    } else {
      notify('error', res.data.msg || 'Error al actualizar');
    }
  } catch (error) {
    notify('error', 'Error de conexión con el servidor');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const cancel = () => {
  router.back();
};
</script>

<style scoped>
/* Reducción visual del switch */
.compact-switch :deep(.v-selection-control) {
  min-height: 32px !important; /* Altura total más pequeña */
}

.compact-switch :deep(.v-switch__track) {
  width: 36px !important;      /* Carril más corto */
  height: 18px !important;     /* Carril más delgado */
  min-width: 36px !important;
}

.compact-switch :deep(.v-switch__thumb) {
  width: 12px !important;      /* Bolita más pequeña */
  height: 12px !important;     /* Bolita más pequeña */
}

/* Ajuste del label para que no se vea desalineado con el switch pequeño */
.compact-switch :deep(.v-label) {
  font-size: 0.8rem !important;
  padding-inline-start: 8px !important;
  opacity: 0.9;
}

.compact-card {
  border-radius: 8px;
}

.text-caption {
  letter-spacing: 0.5px !important;
}
</style>