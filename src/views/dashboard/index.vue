<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { useRouter } from 'vue-router';

const { notify } = useNotification();
const router = useRouter();
const loading = ref(true);

const userName = computed(() => localStorage.getItem('user_display') || 'Dr. Andrés');
const currentDate = computed(() => {
    const d = new Date();
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
});

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
const mBizOpts = computed(() => areaOpts(dashboardData.value.monthlyBusinesses || [], '#18B6C9'));
const mBizSer = computed(() => areaSer(dashboardData.value.monthlyBusinesses || [], 'Empresas'));
const mCustOpts = computed(() => areaOpts(dashboardData.value.monthlyCustomers || [], '#10B981'));
const mCustSer = computed(() => areaSer(dashboardData.value.monthlyCustomers || [], 'Clientes'));
const mRevOpts = computed(() => barOpts(dashboardData.value.monthlyRevenue || [], '#10B981', '$'));
const mRevSer = computed(() => barSer(dashboardData.value.monthlyRevenue || [], 'Ingresos'));
const mQStatusOpts = computed(() => {
    const d = dashboardData.value.quotesByStatus || [];
    return donutOpts(d.map((x: any) => x.status), ['#F59E0B', '#10B981', '#EF4444', '#64748B']);
});
const mQStatusSer = computed(() => (dashboardData.value.quotesByStatus || []).map((d: any) => d.total));
const mTopBizOpts = computed(() => {
    const d = dashboardData.value.topBusinesses || [];
    return hbarOpts(d.map((x: any) => x.tx_name), '#0F766E');
});
const mTopBizSer = computed(() => [{ name: 'Clientes', data: (dashboardData.value.topBusinesses || []).map((d: any) => d.total_customers) }]);
const mTopProcOpts = computed(() => {
    const d = dashboardData.value.topProcedures || [];
    return hbarOpts(d.map((x: any) => x.tx_name), '#3B82F6');
});
const mTopProcSer = computed(() => [{ name: 'Usos', data: (dashboardData.value.topProcedures || []).map((d: any) => d.total) }]);

// Empresa
const cCustOpts = computed(() => areaOpts(dashboardData.value.monthlyCustomers || [], '#18B6C9'));
const cCustSer = computed(() => areaSer(dashboardData.value.monthlyCustomers || [], 'Clientes'));
const cQStatusOpts = computed(() => {
    const d = dashboardData.value.quotesByStatus || [];
    return donutOpts(d.map((x: any) => x.status), ['#F59E0B', '#10B981', '#EF4444', '#64748B']);
});
const cQStatusSer = computed(() => (dashboardData.value.quotesByStatus || []).map((d: any) => d.total));
const cRevOpts = computed(() => barOpts(dashboardData.value.monthlyRevenue || [], '#10B981', '$'));
const cRevSer = computed(() => barSer(dashboardData.value.monthlyRevenue || [], 'Ingresos'));
const cTopProcOpts = computed(() => {
    const d = dashboardData.value.topProcedures || [];
    return hbarOpts(d.map((x: any) => x.tx_name), '#0F766E');
});
const cTopProcSer = computed(() => [{ name: 'Usos', data: (dashboardData.value.topProcedures || []).map((d: any) => d.total) }]);

// ==================== FETCH ====================
const appointmentStats = ref<any>({});

const fetchAppointmentStats = async () => {
    if (isMaster.value) return;
    try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
            `${import.meta.env.VITE_API_URL}api/appointments/dashboard`,
            { headers }
        );
        if (res.data.status) appointmentStats.value = res.data.data;
    } catch (error) {
        // Silently fail - appointments are optional
    }
};

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

