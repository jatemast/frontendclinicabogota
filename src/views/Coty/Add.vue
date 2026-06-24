<template>
  <v-container fluid class="pa-4 pa-md-8 coty-container">
    <!-- ===== ENCABEZADO Y PROGRESO ===== -->
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="10" lg="8" class="text-center">
        <h2 class="text-h4 font-weight-bold mb-2 text-primary">Nueva Cotización Médica</h2>
        <p class="text-body-2 text-medium-emphasis">Complete la información requerida para generar una cotización profesional</p>
        <v-progress-linear :model-value="(step / 5) * 100" color="primary" height="8" rounded class="mt-4"></v-progress-linear>
        <div class="d-flex justify-space-between mt-2 text-caption font-weight-bold text-uppercase">
          <span :class="step >= 1 ? 'text-primary' : 'text-grey'">1. Cliente</span>
          <span :class="step >= 2 ? 'text-primary' : 'text-grey'">2. Diagnóstico</span>
          <span :class="step >= 3 ? 'text-primary' : 'text-grey'">3. Servicios</span>
          <span :class="step >= 4 ? 'text-primary' : 'text-grey'">4. Totales</span>
          <span :class="step >= 5 ? 'text-primary' : 'text-grey'">5. Condiciones</span>
        </div>
      </v-col>
    </v-row>

    <!-- ================================================================ -->
    <!-- PASO 1: SELECCIÓN DE CLIENTE -->
    <!-- ================================================================ -->
    <div v-if="step === 1">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <UiParentCard title="Datos del Paciente / Cliente">
            <v-text-field
              v-model="searchDni"
              label="Buscar por documento de identidad"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-4"
              clearable
            ></v-text-field>

            <v-row v-if="filteredCustomers.length > 0">
              <v-col v-for="item in filteredCustomers" :key="item.id" cols="12" sm="6" lg="4">
                <v-card
                  @click="selectCustomer(item)"
                  :class="['customer-card pa-4', { 'selected-card': selectedCustomer?.id === item.id }]"
                  rounded="xl"
                  elevation="0"
                  variant="outlined"
                >
                  <div class="d-flex align-center">
                    <v-avatar :color="selectedCustomer?.id === item.id ? 'primary' : 'primary-lighten-5'" size="48" class="mr-4">
                      <span :class="selectedCustomer?.id === item.id ? 'text-white' : 'text-primary'" class="font-weight-bold">
                        {{ item.tx_first_name?.charAt(0) }}{{ item.tx_last_name?.charAt(0) }}
                      </span>
                    </v-avatar>
                    <div class="text-truncate">
                      <div class="text-subtitle-2 font-weight-bold text-truncate">{{ item.tx_first_name }} {{ item.tx_last_name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ item.tx_dni_type }}: {{ item.tx_dni }}</div>
                    </div>
                    <v-spacer></v-spacer>
                    <v-icon v-if="selectedCustomer?.id === item.id" color="primary">mdi-check-circle</v-icon>
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <v-alert v-else type="info" color="primary-lighten-1" variant="tonal" rounded="lg" class="mt-4">
              No hay pacientes registrados. Registre uno nuevo en el módulo de Clientes.
            </v-alert>

            <v-card-actions class="mt-4 pa-0">
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="flat" size="large" rounded="lg" class="px-8" :disabled="!selectedCustomer" @click="step = 2">
                Continuar <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </UiParentCard>
        </v-col>
      </v-row>
    </div>

    <!-- ================================================================ -->
    <!-- PASO 2: DIAGNÓSTICO / MOTIVO DE CONSULTA -->
    <!-- ================================================================ -->
    <div v-if="step === 2">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <UiParentCard title="Diagnóstico / Motivo de Consulta">
            <template v-slot:action>
              <v-btn icon color="primary" variant="text" @click="step = 1"><v-icon>mdi-arrow-left</v-icon></v-btn>
            </template>

            <v-textarea
              v-model="form.tx_diagnostico"
              label="Describa el diagnóstico, motivo de consulta o procedimiento solicitado"
              placeholder="Ej: Paciente femenina de 34 años que consulta por insatisfacción con el volumen mamario. Se propone mamoplastia de aumento con implantes de 350cc perfil alto..."
              variant="outlined"
              rows="4"
              auto-grow
              rounded="lg"
              class="mb-4"
            ></v-textarea>

            <v-text-field
              v-model="form.tx_notes"
              label="Notas adicionales (opcional)"
              variant="outlined"
              rounded="lg"
              hint="Información complementaria relevante para la cotización"
              persistent-hint
            ></v-text-field>

            <v-card-actions class="mt-4 pa-0">
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="flat" size="large" rounded="lg" class="px-8" @click="step = 3">
                Continuar <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </UiParentCard>
        </v-col>
      </v-row>
    </div>

    <!-- ================================================================ -->
    <!-- PASO 3: SERVICIOS / PROCEDIMIENTOS (TABLA DETALLADA) -->
    <!-- ================================================================ -->
    <div v-if="step === 3">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <UiParentCard title="Detalle de Servicios y Procedimientos">
            <template v-slot:action>
              <v-btn icon color="primary" variant="text" @click="step = 2"><v-icon>mdi-arrow-left</v-icon></v-btn>
            </template>

            <!-- Botones de agregado rápido por categoría -->
            <div class="d-flex flex-wrap gap-2 mb-4">
              <v-btn size="small" variant="tonal" color="primary" rounded="pill" @click="addItem('Consulta')">
                <v-icon start size="18">mdi-stethoscope</v-icon> Consulta
              </v-btn>
              <v-btn size="small" variant="tonal" color="secondary" rounded="pill" @click="addItem('Procedimiento')">
                <v-icon start size="18">mdi-needle</v-icon> Procedimiento
              </v-btn>
              <v-btn size="small" variant="tonal" color="info" rounded="pill" @click="addItem('Anestesia')">
                <v-icon start size="18">mdi-bed</v-icon> Anestesia
              </v-btn>
              <v-btn size="small" variant="tonal" color="warning" rounded="pill" @click="addItem('Hospitalización')">
                <v-icon start size="18">mdi-hospital-building</v-icon> Hospitalización
              </v-btn>
              <v-btn size="small" variant="tonal" color="success" rounded="pill" @click="addItem('Insumos')">
                <v-icon start size="18">mdi-package-variant</v-icon> Insumos
              </v-btn>
              <v-btn size="small" variant="tonal" color="error" rounded="pill" @click="addItem('Exámenes')">
                <v-icon start size="18">mdi-test-tube</v-icon> Exámenes
              </v-btn>
              <v-btn size="small" variant="tonal" rounded="pill" @click="addItem('Otros')">
                <v-icon start size="18">mdi-plus-circle</v-icon> Otro
              </v-btn>
            </div>

            <!-- TABLA DE ÍTEMS -->
            <v-table density="compact" class="items-table rounded-lg">
              <thead>
                <tr>
                  <th class="text-caption font-weight-bold" width="80">Código</th>
                  <th class="text-caption font-weight-bold">Servicio / Procedimiento</th>
                  <th class="text-caption font-weight-bold" width="140">Categoría</th>
                  <th class="text-caption font-weight-bold text-center" width="70">Cant.</th>
                  <th class="text-caption font-weight-bold text-right" width="120">Valor Unit.</th>
                  <th class="text-caption font-weight-bold text-right" width="120">Subtotal</th>
                  <th width="50"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.items" :key="index">
                  <td>
                    <v-text-field
                      v-model="item.tx_codigo"
                      placeholder="CUPS"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="small-input"
                    ></v-text-field>
                  </td>
                  <td>
                    <v-text-field
                      v-model="item.tx_servicio"
                      placeholder="Nombre del servicio"
                      variant="outlined"
                      density="compact"
                      hide-details
                      :rules="[required]"
                    ></v-text-field>
                    <v-text-field
                      v-model="item.tx_descripcion"
                      placeholder="Descripción (opcional)"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-1 small-input"
                    ></v-text-field>
                  </td>
                  <td>
                    <v-select
                      v-model="item.tx_categoria"
                      :items="categorias"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="small-input"
                    ></v-select>
                  </td>
                  <td>
                    <v-text-field
                      v-model.number="item.nu_cantidad"
                      type="number"
                      min="1"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="small-input text-center"
                      @update:model-value="recalcItem(index)"
                    ></v-text-field>
                  </td>
                  <td>
                    <v-text-field
                      v-model="item.fl_valor_unitario_display"
                      placeholder="0"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="small-input text-right"
                      @update:model-value="handleUnitPriceInput(index, $event)"
                      @blur="recalcItem(index)"
                    ></v-text-field>
                  </td>
                  <td class="text-right">
                    <span class="text-body-2 font-weight-bold text-primary">
                      $ {{ formatMoney(item.fl_subtotal) }}
                    </span>
                  </td>
                  <td>
                    <v-btn icon size="x-small" color="error" variant="text" @click="removeItem(index)" :disabled="form.items.length <= 1">
                      <v-icon size="18">mdi-close</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <!-- SUGERENCIAS DE PROCEDIMIENTOS REGISTRADOS -->
            <div v-if="procedures.length > 0" class="mt-6">
              <div class="text-subtitle-2 font-weight-bold mb-2 text-medium-emphasis">
                <v-icon size="18" class="mr-1">mdi-lightbulb-outline</v-icon>
                Procedimientos registrados en el sistema (click para agregar)
              </div>
              <v-chip-group>
                <v-chip
                  v-for="proc in procedures"
                  :key="proc.id"
                  variant="outlined"
                  color="primary"
                  size="small"
                  @click="addFromProcedure(proc)"
                >
                  {{ proc.tx_name }}
                  <v-icon end size="16">mdi-plus</v-icon>
                </v-chip>
              </v-chip-group>
            </div>

            <v-card-actions class="mt-6 pa-0">
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="flat" size="large" rounded="lg" class="px-8" @click="step = 4">
                Continuar a Totales <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </UiParentCard>
        </v-col>
      </v-row>
    </div>

    <!-- ================================================================ -->
    <!-- PASO 4: RESUMEN DE COSTOS -->
    <!-- ================================================================ -->
    <div v-if="step === 4">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <UiParentCard title="Resumen de Costos">
            <template v-slot:action>
              <v-btn icon color="primary" variant="text" @click="step = 3"><v-icon>mdi-arrow-left</v-icon></v-btn>
            </template>

            <v-row>
              <v-col cols="12" md="8">
                <!-- Resumen financiero -->
                <div class="pa-2">
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-1">Subtotal</span>
                    <span class="text-body-1 font-weight-bold">$ {{ formatMoney(subtotalCalculado) }}</span>
                  </div>

                  <v-divider class="my-2"></v-divider>

                  <div class="d-flex align-center justify-space-between mb-3">
                    <span class="text-body-1">Descuento</span>
                    <div class="d-flex align-center gap-2" style="max-width: 200px;">
                      <v-text-field
                        v-model.number="form.descuento_porcentaje"
                        type="number"
                        min="0"
                        max="100"
                        suffix="%"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="small-input"
                        @update:model-value="recalcTotals"
                      ></v-text-field>
                      <span class="text-caption">=</span>
                      <span class="text-body-1 font-weight-bold text-error">$ {{ formatMoney(form.descuento_valor) }}</span>
                    </div>
                  </div>

                  <v-divider class="my-2"></v-divider>

                  <div class="d-flex align-center justify-space-between mb-3">
                    <span class="text-body-1">IVA</span>
                    <div class="d-flex align-center gap-2" style="max-width: 200px;">
                      <v-text-field
                        v-model.number="form.iva_porcentaje"
                        type="number"
                        min="0"
                        max="100"
                        suffix="%"
                        variant="outlined"
                        density="compact"
                        hide-details
                        hint="0% = Exento sector salud"
                        persistent-hint
                        @update:model-value="recalcTotals"
                      ></v-text-field>
                      <span class="text-caption">=</span>
                      <span class="text-body-1 font-weight-bold">$ {{ formatMoney(form.iva_valor) }}</span>
                    </div>
                  </div>

                  <v-divider class="my-2" thickness="2"></v-divider>

                  <div class="d-flex justify-space-between mb-4">
                    <span class="text-h6 font-weight-bold">TOTAL GENERAL</span>
                    <span class="text-h5 font-weight-bold text-primary">$ {{ formatMoney(form.total_cost) }}</span>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <!-- Condiciones de pago -->
                <div class="text-subtitle-2 font-weight-bold mb-3">Condiciones de Pago</div>

                <v-text-field
                  v-model.number="form.anticipo_porcentaje"
                  label="Anticipo requerido (%)"
                  type="number"
                  min="0"
                  max="100"
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mb-3"
                  @update:model-value="recalcTotals"
                ></v-text-field>

                <div class="text-caption text-medium-emphasis mb-1">Valor del anticipo:</div>
                <div class="text-h6 font-weight-bold text-secondary mb-3">$ {{ formatMoney(form.anticipo_valor) }}</div>

                <v-select
                  v-model="form.tx_forma_pago"
                  :items="formasPago"
                  label="Forma de pago"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mb-3"
                ></v-select>

                <v-text-field
                  v-model.number="form.in_validez_dias"
                  label="Validez de la cotización (días)"
                  type="number"
                  min="1"
                  max="90"
                  suffix="días"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-card-actions class="mt-4 pa-0">
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="flat" size="large" rounded="lg" class="px-8" @click="step = 5">
                Condiciones Finales <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </UiParentCard>
        </v-col>
      </v-row>
    </div>

    <!-- ================================================================ -->
    <!-- PASO 5: CONDICIONES MÉDICAS, OBSERVACIONES Y FIRMA -->
    <!-- ================================================================ -->
    <div v-if="step === 5">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <!-- Condiciones Médicas y Legales -->
          <UiParentCard title="Condiciones Médicas y Legales" class="mb-4">
            <template v-slot:action>
              <v-btn icon color="primary" variant="text" @click="step = 4"><v-icon>mdi-arrow-left</v-icon></v-btn>
            </template>
            <v-textarea
              v-model="form.tx_condiciones_medicas"
              label="Condiciones médicas y legales"
              :placeholder="condicionesDefault"
              variant="outlined"
              rows="5"
              auto-grow
              rounded="lg"
              hint="Estas condiciones aparecerán en la cotización final"
              persistent-hint
            ></v-textarea>
          </UiParentCard>

          <!-- Observaciones Clínicas -->
          <UiParentCard title="Observaciones Clínicas / Recomendaciones" class="mb-4">
            <v-textarea
              v-model="form.tx_observaciones_clinicas"
              label="Recomendaciones preoperatorias o indicaciones médicas"
              placeholder="Ej: Evitar AINES 2 semanas antes del procedimiento. Ayuno de 8 horas. Suspender tabaco 4 semanas antes..."
              variant="outlined"
              rows="4"
              auto-grow
              rounded="lg"
            ></v-textarea>
          </UiParentCard>

          <!-- Médico Responsable -->
          <UiParentCard title="Médico Responsable" class="mb-4">
            <v-select
              v-model="form.id_doctor"
              :items="doctors"
              item-title="tx_full_name"
              item-value="id"
              label="Seleccione el médico que firma la cotización"
              variant="outlined"
              rounded="lg"
              :return-object="false"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="item.raw.tx_specialty + ' | Reg. ' + item.raw.tx_medical_registration">
                </v-list-item>
              </template>
            </v-select>
          </UiParentCard>

          <!-- BOTÓN FINAL -->
          <div class="text-center mt-6 mb-16">
            <v-btn
              size="x-large"
              color="primary"
              class="btn-gradient px-12"
              rounded="xl"
              elevation="4"
              :loading="isSubmitting"
              @click="submitQuotation"
            >
              <v-icon start size="24">mdi-file-document-check-outline</v-icon>
              GENERAR COTIZACIÓN MÉDICA
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { required } from '@/utils/validators';
import { API } from '@/api/endpoints';

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

