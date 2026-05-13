<template>
    <v-container :class="{ 'pb-16': step === 3 }"> <v-row justify="center" class="mb-6">
            <v-col cols="12" md="12" class="text-center">
                <h2 class="text-h4 font-weight-bold mb-4">Nueva Cotización</h2>
                <v-progress-linear
                    :model-value="(step / 3) * 100"
                    color="primary"
                    height="8"
                    rounded
                ></v-progress-linear>
                <div class="d-flex justify-space-between mt-2 text-caption font-weight-bold text-uppercase">
                    <span :class="step >= 1 ? 'text-primary' : 'text-grey'">1. Cliente</span>
                    <span :class="step >= 2 ? 'text-primary' : 'text-grey'">2. Procedimientos</span>
                    <span :class="step >= 3 ? 'text-primary' : 'text-grey'">3. Costos y Resumen</span>
                </div>
            </v-col>
        </v-row>

        <div v-if="step === 1">
            <v-row justify="center">
                <v-col cols="12">
                    <v-text-field
                        v-model="searchDni"
                        label="Buscar por DNI / Cédula"
                        prepend-inner-icon="mdi-magnify"
                        variant="solo"
                        flat
                        bg-color="white"
                        class="shadow-soft mb-6"
                        rounded="lg"
                    ></v-text-field>

                    <v-row v-if="filteredCustomers.length > 0">
                        <v-col v-for="item in filteredCustomers" :key="item.id" cols="12" sm="6" lg="4">
                            <v-card @click="selectCustomer(item)" class="customer-card pa-4" rounded="xl" elevation="0">
                                <div class="d-flex align-center">
                                    <v-avatar color="primary-lighten-5" size="50" class="mr-4">
                                        <span class="text-primary font-weight-bold">{{ item.tx_dni_type }}</span>
                                    </v-avatar>
                                    <div class="text-truncate">
                                        <div class="text-subtitle-1 font-weight-bold text-truncate">{{ item.tx_first_name }} {{ item.tx_last_name }}</div>
                                        <div class="text-caption text-secondary">DNI: {{ item.tx_dni }}</div>
                                    </div>
                                    <v-spacer></v-spacer>
                                    <v-icon color="grey-lighten-1">mdi-chevron-right</v-icon>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-alert v-else type="info" color="primary" variant="flat" rounded="lg">No hay clientes disponibles, registre uno.</v-alert>
                </v-col>
            </v-row>
        </div>

        <div v-if="step === 2">
            <UiParentCard title="Procedimientos a Realizar">
                <template v-slot:action>
                    <v-btn icon color="primary" variant="text" @click="step = 1"><v-icon>mdi-arrow-left</v-icon></v-btn>
                </template>
                <v-row>
                    <v-col v-for="proc in procedures" :key="proc.id" cols="12" sm="6" md="4">
                        <v-checkbox
                            v-model="selectedProcedures"
                            :value="proc.id"
                            :label="proc.tx_name"
                            color="primary"
                            class="procedure-check"
                            hide-details
                        ></v-checkbox>
                    </v-col>
                    <v-alert v-if="procedures.length === 0" class="text-h6" type="info" color="primary" variant="flat" rounded="lg">No hay procedimientos registrados.</v-alert>
                </v-row>
                <v-card-actions class="mt-4">
                    <v-spacer class="d-none d-sm-block"></v-spacer>
                    <v-btn 
                        color="primary" 
                        variant="flat" 
                        size="large" 
                        class="rounded-lg px-8 next-btn"
                        :disabled="selectedProcedures.length === 0"
                        @click="step = 3"
                    >Continuar al Resumen</v-btn>
                </v-card-actions>
            </UiParentCard>
        </div>

        <div v-if="step === 3 && selectedCustomer">
            <v-row>
                <v-col cols="12" md="8">
                    <UiParentCard title="Desglose Financiero">
                        <div class="pa-2">
                            <v-label class="font-weight-bold mb-2 text-primary">VALOR TOTAL DE LA COTIZACIÓN</v-label>
                            <v-text-field
                                v-model="totalPriceDisplay"
                                prefix="$"
                                placeholder="0,00"
                                variant="outlined"
                                class="mb-6 modern-input"
                                color="primary"
                                @input="handlePriceInput"
                            ></v-text-field>

                            <div class="d-flex align-center justify-space-between mb-4">
                                <div class="text-subtitle-1 font-weight-bold">Conceptos Incluidos</div>
                                <v-btn size="small" color="primary" variant="tonal" @click="addItem" class="rounded-pill">
                                    <v-icon start>mdi-plus</v-icon> Agregar Item
                                </v-btn>
                            </div>

                            <v-row v-for="(item, index) in itemsList" :key="index" class="align-center mb-2" no-gutters>
                                <v-col cols="10">
                                    <v-text-field v-model="item.description" placeholder="Ej: Insumos" variant="outlined" hide-details density="comfortable" rounded="lg" class="me-2"></v-text-field>
                                </v-col>
                                <v-col cols="2" class="text-right">
                                    <v-btn icon color="error" variant="text" @click="removeItem(index)" :disabled="itemsList.length === 1">
                                        <v-icon>mdi-delete-outline</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>

                            <v-btn 
                                block 
                                size="x-large" 
                                color="primary" 
                                class="mt-10 btn-gradient d-none d-md-flex" 
                                :loading="isSubmitting"
                                @click="submitQuotation"
                            >
                                <v-icon start>mdi-file-check-outline</v-icon>
                                FINALIZAR COTIZACIÓN
                            </v-btn>
                        </div>
                    </UiParentCard>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card class="summary-card pa-6" rounded="xl" elevation="0">
                        <div class="text-overline text-primary font-weight-bold mb-2">RESUMEN DE SELECCIÓN</div>
                        <div class="mb-4">
                            <div class="d-flex align-center">
                                <v-icon start color="primary" size="20">mdi-account-check</v-icon>
                                <span class="font-weight-bold">{{ selectedCustomer.tx_first_name }} {{ selectedCustomer.tx_last_name }}</span>
                            </div>
                            <div class="text-caption ml-7">{{ selectedCustomer.tx_dni_type }}: {{ selectedCustomer.tx_dni }}</div>
                        </div>
                        <v-divider class="mb-4"></v-divider>
                        <div class="mb-4">
                            <v-chip-group column>
                                <v-chip v-for="p in displaySelectedProcedures" :key="p.id" size="small" color="primary" variant="tonal">{{ p.tx_name }}</v-chip>
                            </v-chip-group>
                        </div>
                        <v-btn variant="tonal" block color="primary" class="text-caption" @click="step = 2">Ir a Procedimientos</v-btn>
                    </v-card>
                </v-col>
            </v-row>

            <v-footer v-if="step === 3" app class="d-md-none pa-4 bg-white border-t">
                <v-btn 
                    block 
                    size="x-large" 
                    color="primary" 
                    class="btn-gradient" 
                    :loading="isSubmitting"
                    elevation="4"
                    @click="submitQuotation"
                >
                    <v-icon start>mdi-file-check-outline</v-icon>
                    FINALIZAR COTIZACIÓN
                </v-btn>
            </v-footer>
        </div>
    </v-container>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { required, email, onlyNumbers, notOnlySpaces } from '@/utils/validators';

