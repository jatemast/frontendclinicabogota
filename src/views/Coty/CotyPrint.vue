<template>
  <v-container fluid class="print-preview-container pa-2 pa-sm-6">
    <v-row justify="center">
      <v-col cols="12" md="11" lg="10" xl="9">
        <!-- BARRA DE ACCIONES SUPERIOR (NO IMPRIMIBLE) -->
        <div class="d-flex align-center justify-space-between mb-6 no-print">
          <v-btn color="secondary" variant="tonal" rounded="lg" class="font-weight-bold" @click="router.back()">
            <v-icon start>mdi-arrow-left</v-icon> Volver a Cotizaciones
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" class="font-weight-bold px-6 elevation-2" @click="printQuotation">
            <v-icon start>mdi-printer</v-icon> Imprimir / Exportar PDF
          </v-btn>
        </div>

        <!-- INDICADOR DE CARGA -->
        <v-card v-if="loading" elevation="0" rounded="xl" class="pa-12 text-center border bg-surface">
          <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
          <p class="mt-4 text-subtitle-1 font-weight-bold text-primary">Generando documento oficial de cotización...</p>
        </v-card>

        <!-- DOCUMENTO DE COTIZACIÓN ESTILO "LA CLINIQUE" -->
        <div v-else-if="quote" class="document-sheet">
          <!-- CABECERA PRINCIPAL CON CURVA NAVY & ORO -->
          <div class="header-section d-flex justify-space-between align-start">
            <!-- LOGO Y DATOS DE LA CLÍNICA (IZQUIERDA) -->
            <div class="clinic-info pa-6">
              <div class="d-flex align-center gap-4 mb-3">
                <img v-if="quote.business_logo" :src="quote.business_logo" alt="Logo" class="clinic-logo" />
                <div v-else class="logo-fallback-box">
                  <div class="logo-initials">LC</div>
                  <div class="logo-text">
                    <span class="brand-name">{{ quote.business_name || 'LA CLINIQUE' }}</span>
                    <span class="brand-sub">CIRUGÍA PLÁSTICA & ESTÉTICA</span>
                  </div>
                </div>
                <div v-if="quote.business_logo">
                  <h2 class="text-h6 font-weight-black text-uppercase brand-navy mb-0">{{ quote.business_name }}</h2>
                  <p class="text-caption text-secondary font-weight-medium mb-0">ESTÉTICA & CIRUGÍA RECONSTRUCTIVA</p>
                </div>
              </div>

              <!-- DETALLES DE CONTACTO Y HABILITACIÓN -->
              <div class="clinic-details text-caption">
                <p class="mb-0"><v-icon size="13" color="#18B6C9">mdi-map-marker</v-icon> {{ quote.business_address || 'Dirección Clínica Principal' }}, {{ quote.business_city || 'Colombia' }}</p>
                <p class="mb-0"><v-icon size="13" color="#18B6C9">mdi-phone</v-icon> {{ quote.business_phone || '+57 320 123 4567' }} <span v-if="quote.business_whatsapp">| {{ quote.business_whatsapp }}</span></p>
                <p class="mb-0"><v-icon size="13" color="#18B6C9">mdi-email</v-icon> {{ quote.business_email || 'contacto@laclinique.com' }}</p>
                <p class="mb-0"><v-icon size="13" color="#18B6C9">mdi-card-account-details-outline</v-icon> <strong>NIT:</strong> {{ quote.business_nit || '900.123.456-7' }}</p>
                <p class="mb-0" v-if="quote.doctor_first_name">
                  <v-icon size="13" color="#18B6C9">mdi-doctor</v-icon> <strong>Dirección y Cirujano:</strong> Dr. {{ quote.doctor_first_name }} {{ quote.doctor_last_name }} (Reg. {{ quote.doctor_registration || '123456' }})
                </p>
              </div>
            </div>

            <!-- BLOQUE FOLIO CURVO NAVY (DERECHA) -->
            <div class="navy-folio-card pa-6 text-right">
              <h1 class="folio-title mb-1">COTIZACIÓN</h1>
              <p class="folio-number mb-3">No. {{ quote.tx_cotizacion_nro || quote.tx_nro || 'COT-2024-0587' }}</p>
              
              <div class="folio-dates">
                <p class="mb-1"><strong>Fecha de emisión:</strong> {{ formatDate(quote.date_add) }}</p>
                <p class="mb-0"><strong>Válida hasta:</strong> {{ formatDate(quote.date_vencimiento) }}</p>
              </div>
            </div>
          </div>

          <!-- FILA 1: DATOS PACIENTE + FOTO ESTÉTICA -->
          <div class="pa-6 pt-0">
            <v-row>
              <!-- DATOS PACIENTE -->
              <v-col cols="12" md="7">
                <div class="subcard-header border-bottom pb-2 mb-3 d-flex align-center">
                  <v-icon color="#18B6C9" class="mr-2" size="20">mdi-account-outline</v-icon>
                  <span class="font-weight-bold text-subtitle-2 gold-accent">DATOS DEL PACIENTE</span>
                </div>
                <div class="patient-grid text-body-2">
                  <div class="grid-row">
                    <span class="label">Nombre completo:</span>
                    <span class="value font-weight-bold text-primary">{{ quote.tx_first_name }} {{ quote.tx_last_name }}</span>
                  </div>
                  <div class="grid-row">
                    <span class="label">Documento:</span>
                    <span class="value">{{ quote.tx_dni_type ? `${quote.tx_dni_type}-` : '' }}{{ quote.tx_dni || '1.234.567.890' }}</span>
                  </div>
                  <div class="grid-row">
                    <span class="label">Edad:</span>
                    <span class="value">{{ getAge(quote.customer_birth) }} años</span>
                  </div>
                  <div class="grid-row">
                    <span class="label">Fecha de valoración:</span>
                    <span class="value">{{ formatDate(quote.date_add) }}</span>
                  </div>
                  <div class="grid-row">
                    <span class="label">Médico tratante:</span>
                    <span class="value">Dr(a). {{ quote.doctor_first_name || 'Juan Pablo' }} {{ quote.doctor_last_name || 'Martínez' }}</span>
                  </div>
                  <div class="grid-row">
                    <span class="label">Historia clínica:</span>
                    <span class="value">HC-{{ quote.id || '2024-1122' }}</span>
                  </div>
                </div>
              </v-col>

              <!-- ILUSTRACIÓN / IMAGEN DE PROCEDIMIENTO -->
              <v-col cols="12" md="5" class="d-flex align-center justify-center">
                <div class="aesthetic-image-card">
                  <img src="/aesthetic_procedure.png?v=2" alt="Procedimiento Estético" class="aesthetic-img" />
                </div>
              </v-col>
            </v-row>

            <!-- FILA 2: PROCEDIMIENTO COTIZADO + DETALLE ECONÓMICO -->
            <v-row class="mt-4">
              <!-- PROCEDIMIENTO COTIZADO (IZQ) -->
              <v-col cols="12" md="5">
                <div class="subcard-header border-bottom pb-2 mb-3 d-flex align-center">
                  <v-icon color="#18B6C9" class="mr-2" size="20">mdi-medical-bag</v-icon>
                  <span class="font-weight-bold text-subtitle-2 gold-accent">PROCEDIMIENTO COTIZADO</span>
                </div>

                <div class="procedure-details">
                  <p class="section-sublabel mb-1">PROCEDIMIENTOS PRINCIPALES</p>
                  <ul class="bullet-list mb-3">
                    <li v-for="(item, idx) in quote.items" :key="idx">
                      <strong>{{ item.tx_servicio }}</strong>
                      <span v-if="item.tx_descripcion"> - {{ item.tx_descripcion }}</span>
                    </li>
                    <li v-if="!quote.items || quote.items.length === 0">
                      {{ quote.tx_diagnostico || 'Procedimiento quirúrgico programado' }}
                    </li>
                  </ul>

                  <p class="section-sublabel mb-1">TÉCNICAS Y TECNOLOGÍAS</p>
                  <ul class="bullet-list mb-3">
                    <li>Equipamiento de alta precisión y monitoreo continuo</li>
                    <li>Técnicas avanzadas de retraimiento y sutura estética</li>
                  </ul>

                  <p class="section-sublabel mb-1">ANESTESIA</p>
                  <p class="text-body-2 text-secondary mb-0">Anestesia asistida por especialista capacitado</p>
                </div>
              </v-col>

              <!-- DETALLE ECONÓMICO (DER) -->
              <v-col cols="12" md="7">
                <div class="subcard-header border-bottom pb-2 mb-3 d-flex align-center">
                  <v-icon color="#18B6C9" class="mr-2" size="20">mdi-receipt-text-outline</v-icon>
                  <span class="font-weight-bold text-subtitle-2 gold-accent">DETALLE ECONÓMICO</span>
                </div>

                <table class="economic-table w-100 mb-2">
                  <thead>
                    <tr>
                      <th class="text-left">CONCEPTO</th>
                      <th class="text-right" width="130">VALOR (COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in quote.items" :key="idx">
                      <td>{{ item.tx_servicio }}</td>
                      <td class="text-right font-weight-medium">$ {{ formatMoney(item.fl_subtotal) }}</td>
                    </tr>
                    <tr v-if="!quote.items || quote.items.length === 0">
                      <td>Valor del procedimiento cotizado</td>
                      <td class="text-right font-weight-medium">$ {{ formatMoney(quote.fl_subtotal) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="summary-row">
                      <td class="font-weight-bold">SUBTOTAL</td>
                      <td class="text-right font-weight-bold">$ {{ formatMoney(quote.fl_subtotal) }}</td>
                    </tr>
                    <tr v-if="quote.fl_descuento_valor > 0" class="summary-row text-error">
                      <td>DESCUENTO ({{ quote.fl_descuento_porcentaje }}%)</td>
                      <td class="text-right font-weight-bold">- $ {{ formatMoney(quote.fl_descuento_valor) }}</td>
                    </tr>
                    <tr v-if="quote.fl_iva_valor > 0" class="summary-row">
                      <td>IVA ({{ quote.fl_iva_porcentaje }}%)</td>
                      <td class="text-right font-weight-bold">$ {{ formatMoney(quote.fl_iva_valor) }}</td>
                    </tr>
                    <tr class="total-navy-row">
                      <td class="font-weight-black">TOTAL</td>
                      <td class="text-right font-weight-black gold-text">$ {{ formatMoney(quote.fl_total_cost) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </v-col>
            </v-row>

            <!-- FILA 3: 3 CAJAS INCLUYE / NO INCLUYE / CONDICIONES -->
            <v-row class="mt-4">
              <!-- INCLUYE -->
              <v-col cols="12" md="4">
                <div class="info-box-card h-100 pa-4 rounded-xl border">
                  <div class="d-flex align-center mb-2">
                    <v-avatar color="success" size="24" class="mr-2">
                      <v-icon size="14" color="white">mdi-check</v-icon>
                    </v-avatar>
                    <span class="font-weight-bold text-caption text-uppercase text-success">INCLUYE</span>
                  </div>
                  <ul class="check-list">
                    <li><v-icon size="14" color="success" class="mr-1">mdi-check-circle-outline</v-icon> Valoración médica prequirúrgica</li>
                    <li><v-icon size="14" color="success" class="mr-1">mdi-check-circle-outline</v-icon> Sala de cirugía y recuperación</li>
                    <li><v-icon size="14" color="success" class="mr-1">mdi-check-circle-outline</v-icon> Controles médicos postoperatorios</li>
                    <li><v-icon size="14" color="success" class="mr-1">mdi-check-circle-outline</v-icon> Medicamentos básicos posquirúrgicos</li>
                    <li><v-icon size="14" color="success" class="mr-1">mdi-check-circle-outline</v-icon> Atención médica personalizada</li>
                  </ul>
                </div>
              </v-col>

              <!-- NO INCLUYE -->
              <v-col cols="12" md="4">
                <div class="info-box-card h-100 pa-4 rounded-xl border">
                  <div class="d-flex align-center mb-2">
                    <v-avatar color="error" size="24" class="mr-2">
                      <v-icon size="14" color="white">mdi-close</v-icon>
                    </v-avatar>
                    <span class="font-weight-bold text-caption text-uppercase text-error">NO INCLUYE</span>
                  </div>
                  <ul class="cross-list">
                    <li><v-icon size="14" color="error" class="mr-1">mdi-close-circle-outline</v-icon> Complicaciones posteriores no contempladas</li>
                    <li><v-icon size="14" color="error" class="mr-1">mdi-close-circle-outline</v-icon> Medicamentos adicionales de farmacia</li>
                    <li><v-icon size="14" color="error" class="mr-1">mdi-close-circle-outline</v-icon> Transporte o traslados particulares</li>
                    <li><v-icon size="14" color="error" class="mr-1">mdi-close-circle-outline</v-icon> Hospedaje o noches extra no agendadas</li>
                  </ul>
                </div>
              </v-col>

              <!-- CONDICIONES DE PAGO -->
              <v-col cols="12" md="4">
                <div class="info-box-card h-100 pa-4 rounded-xl border bg-lightprimary">
                  <div class="d-flex align-center mb-2">
                    <v-avatar color="primary" size="24" class="mr-2">
                      <v-icon size="14" color="white">mdi-credit-card-outline</v-icon>
                    </v-avatar>
                    <span class="font-weight-bold text-caption text-uppercase text-primary">CONDICIONES DE PAGO</span>
                  </div>
                  <div class="payment-terms text-caption">
                    <p class="mb-1" v-if="quote.fl_anticipo_valor > 0">
                      <strong>Anticipo reserva:</strong> {{ quote.fl_anticipo_porcentaje || 50 }}% ($ {{ formatMoney(quote.fl_anticipo_valor) }})
                    </p>
                    <p class="mb-1"><strong>Saldo restante:</strong> 50% el día del procedimiento</p>
                    <p class="mb-1"><strong>Forma de pago:</strong> {{ quote.tx_forma_pago || 'Efectivo, transferencia o tarjeta' }}</p>
                    <p class="mb-0 text-secondary mt-2" style="font-size: 11px;">
                      Cotización válida por {{ quote.in_validez_dias || 30 }} días debido a variación de costos hospitalarios e insumos.
                    </p>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- FILA 4: RIESGOS + CRONOGRAMA -->
            <v-row class="mt-4">
              <!-- RIESGOS -->
              <v-col cols="12" md="5">
                <div class="info-box-card h-100 pa-4 rounded-xl border">
                  <div class="d-flex align-center mb-2">
                    <v-avatar color="warning" size="24" class="mr-2">
                      <v-icon size="14" color="white">mdi-shield-alert-outline</v-icon>
                    </v-avatar>
                    <span class="font-weight-bold text-caption text-uppercase text-warning">RIESGOS Y CONSIDERACIONES</span>
                  </div>
                  <p class="text-caption text-secondary mb-0 line-height-tight">
                    Todo procedimiento quirúrgico o estético implica riesgos y posibles complicaciones explicadas en la consulta médica y consentimiento informado.
                    {{ quote.tx_condiciones_medicas || 'Infección, hematomas o asimetrías temporales son variables normales de recuperación.' }}
                  </p>
                </div>
              </v-col>

              <!-- CRONOGRAMA ESTIMADO -->
              <v-col cols="12" md="7">
                <div class="info-box-card h-100 pa-4 rounded-xl border">
                  <div class="d-flex align-center mb-3">
                    <v-avatar color="primary" size="24" class="mr-2">
                      <v-icon size="14" color="white">mdi-calendar-clock-outline</v-icon>
                    </v-avatar>
                    <span class="font-weight-bold text-caption text-uppercase text-primary">CRONOGRAMA ESTIMADO</span>
                  </div>

                  <!-- PASOS TIMELINE -->
                  <div class="timeline-steps d-flex justify-space-between text-center">
                    <div class="step-item">
                      <div class="step-icon"><v-icon size="18" color="primary">mdi-stethoscope</v-icon></div>
                      <div class="step-title">Valoración</div>
                      <div class="step-sub">Día 1</div>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step-item">
                      <div class="step-icon"><v-icon size="18" color="primary">mdi-needle</v-icon></div>
                      <div class="step-title">Procedimiento</div>
                      <div class="step-sub">Día 15</div>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step-item">
                      <div class="step-icon"><v-icon size="18" color="primary">mdi-bed-outline</v-icon></div>
                      <div class="step-title">Recuperación</div>
                      <div class="step-sub">Día 16 - 20</div>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step-item">
                      <div class="step-icon"><v-icon size="18" color="primary">mdi-heart-pulse</v-icon></div>
                      <div class="step-title">Controles</div>
                      <div class="step-sub">Semana 3-12</div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- FILA 5: FIRMAS Y LEMAS -->
            <div class="signatures-banner d-flex align-center justify-space-between mt-8 pt-4 border-top">
              <!-- FIRMA DOCTOR -->
              <div class="signature-box text-center">
                <div v-if="quote.tx_firma_doctor" class="sig-img-wrap">
                  <img :src="quote.tx_firma_doctor" alt="Firma Médico" class="sig-img" />
                </div>
                <div class="sig-line"></div>
                <p class="font-weight-bold text-body-2 mb-0">Dr(a). {{ quote.doctor_first_name || 'Juan Pablo' }} {{ quote.doctor_last_name || 'Martínez' }}</p>
                <p class="text-caption text-secondary mb-0">Cirujano Responsable</p>
                <p class="text-caption text-secondary mb-0">Registro: {{ quote.doctor_registration || '123456' }}</p>
              </div>

              <!-- LEMA CENTRAL -->
              <div class="quote-motto text-center px-4">
                <span class="quote-mark">“</span>
                <p class="motto-text mb-1">Nuestro compromiso es realzar tu belleza con seguridad, ética y resultados naturales.</p>
                <span class="motto-brand">{{ quote.business_name || 'LA CLINIQUE' }}, TU MEJOR VERSIÓN</span>
              </div>

              <!-- FIRMA ASESOR -->
              <div class="signature-box text-center">
                <div class="sig-line" style="margin-top: 45px;"></div>
                <p class="font-weight-bold text-body-2 mb-0">Asesor(a) Comercial</p>
                <p class="text-caption text-secondary mb-0">Atención Personalizada</p>
              </div>
            </div>
          </div>

          <!-- FOOTER OSCURO NAVY CON QR -->
          <div class="navy-footer-bar pa-4 d-flex align-center justify-space-between">
            <div class="footer-badges d-flex align-center gap-6">
              <div class="f-badge d-flex align-center gap-2">
                <v-icon color="#D4AF37" size="18">mdi-shield-check</v-icon>
                <div>
                  <span class="d-block badge-title">SEGURIDAD</span>
                  <span class="d-block badge-sub">Estándares de clase mundial</span>
                </div>
              </div>
              <div class="f-badge d-flex align-center gap-2">
                <v-icon color="#D4AF37" size="18">mdi-star-circle-outline</v-icon>
                <div>
                  <span class="d-block badge-title">TECNOLOGÍA</span>
                  <span class="d-block badge-sub">Equipos de última generación</span>
                </div>
              </div>
              <div class="f-badge d-flex align-center gap-2">
                <v-icon color="#D4AF37" size="18">mdi-account-group-outline</v-icon>
                <div>
                  <span class="d-block badge-title">EXPERIENCIA</span>
                  <span class="d-block badge-sub">Especialistas certificados</span>
                </div>
              </div>
            </div>

            <!-- BLOQUE VERIFICACIÓN QR -->
            <div class="qr-verify-block d-flex align-center gap-3">
              <div class="qr-box bg-white pa-1 rounded">
                <v-icon size="36" color="#0B192F">mdi-qrcode</v-icon>
              </div>
              <div class="qr-text">
                <span class="d-block text-caption font-weight-bold text-white">Documento Oficial</span>
                <span class="d-block text-caption text-grey-lighten-1" style="font-size: 10px;">Verificación Digital</span>
              </div>
            </div>
          </div>
        </div>

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
  
  business_name: string;
  business_nit?: string;
  business_logo?: string;
  business_address?: string;
  business_phone?: string;
  business_whatsapp?: string;
  business_email?: string;
  business_city?: string;

  tx_first_name: string;
  tx_last_name: string;
  tx_dni: string;
  tx_dni_type: string;
  customer_phone: string;
  customer_email: string;
  customer_birth: string;
  customer_address: string;
  customer_city: string;

  doctor_first_name?: string;
  doctor_last_name?: string;
  doctor_registration?: string;
  doctor_specialty?: string;

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
    } else {
      notify('error', response.data.msg || 'No se encontró la cotización.');
    }
  } catch (error) {
    notify('error', 'Error al cargar la cotización.');
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
.document-sheet {
  background: #ffffff;
  color: #1E293B;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  border: 1px solid #E2E8F0;
}

/* HEADER Y CURVA NAVY */
.header-section {
  position: relative;
  background: #FFFFFF;
}

.clinic-logo {
  max-width: 140px;
  max-height: 65px;
  object-fit: contain;
}

.logo-fallback-box {
  display: flex;
  align-center: center;
  gap: 10px;
}
.logo-initials {
  font-size: 32px;
  font-weight: 900;
  color: #C5A059;
  letter-spacing: -1px;
}
.brand-name {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: #0B192F;
  letter-spacing: 1px;
}
.brand-sub {
  display: block;
  font-size: 9px;
  color: #64748B;
  letter-spacing: 0.5px;
}

.navy-folio-card {
  background: linear-gradient(135deg, #0A192F 0%, #112240 100%);
  color: #FFFFFF;
  border-bottom-left-radius: 60px;
  min-width: 320px;
  box-shadow: -4px 4px 15px rgba(11, 25, 47, 0.2);
}

.folio-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #D4AF37;
}

.folio-number {
  font-size: 15px;
  font-weight: 700;
  color: #F8FAFC;
  letter-spacing: 1px;
}

.folio-dates p {
  font-size: 11px;
  color: #CBD5E1;
}

.gold-accent {
  color: #B48A3C !important;
}

.brand-navy {
  color: #0A192F !important;
}

/* PACIENTE GRID */
.patient-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
}

.grid-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #E2E8F0;
  padding-bottom: 3px;
}

.grid-row .label {
  color: #64748B;
  font-size: 12px;
}
.grid-row .value {
  font-size: 12px;
}

/* IMAGEN ESTÉTICA OFICIAL DE PROCEDIMIENTO */
.aesthetic-image-card {
  width: 100%;
  height: 165px;
  border-radius: 32px 0px 32px 32px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
}

.aesthetic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* DETALLE ECONÓMICO TABLE */
.economic-table {
  border-collapse: collapse;
  font-size: 12px;
}

.economic-table th {
  background: #0A192F;
  color: #FFFFFF;
  padding: 8px 12px;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.economic-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #E2E8F0;
}

.summary-row td {
  background: #F8FAFC;
}

.total-navy-row td {
  background: #0A192F;
  color: #FFFFFF;
  font-size: 14px;
  padding: 10px 12px;
}

.gold-text {
  color: #D4AF37 !important;
}

/* LISTAS INCLUYE / NO INCLUYE */
.check-list, .cross-list, .bullet-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 11px;
}

.check-list li, .cross-list li, .bullet-list li {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.bullet-list li {
  position: relative;
  padding-left: 12px;
}

.bullet-list li::before {
  content: "•";
  color: #18B6C9;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.section-sublabel {
  font-size: 10px;
  font-weight: 800;
  color: #B48A3C;
  letter-spacing: 0.5px;
}

/* CRONOGRAMA TIMELINE */
.timeline-steps {
  align-items: center;
}
.step-item {
  flex: 1;
}
.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(24, 182, 201, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 4px auto;
}
.step-title {
  font-size: 10px;
  font-weight: 700;
}
.step-sub {
  font-size: 9px;
  color: #64748B;
}
.step-connector {
  height: 2px;
  background: #E2E8F0;
  flex: 0.5;
  margin-bottom: 16px;
}

/* FIRMAS & LEMA */
.sig-line {
  width: 160px;
  height: 1px;
  background: #0A192F;
  margin: 0 auto 6px auto;
}
.sig-img {
  max-height: 50px;
  object-fit: contain;
}
.quote-motto {
  max-width: 320px;
}
.quote-mark {
  font-size: 32px;
  color: #D4AF37;
  line-height: 0;
  display: block;
}
.motto-text {
  font-size: 11px;
  font-style: italic;
  color: #475569;
}
.motto-brand {
  font-size: 10px;
  font-weight: 800;
  color: #B48A3C;
  letter-spacing: 0.5px;
}

/* FOOTER NAVY */
.navy-footer-bar {
  background: #0A192F;
  color: #FFFFFF;
}
.badge-title {
  font-size: 10px;
  font-weight: 800;
  color: #D4AF37;
  letter-spacing: 0.5px;
}
.badge-sub {
  font-size: 9px;
  color: #94A3B8;
}
</style>

<!-- REGLAS UN-SCOPED DE IMPRESIÓN OFICIAL (1 SOLA HOJA COMPLETA SIN CORTES) -->
<style>
@media print {
  *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  html, body, #app, .v-application, .v-layout, .v-main {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    display: block !important;
  }

  .v-navigation-drawer,
  .v-app-bar,
  .v-footer,
  .no-print,
  header,
  aside,
  nav,
  .v-overlay-container,
  div[class*="impersonat"],
  div[class*="banner"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-preview-container {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
  }

  .document-sheet,
  .document-sheet * {
    visibility: visible !important;
  }

  .document-sheet {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: none !important;
    border: 1px solid #CBD5E1 !important;
    border-radius: 12px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: hidden !important;
    page-break-inside: avoid !important;
  }

  /* AJUSTES ULTRA-COMPACTOS DE IMPRESIÓN PARA MOSTRAR TODO EN 1 PÁGINA COMPLETA SIN CORTES */
  .clinic-info {
    padding: 8px 12px !important;
  }

  .clinic-logo {
    max-height: 44px !important;
  }

  .clinic-details p {
    font-size: 9.5px !important;
    line-height: 1.15 !important;
  }

  .navy-folio-card {
    padding: 8px 14px !important;
    min-width: 220px !important;
    border-bottom-left-radius: 40px !important;
  }

  .folio-title {
    font-size: 15px !important;
  }

  .folio-number {
    font-size: 12px !important;
    margin-bottom: 2px !important;
  }

  .folio-dates p {
    font-size: 9px !important;
  }

  .pa-6 {
    padding: 8px 12px !important;
  }

  .v-row {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .v-col {
    padding-top: 3px !important;
    padding-bottom: 3px !important;
  }

  .subcard-header {
    margin-bottom: 3px !important;
    padding-bottom: 1px !important;
  }

  .subcard-header span {
    font-size: 10.5px !important;
  }

  /* FORZAR COLUMNAS EN PARALELO (SIDE-BY-SIDE) EN IMPRESIÓN SIN QUE SE DESPLACEN ABAJO */
  .document-sheet .v-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    width: 100% !important;
  }

  .document-sheet .v-col-md-7,
  .document-sheet .v-col-12.v-col-md-7 {
    flex: 0 0 58% !important;
    max-width: 58% !important;
    width: 58% !important;
  }

  .document-sheet .v-col-md-5,
  .document-sheet .v-col-12.v-col-md-5 {
    flex: 0 0 42% !important;
    max-width: 42% !important;
    width: 42% !important;
  }

  .document-sheet .v-col-md-4,
  .document-sheet .v-col-12.v-col-md-4 {
    flex: 0 0 33.333% !important;
    max-width: 33.333% !important;
    width: 33.333% !important;
  }

  .aesthetic-image-card {
    height: 115px !important;
    width: 100% !important;
    border-radius: 24px 0px 24px 24px !important;
  }

  .procedure-details p, .procedure-details ul {
    font-size: 9px !important;
    margin-bottom: 1px !important;
  }

  .economic-table th,
  .economic-table td {
    padding: 3px 6px !important;
    font-size: 9px !important;
  }

  .total-navy-row td {
    padding: 5px 8px !important;
    font-size: 11px !important;
  }

  .info-box-card {
    padding: 5px 8px !important;
    border-radius: 8px !important;
  }

  .check-list li, .cross-list li, .bullet-list li {
    margin-bottom: 1px !important;
    font-size: 9px !important;
  }

  .payment-terms p {
    font-size: 9px !important;
    margin-bottom: 1px !important;
  }

  .timeline-steps {
    margin-top: 1px !important;
  }

  .step-icon {
    width: 22px !important;
    height: 22px !important;
    margin-bottom: 1px !important;
  }

  .step-title {
    font-size: 8.5px !important;
  }

  .step-sub {
    font-size: 7.5px !important;
  }

  .signatures-banner {
    margin-top: 6px !important;
    padding-top: 2px !important;
  }

  .sig-img {
    max-height: 36px !important;
  }

  .sig-line {
    margin-top: 14px !important;
    margin-bottom: 2px !important;
    width: 130px !important;
  }

  .quote-motto {
    max-width: 240px !important;
  }

  .motto-text {
    font-size: 9px !important;
  }

  .navy-footer-bar {
    padding: 4px 10px !important;
  }

  .badge-title {
    font-size: 8.5px !important;
  }

  .badge-sub {
    font-size: 7.5px !important;
  }

  @page {
    margin: 4mm;
    size: portrait;
  }
}
</style>