interface QuoteItem {
  tx_codigo: string;
  tx_servicio: string;
  tx_descripcion: string;
  tx_categoria: string;
  nu_cantidad: number;
  fl_valor_unitario: number;
  fl_valor_unitario_display: string;
  fl_subtotal: number;
}

interface Doctor {
  id: string;
  tx_first_name: string;
  tx_last_name: string;
  tx_full_name: string;
  tx_specialty: string;
  tx_medical_registration: string;
}

const router = useRouter();
const { notify } = useNotification();

const step = ref(1);
const loading = ref(false);
const isSubmitting = ref(false);

const customers = ref<Customer[]>([]);
const procedures = ref<Procedure[]>([]);
const doctors = ref<Doctor[]>([]);
const searchDni = ref('');
const selectedCustomer = ref<Customer | null>(null);

const categorias = ['Consulta', 'Procedimiento', 'Anestesia', 'Hospitalización', 'Insumos', 'Exámenes', 'Otros'];
const formasPago = ['Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito', 'Tarjeta Débito', 'Mixto'];

const condicionesDefault = 'Los valores pueden variar según valoración médica final.\nNo incluye complicaciones no previstas durante el procedimiento.\nRequiere evaluación prequirúrgica previa para confirmación del procedimiento.\nEl paciente declara haber sido informado de los riesgos y beneficios del procedimiento.';