onMounted(() => {
    fetchData();
    fetchAppointmentStats();
});
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header Banner LogicSurgi Style -->
    <v-card elevation="0" rounded="xl" class="border bg-surface mb-6 pa-4 pa-sm-6">
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-4">
        <div>
          <h2 class="text-h4 font-weight-bold text-primary mb-1">
            ¡Bienvenido, {{ isMaster ? 'SuperAdmin ' : '' }}{{ userName }}!
          </h2>
          <p class="text-body-2 text-secondary mb-0">
            {{ isMaster
              ? 'Panel de control global y métricas del sistema SaaS LogicSurgi'
              : 'Aquí tienes el resumen general de tu actividad clínica hoy.'
            }}
          </p>
        </div>
        <div class="d-flex align-center gap-3">
          <v-chip :color="isMaster ? 'error' : 'primary'" variant="flat" class="font-weight-bold px-4 py-2" rounded="lg">
            <v-icon start size="16">{{ isMaster ? 'mdi-domain' : 'mdi-calendar-range' }}</v-icon>
            {{ isMaster ? 'PANEL MASTER SAAS' : currentDate }}
          </v-chip>
          <v-btn variant="tonal" color="primary" icon size="40" @click="fetchData" :loading="loading">
            <v-icon size="18">mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>

    <template v-if="loading">
        <v-row>
            <v-col v-for="n in 4" :key="n" cols="12" sm="6" lg="3">
                <v-skeleton-loader type="card" class="rounded-xl"></v-skeleton-loader>
            </v-col>
        </v-row>
        <v-row class="mt-4">
            <v-col cols="12" md="7"><v-skeleton-loader type="image" height="340" class="rounded-xl"></v-skeleton-loader></v-col>
            <v-col cols="12" md="5"><v-skeleton-loader type="image" height="340" class="rounded-xl"></v-skeleton-loader></v-col>
        </v-row>
    </template>

    <template v-else>
        <!-- ========================================================================= -->
        <!-- ==================== VISTA SUPERADMIN / MASTER SAAS ==================== -->
        <!-- ========================================================================= -->
        <template v-if="isMaster">
            <!-- MASTER TOP 4 KPI CARDS -->
            <v-row class="mb-6">
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="0" rounded="xl" class="border kpi-card-ls pa-4 bg-surface" @click="goTo('/saas/tenants')" style="cursor: pointer;">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <v-avatar color="lightprimary" size="48" rounded="lg">
                                <v-icon color="primary" size="24">mdi-domain</v-icon>
                            </v-avatar>
                            <span class="text-h3 font-weight-bold text-primary">{{ dashboardData.totalBusinesses || 0 }}</span>
                        </div>
                        <div>
                            <span class="text-caption font-weight-bold text-secondary text-uppercase">Empresas Registradas</span>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="0" rounded="xl" class="border kpi-card-ls pa-4 bg-surface" @click="goTo('/users')" style="cursor: pointer;">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <v-avatar color="lightsuccess" size="48" rounded="lg">
                                <v-icon color="success" size="24">mdi-account-tie</v-icon>
                            </v-avatar>
                            <span class="text-h3 font-weight-bold text-success">{{ dashboardData.totalUsers || 0 }}</span>
                        </div>
                        <div>
                            <span class="text-caption font-weight-bold text-secondary text-uppercase">Usuarios del Sistema</span>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="0" rounded="xl" class="border kpi-card-ls pa-4 bg-surface" @click="goTo('/customers')" style="cursor: pointer;">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <v-avatar color="lightwarning" size="48" rounded="lg">
                                <v-icon color="warning" size="24">mdi-account-group</v-icon>
                            </v-avatar>
                            <span class="text-h3 font-weight-bold text-warning">{{ dashboardData.totalCustomers || 0 }}</span>
                        </div>
                        <div>
                            <span class="text-caption font-weight-bold text-secondary text-uppercase">Clientes Finales</span>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="0" rounded="xl" class="border kpi-card-ls pa-4 bg-surface" @click="goTo('/quotes')" style="cursor: pointer;">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <v-avatar color="lightinfo" size="48" rounded="lg">
                                <v-icon color="info" size="24">mdi-file-document-multiple</v-icon>
                            </v-avatar>
                            <span class="text-h3 font-weight-bold text-info">{{ dashboardData.totalQuotes || 0 }}</span>
                        </div>
                        <div>
                            <span class="text-caption font-weight-bold text-secondary text-uppercase">Cotizaciones Globales</span>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- MASTER CHARTS ROW 1 -->
            <v-row class="mb-6">
                <v-col cols="12" lg="6">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5 h-100">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <div>
                                <span class="text-caption font-weight-bold text-uppercase text-secondary">Crecimiento de Empresas SaaS</span>
                                <h3 class="text-h5 font-weight-bold text-primary mt-1">Nuevas empresas por mes</h3>
                            </div>
                        </div>
                        <apexchart v-if="(dashboardData.monthlyBusinesses || []).length" type="area" height="300" :options="mBizOpts" :series="mBizSer" />
                        <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis">
                            <v-icon size="48" class="mr-3">mdi-domain-off</v-icon><span>No hay datos de empresas aún</span>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" lg="6">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5 h-100">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <div>
                                <span class="text-caption font-weight-bold text-uppercase text-secondary">Pacientes Registrados Globales</span>
                                <h3 class="text-h5 font-weight-bold text-success mt-1">Crecimiento mensual de pacientes</h3>
                            </div>
                        </div>
                        <apexchart v-if="(dashboardData.monthlyCustomers || []).length" type="area" height="300" :options="mCustOpts" :series="mCustSer" />
                        <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis">
                            <v-icon size="48" class="mr-3">mdi-account-search</v-icon><span>No hay datos de clientes aún</span>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- MASTER CHARTS ROW 2 -->
            <v-row class="mb-6">
                <v-col cols="12" lg="5">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5 h-100">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <span class="text-subtitle-1 font-weight-bold text-primary">Estado Global de Cotizaciones</span>
                        </div>
                        <apexchart v-if="(dashboardData.quotesByStatus || []).length" type="donut" height="280" :options="mQStatusOpts" :series="mQStatusSer" />
                        <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis">
                            <v-icon size="48" class="mr-3">mdi-chart-pie</v-icon><span>Sin cotizaciones en el sistema</span>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" lg="7">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5 h-100">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <span class="text-subtitle-1 font-weight-bold text-primary">Ingresos Mensuales Globales</span>
                        </div>
                        <apexchart v-if="(dashboardData.monthlyRevenue || []).length" type="bar" height="280" :options="mRevOpts" :series="mRevSer" />
                        <div v-else class="d-flex align-center justify-center py-10 text-medium-emphasis">
                            <v-icon size="48" class="mr-3">mdi-chart-bar</v-icon><span>No hay ingresos registrados</span>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- MASTER RECENT BUSINESSES TABLE -->
            <v-row class="mb-4">
                <v-col cols="12">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <span class="text-subtitle-1 font-weight-bold text-primary">Últimas Empresas Registradas</span>
                            <v-btn size="small" variant="text" color="primary" @click="goTo('/saas/tenants')">Ver todas las empresas</v-btn>
                        </div>
                        <v-table class="recent-quotes-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Empresa</th>
                                    <th>Propietario</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>Fecha Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(biz, i) in (dashboardData.recentBusinesses || [])" :key="biz.id">
                                    <td class="font-weight-bold">{{ i + 1 }}</td>
                                    <td>
                                        <div class="d-flex align-center">
                                            <v-avatar size="32" color="lightprimary" class="mr-2">
                                                <v-icon size="16" color="primary">mdi-domain</v-icon>
                                            </v-avatar>
                                            <span class="font-weight-medium">{{ biz.tx_name }}</span>
                                        </div>
                                    </td>
                                    <td>{{ biz.tx_owner }}</td>
                                    <td>{{ biz.tx_owner_email }}</td>
                                    <td>{{ biz.tx_owner_phone }}</td>
                                    <td class="text-secondary">{{ formatDate(biz.date_add) }}</td>
                                </tr>
                                <tr v-if="!(dashboardData.recentBusinesses || []).length">
                                    <td colspan="6" class="text-center py-6 text-secondary">
                                        <v-icon size="40" class="mb-2">mdi-domain-off</v-icon><br>No hay empresas registradas aún
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                </v-col>
            </v-row>
        </template>

        <!-- ========================================================================= -->
        <!-- ==================== VISTA CLIENTE / DOCTOR / CLÍNICA ==================== -->
        <!-- ========================================================================= -->
        <template v-else>
            <!-- 4 TOP KPI CARDS CLIENTE -->
            <v-row class="mb-6">
                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="0" rounded="xl" class="border kpi-card-ls pa-4 bg-surface" @click="goTo('/appointments')" style="cursor: pointer;">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <v-avatar color="lightprimary" size="48" rounded="lg">
                                <v-icon color="primary" size="24">mdi-star-outline</v-icon>
                            </v-avatar>
                            <span class="text-h3 font-weight-bold text-primary">{{ appointmentStats.today_count || dashboardData.totalCustomers || 12 }}</span>
                        </div>
                        <div>
                            <span class="text-caption font-weight-bold text-secondary text-uppercase">Valoraciones Hoy</span>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="0" rounded="xl" class="border kpi-card-ls pa-4 bg-surface" @click="goTo('/appointments')" style="cursor: pointer;">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <v-avatar color="lightinfo" size="48" rounded="lg">
                                <v-icon color="info" size="24">mdi-needle</v-icon>
                            </v-avatar>
                            <span class="text-h3 font-weight-bold text-info">{{ appointmentStats.total_pending || 8 }}</span>
                        </div>
                        <div>
                            <span class="text-caption font-weight-bold text-secondary text-uppercase">Cirugías Programadas</span>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="0" rounded="xl" class="border kpi-card-ls pa-4 bg-surface" @click="goTo('/appointments')" style="cursor: pointer;">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <v-avatar color="lightwarning" size="48" rounded="lg">
                                <v-icon color="warning" size="24">mdi-calendar-check-outline</v-icon>
                            </v-avatar>
                            <span class="text-h3 font-weight-bold text-warning">{{ appointmentStats.total_confirmed || 24 }}</span>
                        </div>
                        <div>
                            <span class="text-caption font-weight-bold text-secondary text-uppercase">Postoperatorios</span>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" lg="3">
                    <v-card elevation="0" rounded="xl" class="border kpi-card-ls pa-4 bg-surface" @click="goTo('/customers')" style="cursor: pointer;">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <v-avatar color="lightsuccess" size="48" rounded="lg">
                                <v-icon color="success" size="24">mdi-account-plus-outline</v-icon>
                            </v-avatar>
                            <span class="text-h3 font-weight-bold text-success">{{ dashboardData.totalCustomers || 5 }}</span>
                        </div>
                        <div>
                            <span class="text-caption font-weight-bold text-secondary text-uppercase">Nuevos Pacientes</span>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- MIDDLE ROW: INGRESOS & EMBUDO -->
            <v-row class="mb-6">
                <v-col cols="12" lg="7">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5 h-100">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <div>
                                <span class="text-caption font-weight-bold text-uppercase text-secondary">Ingresos del Mes</span>
                                <h2 class="text-h3 font-weight-bold text-primary mt-1">$128.450.000</h2>
                                <v-chip color="success" size="small" variant="tonal" class="mt-1 font-weight-bold">
                                    <v-icon start size="14">mdi-trending-up</v-icon> +23% vs mes anterior
                                </v-chip>
                            </div>
                        </div>
                        <apexchart v-if="(dashboardData.monthlyRevenue || []).length" type="area" height="280" :options="cCustOpts" :series="cCustSer" />
                        <apexchart v-else type="area" height="280" :options="cCustOpts" :series="cCustSer" />
                    </v-card>
                </v-col>

                <v-col cols="12" lg="5">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5 h-100">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <span class="text-subtitle-1 font-weight-bold text-primary">Embudo de Pacientes</span>
                            <v-chip size="small" variant="tonal" color="primary">Este mes</v-chip>
                        </div>

                        <div class="funnel-container d-flex flex-column gap-3 py-2">
                            <div class="funnel-stage stage-1 pa-3 rounded-lg d-flex justify-space-between align-center">
                                <span class="font-weight-medium text-caption text-white">Leads</span>
                                <span class="font-weight-bold text-white">230</span>
                            </div>
                            <div class="funnel-stage stage-2 pa-3 rounded-lg d-flex justify-space-between align-center">
                                <span class="font-weight-medium text-caption text-white">Valoraciones</span>
                                <span class="font-weight-bold text-white">120</span>
                            </div>
                            <div class="funnel-stage stage-3 pa-3 rounded-lg d-flex justify-space-between align-center">
                                <span class="font-weight-medium text-caption text-white">Cotizaciones</span>
                                <span class="font-weight-bold text-white">78</span>
                            </div>
                            <div class="funnel-stage stage-4 pa-3 rounded-lg d-flex justify-space-between align-center">
                                <span class="font-weight-medium text-caption text-white">Aceptados</span>
                                <span class="font-weight-bold text-white">32</span>
                            </div>
                            <div class="funnel-stage stage-5 pa-3 rounded-lg d-flex justify-space-between align-center">
                                <span class="font-weight-medium text-caption text-white">Cirugías</span>
                                <span class="font-weight-bold text-white">24</span>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- SECOND ROW: AGENDA DE HOY & ACTIVIDAD RECIENTE -->
            <v-row class="mb-6">
                <v-col cols="12" lg="6">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5 h-100">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <span class="text-subtitle-1 font-weight-bold text-primary">Agenda del día</span>
                            <v-btn size="small" variant="text" color="primary" @click="goTo('/appointments')">Ver agenda completa</v-btn>
                        </div>

                        <div class="d-flex flex-column gap-3">
                            <div class="d-flex align-center justify-space-between pa-3 rounded-lg bg-lightprimary border">
                                <div class="d-flex align-center gap-3">
                                    <v-chip size="small" color="primary" class="font-weight-bold">08:00</v-chip>
                                    <div>
                                        <h5 class="text-subtitle-2 font-weight-bold mb-0">Valeria Gómez</h5>
                                        <span class="text-caption text-secondary">Rinoplastia</span>
                                    </div>
                                </div>
                                <v-chip color="info" size="small" variant="tonal" class="font-weight-bold">Valoración</v-chip>
                            </div>

                            <div class="d-flex align-center justify-space-between pa-3 rounded-lg bg-lightsuccess border">
                                <div class="d-flex align-center gap-3">
                                    <v-chip size="small" color="success" class="font-weight-bold">09:30</v-chip>
                                    <div>
                                        <h5 class="text-subtitle-2 font-weight-bold mb-0">María Camila R.</h5>
                                        <span class="text-caption text-secondary">Mamoplastia</span>
                                    </div>
                                </div>
                                <v-chip color="error" size="small" variant="tonal" class="font-weight-bold">Cirugía</v-chip>
                            </div>

                            <div class="d-flex align-center justify-space-between pa-3 rounded-lg bg-lightwarning border">
                                <div class="d-flex align-center gap-3">
                                    <v-chip size="small" color="warning" class="font-weight-bold">11:00</v-chip>
                                    <div>
                                        <h5 class="text-subtitle-2 font-weight-bold mb-0">Juan Pablo L.</h5>
                                        <span class="text-caption text-secondary">Control postoperatorio</span>
                                    </div>
                                </div>
                                <v-chip color="warning" size="small" variant="tonal" class="font-weight-bold">Control</v-chip>
                            </div>

                            <div class="d-flex align-center justify-space-between pa-3 rounded-lg bg-lightprimary border">
                                <div class="d-flex align-center gap-3">
                                    <v-chip size="small" color="primary" class="font-weight-bold">14:00</v-chip>
                                    <div>
                                        <h5 class="text-subtitle-2 font-weight-bold mb-0">Laura Sánchez</h5>
                                        <span class="text-caption text-secondary">Liposucción</span>
                                    </div>
                                </div>
                                <v-chip color="info" size="small" variant="tonal" class="font-weight-bold">Valoración</v-chip>
                            </div>
                        </div>
                    </v-card>
                </v-col>

                <v-col cols="12" lg="6">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5 h-100">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <span class="text-subtitle-1 font-weight-bold text-primary">Actividad reciente</span>
                            <v-btn size="small" variant="text" color="primary" @click="goTo('/access-logs')">Ver toda la actividad</v-btn>
                        </div>

                        <div class="d-flex flex-column gap-3">
                            <div class="d-flex align-center justify-space-between pa-3 border-bottom">
                                <div class="d-flex align-center gap-3">
                                    <v-avatar color="lightprimary" size="36">
                                        <v-icon color="primary" size="18">mdi-file-document-plus-outline</v-icon>
                                    </v-avatar>
                                    <div>
                                        <h5 class="text-subtitle-2 font-weight-bold mb-0">Nueva cotización creada</h5>
                                        <span class="text-caption text-secondary">Para Valeria Gómez</span>
                                    </div>
                                </div>
                                <span class="text-caption text-secondary font-weight-medium">Hace 15 min</span>
                            </div>

                            <div class="d-flex align-center justify-space-between pa-3 border-bottom">
                                <div class="d-flex align-center gap-3">
                                    <v-avatar color="lightsuccess" size="36">
                                        <v-icon color="success" size="18">mdi-clipboard-text-outline</v-icon>
                                    </v-avatar>
                                    <div>
                                        <h5 class="text-subtitle-2 font-weight-bold mb-0">Historia clínica actualizada</h5>
                                        <span class="text-caption text-secondary">María Camila R.</span>
                                    </div>
                                </div>
                                <span class="text-caption text-secondary font-weight-medium">Hace 1 hora</span>
                            </div>

                            <div class="d-flex align-center justify-space-between pa-3 border-bottom">
                                <div class="d-flex align-center gap-3">
                                    <v-avatar color="lightwarning" size="36">
                                        <v-icon color="warning" size="18">mdi-check-circle-outline</v-icon>
                                    </v-avatar>
                                    <div>
                                        <h5 class="text-subtitle-2 font-weight-bold mb-0">Procedimiento completado</h5>
                                        <span class="text-caption text-secondary">Juan Pablo L.</span>
                                    </div>
                                </div>
                                <span class="text-caption text-secondary font-weight-medium">Hace 2 horas</span>
                            </div>

                            <div class="d-flex align-center justify-space-between pa-3 border-bottom">
                                <div class="d-flex align-center gap-3">
                                    <v-avatar color="lightinfo" size="36">
                                        <v-icon color="info" size="18">mdi-account-heart-outline</v-icon>
                                    </v-avatar>
                                    <div>
                                        <h5 class="text-subtitle-2 font-weight-bold mb-0">Nuevo paciente registrado</h5>
                                        <span class="text-caption text-secondary">Laura Sánchez</span>
                                    </div>
                                </div>
                                <span class="text-caption text-secondary font-weight-medium">Hace 3 horas</span>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- BOTTOM ROW: PACIENTES DESTACADOS -->
            <v-row class="mb-4">
                <v-col cols="12">
                    <v-card elevation="0" rounded="xl" class="border bg-surface pa-5">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <span class="text-subtitle-1 font-weight-bold text-primary">Pacientes recientes</span>
                            <v-btn size="small" variant="text" color="primary" @click="goTo('/customers')">Ver todos</v-btn>
                        </div>

                        <v-row class="ma-0">
                            <v-col cols="12" sm="6" md="3" class="pa-2">
                                <v-card elevation="0" rounded="xl" class="border pa-4 text-center bg-lightprimary">
                                    <v-avatar size="64" color="primary" class="mx-auto mb-3 border">
                                        <v-icon color="white" size="32">mdi-account</v-icon>
                                    </v-avatar>
                                    <h5 class="text-subtitle-2 font-weight-bold mb-1">Valeria Gómez</h5>
                                    <v-chip size="small" color="primary" variant="flat" class="font-weight-medium">Valoración hoy</v-chip>
                                </v-card>
                            </v-col>

                            <v-col cols="12" sm="6" md="3" class="pa-2">
                                <v-card elevation="0" rounded="xl" class="border pa-4 text-center bg-lightsuccess">
                                    <v-avatar size="64" color="success" class="mx-auto mb-3 border">
                                        <v-icon color="white" size="32">mdi-account</v-icon>
                                    </v-avatar>
                                    <h5 class="text-subtitle-2 font-weight-bold mb-1">María Camila R.</h5>
                                    <v-chip size="small" color="success" variant="flat" class="font-weight-medium">Cirugía hoy</v-chip>
                                </v-card>
                            </v-col>

                            <v-col cols="12" sm="6" md="3" class="pa-2">
                                <v-card elevation="0" rounded="xl" class="border pa-4 text-center bg-lightwarning">
                                    <v-avatar size="64" color="warning" class="mx-auto mb-3 border">
                                        <v-icon color="white" size="32">mdi-account</v-icon>
                                    </v-avatar>
                                    <h5 class="text-subtitle-2 font-weight-bold mb-1">Juan Pablo L.</h5>
                                    <v-chip size="small" color="warning" variant="flat" class="font-weight-medium">Postoperatorio</v-chip>
                                </v-card>
                            </v-col>

                            <v-col cols="12" sm="6" md="3" class="pa-2">
                                <v-card elevation="0" rounded="xl" class="border pa-4 text-center bg-lightinfo">
                                    <v-avatar size="64" color="info" class="mx-auto mb-3 border">
                                        <v-icon color="white" size="32">mdi-account</v-icon>
                                    </v-avatar>
                                    <h5 class="text-subtitle-2 font-weight-bold mb-1">Laura Sánchez</h5>
                                    <v-chip size="small" color="info" variant="flat" class="font-weight-medium">Valoración hoy</v-chip>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>
            </v-row>
        </template>
    </template>
  </v-container>
</template>

<style scoped>
.kpi-card-ls {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.kpi-card-ls:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(24, 182, 201, 0.12) !important;
    border-color: rgba(24, 182, 201, 0.4) !important;
}

.funnel-stage {
    transition: transform 0.2s ease;
}
.funnel-stage:hover {
    transform: scale(1.02);
}
.stage-1 { background: linear-gradient(135deg, #18B6C9 0%, #0F766E 100%); width: 100%; }
.stage-2 { background: linear-gradient(135deg, #20C4D7 0%, #18B6C9 100%); width: 92%; margin: 0 auto; }
.stage-3 { background: linear-gradient(135deg, #38BDF8 0%, #0284C7 100%); width: 84%; margin: 0 auto; }
.stage-4 { background: linear-gradient(135deg, #34D399 0%, #059669 100%); width: 76%; margin: 0 auto; }
.stage-5 { background: linear-gradient(135deg, #10B981 0%, #047857 100%); width: 68%; margin: 0 auto; }

.h-100 {
    height: 100%;
}
</style>
