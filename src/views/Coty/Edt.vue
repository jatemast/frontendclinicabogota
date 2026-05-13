<template>
    <v-container :class="{ 'pb-16': step === 3 }">
        <v-row justify="center" class="mb-6">
            <v-col cols="12" md="12" class="text-center">
                <h2 class="text-h4 font-weight-bold mb-4">
                    Cotización #{{ quoteNumber }}
                </h2>
                <v-progress-linear :model-value="(step / 3) * 100" color="primary" height="8" rounded></v-progress-linear>
                <div class="d-flex justify-space-between mt-2 text-caption font-weight-bold text-uppercase">
                    <span :class="step >= 1 ? 'text-primary' : 'text-grey'">1. Cliente</span>
                    <span :class="step >= 2 ? 'text-primary' : 'text-grey'">2. Procedimientos</span>
                    <span :class="step >= 3 ? 'text-primary' : 'text-grey'">3. Costos y Resumen</span>
                </div>
            </v-col>
        </v-row>

        <v-divider class="mb-6"></v-divider>

        <div v-if="loading" class="text-center pa-10">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4 text-grey">Cargando datos de la cotización...</p>
        </div>

        <template v-else>
            <div v-if="step === 1">
                <UiParentCard title="Seleccionar Cliente">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="searchDni"
                                label="Buscar cliente por DNI"
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                density="comfortable"
                                rounded="lg"
                                class="mb-4"
                            ></v-text-field>

                            <v-row>
                                <v-col v-for="item in filteredCustomers" :key="item.id" cols="12" sm="6" lg="4">
                                    <v-card 
                                        @click="selectCustomer(item)" 
                                        :class="['customer-card pa-4', { 'selected-border': form.id_customer === item.id }]" 
                                        rounded="xl" 
                                        elevation="0"
                                    >
                                        <div class="d-flex align-center">
                                            <v-avatar :color="form.id_customer === item.id ? 'primary' : 'primary-lighten-5'" size="50" class="mr-4">
                                                <span :class="form.id_customer === item.id ? 'text-white' : 'text-primary'" class="font-weight-bold">
                                                    {{ item.tx_dni_type }}
                                                </span>
                                            </v-avatar>
                                            <div class="text-truncate">
                                                <div class="text-subtitle-1 font-weight-bold text-truncate">{{ item.tx_first_name }} {{ item.tx_last_name }}</div>
                                                <div class="text-caption text-secondary">DNI: {{ item.tx_dni }}</div>
                                            </div>
                                            <v-spacer></v-spacer>
                                            <v-icon :color="form.id_customer === item.id ? 'primary' : 'grey-lighten-1'">
                                                {{ form.id_customer === item.id ? 'mdi-check-circle' : 'mdi-chevron-right' }}
                                            </v-icon>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-card-actions class="mt-6 pa-0">
                        <v-spacer></v-spacer>
                        <v-btn 
                            color="primary" 
                            variant="flat" 
                            size="large" 
                            class="rounded-lg px-8" 
                            :disabled="!form.id_customer"
                            @click="step = 2"
                        >Siguiente: Procedimientos</v-btn>
                    </v-card-actions>
                </UiParentCard>
            </div>

            <div v-if="step === 2">
                <UiParentCard title="Modificar Procedimientos">
                    <template v-slot:action>
                        <v-btn icon color="primary" variant="text" @click="step = 1"><v-icon>mdi-arrow-left</v-icon></v-btn>
                    </template>
                    <v-row>
                        <v-col v-for="proc in procedures" :key="proc.id" cols="12" sm="6" md="4">
                            <v-checkbox
                                v-model="form.procedures"
                                :value="proc.id"
                                :label="proc.tx_name"
                                color="primary"
                                class="procedure-check"
                                hide-details
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-card-actions class="mt-4 pa-0">
                        <v-spacer></v-spacer>
                        <v-btn 
                            color="primary" 
                            variant="flat" 
                            size="large" 
                            class="rounded-lg px-8" 
                            :disabled="form.procedures.length === 0"
                            @click="step = 3"
                        >Siguiente: Costos</v-btn>
                    </v-card-actions>
                </UiParentCard>
            </div>

            <div v-if="step === 3">
                <v-row>
                    <v-col cols="12" md="8">
                        <UiParentCard title="Desglose de la Cotización">
                            <div class="pa-2">
                                <v-label class="font-weight-bold mb-2 text-primary">VALOR TOTAL DE LA COTIZACIÓN</v-label>
                                <v-text-field
                                    v-model="totalPriceDisplay"
                                    prefix="$"
                                    variant="outlined"
                                    class="mb-6 modern-input"
                                    @input="handlePriceInput"
                                ></v-text-field>

                                <div class="d-flex align-center justify-space-between mb-4">
                                    <div class="text-subtitle-1 font-weight-bold">Conceptos Incluidos</div>
                                    <v-btn size="small" color="primary" variant="tonal" @click="addItem" class="rounded-pill">
                                        <v-icon start>mdi-plus</v-icon> Agregar Item
                                    </v-btn>
                                </div>

                                <v-row v-for="(item, index) in form.items" :key="index" class="align-center mb-2" no-gutters>
                                    <v-col cols="10">
                                        <v-text-field v-model="item.tx_item" placeholder="Descripción" variant="outlined" hide-details density="comfortable" class="me-2"></v-text-field>
                                    </v-col>
                                    <v-col cols="2" class="text-right">
                                        <v-btn icon color="error" variant="text" @click="removeItem(index)" :disabled="form.items.length === 1">
                                            <v-icon>mdi-delete-outline</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>

                                <v-btn block size="x-large" color="primary" class="mt-10 btn-gradient d-none d-md-flex" :loading="isSubmitting" @click="submit">
                                    <v-icon start>mdi-content-save-check-outline</v-icon> GUARDAR CAMBIOS
                                </v-btn>
                            </div>
                        </UiParentCard>
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-card class="summary-card pa-6" rounded="xl" elevation="0">
                            <div class="text-overline text-primary font-weight-bold mb-2">RESUMEN DE SELECCIÓN</div>
                            <div class="mb-4" v-if="selectedCustomerData">
                                <div class="d-flex align-center">
                                    <v-icon start color="primary" size="20" class="mr-2">mdi-account-check</v-icon>
                                    <span class="font-weight-bold">{{ selectedCustomerData.tx_first_name }} {{ selectedCustomerData.tx_last_name }}</span>
                                </div>
                                <div class="text-caption ml-7">DNI: {{ selectedCustomerData.tx_dni }}</div>
                            </div>
                            <v-divider class="mb-4"></v-divider>
                            <div class="mb-4">
                                <v-chip-group column>
                                    <v-chip v-for="id in form.procedures" :key="id" size="small" color="primary" variant="tonal">
                                        {{ procedures.find(p => p.id === id)?.tx_name }}
                                    </v-chip>
                                </v-chip-group>
                            </div>
                            <v-btn variant="tonal" block color="primary" class="text-caption" @click="step = 2">Ir a Procedimientos</v-btn>
                        </v-card>
                    </v-col>
                </v-row>
            </div>
        </template>

        <v-footer v-if="step === 3 && !loading" app class="d-md-none pa-4 bg-white border-t">
            <v-btn 
                block 
                size="x-large" 
                color="primary" 
                class="btn-gradient" 
                :loading="isSubmitting"
                elevation="4"
                @click="submit"
            >
                <v-icon start>mdi-content-save-check-outline</v-icon> GUARDAR CAMBIOS
            </v-btn>
        </v-footer>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const router = useRouter();
