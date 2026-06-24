<template>
  <v-container fluid class="pa-4 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Estado de carga -->
        <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
          <v-progress-circular indeterminate color="primary" size="56" width="4" />
          <p class="text-body-1 text-medium-emphasis mt-4">Cargando configuración de cotizaciones...</p>
        </div>

        <UiParentCard v-else title="Configuración de Cotizaciones">
          <p class="text-body-1">Aquí podrás configurar los parámetros predeterminados para tus cotizaciones médicas.</p>
          <v-divider class="my-4"></v-divider>
          
          <v-form @submit.prevent="saveConfig">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.tx_prefijo"
                  label="Prefijo de Cotización (Ej: COT-)"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  :rules="[required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.nu_proximo_nro"
                  label="Próximo Número de Cotización"
                  type="number"
                  min="1"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  :rules="[required, minNumber(1)]"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.in_validez_default_dias"
                  label="Validez por Defecto (Días)"
                  type="number"
                  min="1"
                  max="90"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  :rules="[required, minNumber(1), maxNumber(90)]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.fl_anticipo_default"
                  label="Anticipo por Defecto (%)"
                  type="number"
                  min="0"
                  max="100"
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  :rules="[required, minNumber(0), maxNumber(100)]"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.fl_iva_default"
                  label="IVA por Defecto (%)"
                  type="number"
                  min="0"
                  max="100"
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hint="0% para servicios exentos en el sector salud"
                  persistent-hint
                  :rules="[required, minNumber(0), maxNumber(100)]"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.tx_condiciones_medicas_default"
                  label="Condiciones Médicas y Legales por Defecto"
                  variant="outlined"
                  rows="5"
                  auto-grow
                  rounded="lg"
                  hint="Texto predeterminado para las condiciones en nuevas cotizaciones"
                  persistent-hint
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.tx_condiciones_legales_default"
                  label="Condiciones Legales Adicionales por Defecto"
                  variant="outlined"
                  rows="5"
                  auto-grow
                  rounded="lg"
                  hint="Texto predeterminado para las condiciones legales en nuevas cotizaciones"
                  persistent-hint
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.tx_pie_pagina"
                  label="Texto de Pie de Página en Cotización"
                  variant="outlined"
                  rounded="lg"
                  hint="Texto que aparecerá al final del documento de cotización"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="form.in_mostrar_codigos"
                  label="Mostrar columna de códigos (CUPS/CPT) en PDF"
                  color="primary"
                  hide-details
                ></v-checkbox>
              </v-col>
              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="form.in_mostrar_logo"
                  label="Mostrar logo de la clínica en PDF"
                  color="primary"
                  hide-details
                ></v-checkbox>
              </v-col>
            </v-row>

            <div class="mt-6 text-right">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                rounded="lg"
                class="px-8"
                type="submit"
                :loading="isSubmitting"
              >
                <v-icon start>mdi-content-save</v-icon>
                Guardar Configuración
              </v-btn>
            </div>
          </v-form>
        </UiParentCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { required, minNumber, maxNumber } from '@/utils/validators';
import { API } from '@/api/endpoints';

interface CotyConfig {
  id?: string;
  id_business?: string;
  tx_prefijo: string;
  nu_proximo_nro: number;
  tx_condiciones_medicas_default: string;
  tx_condiciones_legales_default: string;
  in_validez_default_dias: number;
  fl_anticipo_default: number;
  fl_iva_default: number;
  in_mostrar_codigos: boolean;
  in_mostrar_logo: boolean;
  tx_pie_pagina: string;
  id_user_add?: string;
  date_add?: string;
  date_upd?: string;
}

const { notify } = useNotification();

const loading = ref(true);
const isSubmitting = ref(false);

const form = ref<CotyConfig>({
  tx_prefijo: 'COT-',
  nu_proximo_nro: 1,
  tx_condiciones_medicas_default: '',
  tx_condiciones_legales_default: '',
  in_validez_default_dias: 15,
  fl_anticipo_default: 50,
  fl_iva_default: 0,
  in_mostrar_codigos: true,
  in_mostrar_logo: true,
  tx_pie_pagina: '',
});

onMounted(async () => {
  loading.value = true;
  try {
    const response = await axios.get(API.QUOTES.CONFIG);
    if (response.data.status && response.data.data) {
      const config = response.data.data;
      form.value = {
        ...config,
        in_mostrar_codigos: !!config.in_mostrar_codigos,
        in_mostrar_logo: !!config.in_mostrar_logo,
        nu_proximo_nro: parseInt(config.nu_proximo_nro) || 1,
        in_validez_default_dias: parseInt(config.in_validez_default_dias) || 15,
        fl_anticipo_default: parseFloat(config.fl_anticipo_default) || 50,
        fl_iva_default: parseFloat(config.fl_iva_default) || 0,
      };
    } else {
      // No hay config previa: usar valores por defecto ya establecidos en form
    }
  } catch (error) {
    // El endpoint puede no existir aún en backend; se usan los defaults silenciosamente
    console.warn('Endpoint /quotes/config no disponible, usando valores por defecto.');
  } finally {
    loading.value = false;
  }
});

const saveConfig = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      ...form.value,
      in_mostrar_codigos: form.value.in_mostrar_codigos ? 1 : 0,
      in_mostrar_logo: form.value.in_mostrar_logo ? 1 : 0,
    };
    
    const response = await axios.post(API.QUOTES.CONFIG, payload);

    if (response.data.status) {
      notify('success', response.data.msg || 'Configuración guardada con éxito!');
      if (!form.value.id && response.data.data?.id) {
        form.value.id = response.data.data.id;
      }
    } else {
      notify('error', response.data.msg || 'Error al guardar la configuración.');
    }
  } catch (error) {
    notify('error', 'Error de conexión al guardar la configuración. Verifique que el backend esté disponible.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
