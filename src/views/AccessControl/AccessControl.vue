<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import Logo from '@/layouts/full/logo/LogoDark.vue';

const { notify } = useNotification();
const API_BASE = import.meta.env.VITE_API_URL;

// Array de 6 dígitos
const digits = ref<string[]>(['', '', '', '', '', '']);
const loading = ref(false);
const actionType = ref<'entry' | 'exit' | null>(null);
const showEntryBtn = ref(false);
const showExitBtn = ref(false);
const inputError = ref(false);

const lastEvent = ref<string | null>(null);
const lastDate = ref<string | null>(null);

const showPolicy = ref(false);
const policyLang = ref<'en' | 'es'>('en'); 

function handleInput(index: number, event: any) {
  const value = event.target.value.replace(/\D/g, ''); // solo números
  if (!value) return;

  digits.value[index] = value[0]; // solo primer dígito
  // mover foco al siguiente input
  if (index < 5) {
    const next = document.getElementById(`digit-${index + 1}`);
    next?.focus();
  } else {
    verifyCode();
  }
}

function handleBackspace(index: number, event: any) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    const prev = document.getElementById(`digit-${index - 1}`);
    prev?.focus();
  }
}

async function verifyCode() {
  const code = digits.value.join('');
  if (code.length !== 6) return;

  loading.value = true;
  inputError.value = false;
  showEntryBtn.value = false;
  showExitBtn.value = false;

  try {
    const response = await axios.post(`${API_BASE}accesscontrol/verifycode`, {
      accessCode: code
    });

    if (!response.data.status) {
      inputError.value = true;
      notify('error', response.data.msg || 'Invalid code');
      lastEvent.value = null;
      lastDate.value = null;
    } else {
      const lastLog = response.data.data;
      if (!lastLog) {
        showEntryBtn.value = true;
        lastEvent.value = null;
        lastDate.value = null;
      } else {
        lastEvent.value = lastLog.tx_type;
        lastDate.value = lastLog.date_add;
        if (lastLog.tx_type === 'Entry') showExitBtn.value = true;
        else if (lastLog.tx_type === 'Exit') showEntryBtn.value = true;
      }
    }
  } catch (error) {
    inputError.value = true;
    notify('error', 'Server connection error');
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function handleAccess(type: 'entry' | 'exit') {
  const code = digits.value.join('');
  if (code.length !== 6) return;

  actionType.value = type;
  loading.value = true;

  try {
    const response = await axios.post(`${API_BASE}accesscontrol/addlog`, {
      code,
      action: type
    });

    if (response.data.status) {
      notify('success', response.data.msg);
      digits.value = ['', '', '', '', '', ''];
      showEntryBtn.value = false;
      showExitBtn.value = false;
      lastEvent.value = null;
      lastDate.value = null;
    } else {
      notify('error', response.data.msg || 'Invalid code');
    }
  } catch (error) {
    notify('error', 'Server connection error');
    console.error(error);
  } finally {
    loading.value = false;
    actionType.value = null;
  }
}

function formatToLocalTime(utcString?: string): string {
  const date = new Date(utcString + ' UTC');
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  });
}

// setInterval(function() {
//   if (window.console) {
//     console.log("%cStop!", "color:red; font-size:40px;");
//     console.log("This is a browser feature intended for developers.");
//   }
// }, 1);

</script>

