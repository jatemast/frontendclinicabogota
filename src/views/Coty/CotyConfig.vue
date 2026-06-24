<template>
  <v-container fluid class="pa-4 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Estado de carga -->
        <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
          <v-progress-circular indeterminate color="primary" size="56" width="4" />
          <p class="text-body-1 text-medium-emphasis mt-4">Cargando configuración de cotizaciones...</p>
        </div>

        <template v-else>
          <!-- ================================================================ -->
          <!-- SECCIÓN 1: IDENTIDAD DE LA EMPRESA -->
          <!-- ================================================================ -->
          <UiParentCard title="Identidad de la Empresa" class="mb-6">
            <template v-slot:action>
              <v-icon color="primary">mdi-office-building</v-icon>
            </template>
            <v-row>
              <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center border-md-right mb-4 mb-md-0">
                <v-hover v-slot="{ isHovering, props }">
                  <v-avatar
                    v-bind="props"
                    size="130"
                    class="elevation-2 bg-grey-lighten-4 mb-3"
                    style="border: 3px solid white; cursor: pointer"
                    @click="triggerLogoInput"
                  >
                    <v-img :src="logoPreviewUrl || defaultBusinessLogo" cover>
                      <v-overlay :model-value="isHovering" contained scrim="primary" class="align-center justify-center">
                        <v-icon color="white" size="28">mdi-camera</v-icon>
                      </v-overlay>
                    </v-img>
                  </v-avatar>
                </v-hover>
                <v-btn variant="tonal" size="small" color="primary" prepend-icon="mdi-upload" @click="triggerLogoInput">
                  {{ form.tx_logo_url ? 'Cambiar Logo' : 'Subir Logo' }}
                </v-btn>
                <input ref="logoInput" type="file" accept="image/*" class="d-none" @change="handleLogoUpload" />
                <v-checkbox
                  v-model="form.in_mostrar_logo"
                  label="Mostrar logo en PDF"
                  color="primary"
                  hide-details
                  density="compact"
                  class="mt-2"
                ></v-checkbox>
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.tx_business_name"
                  label="Nombre de la Empresa / Clínica"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-storefront-outline"
                  hint="Nombre que aparecerá en el encabezado de las cotizaciones"
                  persistent-hint
                ></v-text-field>

                <v-text-field
                  v-model="form.tx_business_nit"
                  label="NIT"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-card-account-details-outline"
                  class="mt-3"
                ></v-text-field>

                <v-row dense class="mt-1">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.tx_business_phone"
                      label="Teléfono"
                      variant="outlined"
                      density="compact"
                      rounded="lg"
                      prepend-inner-icon="mdi-phone-outline"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.tx_business_whatsapp"
                      label="WhatsApp"
                      variant="outlined"
                      density="compact"
                      rounded="lg"
                      prepend-inner-icon="mdi-whatsapp"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="form.tx_business_email"
                  label="Email"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-email-outline"
                ></v-text-field>

                <v-text-field
                  v-model="form.tx_business_address"
                  label="Dirección"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-map-marker-outline"
                ></v-text-field>

                <v-text-field
                  v-model="form.tx_business_city"
                  label="Ciudad"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-city"
                ></v-text-field>
              </v-col>
            </v-row>
          </UiParentCard>

          <!-- ================================================================ -->
          <!-- SECCIÓN 2: FIRMA DEL MÉDICO -->
          <!-- ================================================================ -->
          <UiParentCard title="Firma del Médico Responsable" class="mb-6">
            <template v-slot:action>
              <v-icon color="secondary">mdi-draw-pen</v-icon>
            </template>
            <v-row>
              <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center border-md-right mb-4 mb-md-0">
                <v-hover v-slot="{ isHovering, props }">
                  <div
                    v-bind="props"
                    class="signature-preview-box elevation-2 mb-3"
                    :style="{ cursor: 'pointer', backgroundImage: signaturePreviewUrl || form.tx_firma_url ? `url(${signaturePreviewUrl || form.tx_firma_url})` : 'none' }"
                    @click="triggerSignatureInput"
                  >
                    <v-overlay :model-value="isHovering" contained scrim="primary" class="align-center justify-center">
                      <v-icon color="white" size="28">mdi-camera</v-icon>
                    </v-overlay>
                    <div v-if="!signaturePreviewUrl && !form.tx_firma_url" class="d-flex flex-column align-center text-medium-emphasis">
                      <v-icon size="40" class="mb-2">mdi-signature-freehand</v-icon>
                      <span class="text-caption">Sin firma</span>
                    </div>
                  </div>
                </v-hover>
                <v-btn variant="tonal" size="small" color="secondary" prepend-icon="mdi-upload" @click="triggerSignatureInput">
                  {{ form.tx_firma_url ? 'Cambiar Firma' : 'Subir Firma' }}
                </v-btn>
                <input ref="signatureInput" type="file" accept="image/*" class="d-none" @change="handleSignatureUpload" />
              </v-col>

              <v-col cols="12" md="8">
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.tx_doctor_first_name"
                      label="Nombre del Médico"
                      variant="outlined"
                      density="compact"
                      rounded="lg"
                      prepend-inner-icon="mdi-account"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.tx_doctor_last_name"
                      label="Apellido del Médico"
                      variant="outlined"
                      density="compact"
                      rounded="lg"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="form.tx_doctor_specialty"
                  label="Especialidad"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-stethoscope"
                  class="mt-1"
                ></v-text-field>

                <v-text-field
                  v-model="form.tx_doctor_registration"
                  label="Registro Médico / N° de Matrícula"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-card-account-details"
                  class="mt-1"
                ></v-text-field>
              </v-col>
            </v-row>
          </UiParentCard>

          <!-- ================================================================ -->
          <!-- SECCIÓN 3: PARÁMETROS DE COTIZACIÓN -->
          <!-- ================================================================ -->
          <UiParentCard title="Parámetros de Cotización">
            <template v-slot:action>
              <v-icon color="warning">mdi-cog</v-icon>
            </template>
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

                <v-col cols="12" md="6">
                  <v-checkbox
                    v-model="form.in_mostrar_codigos"
                    label="Mostrar columna de códigos (CUPS/CPT) en PDF"
                    color="primary"
                    hide-details
                    class="mt-2"
                  ></v-checkbox>
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
        </template>
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
import defaultBusinessLogo from '@/assets/images/logos/logo.png';

