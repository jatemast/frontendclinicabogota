<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useNotification } from '@/utils/useNotification';
import { refreshPermissions } from '@/utils/permissions';
import { API } from '@/api/endpoints';

const router = useRouter();
const { notify } = useNotification();

const loading = ref(false);
const showPassword = ref(false);
const hasCamera = ref<boolean | null>(null);

const tx_username = ref('');
const tx_password = ref('');

const checkCameraHardware = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
        hasCamera.value = false;
        return;
    }
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        hasCamera.value = devices.some(device => device.kind === 'videoinput');
    } catch {
        hasCamera.value = false;
    }
};

onMounted(() => { checkCameraHardware(); });

// Control para selector de empresa cuando hay usuarios duplicados
const showBusinessSelector = ref(false);
const businesses = ref<Array<{ id_business: string; tx_name: string }>>([]);
const selectedBusinessId = ref<string | null>(null);

const handleLogin = async () => {
    if (!tx_username.value || !tx_password.value) {
        notify('error', 'Por favor complete todos los campos');
        return;
    }
    loading.value = true;
    try {
        // Si estamos en modo selector de empresa, enviar id_business
        const payload: any = {
            tx_username: tx_username.value,
            tx_password: tx_password.value
        };
        if (selectedBusinessId.value) {
            payload.id_business = selectedBusinessId.value;
        }

        const response = await axios.post(API.LOGIN, payload);

        if (response.data.status) {
            notify('success', `¡Bienvenido, ${response.data.user_name}!`);

            const expiration = Date.now() + response.data.expires_in * 1000;
            localStorage.setItem('token_expiration', expiration.toString());
            localStorage.setItem('is_logged_in', 'true');
            localStorage.setItem('id_business', response.data.id_business);
            localStorage.setItem('user_display', response.data.tx_username);

            // Guardar token de acceso
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('token', response.data.access_token);
            }

            // SaaS Admin
            localStorage.setItem('is_master', response.data.is_master ? 'true' : 'false');
            if (response.data.tx_photo) {
                localStorage.setItem('user_photo', response.data.tx_photo);
            } else {
                localStorage.removeItem('user_photo');
            }

            // Refrescar permisos inmediatamente después del login
            await refreshPermissions();

            router.push('/dashboard');
        } else if (response.data.multiple_businesses) {
            // Usuario existe en múltiples empresas - mostrar selector
            businesses.value = response.data.businesses || [];
            showBusinessSelector.value = true;
            notify('warning', response.data.msg);
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error de conexión con el servidor');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="text-center mb-6">
        <h2 class="text-h4 font-weight-bold mb-1 text-primary">Bienvenido</h2>
        <p class="text-body-2 text-secondary">Gestione su clínica con elegancia y facilidad</p>
    </div>

    <v-form @submit.prevent="handleLogin">
        <v-label class="text-caption font-weight-bold text-uppercase text-secondary mb-1">Usuario</v-label>
        <v-text-field
            v-model="tx_username"
            variant="outlined"
            color="primary"
            density="comfortable"
            prepend-inner-icon="mdi-account-outline"
            class="mb-3"
            rounded="lg"
        ></v-text-field>

        <v-label class="text-caption font-weight-bold text-uppercase text-secondary mb-1">Contraseña</v-label>
        <v-text-field
            v-model="tx_password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            color="primary"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            class="mb-2"
            rounded="lg"
        ></v-text-field>

        <!-- Selector de empresa (visible solo si el usuario existe en múltiples empresas) -->
        <div v-if="showBusinessSelector" class="mb-4">
          <v-alert type="info" variant="tonal" density="compact" class="mb-3" rounded="lg">
            Este usuario existe en múltiples empresas. Seleccione a cuál desea ingresar:
          </v-alert>
          <v-select
            v-model="selectedBusinessId"
            :items="businesses"
            item-title="tx_name"
            item-value="id_business"
            label="Seleccionar Empresa"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-office-building"
            :rules="[v => !!v || 'Debe seleccionar una empresa']"
            rounded="lg"
          ></v-select>
        </div>

        <div class="d-flex align-center justify-space-between mb-6">
            <v-checkbox label="Recuérdame" color="primary" hide-details density="compact"></v-checkbox>
            <a href="#" class="text-primary text-body-2 font-weight-bold text-decoration-none">¿Olvidó sus credenciales?</a>
        </div>

        <v-btn block size="large" type="submit" :loading="loading" class="login-btn mb-4">
            INGRESAR
        </v-btn>
    </v-form>
</template>

<style scoped>
.login-btn {
    height: 50px !important;
    border-radius: 16px !important;
    background: linear-gradient(135deg, #18B6C9 0%, #0F766E 100%) !important;
    color: #FFFFFF !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px !important;
    box-shadow: 0 8px 20px rgba(24, 182, 201, 0.3) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.login-btn:hover {
    box-shadow: 0 12px 25px rgba(24, 182, 201, 0.4) !important;
    transform: translateY(-2px);
}

.employee-btn {
    height: auto !important;
    border-radius: 16px !important;
    text-transform: none !important;
}
:deep(.v-label) {
    opacity: 1;
}

.register-link {
  text-decoration: none;
  color: #18B6C9;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  padding: 10px 20px;
  border: 2px solid #18B6C9;
  border-radius: 50px;
  transition: all 0.3s;
}

.register-link:hover {
  background: #18B6C9;
  color: white;
}
</style>