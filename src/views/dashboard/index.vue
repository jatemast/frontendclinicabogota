<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { useRouter } from 'vue-router';

const { notify } = useNotification();
const router = useRouter();
const loading = ref(true);

// Determinar si el usuario es Master
const isMaster = computed(() => {
    const val = localStorage.getItem('is_master');
    return val === 'true' || val === '1';
});

// ==================== ESTADOS ====================
const dashboardData = ref<any>({
    usersByType: [],
    totalCustomers: 0,
    totalQuotes: 0,
    quotesByStatus: [],
    monthlyCustomers: [],
    monthlyRevenue: [],
    recentQuotes: [],
    topProcedures: []
});

// ==================== APEX CHARTS OPTIONS ====================

// --- 1. Gráfico de Área: Crecimiento de Clientes ---
const customerChartOptions = computed(() => ({
    chart: {
        type: 'area',
        height: 320,
        fontFamily: 'inherit',
        foreColor: '#5A6A7A',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#2eced5'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 0.2, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] }
    },
    grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 4, padding: { left: 0, right: 0 } },
    xaxis: {
        categories: dashboardData.value.monthlyCustomers.map((d: any) => {
            const [y, m] = d.month.split('-');
            const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            return months[parseInt(m) - 1];
        }),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
        labels: { style: { fontSize: '12px' } },
        min: 0,
        forceNiceScale: true
    },
    tooltip: {
        theme: 'light',
        y: { formatter: (val: number) => `${val} cliente${val !== 1 ? 's' : ''}` }
    }
}));

const customerChartSeries = computed(() => [{
    name: 'Clientes',
    data: dashboardData.value.monthlyCustomers.map((d: any) => d.total)
}]);

// --- 2. Gráfico de Donut: Cotizaciones por Estado ---
const quoteStatusChartOptions = computed(() => ({
    chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'inherit',
        foreColor: '#5A6A7A',
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#ffa726', '#4bd08b', '#8e1b22', '#707a82'],
    labels: dashboardData.value.quotesByStatus.map((d: any) => d.status),
    dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: { fontSize: '13px', fontWeight: 600 }
    },
    legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px',
        markers: { width: 10, height: 10, radius: 2 },
        itemMargin: { horizontal: 10 }
    },
    plotOptions: {
        pie: {
            donut: {
                size: '60%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'Total',
                        formatter: () => {
                            const total = dashboardData.value.quotesByStatus.reduce((s: number, d: any) => s + d.total, 0);
                            return `${total}`;
                        }
                    }
                }
            }
        }
    },
    tooltip: {
        y: { formatter: (val: number) => `${val} cotización(es)` }
    },
    responsive: [{ breakpoint: 480, options: { chart: { width: '100%' }, legend: { position: 'bottom' } } }]
}));

const quoteStatusChartSeries = computed(() =>
    dashboardData.value.quotesByStatus.map((d: any) => d.total)
);

// --- 3. Gráfico de Barras: Ingresos Mensuales ---
const revenueChartOptions = computed(() => ({
    chart: {
        type: 'bar',
        height: 320,
        fontFamily: 'inherit',
        foreColor: '#5A6A7A',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#4bd08b'],
    plotOptions: {
        bar: {
            borderRadius: 6,
            columnWidth: '55%',
            distributed: false,
            dataLabels: { position: 'top' }
        }
    },
    dataLabels: {
        enabled: true,
        formatter: (val: number) => {
            if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
            return `$${val}`;
        },
        offsetY: -20,
        style: { fontSize: '11px', fontWeight: 600, colors: ['#5A6A7A'] }
    },
    grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 4, padding: { top: 30, left: 0, right: 0 } },
    xaxis: {
        categories: dashboardData.value.monthlyRevenue.map((d: any) => {
            const [y, m] = d.month.split('-');
            const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            return months[parseInt(m) - 1];
        }),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
        labels: {
            formatter: (val: number) => {
                if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
                return `$${val}`;
            },
            style: { fontSize: '12px' }
        }
    },
    tooltip: {
        theme: 'light',
        y: { formatter: (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}` }
    }
}));

const revenueChartSeries = computed(() => [{
    name: 'Ingresos',
    data: dashboardData.value.monthlyRevenue.map((d: any) => d.total)
}]);

// --- 4. Gráfico de Barras Horizontal: Procedimientos Top ---
const topProceduresOptions = computed(() => ({
    chart: {
        type: 'bar',
        height: 280,
        fontFamily: 'inherit',
        foreColor: '#5A6A7A',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#8763da'],
    plotOptions: {
        bar: {
            borderRadius: 4,
            horizontal: true,
            barHeight: '60%',
            dataLabels: { position: 'center' }
        }
    },
    dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}`,
        style: { fontSize: '12px', fontWeight: 600, colors: ['#fff'] }
    },
    grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 4, padding: { left: 0, right: 0 } },
    xaxis: {
        categories: dashboardData.value.topProcedures.map((d: any) => d.tx_name),
        labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
        labels: { style: { fontSize: '12px' } }
    },
    tooltip: {
        theme: 'light',
        y: { formatter: (val: number) => `${val} vez(es)` }
    }
}));