const route = useRoute();
const { notify } = useNotification();

const loading = ref(true);
const isSubmitting = ref(false);
const step = ref(1);
const quoteNumber = ref('');
const totalPriceDisplay = ref('');
const searchDni = ref('');

// Listas para selects/busqueda
const customers = ref<any[]>([]);
const procedures = ref<any[]>([]);

// FORMULARIO PRINCIPAL (Igual que en tu vista de Usuarios)
const form = ref({
    id_customer: '',
    procedures: [] as string[],
    items: [] as any[],
    fl_total_cost: 0
});

onMounted(async () => {
    const idQuote = route.params.id;
    try {
        const [resCust, resProc, resQuote] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}api/customers/allforcoty`),
            axios.get(`${import.meta.env.VITE_API_URL}api/procedures/allforcoty`),
            axios.get(`${import.meta.env.VITE_API_URL}quotes/edt/${idQuote}`)
        ]);

        customers.value = resCust.data.data;
        procedures.value = resProc.data.data;

        if (resQuote.data.status) {
            const q = resQuote.data.data;
            quoteNumber.value = q.tx_nro;

            // PRECARGA DE VALORES AL FORMULARIO
            form.value = {
                id_customer: q.id_customer,
                // Extraemos solo los IDs de los procedimientos para el v-model del checkbox
                procedures: q.procedures.map((p: any) => p.id_procedure),
                // Mapeamos los items asegurando que la propiedad coincida con el v-model (tx_item)
                items: q.items.map((i: any) => ({ tx_item: i.tx_item })),
                fl_total_cost: q.fl_total_cost
            };

            // Formatear el costo para la vista
            const rawPrice = String(q.fl_total_cost).replace('.', ',');
            totalPriceDisplay.value = formatCurrency(rawPrice);
        }
    } catch (error) {
        notify('error', 'Error al precargar los datos');
    } finally {
        loading.value = false;
    }
});

// Lógica de filtrado y selección
const filteredCustomers = computed(() => {
    if (!searchDni.value) return customers.value;
    return customers.value.filter(c => c.tx_dni.includes(searchDni.value));
});

const selectedCustomerData = computed(() => {
    return customers.value.find(c => c.id === form.value.id_customer);
});

const selectCustomer = (customer: any) => {
    form.value.id_customer = customer.id;
};

// Formateo de Moneda
// Formateo de Moneda con soporte para decimales
const formatCurrency = (value: string) => {
    if (!value) return '';
    
    // Separamos la parte entera de la decimal
    let parts = value.toString().split(',');
    
    // Limpiamos la parte entera de cualquier cosa que no sea número
    parts[0] = parts[0].replace(/[^\d]/g, '');
    
    // Agregamos puntos de miles a la parte entera
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Si hay decimales, limitamos a 2 dígitos y unimos
    return parts.length > 1 ? parts[0] + ',' + parts[1].substring(0, 2).replace(/[^\d]/g, '') : parts[0];
};

const handlePriceInput = (e: any) => {
    // Reemplazamos puntos por nada y comas por coma para normalizar antes de formatear
    let input = e.target.value;
    totalPriceDisplay.value = formatCurrency(input);
};

// Enviar Cambios
const submit = async () => {
    isSubmitting.value = true;
    
    let cleanValue = totalPriceDisplay.value.replace(/\./g, '').replace(',', '.');
    const numericPrice = parseFloat(parseFloat(cleanValue).toFixed(2));
    
    if (isNaN(numericPrice)) {
        notify('error', 'El valor total no es un número válido');
        isSubmitting.value = false;
        return;
    }
    
    const payload = {
        ...form.value,
        total_cost: numericPrice,

        items: form.value.items.map(i => ({ description: i.tx_item }))
    };

    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}quotes/upd/${route.params.id}`, payload);
        if (response.data.status) {
            notify('success', response.data.msg ||  'Cotización actualizada');
            router.push('/quotes');
        }else{
            notify('error', response.data.msg || 'Error al actualizar');
        }
    } catch (error) {
        notify('error', 'Error al actualizar');
    } finally {
        isSubmitting.value = false;
    }
};

const addItem = () => form.value.items.unshift({ tx_item: '' });
const removeItem = (index: number) => form.value.items.splice(index, 1);
</script>

<style scoped>
/* Tus estilos se mantienen iguales */
.customer-card { border: 2px solid transparent; cursor: pointer; background: #fafafa; transition: 0.3s; }
.selected-border { border-color: rgb(var(--v-theme-primary)) !important; background: white !important; box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1); }
.procedure-check { border-radius: 12px; border: 1px solid #eee; margin-bottom: 8px; }
.btn-gradient { background: linear-gradient(45deg, rgb(var(--v-theme-primary)), #4db6ac) !important; color: white; border-radius: 12px; }
.modern-input :deep(.v-field__input) { font-size: 1.6rem !important; font-weight: 800; color: rgb(var(--v-theme-primary)); }
</style>