const form = ref({
  id_customer: '',
  tx_diagnostico: '',
  tx_notes: '',
  items: [] as QuoteItem[],
  total_cost: 0,
  descuento_porcentaje: 0,
  descuento_valor: 0,
  iva_porcentaje: 0,
  iva_valor: 0,
  anticipo_porcentaje: 50,
  anticipo_valor: 0,
  tx_forma_pago: '',
  in_validez_dias: 15,
  tx_condiciones_medicas: '',
  tx_observaciones_clinicas: '',
  id_doctor: null as string | null,
});

onMounted(async () => {
  loading.value = true;
  try {
    const [resCust, resProc, resDoctors] = await Promise.all([
      axios.get(API.CUSTOMERS.ALL_FOR_COTY),
      axios.get(API.PROCEDURES.ALL_FOR_COTY),
      axios.get(API.QUOTES.DOCTORS),
    ]);
    customers.value = resCust.data.data || [];
    procedures.value = resProc.data.data || [];
    doctors.value = (resDoctors.data.data || []).map((d: any) => ({
      ...d,
      tx_full_name: `${d.tx_first_name} ${d.tx_last_name}`
    }));
    // Iniciar con un item vacío
    addItem('Procedimiento');
  } catch (error) {
    notify('error', 'Error al cargar datos iniciales');
  } finally {
    loading.value = false;
  }
});

