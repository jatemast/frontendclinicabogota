<template>
    <v-container :class="{ 'pb-16': step === 2 }">
        <v-row justify="center" class="mb-6">
            <v-col cols="12" md="12" class="text-center">
                <h2 class="text-h4 font-weight-bold mb-4">Iniciar Historia Clínica</h2>
                <v-progress-linear :model-value="(step / 2) * 100" color="primary" height="8" rounded></v-progress-linear>
                <div class="d-flex justify-space-between mt-2 text-caption font-weight-bold text-uppercase">
                    <span :class="step >= 1 ? 'text-primary' : 'text-grey'">1. Seleccionar Cotización</span>
                    <span :class="step >= 2 ? 'text-primary' : 'text-grey'">2. Motivo de Consulta</span>
                </div>
            </v-col>
        </v-row>

        <div v-if="step === 1">
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="searchCoty"
                        label="Buscar por Nro Cotización o Nombre de Paciente"
                        prepend-inner-icon="mdi-magnify"
                        variant="solo"
                        flat
                        bg-color="white"
                        class="shadow-soft mb-6"
                        rounded="lg"
                        hide-details
                    ></v-text-field>

                    <v-row v-if="loading">
                        <v-col cols="12" class="text-center pa-10">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </v-col>
                    </v-row>

                    <v-row v-else-if="filteredCotys.length > 0">
                        <v-col v-for="coty in filteredCotys" :key="coty.id" cols="12" sm="6" lg="4">
                            <v-card @click="selectCoty(coty)" class="coty-card pa-4" rounded="xl" elevation="0">
                                <div class="d-flex align-center">
                                    <v-avatar color="primary" size="54" class="mr-4 shadow-sm">
                                        <span class="text-caption font-weight-bold text-white">#{{ coty.tx_nro }}</span>
                                    </v-avatar>
                                    <div class="text-truncate">
                                        <div class="text-subtitle-1 font-weight-bold">{{ coty.tx_full_name }}</div>
                                        <div class="text-caption text-secondary">DNI: {{ coty.tx_dni }}</div>
                                    </div>
                                    <v-spacer></v-spacer>
                                    <v-icon color="primary">mdi-arrow-right-circle</v-icon>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </div>

        <div v-if="step === 2 && selectedCoty">
            <v-row justify="center">
                <v-col cols="12" md="12">
                    <UiParentCard title="Información Inicial de la Consulta">
                        <template v-slot:action>
                            <v-btn icon color="primary" variant="text" @click="step = 1"><v-icon>mdi-arrow-left</v-icon></v-btn>
                        </template>

                        <div class="selected-coty-info mb-6 pa-4 rounded-lg">
                            <div class="text-overline text-primary">Paciente Seleccionado</div>
                            <div class="text-h6 font-weight-bold">{{ selectedCoty.tx_full_name }}</div>
                            <div class="text-body-2">Cotización: <strong>#{{ selectedCoty.tx_nro }}</strong> | DNI: {{ selectedCoty.tx_dni }}</div>
                        </div>

                        <v-label class="font-weight-bold mb-2 text-primary text-uppercase">Procedimientos a realizar</v-label>
                        <div class="mb-6">
                            <div v-if="loadingProcedures" class="d-flex align-center pa-4">
                                <v-progress-circular indeterminate size="20" width="2" color="primary" class="mr-3"></v-progress-circular>
                                <span class="text-caption">Cargando procedimientos...</span>
                            </div>
                            
                            <v-chip
                                v-else-if="procedures.length > 0"
                                v-for="proc in procedures"
                                :key="proc.id"
                                color="success"
                                variant="tonal"
                                size="small"
                                class="me-2"
                                prepend-icon="mdi-needle"
                            >
                                {{ proc.tx_name }}
                            </v-chip>

                            <v-alert
                                v-else
                                type="warning"
                                variant="tonal"
                                density="compact"
                                rounded="lg"
                                class="text-caption"
                            >
                                Esta cotización no tiene procedimientos asignados.
                            </v-alert>
                        </div>

                        <v-divider class="mb-6"></v-divider>

                        <v-label class="font-weight-bold mb-2 text-primary text-uppercase">Motivo de Consulta</v-label>
                        <v-textarea
                            v-model="form.tx_motivo_consulta"
                            placeholder="Escriba aquí la razón principal..."
                            variant="outlined"
                            counter="250"
                            maxlength="250"
                            rows="4"
                            persistent-counter
                            class="modern-textarea"
                            rounded="lg"
                        ></v-textarea>

                        <v-btn 
                            block size="x-large" color="primary" 
                            class="mt-10 btn-gradient d-none d-md-flex" 
                            :loading="isSubmitting"
                            :disabled="!form.tx_motivo_consulta"
                            @click="submitHistory"
                        >
                            <v-icon start>mdi-content-save-check</v-icon>
                            CREAR HISTORIA MÉDICA
                        </v-btn>
                    </UiParentCard>
                </v-col>
            </v-row>
        </div>

        <v-footer v-if="step === 2 && !loading" app class="d-md-none pa-4 bg-white border-t">
            <v-btn block size="x-large" color="primary" class="btn-gradient" :loading="isSubmitting" :disabled="!form.tx_motivo_consulta" @click="submitHistory">
                <v-icon start>mdi-content-save-check</v-icon> CREAR HISTORIA MÉDICA
            </v-btn>
        </v-footer>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const router = useRouter();
