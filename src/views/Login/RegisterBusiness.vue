<template>
  <v-container fluid class="fill-height justify-center bg-background pa-0">
    <v-card elevation="10" rounded="xl" max-width="500" width="100%" class="pa-6 pa-sm-10 mt-2 mb-2">
      
      <v-card-item class="text-center mb-4">
        <h2 class="text-h4 font-weight-bold text-primary mb-2">Registra tu Clínica</h2>
        <p class="text-body-2 text-secondary">Configura tu nueva cuenta en pocos pasos</p>
      </v-card-item>

      <div class="mb-8">
        <v-row no-gutters align="center" justify="center">
          <v-col cols="auto" class="text-center">
            <v-avatar 
              :color="step >= 1 ? 'primary' : 'grey-lighten-2'" 
              size="32" 
              class="text-white font-weight-bold mb-1"
            >
              1
            </v-avatar>
            <p :class="['text-caption font-weight-bold', step === 1 ? 'text-primary' : 'text-grey']">Clínica</p>
          </v-col>

          <v-col cols="4">
            <v-divider 
              :thickness="3" 
              :color="step === 2 ? 'primary' : 'grey-lighten-2'" 
              class="mx-2 mb-5"
            ></v-divider>
          </v-col>

          <v-col cols="auto" class="text-center">
            <v-avatar 
              :color="step === 2 ? 'primary' : 'grey-lighten-2'" 
              size="32" 
              class="text-white font-weight-bold mb-1"
            >
              2
            </v-avatar>
            <p :class="['text-caption font-weight-bold', step === 2 ? 'text-primary' : 'text-grey']">Usuario</p>
          </v-col>
        </v-row>
      </div>

      <v-window v-model="step" touchless>
        <v-window-item :value="1">
            <div class="text-subtitle-1 font-weight-bold mb-4 text-grey-darken-1">1. Datos de la Clínica</div>
            <v-form ref="formRef1" @submit.prevent="nextStep">
                <v-row >
                    <v-col cols="12">
                        <v-text-field
                            v-model="form.tx_name"
                            label="Nombre"
                            :rules="[v.required, v.notOnlySpaces]"
                            variant="outlined" color="primary"
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="form.tx_owner"
                            label="Nombre del Propietario"
                            :rules="[v.required]"
                            variant="outlined" color="primary"
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="form.tx_owner_email"
                            label="Correo Corporativo"
                            :rules="[v.required, v.email]"
                            variant="outlined" color="primary"
                        />
                    </v-col>
                    <v-col cols="4" sm="3">
                        <v-select
                            v-model="form.area_code_biz"
                            :items="countryCodes"
                            item-title="label"
                            item-value="value"
                            variant="outlined" 
                            color="primary"
                            label="País"
                        />
                    </v-col>
                    <v-col cols="8" sm="9">
                        <v-text-field
                            v-model="form.phone_biz"
                            label="Teléfono"
                            :rules="[v.required, v.onlyNumbers]"
                            variant="outlined" color="primary"
                        />
                    </v-col>
                    <v-col cols="12" class="mt-4">
                        <v-btn block size="x-large" color="primary" rounded="lg" type="submit" class="font-weight-bold">
                            Siguiente: Crea tu Usuario
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-window-item>

        <v-window-item :value="2">
            <div class="text-subtitle-1 font-weight-bold mb-4 text-grey-darken-1">2. Configura tu Usuario</div>
            <v-form ref="formRef2" @submit.prevent="submitRegister">
                <v-row >
                    <v-col cols="6">
                        <v-text-field v-model="form.tx_first_name" label="Nombre" :rules="[v.required]" variant="outlined" color="primary" />
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="form.tx_last_name" label="Apellido" :rules="[v.required]" variant="outlined" color="primary" />
                    </v-col>

                    <v-col cols="12">
                        <v-text-field 
                            v-model="form.tx_username" 
                            label="Nombre de Usuario (Username)" 
                            :rules="[v.required, v.notOnlySpaces, v.validUsername]" 
                            variant="outlined" 
                            
                            :base-color="usernameStatus.color"
                            
                            :color="usernameStatus.color || 'primary'"
                            
                            :loading="isUsernameChecking"
                            :prepend-inner-icon="usernameStatus.icon"
                            :hint="usernameStatus.msg"
                            persistent-hint
                            
                            @update:model-value="onUsernameInput"
                        />
                    </v-col>

                    <v-col cols="12">
                        <v-text-field v-model="form.tx_email" label="Correo Personal" :rules="[v.required, v.email]" variant="outlined" color="primary" />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="form.tx_password"
                            label="Contraseña"
                            :type="showPassword ? 'text' : 'password'"
                            :rules="[v.required, v.strongPassword]"
                            variant="outlined" color="primary"
                            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            @click:append-inner="showPassword = !showPassword"
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="form.confirm_password"
                            label="Confirmar Contraseña"
                            :type="showPassword ? 'text' : 'password'"
                            :rules="[v.required, matchPasswordsRule]"
                            variant="outlined" color="primary"
                        />
                    </v-col>
                    <v-col cols="4">
                        <v-btn block variant="text" size="x-large" @click="prevStep">Atrás</v-btn>
                    </v-col>
                    <v-col cols="8">
                        <v-btn block color="primary" size="x-large" rounded="lg" type="submit" :loading="loading" class="font-weight-bold">
                            FINALIZAR
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-window-item>
      </v-window>

      <div class="text-center mt-8">
        <p class="text-body-2">
          ¿Ya tienes tu negocio? 
          <RouterLink to="/login" class="text-primary font-weight-bold text-decoration-none">Iniciar Sesión</RouterLink>
        </p>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import * as v from '@/utils/validators';

