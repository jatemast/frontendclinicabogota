<template>
  <v-row>
    <v-col cols="12">
      <UiParentCard :title="`Editar Usuario: ${form.tx_user_type}`">
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submit">
            
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center">
              <v-icon start size="20">mdi-account-details</v-icon> Información Personal Básica
            </div>
            <v-row class="mb-2">
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Nombre" v-model="form.tx_first_name" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Apellido" v-model="form.tx_last_name" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Correo Electrónico" v-model="form.tx_email" :rules="[required, email]" variant="outlined" prepend-inner-icon="mdi-email-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field 
                  label="Teléfono" 
                  v-model="form.tx_phone" 
                  :rules="[required, onlyNumbers, colombianPhone]" 
                  variant="outlined"
                  maxlength="10"
                >
                  <template v-slot:prepend-inner>
                    <div class="d-flex align-center mr-2 text-body-1 grey--text text--darken-2">
                      <v-img src="https://flagcdn.com/w20/co.png" width="20" class="mr-1"></v-img> +57
                    </div>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <template v-if="form.tx_user_type !== 'Administrativo'">
              <v-divider class="my-6"></v-divider>
              <div class="text-subtitle-1 font-weight-bold mb-4 text-primary">
                <v-icon start size="20">mdi-school-outline</v-icon> Información Profesional
              </div>
              <v-row class="mb-2">
                <v-col cols="12" sm="6" md="3">
                  <v-text-field label="Cédula / ID Document" v-model="form.tx_document_id" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-card-account-details-outline" />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field label="Número RETHUS" v-model="form.tx_rethus_number" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-identifier" />
                </v-col>

                <template v-if="form.tx_user_type === 'Médico'">
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field label="Registro Médico" v-model="form.tx_medical_registration" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-clipboard-plus-outline" />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field label="Especialidad" v-model="form.tx_specialty" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-stethoscope" />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field label="Subespecialidad" v-model="form.tx_subspecialty" variant="outlined" prepend-inner-icon="mdi-doctor" />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field label="Universidad" v-model="form.tx_university" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-town-hall" />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-select 
                      label="Año de Grado" 
                      v-model="form.tx_graduation_year" 
                      :items="graduationYears" 
                      :rules="[required]" 
                      variant="outlined" 
                      prepend-inner-icon="mdi-medal-outline" 
                    />
                  </v-col>
                </template>

                <template v-if="form.tx_user_type === 'Enfermero'">
                  <v-col cols="12" sm="6" md="3">
                    <v-select label="Nivel de Enfermería" v-model="form.tx_nursing_level" :items="['Auxiliar', 'Profesional']" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-layers-outline" />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-select label="Certificaciones" v-model="certificationsArray" :items="['RCP', 'BLS', 'ACLS']" multiple chips closable-chips variant="outlined" prepend-inner-icon="mdi-certificate-outline" />
                  </v-col>
                </template>
              </v-row>
            </template>

            <v-divider class="my-6"></v-divider>

            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary">
              <v-icon start size="20">mdi-lock-outline</v-icon> Credenciales y Estado
            </div>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-select 
                    v-model="form.id_rol" 
                    :items="roles" 
                    item-title="tx_name" 
                    item-value="id" 
                    label="Rol del Sistema" 
                    :rules="[required]" 
                    variant="outlined" 
                    prepend-inner-icon="mdi-shield-account-outline" 
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
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
        
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="primary" :loading="isSubmitting" @click="submit" > Guardar </v-btn>
          <v-btn variant="text" color="error" @click="cancel"> Cancelar </v-btn>
        </v-card-actions>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { required, email, onlyNumbers, notOnlySpaces, colombianPhone } from '@/utils/validators';

const router = useRouter();
const route = useRoute();
const { notify } = useNotification();
const formRef = ref();
const isSubmitting = ref(false);

const certificationsArray = ref<string[]>([]);
const roles = ref<any[]>([]);

const form = ref({
  tx_first_name: '',
  tx_last_name: '',
  tx_email: '',
  tx_phone: '',
  id_rol: '',
  in_status: '',
  tx_user_type: '',
  tx_document_id: '',
  tx_rethus_number: '',
  tx_medical_registration: '',
  tx_specialty: '',
  tx_subspecialty: '',
  tx_university: '',
  tx_graduation_year: null as number | null,
  tx_nursing_level: '',
  tx_certifications: ''
});

const graduationYears = computed(() => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 60; i--) years.push(i);
  return years;
});

onMounted(async () => {
  const userId = route.params.id;
  const token = localStorage.getItem('token');

  try {
    // Restaurada la consulta de roles con el endpoint correcto
    const [userRes, rolesRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}users/edt/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${import.meta.env.VITE_API_URL}api/roles/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    roles.value = rolesRes.data.data;

    if (userRes.data.status) {
      const u = userRes.data.data;
      
      const cleanPhone = u.tx_phone ? u.tx_phone.replace('+57', '') : '';

      if (u.tx_certifications) {
        certificationsArray.value = u.tx_certifications.split(', ').filter(Boolean);
      }

      form.value = {
        ...u,
        tx_phone: cleanPhone,
        // Convertimos a Number para que coincida con el item-value de roles
        id_rol: u.id_rol ? String(u.id_rol) : null,
        tx_graduation_year: u.tx_graduation_year ? Number(u.tx_graduation_year) : null,
        // Forzamos String para que el select de Activo/Inactivo funcione correctamente
        in_status: String(u.in_status)
      };
    }
  } catch (error) {
    notify('error', 'Error al cargar los datos del usuario');
    console.error(error);
    router.push('/users');
  }
});

const submit = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) return;

  isSubmitting.value = true;

  if (form.value.tx_user_type === 'Enfermero') {
    form.value.tx_certifications = certificationsArray.value.join(', ');
  }

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}users/upd/${route.params.id}`, form.value);

    if (response.data.status) {
      notify('success', response.data.msg || 'Usuario actualizado correctamente');
      router.push('/users');
    } else {
      notify('error', response.data.msg);
    }
  } catch (error) {
    notify('error', 'Error de conexión con el servidor');
  } finally {
    isSubmitting.value = false;
  }
};

const cancel = () => router.back();
</script>