const { notify } = useNotification();

const step = ref(1);
const loading = ref(false);
const loadingProcedures = ref(false);
const isSubmitting = ref(false);

const cotys = ref<any[]>([]);
const procedures = ref<any[]>([]);
const searchCoty = ref('');
const selectedCoty = ref<any>(null);

const form = ref({
    id_coty: '',
    tx_motivo_consulta: ''
});

onMounted(() => fetchCotys());

const fetchCotys = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/coty/all`);
        if (response.data.status) cotys.value = response.data.data;
    } catch (error) {
        notify('error', 'Error al cargar cotizaciones');
    } finally {
        loading.value = false;
    }
};

const selectCoty = async (coty: any) => {
    selectedCoty.value = coty;
    form.value.id_coty = coty.id;
    step.value = 2;
    window.scrollTo(0, 0);
    
    // Cargar procedimientos de esta cotización específica
    loadingProcedures.value = true;
    procedures.value = [];
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/coty/allprocedures/${coty.id}`);
        if (res.data.status) {
            procedures.value = res.data.data;
        }
    } catch (error) {
        console.error("Error cargando procedimientos", error);
    } finally {
        loadingProcedures.value = false;
    }
};

const filteredCotys = computed(() => {
    if (!searchCoty.value) return cotys.value;
    const search = searchCoty.value.toLowerCase();
    return cotys.value.filter(c => 
        c.tx_nro.includes(search) || 
        c.tx_full_name.toLowerCase().includes(search) || 
        c.tx_dni.includes(search)
    );
});

const submitHistory = async () => {
    if (!form.value.tx_motivo_consulta) return;
    
    isSubmitting.value = true;
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}medicalhistory/add`, form.value);
        if (response.data.status) {
            notify('success', response.data.msg ||  'Historia clínica iniciada');
            router.push('/medical-history'); 
        } else {
            notify('error', response.data.msg || 'Error al iniciar historia clínica');
        }
    } catch (error) {
        notify('error', 'Error al guardar');
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
/* (Se mantienen tus estilos de avatar, card, etc.) */
.coty-card { border: 2px solid transparent; cursor: pointer; transition: all 0.2s ease;  }
.coty-card:hover { border-color: rgb(var(--v-theme-primary)); transform: translateY(-2px); }
.selected-coty-info { background: rgba(var(--v-theme-primary), 0.05); border-left: 4px solid rgb(var(--v-theme-primary)); }
.btn-gradient { background: linear-gradient(45deg, rgb(var(--v-theme-primary)), #4db6ac) !important; color: white !important; }
</style>