interface CotyConfig {
  id?: string;
  id_business?: string;
  // --- Parámetros de cotización ---
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
  // --- Identidad de la empresa ---
  tx_business_name: string;
  tx_business_nit: string;
  tx_business_phone: string;
  tx_business_whatsapp: string;
  tx_business_email: string;
  tx_business_address: string;
  tx_business_city: string;
  tx_logo_url: string;
  // --- Firma del médico ---
  tx_doctor_first_name: string;
  tx_doctor_last_name: string;
  tx_doctor_specialty: string;
  tx_doctor_registration: string;
  tx_firma_url: string;
  // --- Metadata ---
  id_user_add?: string;
  date_add?: string;
  date_upd?: string;
}

const { notify } = useNotification();

const loading = ref(true);
const isSubmitting = ref(false);

// Refs para file inputs
const logoInput = ref<HTMLInputElement>();
const signatureInput = ref<HTMLInputElement>();
const logoFile = ref<File | null>(null);
const signatureFile = ref<File | null>(null);
const logoPreviewUrl = ref<string | null>(null);
const signaturePreviewUrl = ref<string | null>(null);

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
  tx_business_name: '',
  tx_business_nit: '',
  tx_business_phone: '',
  tx_business_whatsapp: '',
  tx_business_email: '',
  tx_business_address: '',
  tx_business_city: '',
  tx_logo_url: '',
  tx_doctor_first_name: '',
  tx_doctor_last_name: '',
  tx_doctor_specialty: '',
  tx_doctor_registration: '',
  tx_firma_url: '',
});

// ====================== FILE HANDLERS ======================
const triggerLogoInput = () => logoInput.value?.click();
const triggerSignatureInput = () => signatureInput.value?.click();

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    logoFile.value = file;
    logoPreviewUrl.value = URL.createObjectURL(file);
  }
};

const handleSignatureUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    signatureFile.value = file;
    signaturePreviewUrl.value = URL.createObjectURL(file);
  }
};

