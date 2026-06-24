<template>
  <v-container fluid class="print-preview-container">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card v-if="loading" flat class="pa-10 text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-medium-emphasis">Cargando vista previa de la cotización...</p>
        </v-card>

        <v-card v-else-if="quote" class="quotation-card pa-8" flat rounded="lg">
          <!-- HEADER -->
          <v-row no-gutters class="mb-6 align-center">
            <v-col cols="6">
              <div class="d-flex align-center">
                <img v-if="quote.business_logo" :src="quote.business_logo" alt="Logo Clínica" class="business-logo mr-4" />
                <div>
                  <h1 class="text-h6 font-weight-bold text-primary">{{ quote.business_name }}</h1>
                  <p class="text-caption text-medium-emphasis">NIT: {{ quote.business_nit || 'N/A' }}</p>
                  <p class="text-caption text-medium-emphasis">{{ quote.business_address || 'N/A' }}, {{ quote.business_city || 'N/A' }}</p>
                  <p class="text-caption text-medium-emphasis">Tel: {{ quote.business_phone || 'N/A' }} | WhatsApp: {{ quote.business_whatsapp || 'N/A' }}</p>
                  <p class="text-caption text-medium-emphasis">Email: {{ quote.business_email || 'N/A' }}</p>
                </div>
              </div>
            </v-col>
            <v-col cols="6" class="text-right">
              <div class="py-2 px-4 bg-primary-lighten-5 rounded-lg d-inline-block">
                <h2 class="text-h5 font-weight-bold text-primary">COTIZACIÓN</h2>
                <p class="text-subtitle-1 font-weight-bold text-secondary">No. {{ quote.tx_cotizacion_nro || quote.tx_nro }}</p>
              </div>
              <p class="text-caption mt-2">Fecha de Emisión: {{ formatDate(quote.date_add) }}</p>
              <p class="text-caption">Válida hasta: {{ formatDate(quote.date_vencimiento) }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <!-- DATOS DEL PACIENTE -->
          <h3 class="text-subtitle-1 font-weight-bold mb-3 text-secondary">DATOS DEL PACIENTE</h3>
          <v-row dense class="mb-6 patient-data-card">
            <v-col cols="12" sm="6">
              <p class="text-body-2">**Nombre:** {{ quote.tx_first_name }} {{ quote.tx_last_name }}</p>
              <p class="text-body-2">**Documento:** {{ quote.tx_dni_type }}-{{ quote.tx_dni }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p class="text-body-2">**Edad:** {{ getAge(quote.customer_birth) }} años</p>
              <p class="text-body-2">**Teléfono:** {{ quote.customer_phone }}</p>
              <p class="text-body-2">**Email:** {{ quote.customer_email }}</p>
            </v-col>
          </v-row>

          <!-- DIAGNÓSTICO / MOTIVO DE CONSULTA -->
          <h3 class="text-subtitle-1 font-weight-bold mb-3 text-secondary">DIAGNÓSTICO / MOTIVO DE CONSULTA</h3>
          <div class="mb-6 detail-box">
            <p class="text-body-2">{{ quote.tx_diagnostico || 'No especificado.' }}</p>
          </div>

          <!-- DETALLE DE LA COTIZACIÓN (TABLA) -->
          <h3 class="text-subtitle-1 font-weight-bold mb-3 text-secondary">DETALLE DE LA COTIZACIÓN</h3>
          <v-table density="compact" class="items-table mb-6">
            <thead>
              <tr>
                <th v-if="quote.in_mostrar_codigos" class="text-caption font-weight-bold" width="80">CÓDIGO</th>
                <th class="text-caption font-weight-bold">PROCEDIMIENTO / SERVICIO</th>
                <th class="text-caption font-weight-bold text-center" width="70">CANT.</th>
                <th class="text-caption font-weight-bold text-right" width="100">VALOR UNIT.</th>
                <th class="text-caption font-weight-bold text-right" width="120">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in quote.items" :key="index">
                <td v-if="quote.in_mostrar_codigos">{{ item.tx_codigo || '-' }}</td>
                <td>
                  <p class="font-weight-medium">{{ item.tx_servicio }}</p>
                  <p v-if="item.tx_descripcion" class="text-caption text-medium-emphasis">{{ item.tx_descripcion }}</p>
                </td>
                <td class="text-center">{{ item.nu_cantidad }}</td>
                <td class="text-right">$ {{ formatMoney(item.fl_valor_unitario) }}</td>
                <td class="text-right font-weight-bold">$ {{ formatMoney(item.fl_subtotal) }}</td>
              </tr>
            </tbody>
          </v-table>

          <!-- RESUMEN DE COSTOS -->
          <h3 class="text-subtitle-1 font-weight-bold mb-3 text-secondary">RESUMEN DE COSTOS</h3>
          <div class="summary-box mb-6">
            <div class="d-flex justify-space-between text-body-1 mb-1">
              <span>Subtotal</span>
              <span class="font-weight-bold">$ {{ formatMoney(quote.fl_subtotal) }}</span>
            </div>
            <div v-if="quote.fl_descuento_valor > 0" class="d-flex justify-space-between text-body-1 mb-1 text-error">
              <span>Descuento ({{ quote.fl_descuento_porcentaje }}%)</span>
              <span class="font-weight-bold">- $ {{ formatMoney(quote.fl_descuento_valor) }}</span>
            </div>
            <div v-if="quote.fl_iva_valor > 0" class="d-flex justify-space-between text-body-1 mb-1">
              <span>IVA ({{ quote.fl_iva_porcentaje }}%)</span>
              <span class="font-weight-bold">$ {{ formatMoney(quote.fl_iva_valor) }}</span>
            </div>
            <v-divider class="my-2" thickness="2"></v-divider>
            <div class="d-flex justify-space-between text-h6 text-primary mb-1">
              <span class="font-weight-bold">TOTAL GENERAL</span>
              <span class="font-weight-bold">$ {{ formatMoney(quote.fl_total_cost) }}</span>
            </div>
            <div v-if="quote.fl_anticipo_valor > 0" class="d-flex justify-space-between text-subtitle-1 text-secondary mt-2">
              <span>Anticipo Requerido ({{ quote.fl_anticipo_porcentaje }}%)</span>
              <span class="font-weight-bold">$ {{ formatMoney(quote.fl_anticipo_valor) }}</span>
            </div>
          </div>

          <!-- CONDICIONES DE PAGO -->
          <h3 class="text-subtitle-1 font-weight-bold mb-3 text-secondary">CONDICIONES DE PAGO</h3>
          <div class="mb-6 detail-box">
            <p class="text-body-2">**Forma de Pago:** {{ quote.tx_forma_pago || 'A convenir' }}</p>
            <p class="text-body-2">**Validez de la Cotización:** {{ quote.in_validez_dias }} días a partir de la fecha de emisión.</p>
            <p class="text-body-2">**Fecha de Vencimiento:** {{ formatDate(quote.date_vencimiento) }}</p>
          </div>

          <!-- CONDICIONES MÉDICAS Y LEGALES -->
          <h3 class="text-subtitle-1 font-weight-bold mb-3 text-secondary">CONDICIONES MÉDICAS Y LEGALES</h3>
          <div class="mb-6 detail-box pre-wrap">
            <p class="text-body-2">{{ quote.tx_condiciones_medicas || 'No se especificaron condiciones médicas o legales.' }}</p>
          </div>

          <!-- OBSERVACIONES CLÍNICAS -->
          <h3 class="text-subtitle-1 font-weight-bold mb-3 text-secondary">OBSERVACIONES CLÍNICAS</h3>
          <div class="mb-8 detail-box pre-wrap">
            <p class="text-body-2">{{ quote.tx_observaciones_clinicas || 'No hay observaciones clínicas.' }}</p>
          </div>

          <!-- FIRMA -->
          <div class="text-center signature-area">
            <div v-if="quote.tx_firma_doctor" class="signature-img-container">
              <img :src="quote.tx_firma_doctor" alt="Firma Médico" class="signature-img" />
            </div>
            <div class="signature-line"></div>
            <p class="text-subtitle-1 font-weight-bold mb-1">Dr. {{ quote.doctor_first_name }} {{ quote.doctor_last_name }}</p>
            <p class="text-caption">Reg. Médico: {{ quote.doctor_registration || 'N/A' }}</p>
            <p class="text-caption">Especialidad: {{ quote.doctor_specialty || 'N/A' }}</p>
            <p class="text-caption text-primary mt-2">**Firma Digital del Médico Responsable**</p>
          </div>

        </v-card>

        <v-alert v-else type="error" color="error" variant="tonal" rounded="lg" class="mt-4">
          No se pudo cargar la cotización. Verifique el ID o intente de nuevo.
        </v-alert>

        <div class="d-flex justify-center mt-6">
          <v-btn color="secondary" variant="tonal" class="mx-2" @click="router.back()">
            <v-icon start>mdi-arrow-left</v-icon> Volver
          </v-btn>
          <v-btn color="primary" class="mx-2" @click="printQuotation">
            <v-icon start>mdi-printer</v-icon> Imprimir / Exportar PDF
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
  in_mostrar_codigos?: number;
  in_mostrar_logo?: number;

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
      // Convertir 0/1 a boolean para mostrar/ocultar en la vista
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
  background-color: #f0f2f5; /* Un fondo suave para la previsualización */
  min-height: 100vh;
  padding-top: 20px;
  padding-bottom: 20px;
}

.quotation-card {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: 'Roboto', sans-serif; /* Fuente profesional */
}

.business-logo {
  max-width: 120px;
  height: auto;
}

.patient-data-card p, .detail-box p {
  margin-bottom: 4px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

.items-table th,
.items-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
}

.items-table th {
  background-color: #f5f5f5;
  text-align: left;
  font-weight: bold;
}

.summary-box {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  padding: 1rem;
  border-radius: 8px;
}

.signature-area {
  margin-top: 4rem;
  padding-top: 2rem;
  position: relative;
}

.signature-line {
  border-top: 1px solid #000;
  width: 250px;
  margin: 0 auto 8px auto;
}

.signature-img-container {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px; /* Ancho estimado para la firma */
  height: 80px; /* Alto estimado para la firma */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.signature-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pre-wrap {
  white-space: pre-wrap; /* Para respetar saltos de línea en textareas */
}

@media print {
  body * {
    visibility: hidden;
  }
  .print-preview-container, .print-preview-container * {
    visibility: visible;
    overflow: visible !important;
  }
  .print-preview-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
    margin: 0;
    box-shadow: none;
    background-color: #ffffff;
  }
  .quotation-card {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 20px !important;
  }
  .v-navigation-drawer, .v-app-bar, .v-footer, .v-btn {
    display: none !important;
  }
}
</style>