const router = useRouter();
const { notify } = useNotification();

// Referencias de UI
const formRef1 = ref();
const formRef2 = ref();
const step = ref(1);
const loading = ref(false);
const showPassword = ref(false);
const API_BASE = import.meta.env.VITE_API_URL;

// Opciones
const countryCodes = [
    { label: '🇨🇴 +57', value: '+57' },
];

// Estado del formulario (Usamos reactive para mantener la estructura de objeto)
const form = reactive({
    tx_name: '',
    tx_owner: '',
    tx_owner_email: '',
    area_code_biz: '+57',
    phone_biz: '',
    tx_first_name: '',
    tx_last_name: '',
    tx_email: '',
    tx_username: '',
    tx_password: '',
    confirm_password: ''
});

// Regla especial para matching (estilo New User)
const matchPasswordsRule = v.matchPasswords(() => form.tx_password);

// Teléfonos unificados
const fullPhoneBiz = computed(() => `${form.area_code_biz}${form.phone_biz}`);

// Lógica de navegación entre pasos con validación manual
const nextStep = async () => {
    const { valid } = await formRef1.value?.validate();
    if (valid) step.value++;
};

const prevStep = () => step.value--;

// Envío final
const submitRegister = async () => {
    const { valid } = await formRef2.value?.validate();
    
    if (!valid) return;

    loading.value = true;
    try {
        const payload = {
            business: {
                tx_name: form.tx_name,
                tx_owner: form.tx_owner,
                tx_owner_email: form.tx_owner_email,
                tx_owner_phone: fullPhoneBiz.value
            },
            admin: {
                tx_first_name: form.tx_first_name,
                tx_last_name: form.tx_last_name,
                tx_email: form.tx_email,
                tx_username: form.tx_username,
                tx_phone: fullPhoneBiz.value, 
                tx_password: form.tx_password 
            }
        };

        const response = await axios.post(`${API_BASE}business/register`, payload);
        
        if (response.data.status) {
            notify('success', response.data.msg || '¡Negocio registrado con éxito!');
            router.push('/login');
        } else {
            notify('error', response.data.msg || 'Error en el registro');
        }
    } catch (error) {
        notify('error', 'Error de conexión con el servidor');
    } finally {
        loading.value = false;
    }
};

const isUsernameChecking = ref(false);
const usernameStatus = ref<{color: string, icon: string, msg: string | undefined}>({
    color: '',
    icon: 'mdi-at',
    msg: undefined 
});

let debounceTimeout: any = null;

const checkUsername = async (val: string) => {
    // Si es muy corto, reseteamos el estado para que vuelva al color gris neutro
    if (!val || val.length < 6) {
        usernameStatus.value = { 
            color: '', // Al estar vacío, Vuetify usa el color por defecto
            icon: 'mdi-at', 
            msg: undefined 
        };
        return;
    }

    isUsernameChecking.value = true;
    
    try {
        const response = await axios.post(`${API_BASE}users/availableusername`, {
            username: val
        });
        
        if (response.data.status) {
            usernameStatus.value = {
                color: 'success', // Borde verde persistente
                icon: 'mdi-check-circle',
                msg: '¡Usuario disponible!'
            };
        } else {
            usernameStatus.value = {
                color: 'error', // Borde rojo persistente
                icon: 'mdi-close-circle',
                msg: 'Este nombre de usuario ya está en uso'
            };
        }
    } catch (error) {
        // En caso de error de red, mejor dejarlo en neutro o advertencia
        usernameStatus.value = { color: 'warning', icon: 'mdi-alert', msg: 'No se pudo verificar' };
    } finally {
        isUsernameChecking.value = false;
    }
};

// Observador que detecta cuando el usuario escribe
const onUsernameInput = (val: string) => {
    // Limpiamos el timer anterior si el usuario sigue escribiendo
    clearTimeout(debounceTimeout);
    
    // Seteamos un nuevo timer
    debounceTimeout = setTimeout(() => {
        checkUsername(val);
    }, 500); // Espera 500ms tras la última tecla pulsada
};
</script>
