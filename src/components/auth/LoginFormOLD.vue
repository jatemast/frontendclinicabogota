<script setup lang="ts">
  import { ref } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import { useNotification } from '@/utils/useNotification';
  import sidebarItems from '@/layouts/full/vertical-sidebar/sidebarItem';

  const router = useRouter();
  const { notify } = useNotification();

  const tx_username = ref('');
  const tx_password = ref('');
  const loading = ref(false);
  const API_BASE = import.meta.env.VITE_API_URL;

  // const handleLogin = async () => {
  //   loading.value = true;

  //   try {
  //     const response = await axios.post(`${API_BASE}login`, {
  //       tx_username: tx_username.value,
  //       tx_password: tx_password.value
  //     });

  //     // if (response.data.status) {

  //     //   notify('success', response.data.msg);

  //     //   //localStorage.setItem('user', JSON.stringify(response.data));
  //     //   const token = response.data.token;
  //     //   const expiration = Date.now() + response.data.expires_in * 1000; 

  //     //   localStorage.setItem('token', token);
  //     //   localStorage.setItem('token_expiration', expiration.toString());
        
  //     //   setTimeout(() => {
  //     //     router.push('/dashboard');
  //     //   }, 1000);

  //     if (response.data.status) {
  //       notify('success', response.data.msg);

  //       // YA NO GUARDAMOS EL TOKEN (La cookie se guarda sola)
  //       const expiration = Date.now() + response.data.expires_in * 1000; 
  //       localStorage.setItem('token_expiration', expiration.toString());
        
  //       // Guardamos un flag simple para saber que está logueado
  //       localStorage.setItem('is_logged_in', 'true');

  //       setTimeout(() => {
  //           router.push('/dashboard');
  //       }, 1000);

  //     } else {

  //       notify('error', response.data.msg);
  //       loading.value = false;

  //     }
    
  //   }catch (error) {

  //     notify('error', 'Error al conectar con el servidor.');
  //     console.error(error);
  //     loading.value = false;

  //   } finally {
  //     // loading.value = false;
  //   }
  // };

  const handleLogin = async () => {
      loading.value = true;

      try {
          const response = await axios.post(`${API_BASE}login`, {
              tx_username: tx_username.value,
              tx_password: tx_password.value
          });

          if (response.data.status) {
              notify('success', response.data.msg);

              // 1. Guardar expiración y flag
              const expiration = Date.now() + response.data.expires_in * 1000;
              localStorage.setItem('token_expiration', expiration.toString());
              localStorage.setItem('is_logged_in', 'true');

              // 2. OBTENER PERMISOS PARA REDIRECCIÓN DINÁMICA
              try {
                  const permRes = await axios.get(`${API_BASE}api/users/permissions/list`);
                  
                  if (permRes.data.status && permRes.data.data.length > 0) {
                      const firstModuleName = permRes.data.data[0];
                      
                      // Buscamos en sidebarItem qué ruta le corresponde a ese nombre de módulo
                      const firstModule = sidebarItems.find(item => item.module === firstModuleName);
                      
                      if (firstModule && firstModule.to) {
                          router.push(firstModule.to);
                          return; // Salimos para evitar el push al dashboard
                      }
                  }
              } catch (permError) {
                  console.error("Error fetching permissions for redirect", permError);
              }

              // 3. Fallback: Si no hay módulos o hubo error, ir al dashboard
              router.push('/dashboard');

          } else {
              notify('error', response.data.msg);
              loading.value = false;
          }
      } catch (error) {
          notify('error', 'Error al conectar con el servidor.');
          loading.value = false;
      }
  };

  const existingToken = localStorage.getItem('token');
  const expiration = localStorage.getItem('token_expiration');

  if (existingToken && expiration && Date.now() < parseInt(expiration)) {

    notify('warning', "You're already logged in. Redirecting to the dashboard...");
  
    loading.value = false;

    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);

  }

</script>


<template>
  <div>
    <!-- <div class="d-flex align-center text-center mb-6">
      <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
        <span class="bg-surface px-5 py-3 position-relative text-subtitle-1 text-grey100">Process Manager</span>
      </div>
    </div> -->

    <v-form>
      <v-row class="mb-3">
        <!-- <v-col cols="12">
          <v-label class="font-weight-medium mb-1">User</v-label>
          <v-text-field
            v-model="tx_username"
            name="tx_username"
            id="tx_username"
            placeholder="Enter your username"
            variant="outlined"
            hide-details
            color="primary"
          />
        </v-col>
        <v-col cols="12">
          <v-label class="font-weight-medium mb-1">Password</v-label>
          <v-text-field
            v-model="tx_password"
            name="tx_password"
            id="tx_password"
            variant="outlined"
            type="password"
            placeholder="********"
            hide-details
            color="primary"
          />
        </v-col>

        <v-col cols="12" class="mt-4">
          <v-btn
            size="large"
            rounded="pill"
            color="primary"
            block
            flat
            :loading="loading"
            :disabled="loading"
            @click="handleLogin"
          >
            Login
          </v-btn>
        </v-col> -->

        <v-col cols="12" class="pt-4 pb-0">
          <div class="employee-actions-container">
            <RouterLink to="/access-control" class="employee-link attendance-link mb-3">
              <div class="d-flex align-center w-100">
                <v-avatar size="32" color="blue-lighten-5" class="me-3">
                  <v-icon color="blue" size="18">mdi-clock-check-outline</v-icon>
                </v-avatar>
                <div class="text-start">
                  <div class="text-body-2 font-weight-bold text-blue-darken-2">Attendance Control</div>
                  <div class="text-caption text-grey">Clock in/out records</div>
                </div>
                <v-spacer></v-spacer>
                <v-icon size="16" color="grey-lighten-1">mdi-chevron-right</v-icon>
              </div>
            </RouterLink>

            <RouterLink to="/employee-login" class="employee-link login-link">
              <div class="d-flex align-center w-100">
                <v-avatar size="32" color="purple-lighten-5" class="me-3">
                  <v-icon color="purple" size="18">mdi-account-key-outline</v-icon>
                </v-avatar>
                <div class="text-start">
                  <div class="text-body-2 font-weight-bold text-purple-darken-2">Log in as Employee</div>
                  <div class="text-caption text-grey">Access with 6-digit code</div>
                </div>
                <v-spacer></v-spacer>
                <v-icon size="16" color="grey-lighten-1">mdi-chevron-right</v-icon>
              </div>
            </RouterLink>
          </div>
        </v-col>

        
      </v-row>
    </v-form>
  </div>
</template>

<style scoped>
.employee-actions-container {
  display: flex;
  flex-direction: column;
}

.employee-link :deep(.text-body-2) {
  color: #0e2149 !important; 
}

.employee-link :deep(.text-caption) {
  color: #424242 !important; 
}

.employee-link {
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.employee-link:hover {
  background-color: #ffffff;
  border-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.attendance-link {
  border-left: 4px solid #2196f3;
}

.login-link {
  border-left: 4px solid #4bd08b;
}
</style>