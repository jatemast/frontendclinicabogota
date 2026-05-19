<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { useRouter } from 'vue-router';

const { notify } = useNotification();
const router = useRouter();
const loading = ref(true);

const isMaster = computed(() => {
    const val = localStorage.getItem('is_master');
    return val === 'true' || val === '1';
});

const dashboardData = ref<any>({});

// ==================== HELPERS ====================
const monthLabels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const getMonthLabel = (monthStr: string) => {
    const [, m] = monthStr.split('-');
    return monthLabels[parseInt(m) - 1] || monthStr;
};

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
        'Pendiente': 'warning', 'Aprobada': 'success', 'Rechazada': 'error', 'Cancelada': 'secondary'
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

const goTo = (path: string) => router.push(path);

// ==================== APEX CHARTS FACTORY ====================
const areaOpts = (data: any[], color: string) => ({
    chart: { type: 'area', height: 320, fontFamily: 'inherit', foreColor: '#5A6A7A', toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [color], dataLabels: { enabled: false }, stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 0.2, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] } },
    grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 4, padding: { left: 0, right: 0 } },
    xaxis: { categories: data.map((d: any) => getMonthLabel(d.month)), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '12px' } } },
    yaxis: { labels: { style: { fontSize: '12px' } }, min: 0, forceNiceScale: true },
    tooltip: { theme: 'light' }
});
const areaSer = (data: any[], name: string) => [{ name, data: data.map((d: any) => d.total) }];

