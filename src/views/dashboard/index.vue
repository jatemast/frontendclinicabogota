<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UpcommingSchedule from '@/components/dashboards/UpcommingSchedule.vue';

const { notify } = useNotification();
const loading = ref(true);

// Estados para los datos simplificados
const stats = ref({
    users: [] as any[],
    totalCustomers: 0
});

const fetchData = async () => {
    loading.value = true;
    try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Solo pedimos datos de personal y clientes
        const [resUsers, resCustomers] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}api/dashboard/usersbytype`, { headers }),
            axios.get(`${import.meta.env.VITE_API_URL}api/dashboard/totalcustomers`, { headers })
        ]);

        if (resUsers.data.status) stats.value.users = resUsers.data.data;
        if (resCustomers.data.status) stats.value.totalCustomers = resCustomers.data.total;

    } catch (error) {
        notify('error', 'Error al cargar indicadores');
    } finally {
        loading.value = false;
    }
};

const getKpiConfig = (type: string) => {
    const configs: any = {
        'Médico': { icon: 'mdi-doctor', color: 'primary', label: 'Médicos / Especialistas' },
        'Enfermero': { icon: 'mdi-meditation', color: 'warning', label: 'Enfermeros / Asistentes' },
        'Administrativo': { icon: 'mdi-badge-account-horizontal', color: 'indigo', label: 'Administrativos' }
    };
    return configs[type] || { icon: 'mdi-account', color: 'grey', label: type };
};

onMounted(fetchData);
</script>

<template>
  <v-container fluid class="pt-6">
    <v-row class="mb-4">
        <v-col cols="12">
            <h1 class="text-h4 font-weight-bold grey--text text--darken-3">Resumen operativo</h1>
        </v-col>
    </v-row>

    <div class="d-flex align-center mb-4 mt-2">
        <v-icon color="primary" class="mr-2">mdi-account-tie-outline</v-icon>
        <span class="text-h6 font-weight-bold grey--text text--darken-1">Personal</span>
        <v-divider class="ml-4"></v-divider>
    </div>

    <v-row class="mb-8">
        <v-col v-for="user in stats.users" :key="user.type" cols="12" sm="6" md="4">
            <v-card elevation="10" class="rounded-xl kpi-card border-light">
                <v-card-text class="pa-5">
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <span class="text-overline font-weight-bold" :class="`text-${getKpiConfig(user.type).color}`">
                                {{ getKpiConfig(user.type).label }}
                            </span>
                            <h2 class="text-h3 font-weight-black mt-1">{{ user.total }}</h2>
                        </div>
                        <v-avatar :color="`${getKpiConfig(user.type).color}-lighten-5`" size="64" rounded="lg">
                            <v-icon :color="getKpiConfig(user.type).color" size="32">
                                {{ getKpiConfig(user.type).icon }}
                            </v-icon>
                        </v-avatar>
                    </div>
                    <div class="mt-4 d-flex align-center text-caption text-medium-emphasis">
                        <v-badge dot color="success" inline class="mr-2"></v-badge>
                        Personal activo en sistema
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <div class="d-flex align-center mb-4">
        <v-icon color="pink-accent-3" class="mr-2">mdi-account-group-outline</v-icon>
        <span class="text-h6 font-weight-bold grey--text text--darken-1">Clientes</span>
        <v-divider class="ml-4"></v-divider>
    </div>

    <v-row class="mb-8">
        <v-col cols="12" md="4">
            <v-card elevation="10" class="rounded-xl kpi-card overflow-hidden bg-pink-lighten-5 border-pink">
                <v-card-text class="pa-5">
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <span class="text-overline text-success font-weight-bold">Clientes Totales</span>
                            <h2 class="text-h3 font-weight-black mt-1 text-pink-darken-2">{{ stats.totalCustomers }}</h2>
                        </div>
                        <v-avatar color="white" size="64" elevation="2">
                            <v-icon color="success" size="32">mdi-account-heart</v-icon>
                        </v-avatar>
                    </div>
                    <div class="mt-4 text-caption text-pink-darken-1 font-weight-medium">
                        <v-icon start size="16">mdi-trending-up</v-icon> Crecimiento acumulado
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <!-- <v-row class="mt-4">
        <v-col cols="12">
            <UpcommingSchedule />
        </v-col>
    </v-row> -->
  </v-container>
</template>

<style scoped>
.kpi-card {
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.03) !important;
}
.kpi-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.12) !important;
}
.border-light { border-top: 4px solid rgba(var(--v-theme-primary), 0.5) !important; }
.border-pink { border-top: 4px solid rgb(var(--v-theme-success)) !important; }
</style>