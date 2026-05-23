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

const handleLogin = async () => {
    if (!tx_username.value || !tx_password.value) {
        notify('error', 'Por favor complete todos los campos');
        return;
    }
    loading.value = true;
    try {
        const response = await axios.post(API.LOGIN, {
            tx_username: tx_username.value,
            tx_password: tx_password.value
        });

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
        <h2 class="text-h4 font-weight-bold mb-2 text-primary">Bienvenido</h2>
        <p class="text-body-2 text-secondary">Gestione tú clínica con facilidad</p>
    </div>

    <v-form @submit.prevent="handleLogin">
        <v-label class="text-subtitle-1 font-weight-semibold mb-1">Usuario</v-label>
        <v-text-field
            v-model="tx_username"
            variant="outlined"
            color="primary"
            density="comfortable"
            prepend-inner-icon="mdi-account-outline"
            class="mb-2"
        ></v-text-field>

        <v-label class="text-subtitle-1 font-weight-semibold mb-1">Contraseña</v-label>
        <v-text-field
            v-model="tx_password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            color="primary"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
        ></v-text-field>

        <div class="d-flex align-center justify-space-between mb-6">
            <v-checkbox label="Recuerdame" color="primary" hide-details density="compact"></v-checkbox>
            <a href="#" class="text-primary text-body-2 font-weight-bold text-decoration-none">Olvidó sus credenciales?</a>
        </div>

        <v-btn block size="large" color="primary" type="submit" :loading="loading" class="login-btn mb-6">
            INGRESAR
        </v-btn>
    </v-form>

    <!-- Registro deshabilitado -->
    <!-- <div class="text-center mt-4 mb-6">
        <div class="text-center">
            <RouterLink to="/register-business" class="register-link">
            <v-icon start size="18">mdi-store-plus-outline</v-icon>
            REGISTRAR MI CLÍNICA
            </RouterLink>
        </div>
    </div> -->
</template>

<style scoped>
.login-btn {
    height: 50px !important;
    border-radius: 12px !important;
}
.employee-btn {
    height: auto !important;
    border-radius: 12px !important;
    text-transform: none !important;
}
:deep(.v-label) {
    opacity: 1;
}

.register-link {
  text-decoration: none;
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  padding: 10px 20px;
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 50px;
  transition: all 0.3s;
}

.register-link:hover {
  background: rgb(var(--v-theme-primary));
  color: white;
}
</style>