const donutOpts = (labels: string[], colors: string[]) => ({
    chart: { type: 'donut', height: 300, fontFamily: 'inherit', foreColor: '#5A6A7A', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors, labels,
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%`, style: { fontSize: '13px', fontWeight: 600 } },
    legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '13px', markers: { width: 10, height: 10, radius: 2 }, itemMargin: { horizontal: 10 } },
    plotOptions: { pie: { donut: { size: '60%', labels: { show: true, total: { show: true, label: 'Total', formatter: () => '0' } } } } },
    tooltip: { y: { formatter: (val: number) => `${val}` } },
    responsive: [{ breakpoint: 480, options: { chart: { width: '100%' }, legend: { position: 'bottom' } } }]
});

const barOpts = (data: any[], color: string, prefix: string = '') => ({
    chart: { type: 'bar', height: 320, fontFamily: 'inherit', foreColor: '#5A6A7A', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [color],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', dataLabels: { position: 'top' } } },
    dataLabels: { enabled: true, formatter: (val: number) => prefix === '$' ? (val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`) : `${val}`, offsetY: -20, style: { fontSize: '11px', fontWeight: 600, colors: ['#5A6A7A'] } },
    grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 4, padding: { top: 30, left: 0, right: 0 } },
    xaxis: { categories: data.map((d: any) => getMonthLabel(d.month)), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '12px' } } },
    yaxis: { labels: { formatter: (val: number) => prefix === '$' ? (val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`) : `${val}`, style: { fontSize: '12px' } } },
    tooltip: { theme: 'light', y: { formatter: (val: number) => prefix === '$' ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `${val}` } }
});
const barSer = (data: any[], name: string) => [{ name, data: data.map((d: any) => d.total) }];

const hbarOpts = (categories: string[], color: string) => ({
    chart: { type: 'bar', height: 280, fontFamily: 'inherit', foreColor: '#5A6A7A', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [color],
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '60%', dataLabels: { position: 'center' } } },
    dataLabels: { enabled: true, formatter: (val: number) => `${val}`, style: { fontSize: '12px', fontWeight: 600, colors: ['#fff'] } },
    grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 4, padding: { left: 0, right: 0 } },
    xaxis: { categories, labels: { style: { fontSize: '12px' } } },
    yaxis: { labels: { style: { fontSize: '12px' } } },
    tooltip: { theme: 'light', y: { formatter: (val: number) => `${val}` } }
});

// ==================== COMPUTED CHARTS ====================
// Master
const mBizOpts = computed(() => areaOpts(dashboardData.value.monthlyBusinesses || [], '#2eced5'));
const mBizSer = computed(() => areaSer(dashboardData.value.monthlyBusinesses || [], 'Empresas'));
const mCustOpts = computed(() => areaOpts(dashboardData.value.monthlyCustomers || [], '#4bd08b'));
const mCustSer = computed(() => areaSer(dashboardData.value.monthlyCustomers || [], 'Clientes'));
const mRevOpts = computed(() => barOpts(dashboardData.value.monthlyRevenue || [], '#4bd08b', '$'));
const mRevSer = computed(() => barSer(dashboardData.value.monthlyRevenue || [], 'Ingresos'));
const mQStatusOpts = computed(() => {
    const d = dashboardData.value.quotesByStatus || [];
    return donutOpts(d.map((x: any) => x.status), ['#ffa726', '#4bd08b', '#8e1b22', '#707a82']);
});
const mQStatusSer = computed(() => (dashboardData.value.quotesByStatus || []).map((d: any) => d.total));
const mTopBizOpts = computed(() => {
    const d = dashboardData.value.topBusinesses || [];
    return hbarOpts(d.map((x: any) => x.tx_name), '#8763da');
});
const mTopBizSer = computed(() => [{ name: 'Clientes', data: (dashboardData.value.topBusinesses || []).map((d: any) => d.total_customers) }]);
const mTopProcOpts = computed(() => {
    const d = dashboardData.value.topProcedures || [];
    return hbarOpts(d.map((x: any) => x.tx_name), '#eacc83');
});
const mTopProcSer = computed(() => [{ name: 'Usos', data: (dashboardData.value.topProcedures || []).map((d: any) => d.total) }]);

// Empresa
const cCustOpts = computed(() => areaOpts(dashboardData.value.monthlyCustomers || [], '#2eced5'));
const cCustSer = computed(() => areaSer(dashboardData.value.monthlyCustomers || [], 'Clientes'));
const cQStatusOpts = computed(() => {
    const d = dashboardData.value.quotesByStatus || [];
    return donutOpts(d.map((x: any) => x.status), ['#ffa726', '#4bd08b', '#8e1b22', '#707a82']);
});
const cQStatusSer = computed(() => (dashboardData.value.quotesByStatus || []).map((d: any) => d.total));
const cRevOpts = computed(() => barOpts(dashboardData.value.monthlyRevenue || [], '#4bd08b', '$'));
const cRevSer = computed(() => barSer(dashboardData.value.monthlyRevenue || [], 'Ingresos'));
const cTopProcOpts = computed(() => {
    const d = dashboardData.value.topProcedures || [];
    return hbarOpts(d.map((x: any) => x.tx_name), '#8763da');
});
const cTopProcSer = computed(() => [{ name: 'Usos', data: (dashboardData.value.topProcedures || []).map((d: any) => d.total) }]);

// ==================== FETCH ====================
const fetchData = async () => {
    loading.value = true;
    try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        const endpoint = isMaster.value
            ? `${import.meta.env.VITE_API_URL}api/dashboard/master`
            : `${import.meta.env.VITE_API_URL}api/dashboard/full`;
        const res = await axios.get(endpoint, { headers });
        if (res.data.status) dashboardData.value = res.data.data;
    } catch (error) {
        notify('error', 'Error al cargar indicadores del dashboard');
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4">
        <v-col cols="12" md="8">
            <h1 class="text-h4 font-weight-bold text-grey-darken-3">
                <v-icon size="36" :color="isMaster ? 'error' : 'primary'" class="mr-2">
                    {{ isMaster ? 'mdi-domain' : 'mdi-view-dashboard-outline' }}
                </v-icon>
                {{ isMaster ? 'Panel Global - SuperAdmin' : 'Panel de Control' }}
            </h1>
            <p class="text-body-2 text-medium-emphasis mt-1 ml-1">
                {{ isMaster
                    ? 'Métricas globales de todas las empresas registradas en el sistema'
                    : 'Resumen operativo y métricas clave de tu negocio'
                }}
            </p>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-end justify-end">
            <v-btn variant="outlined" color="primary" @click="fetchData" :loading="loading" size="small">
                <v-icon start>mdi-refresh</v-icon> Actualizar
            </v-btn>
        </v-col>
    </v-row>

    <template v-if="loading">
        <v-row>
            <v-col v-for="n in 4" :key="n" cols="12" sm="6" lg="3">
                <v-skeleton-loader type="card-avatar, article" class="rounded-xl"></v-skeleton-loader>
            </v-col>
        </v-row>
        <v-row class="mt-4">
            <v-col cols="12" md="8"><v-skeleton-loader type="image" height="320" class="rounded-xl"></v-skeleton-loader></v-col>
            <v-col cols="12" md="4"><v-skeleton-loader type="image" height="320" class="rounded-xl"></v-skeleton-loader></v-col>
        </v-row>
    </template>

    <template v-else>
        <!-- ==================== MASTER VIEW ==================== -->
        <template v-if="isMaster">
            <v-row class="mb-6">
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="2" class="rounded-xl kpi-card" @click="goTo('/saas/tenants')" style="cursor: pointer;">
                        <v-card-text class="pa-5">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <span class="text-overline font-weight-bold text-primary">Empresas Registradas</span>
                                    <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.totalBusinesses || 0 }}</h2>
                                </div>
                                <v-avatar color="lightprimary" size="56" rounded="lg"><v-icon color="primary" size="28">mdi-domain</v-icon></v-avatar>
                            </div>
                            <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                                <v-icon size="14" color="success" class="mr-1">mdi-circle-small</v-icon>
                                <span>Clientes SaaS activos</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="2" class="rounded-xl kpi-card">
                        <v-card-text class="pa-5">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <span class="text-overline font-weight-bold text-success">Usuarios del Sistema</span>
                                    <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.totalUsers || 0 }}</h2>
                                </div>
                                <v-avatar color="lightsuccess" size="56" rounded="lg"><v-icon color="success" size="28">mdi-account-tie</v-icon></v-avatar>
                            </div>
                            <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                                <v-icon size="14" color="success" class="mr-1">mdi-circle-small</v-icon>
                                <span>En todas las empresas</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="2" class="rounded-xl kpi-card">
                        <v-card-text class="pa-5">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <span class="text-overline font-weight-bold text-warning">Clientes Finales</span>
                                    <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.totalCustomers || 0 }}</h2>
                                </div>
                                <v-avatar color="lightwarning" size="56" rounded="lg"><v-icon color="warning" size="28">mdi-account-group</v-icon></v-avatar>
                            </div>
                            <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                                <v-icon size="14" color="warning" class="mr-1">mdi-trending-up</v-icon>
                                <span>Pacientes registrados</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="2" class="rounded-xl kpi-card">
                        <v-card-text class="pa-5">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <span class="text-overline font-weight-bold text-indigo">Cotizaciones Globales</span>
                                    <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.totalQuotes || 0 }}</h2>
                                </div>
                                <v-avatar color="lightindigo" size="56" rounded="lg"><v-icon color="indigo" size="28">mdi-file-document-multiple</v-icon></v-avatar>
                            </div>
                            <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                                <v-icon size="14" color="indigo" class="mr-1">mdi-circle-small</v-icon>
                                <span>En todo el sistema</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-4">
                <v-col cols="12">
                    <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2">mdi-account-tie-outline</v-icon>
                        <span class="text-h6 font-weight-bold text-grey-darken-1">Distribución Global del Personal</span>
                        <v-divider class="ml-4"></v-divider>
                    </div>
                </v-col>
            </v-row>
            <v-row class="mb-8">
                <v-col v-for="user in (dashboardData.usersByType || [])" :key="user.type" cols="12" sm="6" md="4">
                    <v-card elevation="2" class="rounded-xl kpi-card-mini border-top" :class="`border-${getKpiConfig(user.type).color}`">
                        <v-card-text class="pa-4 d-flex align-center">
                            <v-avatar :color="`${getKpiConfig(user.type).color}-lighten-5`" size="52" rounded="lg" class="mr-4">
                                <v-icon :color="getKpiConfig(user.type).color" size="26">{{ getKpiConfig(user.type).icon }}</v-icon>
                            </v-avatar>
                            <div>
                                <span class="text-body-2 text-medium-emphasis font-weight-medium">{{ getKpiConfig(user.type).label }}</span>
                                <h3 class="text-h4 font-weight-black mt-1">{{ user.total }}</h3>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-6">
                <v-col cols="12" lg="6">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="primary" class="mr-2">mdi-chart-bell-curve-cumulative</v-icon><span class="text-subtitle-1 font-weight-bold">Empresas Registradas por Mes</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Últimos 12 meses</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.monthlyBusinesses || []).length" type="area" height="320" :options="mBizOpts" :series="mBizSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-chart-line</v-icon><span>No hay datos de empresas aún</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" lg="6">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="success" class="mr-2">mdi-chart-bell-curve-cumulative</v-icon><span class="text-subtitle-1 font-weight-bold">Clientes Registrados por Mes</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Pacientes - Últimos 12 meses</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.monthlyCustomers || []).length" type="area" height="320" :options="mCustOpts" :series="mCustSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-chart-line</v-icon><span>No hay datos de clientes aún</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-6">
                <v-col cols="12" lg="5">
                    <v-card elevation="2" class="rounded-xl chart-card h-100">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="warning" class="mr-2">mdi-chart-donut</v-icon><span class="text-subtitle-1 font-weight-bold">Estado Cotizaciones</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Distribución global</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.quotesByStatus || []).length" type="donut" height="300" :options="mQStatusOpts" :series="mQStatusSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-chart-pie</v-icon><span>Sin cotizaciones</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" lg="7">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="success" class="mr-2">mdi-chart-bar</v-icon><span class="text-subtitle-1 font-weight-bold">Ingresos Mensuales Globales</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Cotizaciones aprobadas - Últimos 12 meses</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.monthlyRevenue || []).length" type="bar" height="320" :options="mRevOpts" :series="mRevSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-chart-bar</v-icon><span>No hay ingresos registrados</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-6">
                <v-col cols="12" lg="6">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="indigo" class="mr-2">mdi-chart-bar-stacked</v-icon><span class="text-subtitle-1 font-weight-bold">Top Empresas con Más Clientes</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Ranking de empresas</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.topBusinesses || []).length" type="bar" height="280" :options="mTopBizOpts" :series="mTopBizSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-poll</v-icon><span>Sin datos de empresas</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" lg="6">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="info" class="mr-2">mdi-stethoscope</v-icon><span class="text-subtitle-1 font-weight-bold">Procedimientos Más Usados</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Top procedimientos globales</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.topProcedures || []).length" type="bar" height="280" :options="mTopProcOpts" :series="mTopProcSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-stethoscope</v-icon><span>Sin procedimientos registrados</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-4">
                <v-col cols="12">
                    <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2">mdi-domain-plus</v-icon>
                        <span class="text-h6 font-weight-bold text-grey-darken-1">Últimas Empresas Registradas</span>
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
                                    <th class="text-overline font-weight-bold text-grey">#</th>
                                    <th class="text-overline font-weight-bold text-grey">Empresa</th>
                                    <th class="text-overline font-weight-bold text-grey">Propietario</th>
                                    <th class="text-overline font-weight-bold text-grey">Email</th>
                                    <th class="text-overline font-weight-bold text-grey">Teléfono</th>
                                    <th class="text-overline font-weight-bold text-grey">Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(biz, i) in (dashboardData.recentBusinesses || [])" :key="biz.id" class="quote-row">
                                    <td class="font-weight-medium">{{ i + 1 }}</td>
                                    <td>
                                        <div class="d-flex align-center">
                                            <v-avatar size="32" color="lightprimary" class="mr-2"><v-icon size="16" color="primary">mdi-domain</v-icon></v-avatar>
                                            <span class="font-weight-medium">{{ biz.tx_name }}</span>
                                        </div>
                                    </td>
                                    <td>{{ biz.tx_owner }}</td>
                                    <td>{{ biz.tx_owner_email }}</td>
                                    <td>{{ biz.tx_owner_phone }}</td>
                                    <td class="text-medium-emphasis">{{ formatDate(biz.date_add) }}</td>
                                </tr>
                                <tr v-if="!(dashboardData.recentBusinesses || []).length">
                                    <td colspan="6" class="text-center py-6 text-medium-emphasis">
                                        <v-icon size="40" class="mb-2">mdi-domain-off</v-icon><br>No hay empresas registradas aún
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                </v-col>
            </v-row>
        </template>

        <!-- ==================== EMPRESA VIEW ==================== -->
        <template v-else>
            <v-row class="mb-6">
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="2" class="rounded-xl kpi-card" @click="goTo('/users')" style="cursor: pointer;">
                        <v-card-text class="pa-5">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <span class="text-overline font-weight-bold text-primary">Personal Activo</span>
                                    <h2 class="text-h3 font-weight-black mt-1">{{ (dashboardData.usersByType || []).reduce((s: number, u: any) => s + u.total, 0) }}</h2>
                                </div>
                                <v-avatar color="lightprimary" size="56" rounded="lg"><v-icon color="primary" size="28">mdi-account-tie</v-icon></v-avatar>
                            </div>
                            <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                                <v-icon size="14" color="success" class="mr-1">mdi-circle-small</v-icon>
                                <span>Distribuido en {{ (dashboardData.usersByType || []).length }} roles</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="2" class="rounded-xl kpi-card" @click="goTo('/customers')" style="cursor: pointer;">
                        <v-card-text class="pa-5">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <span class="text-overline font-weight-bold text-success">Clientes Registrados</span>
                                    <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.totalCustomers || 0 }}</h2>
                                </div>
                                <v-avatar color="lightsuccess" size="56" rounded="lg"><v-icon color="success" size="28">mdi-account-group</v-icon></v-avatar>
                            </div>
                            <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                                <v-icon size="14" color="success" class="mr-1">mdi-trending-up</v-icon>
                                <span>Crecimiento acumulado</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="2" class="rounded-xl kpi-card" @click="goTo('/quotes')" style="cursor: pointer;">
                        <v-card-text class="pa-5">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <span class="text-overline font-weight-bold text-warning">Cotizaciones</span>
                                    <h2 class="text-h3 font-weight-black mt-1">{{ dashboardData.totalQuotes || 0 }}</h2>
                                </div>
                                <v-avatar color="lightwarning" size="56" rounded="lg"><v-icon color="warning" size="28">mdi-file-document-outline</v-icon></v-avatar>
                            </div>
                            <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                                <v-icon size="14" color="warning" class="mr-1">mdi-circle-small</v-icon>
                                <span>{{ (dashboardData.quotesByStatus || []).find((d: any) => d.status === 'Aprobada')?.total || 0 }} aprobadas</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="2" class="rounded-xl kpi-card">
                        <v-card-text class="pa-5">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <span class="text-overline font-weight-bold text-indigo">Procedimientos</span>
                                    <h2 class="text-h3 font-weight-black mt-1">{{ (dashboardData.topProcedures || []).length }}</h2>
                                </div>
                                <v-avatar color="lightindigo" size="56" rounded="lg"><v-icon color="indigo" size="28">mdi-stethoscope</v-icon></v-avatar>
                            </div>
                            <div class="mt-3 d-flex align-center text-caption text-medium-emphasis">
                                <v-icon size="14" color="indigo" class="mr-1">mdi-circle-small</v-icon>
                                <span>Tipos de procedimientos</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

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
                <v-col v-for="user in (dashboardData.usersByType || [])" :key="user.type" cols="12" sm="6" md="4">
                    <v-card elevation="2" class="rounded-xl kpi-card-mini border-top" :class="`border-${getKpiConfig(user.type).color}`">
                        <v-card-text class="pa-4 d-flex align-center">
                            <v-avatar :color="`${getKpiConfig(user.type).color}-lighten-5`" size="52" rounded="lg" class="mr-4">
                                <v-icon :color="getKpiConfig(user.type).color" size="26">{{ getKpiConfig(user.type).icon }}</v-icon>
                            </v-avatar>
                            <div>
                                <span class="text-body-2 text-medium-emphasis font-weight-medium">{{ getKpiConfig(user.type).label }}</span>
                                <h3 class="text-h4 font-weight-black mt-1">{{ user.total }}</h3>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-6">
                <v-col cols="12" lg="6">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="primary" class="mr-2">mdi-chart-bell-curve-cumulative</v-icon><span class="text-subtitle-1 font-weight-bold">Crecimiento de Clientes</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Nuevos pacientes por mes</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.monthlyCustomers || []).length" type="area" height="320" :options="cCustOpts" :series="cCustSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-chart-line</v-icon><span>No hay datos de clientes aún</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" lg="6">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="warning" class="mr-2">mdi-chart-donut</v-icon><span class="text-subtitle-1 font-weight-bold">Estado de Cotizaciones</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Distribución por estado</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.quotesByStatus || []).length" type="donut" height="300" :options="cQStatusOpts" :series="cQStatusSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-chart-pie</v-icon><span>Sin cotizaciones</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-6">
                <v-col cols="12" lg="6">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="success" class="mr-2">mdi-chart-bar</v-icon><span class="text-subtitle-1 font-weight-bold">Ingresos Mensuales</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Cotizaciones aprobadas - Últimos 12 meses</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.monthlyRevenue || []).length" type="bar" height="320" :options="cRevOpts" :series="cRevSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-chart-bar</v-icon><span>No hay ingresos registrados</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" lg="6">
                    <v-card elevation="2" class="rounded-xl chart-card">
                        <v-card-item>
                            <template v-slot:title><div class="d-flex align-center"><v-icon color="indigo" class="mr-2">mdi-stethoscope</v-icon><span class="text-subtitle-1 font-weight-bold">Procedimientos Más Usados</span></div></template>
                            <template v-slot:subtitle><span class="text-caption">Top procedimientos</span></template>
                        </v-card-item>
                        <v-card-text class="pa-4 pt-0">
                            <apexchart v-if="(dashboardData.topProcedures || []).length" type="bar" height="280" :options="cTopProcOpts" :series="cTopProcSer" />
                            <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis"><v-icon size="48" class="mr-3">mdi-stethoscope</v-icon><span>Sin procedimientos registrados</span></div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-4">
                <v-col cols="12">
                    <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2">mdi-file-document-multiple-outline</v-icon>
                        <span class="text-h6 font-weight-bold text-grey-darken-1">Cotizaciones Recientes</span>
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
                                    <th class="text-overline font-weight-bold text-grey">#</th>
                                    <th class="text-overline font-weight-bold text-grey">Cliente</th>
                                    <th class="text-overline font-weight-bold text-grey">Total</th>
                                    <th class="text-overline font-weight-bold text-grey">Estado</th>
                                    <th class="text-overline font-weight-bold text-grey">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(q, i) in (dashboardData.recentQuotes || [])" :key="q.id" class="quote-row">
                                    <td class="font-weight-medium">{{ i + 1 }}</td>
                                    <td>
                                        <div class="d-flex align-center">
                                            <v-avatar size="32" color="lightprimary" class="mr-2"><v-icon size="16" color="primary">mdi-account</v-icon></v-avatar>
                                            <span class="font-weight-medium">{{ q.tx_name || q.cliente || 'N/A' }}</span>
                                        </div>
                                    </td>
                                    <td class="font-weight-bold text-success">{{ formatCurrency(q.total || q.nu_total || 0) }}</td>
                                    <td>
                                        <v-chip size="small" :color="getStatusColor(q.tx_status || q.status)" variant="tonal" class="font-weight-medium">
                                            {{ q.tx_status || q.status }}
                                        </v-chip>
                                    </td>
                                    <td class="text-medium-emphasis">{{ formatDate(q.date_add || q.fecha) }}</td>
                                </tr>
                                <tr v-if="!(dashboardData.recentQuotes || []).length">
                                    <td colspan="5" class="text-center py-6 text-medium-emphasis">
                                        <v-icon size="40" class="mb-2">mdi-file-document-remove-outline</v-icon><br>No hay cotizaciones recientes
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                </v-col>
            </v-row>
        </template>
    </template>
  </v-container>
</template>

<style scoped>
.kpi-card {
    transition: all 0.25s ease;
    border-left: 4px solid transparent;
}
.kpi-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important;
}
.kpi-card-mini {
    transition: all 0.25s ease;
}
.kpi-card-mini:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.08) !important;
}
.chart-card {
    transition: all 0.25s ease;
}
.chart-card:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important;
}
.quote-row {
    transition: background 0.15s ease;
}
.quote-row:hover {
    background: rgba(46, 206, 213, 0.04);
}
.recent-quotes-table th {
    font-size: 0.7rem !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 14px 16px !important;
    background: #f8fafc;
}
.recent-quotes-table td {
    padding: 12px 16px !important;
    border-bottom: 1px solid rgba(0,0,0,0.04);
}
.h-100 {
    height: 100%;
}
.border-top {
    border-top: 3px solid;
}
</style>