// ====================== FILTROS ======================
const filteredCustomers = computed(() => {
  if (!searchDni.value) return customers.value;
  return customers.value.filter(c => c.tx_dni.includes(searchDni.value));
});

// ====================== CÁLCULOS ======================
const subtotalCalculado = computed(() => {
  return form.value.items.reduce((sum, item) => sum + item.fl_subtotal, 0);
});

const formatMoney = (value: number): string => {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const parseCurrencyInput = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

const handleUnitPriceInput = (index: number, rawValue: any) => {
  const item = form.value.items[index];
  if (!item) return;
  // Permitir escribir libremente; al hacer blur o recalcular se parsea
};

const recalcItem = (index: number) => {
  const item = form.value.items[index];
  if (!item) return;
  item.fl_valor_unitario = parseCurrencyInput(item.fl_valor_unitario_display || '0');
  item.nu_cantidad = item.nu_cantidad || 1;
  item.fl_subtotal = item.nu_cantidad * item.fl_valor_unitario;
  recalcTotals();
};

const recalcTotals = () => {
  const subtotal = subtotalCalculado.value;

  // Descuento
  form.value.descuento_valor = (subtotal * (form.value.descuento_porcentaje || 0)) / 100;

  // Base para IVA
  const baseIVA = subtotal - form.value.descuento_valor;
  form.value.iva_valor = (baseIVA * (form.value.iva_porcentaje || 0)) / 100;

  // Total general
  form.value.total_cost = baseIVA + form.value.iva_valor;

  // Anticipo
  form.value.anticipo_valor = (form.value.total_cost * (form.value.anticipo_porcentaje || 0)) / 100;
};

// ====================== MANEJO DE ÍTEMS ======================
const addItem = (categoria: string = 'Procedimiento') => {
  form.value.items.push({
    tx_codigo: '',
    tx_servicio: '',
    tx_descripcion: '',
    tx_categoria: categoria,
    nu_cantidad: 1,
    fl_valor_unitario: 0,
    fl_valor_unitario_display: '',
    fl_subtotal: 0,
  });
};

const addFromProcedure = (proc: Procedure) => {
  form.value.items.push({
    tx_codigo: '',
    tx_servicio: proc.tx_name,
    tx_descripcion: '',
    tx_categoria: 'Procedimiento',
    nu_cantidad: 1,
    fl_valor_unitario: 0,
    fl_valor_unitario_display: '',
    fl_subtotal: 0,
  });
};

const removeItem = (index: number) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1);
    recalcTotals();
  }
};