const topProceduresSeries = computed(() => [{
    name: 'Usos',
    data: dashboardData.value.topProcedures.map((d: any) => d.total)
}]);

// ==================== FETCH DATA ====================
const fetchData = async () => {
    loading.value = true;
    try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        // Endpoint unificado
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/dashboard/full`, { headers });

        if (res.data.status) {
            dashboardData.value = res.data.data;
        }
    } catch (error) {
        notify('error', 'Error al cargar indicadores del dashboard');
    } finally {
        loading.value = false;
    }
};

// ==================== HELPERS ====================
const getKpiConfig = (type: string) => {
    const configs: any = {
        'Médico': { icon: 'mdi-doctor', color: 'primary', label: 'Médicos / Especialistas' },
        'Enfermero': { icon: 'mdi-meditation', color: 'warning', label: 'Enfermeros / Asistentes' },
        'Administrativo': { icon: 'mdi-badge-account-horizontal', color: 'indigo', label: 'Administrativos' }
    };
    return configs[type] || { icon: 'mdi-account', color: 'grey', label: type };
};

const getStatusColor = (status: string) => {
    const map: any = {
        'Pendiente': 'warning',
        'Aprobada': 'success',
        'Rechazada': 'error',
        'Cancelada': 'secondary'
    };
    return map[status] || 'grey';
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const goToQuotes = () => router.push('/quotes');
const goToCustomers = () => router.push('/customers');
const goToUsers = () => router.push('/users');

onMounted(fetchData);
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-4">
        <v-col cols="12" md="8">
            <h1 class="text-h4 font-weight-bold text-grey-darken-3">
                <v-icon size="36" color="primary" class="mr-2">mdi-view-dashboard-outline</v-icon>
                Panel de Control
            </h1>
            <p class="text-body-2 text-medium-emphasis mt-1 ml-1">
                Resumen operativo y métricas clave del negocio
            </p>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-end justify-end">
            <v-btn variant="outlined" color="primary" @click="fetchData" :loading="loading" size="small">
                <v-icon start>mdi-refresh</v-icon>
                Actualizar
            </v-btn>
        </v-col>
    </v-row>

    <!-- Skeleton Loader -->
    <template v-if="loading">
        <v-row>
            <v-col v-for="n in 4" :key="n" cols="12" sm="6" lg="3">
                <v-skeleton-loader type="card-avatar, article" class="rounded-xl"></v-skeleton-loader>
            </v-col>
        </v-row>
        <v-row class="mt-4">
            <v-col cols="12" md="8">
                <v-skeleton-loader type="image" height="320" class="rounded-xl"></v-skeleton-loader>
            </v-col>
            <v-col cols="12" md="4">
                <v-skeleton-loader type="image" height="320" class="rounded-xl"></v-skeleton-loader>
            </v-col>
        </v-row>
    </template>

    <template v-else>
        <!-- ============ KPI CARDS ============ -->
        <v-row class="mb-6">
            <!-- Personal Total -->
            <v-col cols="12" sm="6" lg="3">
                <v-card elevation="2" class="rounded-xl kpi-card" @click="goToUsers" style="cursor: pointer;">
                    <v-card-text class="pa-5">
                        <div class="d-flex align-center justify-space-between">
                            <div>
                                <span class="text-overline font-weight-bold text-primary">Personal Activo</span>
                                <h2 class="text-h3 font-weight-black mt-1">
                                    {{ dashboardData.usersByType.reduce((s: number, u: any) => s + u.total, 0) }}
                                </h2>
                            </div>
                            <v-avatar color="lightprimary" size="56" rounded="lg">
                                <v-icon color="primary" size="28">mdi-account-tie</v-icon>
                            </v-avatar>
                        </div>
                        <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                            <v-icon size="14" color="success" class="mr-1">mdi-circle-small</v-icon>
                            <span>Distribuido en {{ dashboardData.usersByType.length }} roles</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Clientes Totales (Master) -->
            <v-col cols="12" sm="6" lg="3">
                <v-card elevation="2" class="rounded-xl kpi-card" @click="isMaster ? goToCustomers() : null"
                    :style="{ cursor: isMaster ? 'pointer' : 'default' }">
                    <v-card-text class="pa-5">
                        <div class="d-flex align-center justify-space-between">
                            <div>
                                <span class="text-overline font-weight-bold text-success">Clientes Registrados</span>
                                <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.totalCustomers }}</h2>
                            </div>
                            <v-avatar color="lightsuccess" size="56" rounded="lg">
                                <v-icon color="success" size="28">mdi-account-group</v-icon>
                            </v-avatar>
                        </div>
                        <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                            <v-icon size="14" color="success" class="mr-1">mdi-trending-up</v-icon>
                            <span>Crecimiento acumulado</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Cotizaciones Totales -->
            <v-col cols="12" sm="6" lg="3">
                <v-card elevation="2" class="rounded-xl kpi-card" @click="goToQuotes" style="cursor: pointer;">
                    <v-card-text class="pa-5">
                        <div class="d-flex align-center justify-space-between">
                            <div>
                                <span class="text-overline font-weight-bold text-warning">Cotizaciones</span>
                                <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.totalQuotes }}</h2>
                            </div>
                            <v-avatar color="lightwarning" size="56" rounded="lg">
                                <v-icon color="warning" size="28">mdi-file-document-outline</v-icon>
                            </v-avatar>
                        </div>
                        <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                            <v-icon size="14" color="warning" class="mr-1">mdi-circle-small</v-icon>
                            <span>{{ dashboardData.quotesByStatus.find((d: any) => d.status === 'Aprobada')?.total || 0 }} aprobadas</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Procedimientos -->
            <v-col cols="12" sm="6" lg="3">
                <v-card elevation="2" class="rounded-xl kpi-card">
                    <v-card-text class="pa-5">
                        <div class="d-flex align-center justify-space-between">
                            <div>
                                <span class="text-overline font-weight-bold text-indigo">Procedimientos</span>
                                <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.topProcedures.length }}</h2>
                            </div>
                            <v-avatar color="lightindigo" size="56" rounded="lg">
                                <v-icon color="indigo" size="28">mdi-stethoscope</v-icon>
                            </v-avatar>
                        </div>
                        <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                            <v-icon size="14" color="indigo" class="mr-1">mdi-circle-small</v-icon>
                            <span>Tipos de procedimientos</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- ============ PERSONAL BREAKDOWN ============ -->
        <v-row class="mb-4">
            <v-col cols="12">
                <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-account-tie-outline</v-icon>
                    <span class="text-h6 font-weight-bold text-grey-darken-1">Distribución del Personal</span>
                    <v-divider class="ml-4"></v-divider>
                </div>
            </v-col>
        </v-row>

        <v-row class="mb-8">
            <v-col v-for="user in dashboardData.usersByType" :key="user.type" cols="12" sm="6" md="4">
                <v-card elevation="2" class="rounded-xl kpi-card-mini border-top" :class="`border-${getKpiConfig(user.type).color}`">
                    <v-card-text class="pa-4 d-flex align-center">
                        <v-avatar :color="`${getKpiConfig(user.type).color}-lighten-5`" size="52" rounded="lg" class="mr-4">
                            <v-icon :color="getKpiConfig(user.type).color" size="26">
                                {{ getKpiConfig(user.type).icon }}
                            </v-icon>
                        </v-avatar>
                        <div>
                            <span class="text-body-2 text-medium-emphasis font-weight-medium">{{ getKpiConfig(user.type).label }}</span>
                            <h3 class="text-h4 font-weight-black mt-1">{{ user.total }}</h3>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- ============ CHARTS ROW 1 ============ -->
        <v-row class="mb-6">
            <!-- Clientes por Mes (Área) -->
            <v-col cols="12" lg="8">
                <v-card elevation="2" class="rounded-xl chart-card">
                    <v-card-item>
                        <template v-slot:title>
                            <div class="d-flex align-center">
                                <v-icon color="primary" class="mr-2">mdi-chart-bell-curve-cumulative</v-icon>
                                <span class="text-subtitle-1 font-weight-bold">Crecimiento de Clientes</span>
                            </div>
                        </template>
                        <template v-slot:subtitle>
                            <span class="text-caption">Últimos 12 meses</span>
                        </template>
                    </v-card-item>
                    <v-card-text class="pa-4 pt-0">
                        <apexchart
                            v-if="dashboardData.monthlyCustomers.length"
                            type="area"
                            height="320"
                            :options="customerChartOptions"
                            :series="customerChartSeries"
                        />
                        <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis">
                            <v-icon size="48" class="mr-3">mdi-chart-line</v-icon>
                            <span>No hay datos de clientes aún</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Cotizaciones por Estado (Donut) -->
            <v-col cols="12" lg="4">
                <v-card elevation="2" class="rounded-xl chart-card h-100">
                    <v-card-item>
                        <template v-slot:title>
                            <div class="d-flex align-center">
                                <v-icon color="warning" class="mr-2">mdi-chart-donut</v-icon>
                                <span class="text-subtitle-1 font-weight-bold">Estado Cotizaciones</span>
                            </div>
                        </template>
                        <template v-slot:subtitle>
                            <span class="text-caption">Distribución general</span>
                        </template>
                    </v-card-item>
                    <v-card-text class="pa-4 pt-0">
                        <apexchart
                            v-if="dashboardData.quotesByStatus.length"
                            type="donut"
                            height="300"
                            :options="quoteStatusChartOptions"
                            :series="quoteStatusChartSeries"
                        />
                        <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis">
                            <v-icon size="48" class="mr-3">mdi-chart-pie</v-icon>
                            <span>Sin cotizaciones</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- ============ CHARTS ROW 2 ============ -->
        <v-row class="mb-6">
            <!-- Ingresos Mensuales (Barras) -->
            <v-col cols="12" lg="6">
                <v-card elevation="2" class="rounded-xl chart-card">
                    <v-card-item>
                        <template v-slot:title>
                            <div class="d-flex align-center">
                                <v-icon color="success" class="mr-2">mdi-chart-bar</v-icon>
                                <span class="text-subtitle-1 font-weight-bold">Ingresos Mensuales</span>
                            </div>
                        </template>
                        <template v-slot:subtitle>
                            <span class="text-caption">Cotizaciones aprobadas - Últimos 12 meses</span>
                        </template>
                    </v-card-item>
                    <v-card-text class="pa-4 pt-0">
                        <apexchart
                            v-if="dashboardData.monthlyRevenue.length"
                            type="bar"
                            height="320"
                            :options="revenueChartOptions"
                            :series="revenueChartSeries"
                        />
                        <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis">
                            <v-icon size="48" class="mr-3">mdi-chart-bar</v-icon>
                            <span>No hay ingresos registrados</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Procedimientos más usados (Barras Horizontales) -->
            <v-col cols="12" lg="6">
                <v-card elevation="2" class="rounded-xl chart-card">
                    <v-card-item>
                        <template v-slot:title>
                            <div class="d-flex align-center">
                                <v-icon color="indigo" class="mr-2">mdi-chart-bar-stacked</v-icon>
                                <span class="text-subtitle-1 font-weight-bold">Procedimientos Más Usados</span>
                            </div>
                        </template>
                        <template v-slot:subtitle>
                            <span class="text-caption">Top procedimientos en cotizaciones</span>
                        </template>
                    </v-card-item>
                    <v-card-text class="pa-4 pt-0">
                        <apexchart
                            v-if="dashboardData.topProcedures.length"
                            type="bar"
                            height="280"
                            :options="topProceduresOptions"
                            :series="topProceduresSeries"
                        />
                        <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis">
                            <v-icon size="48" class="mr-3">mdi-stethoscope</v-icon>
                            <span>Sin procedimientos registrados</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- ============ ÚLTIMAS COTIZACIONES ============ -->
        <v-row class="mb-4">
            <v-col cols="12">
                <div class="d-flex align-center mb-2">
                    <v-icon color="warning" class="mr-2">mdi-file-document-multiple-outline</v-icon>
                    <span class="text-h6 font-weight-bold text-grey-darken-1">Últimas Cotizaciones</span>
                    <v-divider class="ml-4"></v-divider>
                </div>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-card elevation="2" class="rounded-xl">
                    <v-table class="recent-quotes-table">
                        <thead>
                            <tr>
                                <th class="text-overline font-weight-bold text-grey">N°</th>
                                <th class="text-overline font-weight-bold text-grey">Cliente</th>
                                <th class="text-overline font-weight-bold text-grey">Monto</th>
                                <th class="text-overline font-weight-bold text-grey">Estado</th>
                                <th class="text-overline font-weight-bold text-grey">Fecha</th>
                                <th class="text-overline font-weight-bold text-grey text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="quote in dashboardData.recentQuotes" :key="quote.id"
                                class="quote-row">
                                <td class="font-weight-medium">{{ quote.tx_nro }}</td>
                                <td>
                                    <div class="d-flex align-center">
                                        <v-avatar size="32" color="lightprimary" class="mr-2">
                                            <v-icon size="16" color="primary">mdi-account</v-icon>
                                        </v-avatar>
                                        <span>{{ quote.customer_name }}</span>
                                    </div>
                                </td>
                                <td class="font-weight-bold">{{ formatCurrency(quote.fl_total_cost) }}</td>
                                <td>
                                    <v-chip
                                        :color="getStatusColor(quote.status_label)"
                                        size="small"
                                        variant="flat"
                                        class="font-weight-medium"
                                        label
                                    >
                                        {{ quote.status_label }}
                                    </v-chip>
                                </td>
                                <td class="text-medium-emphasis">{{ formatDate(quote.date_add) }}</td>
                                <td class="text-center">
                                    <v-btn
                                        icon="mdi-eye-outline"
                                        variant="text"
                                        color="primary"
                                        size="small"
                                        @click="router.push(`/quotes-edt/${quote.id}`)"
                                    />
                                </td>
                            </tr>
                            <tr v-if="!dashboardData.recentQuotes.length">
                                <td colspan="6" class="text-center py-6 text-medium-emphasis">
                                    <v-icon size="40" class="mb-2">mdi-file-document-remove-outline</v-icon>
                                    <br>No hay cotizaciones recientes
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-col>
        </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.kpi-card {
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.04) !important;
}
.kpi-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important;
}

.kpi-card-mini {
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.04) !important;
}
.kpi-card-mini:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important;
}

.chart-card {
    border: 1px solid rgba(0,0,0,0.04) !important;
    transition: all 0.3s ease;
}
.chart-card:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.06) !important;
}

.h-100 {
    height: 100%;
}

.border-top.border-primary { border-top: 4px solid rgb(var(--v-theme-primary)) !important; }
.border-top.border-warning { border-top: 4px solid rgb(var(--v-theme-warning)) !important; }
.border-top.border-indigo { border-top: 4px solid rgb(var(--v-theme-indigo)) !important; }

.quote-row {
    transition: background-color 0.2s ease;
}
.quote-row:hover {
    background-color: rgba(var(--v-theme-primary), 0.03);
}

.recent-quotes-table th {
    font-size: 11px !important;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #707a82 !important;
}
</style>
