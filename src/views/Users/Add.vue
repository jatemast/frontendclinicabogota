<template>
  <v-row>
    <v-col cols="12">
      <div v-if="!userTypeSelected" class="mb-6">
        <div class="text-h5 font-weight-bold mb-6 text-center">Seleccione el Tipo de Usuario</div>
        <v-row justify="center">
          <v-col v-for="type in userTypes" :key="type.value" cols="12" sm="4">
            <v-card 
              @click="selectUserType(type.value)"
              class="type-card py-6 text-center cursor-pointer h-100"
              elevation="0"
            >
              <v-avatar size="80" :color="type.color" variant="tonal" class="mb-4">
                <v-icon size="40">{{ type.icon }}</v-icon>
              </v-avatar>
              <v-card-title class="justify-center font-weight-bold">{{ type.label }}</v-card-title>
              <v-card-subtitle>{{ type.description }}</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <UiParentCard v-else :title="`Nuevo Usuario: ${selectedTypeLabel}`">
        <template v-slot:action>
             <v-btn icon color="primary" variant="text" @click="userTypeSelected = false">
                <v-icon>mdi-arrow-left</v-icon>
             </v-btn>
        </template>
        
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submit">
            
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center">
              <v-icon start size="20">mdi-account-details</v-icon> Información Personal Básica
            </div>
            <v-row class="mb-2">
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Nombre" v-model="form.tx_first_name" :rules="[required, notOnlySpaces]" variant="outlined" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Apellido" v-model="form.tx_last_name" :rules="[required, notOnlySpaces]" variant="outlined" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Correo Electrónico" v-model="form.tx_email" :rules="[required, email, notOnlySpaces]" type="email" variant="outlined" prepend-inner-icon="mdi-email-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field 
                  label="Teléfono" 
                  v-model="form.tx_phone" 
                  :rules="[required, onlyNumbers, colombianPhone]"
                  variant="outlined"
                  placeholder="3001234567"
                  maxlength="10"
                >
                  <template v-slot:prepend-inner>
                    <div class="d-flex align-center mr-2 text-body-1 grey--text text--darken-2">
                      <v-img
                        src="https://flagcdn.com/w20/co.png"
                        width="20"
                        class="mr-1"
                      ></v-img>
                      +57
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
                    <v-select 
                      label="Nivel de Enfermería" 
                      v-model="form.tx_nursing_level" 
                      :items="['Auxiliar', 'Profesional']" 
                      :rules="[required]" 
                      variant="outlined" 
                      prepend-inner-icon="mdi-layers-outline" 
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-select
                      label="Certificaciones"
                      v-model="certificationsArray"
                      :items="['RCP', 'BLS', 'ACLS']"
                      multiple
                      chips
                      closable-chips
                      variant="outlined"
                      prepend-inner-icon="mdi-certificate-outline"
                      :rules="[v => v.length > 0 || 'Seleccione al menos una certificación']"
                    />
                  </v-col>
                </template>
              </v-row>
            </template>

            <v-divider class="my-6"></v-divider>

            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary">
              <v-icon start size="20">mdi-lock-outline</v-icon> Credenciales y Acceso
            </div>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Nombre de Usuario" v-model="form.tx_username" :rules="[required, notOnlySpaces, validUsername]" variant="outlined" prepend-inner-icon="mdi-at" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select v-model="form.id_rol" :items="roles" item-title="tx_name" item-value="id" label="Rol del Sistema" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-shield-account-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Contraseña" v-model="form.tx_password" :rules="[required, notOnlySpaces, strongPassword]" :type="showPassword ? 'text' : 'password'" variant="outlined" prepend-inner-icon="mdi-key-outline" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPassword = !showPassword" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Confirmar Contraseña" v-model="form.tx_repeat_password" :rules="[required, notOnlySpaces, matchPasswordsRule]" :type="showRepeatPassword ? 'text' : 'password'" variant="outlined" prepend-inner-icon="mdi-lock" :append-inner-icon="showRepeatPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showRepeatPassword = !showRepeatPassword" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="primary" :loading="isSubmitting" @click="submit"> Guardar </v-btn>
          <v-btn variant="text" color="error" @click="cancel"> Cancelar </v-btn>
        </v-card-actions>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { API } from '@/api/endpoints';
import { required, email, onlyNumbers, notOnlySpaces, strongPassword, matchPasswords, validUsername, colombianPhone } from '@/utils/validators';

const router = useRouter();
const formRef = ref();
const isSubmitting = ref(false);
const { notify } = useNotification();

// Control de selección previa
const userTypeSelected = ref(false);
const certificationsArray = ref([]); // Auxiliar para el v-combobox

const userTypes = [
  { value: 'Administrativo', label: 'Administrativo', icon: 'mdi-briefcase-account', color: 'blue', description: 'Personal de oficina y gestión.' },
  { value: 'Médico', label: 'Médico', icon: 'mdi-doctor', color: 'teal', description: 'Personal médico especializado.' },
  { value: 'Enfermero', label: 'Enfermero', icon: 'mdi-medication', color: 'cyan', description: 'Personal de enfermería y apoyo.' }
];

const form = ref({
  tx_first_name: '',
  tx_last_name: '',
  tx_email: '',
  tx_phone: '',
  tx_username: '',
  tx_password: '',
  tx_repeat_password: '',
  id_rol: '',
  tx_user_type: '', // Campo clave
  // Campos profesionales (Inglés)
  tx_document_id: '',
  tx_rethus_number: '',
  tx_medical_registration: '',
  tx_specialty: '',
  tx_subspecialty: '', // Opcional
  tx_university: '',
  tx_graduation_year: null as number | null,
  tx_nursing_level: '',
  tx_certifications: ''
});

const selectedTypeLabel = computed(() => {
  return userTypes.find(t => t.value === form.value.tx_user_type)?.label || '';
});

const selectUserType = (type: string) => {
  form.value.tx_user_type = type;
  userTypeSelected.value = true;
};

// ... Resto de la lógica (roles, matchPasswords) se mantiene igual ...
const matchPasswordsRule = matchPasswords(() => form.value.tx_password);
const showPassword = ref(false);
const showRepeatPassword = ref(false);

type Rol = {
  id: number;
  tx_name: string;
};

const roles = ref<Rol[]>([]);

onMounted(async () => {
  try {
    const res = await axios.get(API.ROLES.ALL);
    
    if (Array.isArray(res.data.data)) {
      if (res.data.data.length === 0) {
        notify('error', 'No hay roles registrados en el sistema');
        router.push('/users');
      } else {
        roles.value = res.data.data;
      }
    } else {
      notify('error', 'No se pudieron cargar los roles');
    }

  } catch (error) {
    notify('error', 'Error al obtener los roles');
    console.error(error);
  }
});


const submit = async () => {
  const validationResult = await formRef.value?.validate();
  if (!validationResult?.valid) {
    notify('warning', 'Por favor, revise los campos marcados en rojo');
    return;
  }

  isSubmitting.value = true;

  // Convertir array de certificaciones a string separado por comas para DB
  if (form.value.tx_user_type === 'Enfermero' && certificationsArray.value.length > 0) {
    form.value.tx_certifications = certificationsArray.value.join(', ');
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      API.USERS.ADD,
      form.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.status) {
      notify('success', response.data.msg || 'Usuario guardado correctamente');
      router.push('/users');
    } else {
      notify('error', response.data.msg || 'Error al guardar');
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

const graduationYears = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 60; i--) {
    years.push(i);
  }
  return years;
});
</script>

<style scoped>
.type-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  transition: all 0.3s ease;
}

.type-card:hover {
  transform: translateY(-5px);
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>