<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { CircleIcon } from 'vue-tabler-icons';

interface AccessLog {
  id: number;
  tx_type: string;
  access_date: string;
  tx_full_name: string;
  tx_username: string;
}

const logs = ref<AccessLog[]>([]);
const loading = ref(true);
const API_BASE = import.meta.env.VITE_API_URL;

const fetchTodayLogs = async () => {
  try {
    const res = await axios.get(`${API_BASE}api/users/allaccesslogs`);
    const allLogs = res.data.data;

    // 1. Obtener la fecha de "hoy" en el horario local del usuario (formato YYYY-MM-DD)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayLocal = `${year}-${month}-${day}`;

    // 2. Filtrar comparando la fecha local del usuario con la fecha del log
    // Asumimos que el servidor envía 'YYYY-MM-DD HH:mm:ss'
    logs.value = allLogs.filter((log: AccessLog) => {
      // Extraemos solo la parte de la fecha 'YYYY-MM-DD' del string de la API
      const logDate = log.access_date.split(' ')[0]; 
      return logDate === todayLocal;
    });
    
  } catch (error) {
    console.error('Error cargando los accesos de hoy:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTodayLogs();
});

// 3. Formateador de hora convertido a la zona horaria local del navegador
function formatTime(dateStr: string) {
  // Creamos el objeto fecha asegurando que JS entienda que viene de UTC (añadiendo ' Z' o ' UTC')
  // para que al mostrarlo con toLocaleTimeString haga la conversión automática a tu zona horaria.
  const date = new Date(dateStr + ' UTC');
  return date.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
}
</script>

<template>
    <v-card elevation="10" class="withbg">
        <v-card-item class="pb-0">
            <v-card-title class="text-h5 pt-sm-2">Accesos de Hoy</v-card-title>
            
            <v-progress-linear v-if="loading" indeterminate color="primary" class="mt-2" />

            <div v-else class="recent-transaction mt-10 px-3">
                <template v-if="logs.length > 0">
                    <div v-for="(log, index) in logs" :key="log.id">
                        <v-row class="d-flex mb-4">
                            <v-col cols="4" lg="3" md="auto" sm="auto" class="px-0 pt-0 pb-1 d-flex align-start">
                                <h6 class="text-body-1 textSecondary text-no-wrap">
                                    {{ formatTime(log.access_date) }}
                                </h6>
                            </v-col>

                            <v-col cols="1" sm="1" class="px-0 text-center pt-0 pb-1">
                                <CircleIcon 
                                    size="13" 
                                    :class="log.tx_type.includes('Inicio') ? 'text-success' : 'text-error'" 
                                />
                                <div v-if="index !== logs.length - 1" class="line mx-auto bg-borderColor"></div>
                            </v-col>

                            <v-col cols="7" sm="8" class="pt-0">
                                <h6 class="text-body-1 font-weight-bold">
                                    {{ log.tx_full_name }}
                                </h6>
                                <div class="mt-n1">
                                    <span :class="['text-body-2', log.tx_type.includes('Inicio') ? 'text-success' : 'text-error']">
                                        {{ log.tx_type }}
                                    </span>
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </template>

                <div v-else class="text-center py-5">
                    <span class="text-body-1 textSecondary">No hay accesos registrados el día de hoy.</span>
                </div>
            </div>
        </v-card-item>
    </v-card>
</template>