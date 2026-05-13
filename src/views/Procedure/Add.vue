<template>
  <v-row >
    <v-col cols="12">
        
        <UiParentCard title="Nuevo Procedimiento Estético">
          <template v-slot:action>
            <v-btn icon variant="text" color="error" @click="cancel">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </template>

          <v-card-text class="pa-6">
            <v-form ref="formRef" @submit.prevent="submit">
              
              <div class="text-center mb-8">
                <v-avatar size="70" color="primary" variant="tonal" class="mb-3">
                  <v-icon size="35">mdi-shimmer</v-icon>
                </v-avatar>
                <p class="text-medium-emphasis font-weight-bold">
                  Define el nombre del nuevo servicio que ofrecerás en la clínica.
                </p>
              </div>

              <v-row>
                <v-col cols="12">
                  <v-label class="text-subtitle-1 font-weight-bold mb-2 text-primary">
                    Nombre del Procedimiento
                  </v-label>
                  <v-text-field
                    v-model="form.tx_name"
                    placeholder="Ej: Limpieza Facial Profunda, Botox, etc."
                    variant="outlined"
                    color="primary"
                    :rules="[required]"
                    prepend-inner-icon="mdi-format-title"
                    class="modern-input"
                  ></v-text-field>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { required } from '@/utils/validators';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const router = useRouter();
const formRef = ref();
const isSubmitting = ref(false);
const { notify } = useNotification();

const form = ref({
    tx_name: '',
});

const submit = async () => {
    const validation = await formRef.value?.validate();
    if (!validation?.valid) return;

    isSubmitting.value = true;
    try {

        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}procedures/add`, 
            form.value,
        );

        if (response.data.status) {
            notify('success', response.data.msg || 'Guardado correctamente');
            router.push('/procedures'); 
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al procesar la solicitud');
    } finally {
        isSubmitting.value = false;
    }
};

const cancel = () => router.back();
</script>