interface Customer {
    id: string;
    tx_dni_type: string;
    tx_dni: string;
    tx_first_name: string;
    tx_last_name: string;
}

interface Procedure {
    id: string;
    tx_name: string;
}

const router = useRouter();
const { notify } = useNotification();

const step = ref(1);
const loading = ref(false);
const isSubmitting = ref(false);

const customers = ref<Customer[]>([]);
const procedures = ref<Procedure[]>([]);
const searchDni = ref('');
const selectedCustomer = ref<Customer | null>(null);
const selectedProcedures = ref<string[]>([]);
const itemsList = ref([{ description: '', price: 0 }]); 
const totalPrice = ref(0);

onMounted(async () => {
    loading.value = true;
    try {
        const [resCust, resProc] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}api/customers/allforcoty`),
            axios.get(`${import.meta.env.VITE_API_URL}api/procedures/allforcoty`)
        ]);
        customers.value = resCust.data.data;
        procedures.value = resProc.data.data;
    } catch (error) {
        notify('error', 'Error al cargar datos');
    } finally {
        loading.value = false;
    }
});

const filteredCustomers = computed(() => {
    if (!searchDni.value) return customers.value;
    return customers.value.filter(c => c.tx_dni.includes(searchDni.value));
});

const selectCustomer = (customer: Customer) => {
    selectedCustomer.value = customer;
    step.value = 2;
    window.scrollTo(0,0);
};

const displaySelectedProcedures = computed(() => {
    return procedures.value.filter(p => selectedProcedures.value.includes(p.id));
});

const totalPriceDisplay = ref('');

// Función para formatear mientras escribe (Estilo Colombia: . miles, , decimales)
const formatCurrency = (value: string) => {
    // 1. Quitar todo lo que no sea número o coma
    let cleanValue = value.replace(/[^\d,]/g, '');
    
    // 2. Evitar múltiples comas
    const parts = cleanValue.split(',');
    if (parts.length > 2) cleanValue = parts[0] + ',' + parts.slice(1).join('');

    // 3. Formatear miles en la parte entera
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return parts.join(',');
};

// Observar el cambio para aplicar el formato
const handlePriceInput = (e: any) => {
    const input = e.target.value;
    totalPriceDisplay.value = formatCurrency(input);
};

const submitQuotation = async () => {
    
    const numericValue = parseFloat(
        totalPriceDisplay.value
            .replace(/\./g, '')  // Quitar puntos de miles
            .replace(',', '.')   // Cambiar coma decimal por punto
    );

    if (isNaN(numericValue) || numericValue <= 0) {
        notify('warning', 'Ingrese un costo válido mayor a 0');
        return;
    }

    isSubmitting.value = true;
    const payload = {
        id_customer: selectedCustomer.value?.id,
        procedures: selectedProcedures.value,
        items: itemsList.value,
        total_cost: numericValue // Enviamos el número limpio
    };

    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}quotes/add`, payload);
        if (response.data.status) {
            notify('success', response.data.msg || 'Cotización guardada');
            router.push('/quotes');
        }else{
            notify('warning', response.data.msg || 'Error al guardar cotización');
        }
    } catch (error) {
        notify('error', 'Error al guardar');
    } finally {
        isSubmitting.value = false;
    }
};

const showMobileSummary = ref(false);

const addItem = () => {
    itemsList.value.unshift({ description: '', price: 0 });
};

const removeItem = (index: number) => itemsList.value.splice(index, 1);

</script>

<style scoped>
/* Estilos previos mantenidos */
.customer-card { border: 1px solid rgba(0,0,0,0.05); transition: all 0.3s ease; cursor: pointer; }
.customer-card:hover { border-color: rgb(var(--v-theme-primary)); transform: translateY(-4px); }
.procedure-check { border-radius: 12px; padding: 8px 12px; margin-bottom: 8px; border: 1px solid #f1f5f9; }
.summary-card { border: 1px solid rgba(var(--v-theme-primary), 0.1) !important; position: sticky; top: 24px; }
.btn-gradient { background: linear-gradient(45deg, rgb(var(--v-theme-primary)), #4db6ac) !important; border-radius: 16px !important; font-weight: bold; }
.modern-input :deep(.v-field__input) { font-size: 1.5rem !important; font-weight: bold; color: rgb(var(--v-theme-primary)); }

/* Ajuste específico para el footer móvil */
.v-footer {
    box-shadow: 0 -4px 10px rgba(0,0,0,0.05) !important;
}
</style>