// ====================== DATA LOADING ======================
onMounted(async () => {
  loading.value = true;
  try {
    // Cargar configuración de cotizaciones
    const resConfig = await axios.get(API.QUOTES.CONFIG).catch(() => null);
    if (resConfig?.data?.status && resConfig.data.data) {
      const config = resConfig.data.data;
      form.value = {
        ...form.value,
        ...config,
        in_mostrar_codigos: !!config.in_mostrar_codigos,
        in_mostrar_logo: !!config.in_mostrar_logo,
        nu_proximo_nro: parseInt(config.nu_proximo_nro) || 1,
        in_validez_default_dias: parseInt(config.in_validez_default_dias) || 15,
        fl_anticipo_default: parseFloat(config.fl_anticipo_default) || 50,
        fl_iva_default: parseFloat(config.fl_iva_default) || 0,
      };
    }

    // Cargar datos del negocio para precargar empresa
    const resBusiness = await axios.get(API.BUSINESS.DETAILS).catch(() => null);
    if (resBusiness?.data?.status && resBusiness.data.data) {
      const b = resBusiness.data.data;
      // Solo precargar si no hay datos existentes de config
      if (!form.value.tx_business_name) {
        form.value.tx_business_name = b.tx_name || '';
        form.value.tx_business_nit = b.tx_nit || '';
        form.value.tx_business_phone = b.tx_phone || '';
        form.value.tx_business_whatsapp = b.tx_whatsapp || '';
        form.value.tx_business_email = b.tx_email || '';
        form.value.tx_business_address = b.tx_address || '';
        form.value.tx_business_city = b.tx_city || '';
      }
      if (b.tx_logo && !form.value.tx_logo_url) {
        const idBusiness = localStorage.getItem('id_business');
        form.value.tx_logo_url = `${import.meta.env.VITE_API_URL}uploads/logos/${idBusiness}/${b.tx_logo}`;
      }
    }
  } catch (error) {
    console.warn('No se pudo cargar la configuración; usando valores por defecto.');
  } finally {
    loading.value = false;
  }
});

// ====================== SAVE ======================
const saveConfig = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();

    // Parámetros de cotización
    formData.append('tx_prefijo', form.value.tx_prefijo);
    formData.append('nu_proximo_nro', String(form.value.nu_proximo_nro));
    formData.append('in_validez_default_dias', String(form.value.in_validez_default_dias));
    formData.append('fl_anticipo_default', String(form.value.fl_anticipo_default));
    formData.append('fl_iva_default', String(form.value.fl_iva_default));
    formData.append('in_mostrar_codigos', form.value.in_mostrar_codigos ? '1' : '0');
    formData.append('in_mostrar_logo', form.value.in_mostrar_logo ? '1' : '0');
    formData.append('tx_condiciones_medicas_default', form.value.tx_condiciones_medicas_default);
    formData.append('tx_condiciones_legales_default', form.value.tx_condiciones_legales_default);
    formData.append('tx_pie_pagina', form.value.tx_pie_pagina);

    // Identidad de la empresa
    formData.append('tx_business_name', form.value.tx_business_name);
    formData.append('tx_business_nit', form.value.tx_business_nit);
    formData.append('tx_business_phone', form.value.tx_business_phone);
    formData.append('tx_business_whatsapp', form.value.tx_business_whatsapp);
    formData.append('tx_business_email', form.value.tx_business_email);
    formData.append('tx_business_address', form.value.tx_business_address);
    formData.append('tx_business_city', form.value.tx_business_city);

    // Doctor
    formData.append('tx_doctor_first_name', form.value.tx_doctor_first_name);
    formData.append('tx_doctor_last_name', form.value.tx_doctor_last_name);
    formData.append('tx_doctor_specialty', form.value.tx_doctor_specialty);
    formData.append('tx_doctor_registration', form.value.tx_doctor_registration);

    // Archivos
    if (logoFile.value) {
      formData.append('tx_logo', logoFile.value);
    }
    if (signatureFile.value) {
      formData.append('tx_firma', signatureFile.value);
    }

    const response = await axios.post(API.QUOTES.CONFIG, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.status) {
      notify('success', response.data.msg || 'Configuración guardada con éxito!');
      if (!form.value.id && response.data.data?.id) {
        form.value.id = response.data.data.id;
      }
      // Actualizar URLs de preview con las devueltas por el servidor
      if (response.data.data?.tx_logo_url) {
        form.value.tx_logo_url = response.data.data.tx_logo_url;
        logoPreviewUrl.value = null;
        logoFile.value = null;
      }
      if (response.data.data?.tx_firma_url) {
        form.value.tx_firma_url = response.data.data.tx_firma_url;
        signaturePreviewUrl.value = null;
        signatureFile.value = null;
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

<style scoped>
.border-md-right {
  border-right: 1px solid #e0e0e0;
}
@media (max-width: 960px) {
  .border-md-right {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 16px;
  }
}
.signature-preview-box {
  width: 220px;
  height: 100px;
  border-radius: 12px;
  background-color: #f5f5f5;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.signature-preview-box:hover {
  border-color: rgb(var(--v-theme-primary));
}
</style>
