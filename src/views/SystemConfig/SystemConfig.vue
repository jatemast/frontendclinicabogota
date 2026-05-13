<template>
  <v-row>
    <v-col cols="12" >
      <UiParentCard title="Configuración del Negocio">
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submit">
            
            <div class="text-subtitle-1 font-weight-bold mb-6 text-primary d-flex align-center">
              <v-icon start size="20" class="mr-2">mdi-office-building-cog</v-icon> 
              Identidad y Contacto Corporativo
            </div>

            <v-row>
              <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center border-md-right mb-6 mb-md-0">
                <v-hover v-slot="{ isHovering, props }">
                  <v-avatar 
                    v-bind="props"
                    size="140" 
                    class="elevation-2 bg-grey-lighten-4 mb-4" 
                    style="border: 3px solid white; cursor: pointer"
                    @click="changeLogo"
                  >
                    <v-img :src="logoUrl" cover>
                      <v-overlay :model-value="isHovering" contained scrim="primary" class="align-center justify-center">
                        <v-icon color="white" size="32">mdi-camera</v-icon>
                      </v-overlay>
                    </v-img>
                  </v-avatar>
                </v-hover>
                <v-btn variant="tonal" size="small" color="primary" prepend-icon="mdi-upload" @click="changeLogo">
                  Subir Logo
                </v-btn>
                <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="handleLogoUpload" />
              </v-col>

              <v-col cols="12" md="8">
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field 
                      label="Nombre del Negocio" 
                      v-model="form.tx_name" 
                      :rules="[required, notOnlySpaces]"
                      variant="outlined"
                      prepend-inner-icon="mdi-storefront-outline"
                    />
                  </v-col>
                  
                  <v-col cols="12">
                    <v-text-field 
                      label="Dueño / Manager" 
                      v-model="form.tx_owner" 
                      :rules="[required, notOnlySpaces]"
                      variant="outlined"
                      prepend-inner-icon="mdi-account-tie-outline"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field 
                      label="Teléfono" 
                      v-model="form.tx_owner_phone" 
                      :rules="[required]"
                      variant="outlined"
                      prepend-inner-icon="mdi-phone-outline"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field 
                      label="Correo Electrónico" 
                      v-model="form.tx_owner_email" 
                      :rules="[required, email]"
                      variant="outlined"
                      prepend-inner-icon="mdi-email-outline"
                    />
                  </v-col>
                </v-row>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { required, email, notOnlySpaces } from '@/utils/validators';
import defaultLogo from '@/assets/images/logos/logo.png';

const router = useRouter();
const formRef = ref();
const isSubmitting = ref(false); 
const fileInput = ref<HTMLInputElement>();
const logoFile = ref<File | null>(null);
const logoPreviewUrl = ref<string | null>(null);

const { notify } = useNotification();
const API_BASE = import.meta.env.VITE_API_URL;

const form = ref({
  tx_name: '',
  tx_logo: null as string | null,
  tx_owner: '',
  tx_owner_email: '',
  tx_owner_phone: '',
});

const idBusiness = localStorage.getItem('id_business');

// Lógica de URL del Logo
const logoUrl = computed(() => {
  if (logoPreviewUrl.value) return logoPreviewUrl.value;
  return form.value.tx_logo
    ? `${API_BASE}uploads/logos/${idBusiness}/${form.value.tx_logo}`
    : defaultLogo;
});

const changeLogo = () => fileInput.value?.click();

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    logoFile.value = file;
    logoPreviewUrl.value = URL.createObjectURL(file);
  }
};

// Carga inicial de datos
onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE}api/business/details`);
    if (response.data.status && response.data.data) {
      const d = response.data.data;
      form.value = {
        tx_name: d.tx_name,
        tx_logo: d.tx_logo,
        tx_owner: d.tx_owner,
        tx_owner_email: d.tx_owner_email,
        tx_owner_phone: d.tx_owner_phone,
      };
    }
  } catch (error) {
    notify('error', 'Error al cargar los datos del negocio');
  }
});

const submit = async () => {
  const validationResult = await formRef.value?.validate();

  if (!validationResult?.valid) {
    notify('warning', 'Por favor, revise los campos marcados en rojo');
    return;
  }

  isSubmitting.value = true;

  // Usamos FormData porque hay un archivo (logo)
  const formData = new FormData();
  formData.append('tx_name', form.value.tx_name);
  formData.append('tx_owner', form.value.tx_owner);
  formData.append('tx_owner_email', form.value.tx_owner_email);
  formData.append('tx_owner_phone', form.value.tx_owner_phone);
  
  if (logoFile.value) {
    formData.append('tx_logo', logoFile.value);
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}business/upd`, formData);

    if (response.data.status) {
      notify('success', response.data.msg || 'Actualizada correctamente');
    } else {
      notify('error', response.data.msg || 'Error al actualizar');
    }

  } catch (error) {
    notify('error', 'Error de conexión con el servidor');
  } finally {
    isSubmitting.value = false;
  }
};

const cancel = () => {
  router.back();
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
  }
}
</style>