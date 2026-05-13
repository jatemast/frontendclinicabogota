<template>
  <v-row >
    <v-col cols="12">
      <UiParentCard title="Nuevo Rol">
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submit">
            
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary">
              <v-icon start size="20">mdi-clipboard-outline</v-icon> Información del Rol
            </div>
            
            <v-row class="mb-0">
              <v-col cols="12" sm="12" md="12">
                <v-text-field 
                  label="Nombre del Rol" 
                  v-model="form.tx_name" 
                  :rules="[required, notOnlySpaces]"
                  variant="outlined"
                  prepend-inner-icon="mdi-shield-account-outline"
                />
              </v-col>
            </v-row>

          </v-form>
        </v-card-text>
        
        <v-card-actions>
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
import { useRouter } from 'vue-router';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import {
  required,
  notOnlySpaces,
} from '@/utils/validators';

const router = useRouter();
const formRef = ref();
const isSubmitting = ref(false); 

const form = ref({
  tx_name: '',
});

const { notify } = useNotification();

const submit = async () => {
  const validationResult = await formRef.value?.validate();

  if (!validationResult?.valid) {
    notify('warning', 'Por favor, revise los campos marcados en rojo');
    return;
  }

  isSubmitting.value = true;

  try {

    const response = await axios.post(`${import.meta.env.VITE_API_URL}roles/add`, form.value,);

    if (response.data.status) {
      notify('success', response.data.msg || 'Guardado correctamente');
      router.push('/roles');
    } else {
      const msg = response.data.msg || 'Error al guardar';
      notify('error', msg);
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