<template>
  <div class="access-control">
    <v-container fluid class="pa-3">
      <v-row class="h-100vh d-flex justify-center align-center">
        <v-col cols="12" md="6" lg="4">
          <v-card rounded="xl" elevation="10" class="pa-6 text-center">
            <div class="d-flex justify-center mb-0">
              <Logo />
            </div>

            <h4 class="text-h5 font-weight-bold mb-2">Access Control</h4>
            <p class="text-subtitle-2 text-grey-darken-1 mb-6">
              Enter your 6-digit access code to seal your <strong>entry</strong> or <strong>exit</strong>.
            </p>

            <!-- OTP style inputs -->
            <div class="d-flex justify-center mb-4">
              <v-text-field
                v-for="(digit, index) in digits"
                :key="index"
                v-model="digits[index]"
                :id="'digit-' + index"
                maxlength="1"
                class="mx-1 otp-input"
                :error="inputError"
                hide-details
                variant="outlined"
                color="primary"
                style="width: 50px; text-align: center;"
                @input="handleInput(index, $event)"
                @keydown="handleBackspace(index, $event)"
              />
            </div>

            <!-- Botones dinámicos -->
            <div v-if="showEntryBtn || showExitBtn" class="d-flex justify-center mt-8">
              <v-btn
                v-if="showEntryBtn"
                color="success"
                rounded="pill"
                block
                :loading="loading && actionType === 'entry'"
                :disabled="loading"
                @click="handleAccess('entry')"
              >
                <v-icon start>mdi-login</v-icon>
                Clock In
              </v-btn>

              <v-btn
                v-if="showExitBtn"
                color="error"
                rounded="pill"
                block
                :loading="loading && actionType === 'exit'"
                :disabled="loading"
                @click="handleAccess('exit')"
              >
                <v-icon start>mdi-logout</v-icon>
                Clock Out
              </v-btn>
            </div>

            <div class="mt-6 mb-6 text-subtitle-1 text-grey-darken-1 text-error">
              <v-icon size="18" color="error" class="me-1">mdi-information-outline</v-icon>
              Your access code is personal. Do not share it with others.
            </div>

            <div v-if="lastEvent && lastDate" class="text-subtitle-1 text-grey-darken-1 mb-4">
              Your last {{ lastEvent }} was:
              <strong>{{ formatToLocalTime(lastDate) }}</strong>
            </div>

            <div
              class="text-subtitle-2 text-primary mt-4"
              style="cursor: pointer; text-decoration: underline;"
              @click="showPolicy = true"
            >
              Read Access Control Policy
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-dialog v-model="showPolicy" max-width="600">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
            {{ policyLang === 'en' ? 'Access Control Policy' : 'Política de Control de Acceso' }}
            
            <v-btn-toggle v-model="policyLang" mandatory>
              <v-btn value="en" icon>
                <img src="https://flagcdn.com/us.svg" alt="English" width="24" />
              </v-btn>
              <v-btn value="es" icon>
                <img src="https://flagcdn.com/es.svg" alt="Español" width="24" />
              </v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-card-text>
            <div v-if="policyLang === 'en'">
              <p>
                Our company's Time and Attendance Policy. It is essential that all employees accurately record their working hours by clocking in and out at the beginning and end of each shift.
                Please note that failure to record or to clock in or out correctly is considered a violation of company policy. Repeated non-compliance with these protocols may result in disciplinary action, including termination.
                We value each member of our team and expect everyone to adhere to these procedures to ensure fair and transparent recording of hours worked.
                If you have any questions about this policy or are experiencing problems with the time tracking system, please contact your supervisor or the Human Resources department for assistance.
                Thank you for your cooperation.
              </p>
            </div>

            <div v-else>
              <p>
                Política de Control de Horario y Asistencia de nuestra empresa. Es fundamental que todos los empleados registren con precisión sus horas de trabajo, marcando su entrada y salida al inicio y al final de cada turno.
                Tenga en cuenta que no registrar o marcar su entrada o salida correctamente se considera una infracción de la política de la empresa. El incumplimiento reiterado de estos protocolos puede dar lugar a medidas disciplinarias, incluido el despido.
                Valoramos a cada miembro de nuestro equipo y esperamos que todos cumplan con estos procedimientos para garantizar un registro justo y transparente de las horas trabajadas.
                Si tiene alguna pregunta sobre esta política o experimenta problemas con el sistema de control de horario, póngase en contacto con su supervisor o con el departamento de Recursos Humanos para obtener ayuda.
                Gracias por su cooperación.
              </p>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" v-if="policyLang === 'en'" type="text" @click="showPolicy = false">Agreed</v-btn>
            <v-btn color="primary" v-if="policyLang === 'es'" type="text" @click="showPolicy = false">Entendido</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-overlay :model-value="loading" class="d-flex flex-column align-center justify-center" persistent>
        <v-progress-circular indeterminate color="primary" size="100" />
        <div class="mt-4 h1 font-weight-bold text-center text-error">Validating access code...</div>
      </v-overlay>
    </v-container>
  </div>
</template>

<style scoped>
.access-control {
  background: linear-gradient(135deg, #f5f7fa, #e4ebf7);
  min-height: 100vh;
}
.otp-input input {
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 2px;
}
</style>
