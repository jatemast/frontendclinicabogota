<template>
  <v-container fluid class="print-preview-container pa-4 pa-sm-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- BARRA DE ACCIONES DE IMPRESIÓN (NO IMPRIMIBLE) -->
        <div class="d-flex align-center justify-space-between mb-6 no-print">
          <v-btn color="secondary" variant="tonal" rounded="lg" class="font-weight-bold" @click="router.back()">
            <v-icon start>mdi-arrow-left</v-icon> Volver a Cotizaciones
          </v-btn>
          <div class="d-flex gap-3">
            <v-btn color="primary" variant="flat" rounded="lg" class="font-weight-bold px-6" @click="printQuotation">
              <v-icon start>mdi-printer</v-icon> Imprimir / Exportar PDF
            </v-btn>
          </div>
        </div>

        <!-- INDICADOR DE CARGA -->
        <v-card v-if="loading" elevation="0" rounded="xl" class="pa-12 text-center border bg-surface">
          <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
          <p class="mt-4 text-subtitle-1 font-weight-bold text-primary">Generando documento oficial de cotización...</p>
        </v-card>

        <!-- DOCUMENTO DE COTIZACIÓN -->
        <v-card v-else-if="quote" class="quotation-card pa-6 pa-sm-10 border rounded-xl bg-surface" elevation="0">
          <!-- HEADER CLÍNICA & FOLIO -->
          <v-row class="mb-6 align-center">
            <v-col cols="12" sm="7">
              <div class="d-flex align-center gap-4">
                <img v-if="quote.business_logo" :src="quote.business_logo" alt="Logo Clínica" class="business-logo" />
                <v-avatar v-else color="lightprimary" size="64" rounded="lg" class="border">
                  <v-icon color="primary" size="36">mdi-hospital-building</v-icon>
                </v-avatar>
                <div>
                  <h1 class="text-h5 font-weight-bold text-primary mb-1">{{ quote.business_name || 'LogicSurgi Clínica' }}</h1>
                  <p class="text-caption text-secondary mb-0"><strong>NIT / RUC:</strong> {{ quote.business_nit || 'N/A' }}</p>
                  <p class="text-caption text-secondary mb-0"><v-icon size="12" color="primary">mdi-map-marker</v-icon> {{ quote.business_address || 'Dirección no registrada' }}, {{ quote.business_city || '' }}</p>
                  <p class="text-caption text-secondary mb-0"><v-icon size="12" color="primary">mdi-phone</v-icon> {{ quote.business_phone || 'N/A' }} <span v-if="quote.business_whatsapp">| WhatsApp: {{ quote.business_whatsapp }}</span></p>
                  <p class="text-caption text-secondary mb-0"><v-icon size="12" color="primary">mdi-email-outline</v-icon> {{ quote.business_email || 'N/A' }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="5" class="text-sm-right mt-4 mt-sm-0">
              <div class="folio-badge pa-4 rounded-xl d-inline-block text-center border bg-lightprimary">
                <span class="text-overline font-weight-bold text-primary d-block">COTIZACIÓN MÉDICA</span>
                <h2 class="text-h4 font-weight-bold text-primary">No. {{ quote.tx_cotizacion_nro || quote.tx_nro }}</h2>
              </div>
              <div class="mt-3">
                <p class="text-caption text-secondary mb-0"><strong>Emisión:</strong> {{ formatDate(quote.date_add) }}</p>
                <p class="text-caption text-secondary mb-0"><strong>Válido Hasta:</strong> {{ formatDate(quote.date_vencimiento) }}</p>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <!-- SECCIÓN 1: DATOS DEL PACIENTE -->
          <div class="section-card pa-4 rounded-lg mb-6 border bg-lightprimary">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" class="mr-2" size="20">mdi-account-heart</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold text-primary">INFORMACIÓN DEL PACIENTE</h3>
            </div>
            <v-row dense class="text-body-2">
              <v-col cols="12" sm="6" md="4">
                <p class="mb-1 text-secondary">Paciente:</p>
                <p class="font-weight-bold text-primary text-subtitle-2 mb-0">{{ quote.tx_first_name }} {{ quote.tx_last_name }}</p>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <p class="mb-1 text-secondary">Documento ID:</p>
                <p class="font-weight-bold mb-0">{{ quote.tx_dni_type ? `${quote.tx_dni_type}-` : '' }}{{ quote.tx_dni || 'N/A' }}</p>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <p class="mb-1 text-secondary">Edad:</p>
                <p class="font-weight-bold mb-0">{{ getAge(quote.customer_birth) }} años</p>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="mt-2">
                <p class="mb-1 text-secondary">Teléfono:</p>
                <p class="font-weight-bold mb-0">{{ quote.customer_phone || 'N/A' }}</p>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="mt-2">
                <p class="mb-1 text-secondary">Email:</p>
                <p class="font-weight-bold mb-0">{{ quote.customer_email || 'N/A' }}</p>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="mt-2">
                <p class="mb-1 text-secondary">Ciudad / Dirección:</p>
                <p class="font-weight-bold mb-0">{{ quote.customer_city || '' }} {{ quote.customer_address ? `(${quote.customer_address})` : '' }}</p>
              </v-col>
            </v-row>
          </div>

          <!-- SECCIÓN 2: DIAGNÓSTICO / EVALUACIÓN -->
          <div class="mb-6">
            <div class="d-flex align-center mb-2">
              <v-icon color="primary" class="mr-2" size="20">mdi-stethoscope</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold text-primary">DIAGNÓSTICO Y EVALUACIÓN CLÍNICA</h3>
            </div>
            <div class="detail-box pa-4 rounded-lg border bg-surface">
              <p class="text-body-2 mb-0">{{ quote.tx_diagnostico || 'Evaluación médica presencial.' }}</p>
            </div>
          </div>

          <!-- SECCIÓN 3: TABLA DE PROCEDIMIENTOS Y SERVICIOS -->
          <div class="mb-6">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" class="mr-2" size="20">mdi-clipboard-list-outline</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold text-primary">PROCEDIMIENTOS Y SERVICIOS INCLUIDOS</h3>
            </div>

            <v-table class="items-table border rounded-lg overflow-hidden mb-4">
              <thead>
                <tr>
                  <th v-if="quote.in_mostrar_codigos" class="text-overline font-weight-bold" width="90">CÓDIGO</th>
                  <th class="text-overline font-weight-bold">PROCEDIMIENTO / DETALLE</th>
                  <th class="text-overline font-weight-bold text-center" width="75">CANT.</th>
                  <th class="text-overline font-weight-bold text-right" width="130">VALOR UNIT.</th>
                  <th class="text-overline font-weight-bold text-right" width="140">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in quote.items" :key="index" class="item-row">
                  <td v-if="quote.in_mostrar_codigos" class="font-weight-medium text-caption">{{ item.tx_codigo || '-' }}</td>
                  <td>
                    <p class="font-weight-bold text-subtitle-2 mb-0 text-primary">{{ item.tx_servicio }}</p>
                    <p v-if="item.tx_descripcion" class="text-caption text-secondary mb-0">{{ item.tx_descripcion }}</p>
                  </td>
                  <td class="text-center font-weight-bold">{{ item.nu_cantidad }}</td>
                  <td class="text-right font-weight-medium">$ {{ formatMoney(item.fl_valor_unitario) }}</td>
                  <td class="text-right font-weight-bold text-primary">$ {{ formatMoney(item.fl_subtotal) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- SECCIÓN 4: CONDICIONES DE PAGO & RESUMEN FINANCIERO -->
          <v-row class="mb-6">
            <!-- Condiciones Left -->
            <v-col cols="12" md="6">
              <div class="detail-box pa-4 rounded-lg border bg-surface h-100">
                <div class="d-flex align-center mb-3">
                  <v-icon color="primary" class="mr-2" size="20">mdi-credit-card-outline</v-icon>
                  <h4 class="text-subtitle-2 font-weight-bold text-primary">CONDICIONES DE PAGO Y VIGENCIA</h4>
                </div>
                <p class="text-body-2 mb-2"><strong>Forma de Pago:</strong> {{ quote.tx_forma_pago || 'A convenir' }}</p>
                <p class="text-body-2 mb-2"><strong>Días de Validez:</strong> {{ quote.in_validez_dias || 30 }} días calendario a partir de su emisión.</p>
                <p class="text-body-2 mb-0"><strong>Vencimiento Oficial:</strong> {{ formatDate(quote.date_vencimiento) }}</p>
              </div>
            </v-col>

            <!-- Total Box Right -->
            <v-col cols="12" md="6">
              <div class="financial-summary-box pa-4 rounded-lg border bg-lightprimary">
                <div class="d-flex justify-space-between text-body-2 mb-2">
                  <span class="text-secondary">Subtotal Procedimientos:</span>
                  <span class="font-weight-bold">$ {{ formatMoney(quote.fl_subtotal) }}</span>
                </div>

                <div v-if="quote.fl_descuento_valor > 0" class="d-flex justify-space-between text-body-2 mb-2 text-error">
                  <span>Descuento ({{ quote.fl_descuento_porcentaje }}%):</span>
                  <span class="font-weight-bold">- $ {{ formatMoney(quote.fl_descuento_valor) }}</span>
                </div>

                <div v-if="quote.fl_iva_valor > 0" class="d-flex justify-space-between text-body-2 mb-2">
                  <span class="text-secondary">IVA ({{ quote.fl_iva_porcentaje }}%):</span>
                  <span class="font-weight-bold">$ {{ formatMoney(quote.fl_iva_valor) }}</span>
                </div>

                <v-divider class="my-3"></v-divider>

                <div class="d-flex justify-space-between align-center text-h5 text-primary">
                  <span class="font-weight-bold">TOTAL INVERSIÓN:</span>
                  <span class="font-weight-black">$ {{ formatMoney(quote.fl_total_cost) }}</span>
                </div>

                <div v-if="quote.fl_anticipo_valor > 0" class="d-flex justify-space-between align-center mt-3 pt-2 border-top">
                  <span class="text-caption font-weight-bold text-secondary">Anticipo Requerido ({{ quote.fl_anticipo_porcentaje }}%):</span>
                  <v-chip color="success" size="small" variant="flat" class="font-weight-bold">
                    $ {{ formatMoney(quote.fl_anticipo_valor) }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- SECCIÓN 5: CONDICIONES MÉDICAS Y LEGALES -->
          <div v-if="quote.tx_condiciones_medicas" class="mb-6">
            <div class="d-flex align-center mb-2">
              <v-icon color="primary" class="mr-2" size="20">mdi-file-certificate-outline</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold text-primary">CONDICIONES MÉDICAS Y LEGALES</h3>
            </div>
            <div class="detail-box pa-4 rounded-lg border bg-surface pre-wrap">
              <p class="text-body-2 mb-0">{{ quote.tx_condiciones_medicas }}</p>
            </div>
          </div>

          <!-- SECCIÓN 6: OBSERVACIONES CLÍNICAS -->
          <div v-if="quote.tx_observaciones_clinicas" class="mb-8">
            <div class="d-flex align-center mb-2">
              <v-icon color="primary" class="mr-2" size="20">mdi-comment-text-outline</v-icon>
              <h3 class="text-subtitle-1 font-weight-bold text-primary">OBSERVACIONES CLÍNICAS</h3>
            </div>
            <div class="detail-box pa-4 rounded-lg border bg-surface pre-wrap">
              <p class="text-body-2 mb-0">{{ quote.tx_observaciones_clinicas }}</p>
            </div>
          </div>

          <!-- SECCIÓN 7: FIRMA Y SELLO MÉDICO -->
          <div class="text-center signature-area pt-8">
            <div v-if="quote.tx_firma_doctor" class="signature-img-container mb-2">
              <img :src="quote.tx_firma_doctor" alt="Firma Médico" class="signature-img" />
            </div>
            <div class="signature-line"></div>
            <h4 class="text-subtitle-1 font-weight-bold text-primary mb-1">
              Dr(a). {{ quote.doctor_first_name }} {{ quote.doctor_last_name }}
            </h4>
            <p class="text-caption text-secondary mb-0"><strong>Reg. Médico / Col:</strong> {{ quote.doctor_registration || 'N/A' }}</p>
            <p class="text-caption text-secondary mb-0"><strong>Especialidad:</strong> {{ quote.doctor_specialty || 'Cirugía / Medicina Estética' }}</p>
            <v-chip color="primary" size="x-small" variant="tonal" class="mt-2 font-weight-bold">
              <v-icon start size="12">mdi-check-decagram</v-icon> Firma Digital y Sello Médico Autorizado
            </v-chip>
          </div>
        </v-card>

        <v-alert v-else type="error" color="error" variant="tonal" rounded="xl" class="mt-4">
          No se pudo cargar el documento de cotización. Verifique el ID.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { API } from '@/api/endpoints';

interface QuoteItem {
  tx_codigo?: string;
  tx_servicio: string;
  tx_descripcion?: string;
  nu_cantidad: number;
  fl_valor_unitario: number;
  fl_subtotal: number;
}

interface QuoteData {
  id: string;
  tx_nro: string;
  tx_cotizacion_nro: string;
  date_add: string;
  date_vencimiento: string;
  tx_diagnostico: string;
  tx_notes: string;
  fl_subtotal: number;
  fl_descuento_porcentaje: number;
  fl_descuento_valor: number;
  fl_iva_porcentaje: number;
  fl_iva_valor: number;
  fl_total_cost: number;
  fl_anticipo_porcentaje: number;
  fl_anticipo_valor: number;
  tx_forma_pago: string;
  in_validez_dias: number;
  tx_condiciones_medicas: string;
  tx_observaciones_clinicas: string;
  id_doctor?: string;
  tx_firma_doctor?: string;
  
  // Business Info
  business_name: string;
  business_nit?: string;
  business_logo?: string;
  business_address?: string;
  business_phone?: string;
  business_whatsapp?: string;
  business_email?: string;
  business_city?: string;

  // Customer Info
  tx_first_name: string;
  tx_last_name: string;
  tx_dni: string;
  tx_dni_type: string;
  customer_phone: string;
  customer_email: string;
  customer_birth: string;
  customer_address: string;
  customer_city: string;

  // Doctor Info
  doctor_first_name?: string;
  doctor_last_name?: string;
  doctor_registration?: string;
  doctor_specialty?: string;

  // Config settings
  in_mostrar_codigos?: boolean | number;
  in_mostrar_logo?: boolean | number;

  items: QuoteItem[];
}

const route = useRoute();
const router = useRouter();
const { notify } = useNotification();

const loading = ref(true);
const quote = ref<QuoteData | null>(null);

onMounted(async () => {
  const idQuote = route.params.id;
  if (!idQuote) {
    notify('error', 'ID de cotización no proporcionado.');
    loading.value = false;
    return;
  }

  try {
    const response = await axios.get(API.QUOTES.PRINT(idQuote as string));
    if (response.data.status && response.data.data) {
      quote.value = response.data.data;
      if (quote.value) {
        quote.value.in_mostrar_codigos = !!quote.value.in_mostrar_codigos;
        quote.value.in_mostrar_logo = !!quote.value.in_mostrar_logo;
      }
    } else {
      notify('error', response.data.msg || 'No se encontró la cotización.');
    }
  } catch (error) {
    notify('error', 'Error al cargar la cotización para impresión.');
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const formatMoney = (value: number): string => {
  return (value || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-CO', options);
};

const getAge = (dateOfBirth?: string): string => {
  if (!dateOfBirth) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return String(age);
};

const printQuotation = () => {
  window.print();
};
</script>

<style scoped>
.print-preview-container {
  min-height: 100vh;
}

.quotation-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
}

.business-logo {
  max-width: 140px;
  max-height: 70px;
  object-fit: contain;
}

.folio-badge {
  min-width: 220px;
}

.items-table {
  width: 100%;
}

.items-table th {
  background-color: rgb(var(--v-theme-bglight)) !important;
  color: rgb(var(--v-theme-textSecondary)) !important;
  font-weight: 700 !important;
  height: 44px !important;
  border-bottom: 2px solid rgb(var(--v-theme-borderColor)) !important;
}

.items-table td {
  border-bottom: 1px solid rgb(var(--v-theme-borderColor)) !important;
  padding: 12px 16px !important;
}

.item-row:hover {
  background-color: rgb(var(--v-theme-hoverColor)) !important;
}

.signature-area {
  margin-top: 3rem;
  position: relative;
}

.signature-line {
  border-top: 2px solid #18B6C9;
  width: 240px;
  margin: 0 auto 12px auto;
}

.signature-img-container {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.signature-img {
  max-height: 75px;
  object-fit: contain;
}

.pre-wrap {
  white-space: pre-wrap;
}

/* REGLAS DE IMPRESIÓN OFICIAL (PDF) */
@media print {
  body * {
    visibility: hidden;
  }
  .print-preview-container, .print-preview-container * {
    visibility: visible;
  }
  .print-preview-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }
  .quotation-card {
    box-shadow: none !important;
    border: none !important;
    background: white !important;
    color: black !important;
    padding: 0 !important;
  }
  .no-print, .v-navigation-drawer, .v-app-bar, .v-footer, .v-btn {
    display: none !important;
  }
}
</style>