// ====================== NAVEGACIÓN ======================
const selectCustomer = (customer: Customer) => {
  selectedCustomer.value = customer;
  form.value.id_customer = customer.id;
};

// ====================== ENVÍO ======================
const submitQuotation = async () => {
  if (form.value.items.length === 0 || form.value.items.every(i => !i.tx_servicio.trim())) {
    notify('warning', 'Debe agregar al menos un servicio o procedimiento con nombre');
    return;
  }

  if (form.value.total_cost <= 0) {
    notify('warning', 'El total general debe ser mayor a 0');
    return;
  }

  isSubmitting.value = true;

  // Limpiar items para envío
  const cleanItems = form.value.items
    .filter(i => i.tx_servicio.trim() !== '')
    .map(i => ({
      tx_codigo: i.tx_codigo,
      tx_servicio: i.tx_servicio,
      tx_descripcion: i.tx_descripcion,
      nu_cantidad: i.nu_cantidad,
      fl_valor_unitario: i.fl_valor_unitario,
      tx_categoria: i.tx_categoria,
    }));

  const payload = {
    id_customer: selectedCustomer.value?.id,
    tx_diagnostico: form.value.tx_diagnostico,
    tx_notes: form.value.tx_notes,
    items: cleanItems,
    subtotal: subtotalCalculado.value,
    total_cost: form.value.total_cost,
    descuento_porcentaje: form.value.descuento_porcentaje,
    descuento_valor: form.value.descuento_valor,
    iva_porcentaje: form.value.iva_porcentaje,
    iva_valor: form.value.iva_valor,
    anticipo_porcentaje: form.value.anticipo_porcentaje,
    anticipo_valor: form.value.anticipo_valor,
    tx_forma_pago: form.value.tx_forma_pago,
    in_validez_dias: form.value.in_validez_dias,
    tx_condiciones_medicas: form.value.tx_condiciones_medicas || condicionesDefault,
    tx_observaciones_clinicas: form.value.tx_observaciones_clinicas,
    id_doctor: form.value.id_doctor,
  };

  try {
    const response = await axios.post(API.QUOTES.ADD, payload);
    if (response.data.status) {
      notify('success', response.data.msg || 'Cotización médica generada con éxito');
      router.push('/quotes');
    } else {
      notify('warning', response.data.msg || 'Error al generar la cotización');
    }
  } catch (error) {
    notify('error', 'Error de conexión al servidor');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.coty-container {
  max-width: 1200px;
  margin: 0 auto;
}
.customer-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}
.customer-card:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
}
.selected-card {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.03) !important;
}
.items-table {
  border: 1px solid rgba(0,0,0,0.08);
}
.items-table th {
  background: #f8fafc !important;
  white-space: nowrap;
}
.items-table td {
  vertical-align: top;
  padding: 4px 8px;
}
.small-input :deep(.v-field__input) {
  font-size: 0.85rem;
  padding: 4px 8px;
}
.small-input :deep(.v-field) {
  font-size: 0.85rem;
}
.btn-gradient {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), #4db6ac) !important;
  color: white !important;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.gap-2 {
  gap: 0.5rem;
}
</style>
