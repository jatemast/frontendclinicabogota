<template>
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Editar Rol">
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submit">
            
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary">
              <v-icon start size="20">mdi-clipboard-outline</v-icon> Información del Rol
            </div>
            <v-row class="mb-6">
              <v-col cols="12" sm="6" md="6">
                <v-text-field 
                  label="Nombre del Rol" 
                  v-model="form.tx_name" 
                  :rules="[required, notOnlySpaces]"
                  variant="outlined"
                  prepend-inner-icon="mdi-shield-account-outline"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select
                  v-model="form.in_status"
                  :items="[
                    { title: 'Activo', value: '1' },
                    { title: 'Inactivo', value: '0' }
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Estado"
                  :rules="[required]"
                  variant="outlined"
                  prepend-inner-icon="mdi-list-status"
                />
              </v-col>
            </v-row>

          </v-form>
        </v-card-text>
        
        <v-card-actions >
          <v-spacer />
          <v-btn 
            variant="text" 
            color="primary" 
            :loading="isSubmitting" 
            @click="submit"
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { API } from '@/api/endpoints';
import { required, onlyNumbers, notOnlySpaces } from '@/utils/validators';

const router = useRouter();
const route = useRoute();
const formRef = ref();
const isSubmitting = ref(false);

const form = ref({
  tx_name: '',
  in_status: "1",
});

const { notify } = useNotification();

onMounted(async () => {
  const recorId = route.params.id;

  try {
    const [recordRes] = await Promise.all([
      axios.get(API.ROLES.EDIT(recorId))]);

    if (recordRes.data.status) {
      const record = recordRes.data.data;
      form.value = {
        tx_name: record.tx_name || '',
        in_status: String(record.in_status),
      };
    } else {
      notify('error', recordRes.data.msg || 'No se pudieron obtener los datos del registro');
      router.push('/roles');
    }

  } catch (error) {
    notify('error', 'Error al obtener la información del registro');
    console.error(error);
    router.push('/roles');
  }
});

const submit = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) {
    notify('warning', 'Por favor, revise los campos marcados');
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await axios.post(API.ROLES.UPDATE(route.params.id), form.value);

    if (response.data.status) {
      notify('success', response.data.msg || 'Actualizado correctamente');
      router.push('/roles');
    } else {
      notify('error', response.data.msg || 'No se pudo actualizar el registro');
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