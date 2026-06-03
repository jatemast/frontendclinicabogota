<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { API } from '@/api/endpoints';

const { notify } = useNotification();
const router = useRouter();
const loading = ref(false);
const loadingCustomers = ref(true);
const loadingSlots = ref(false);

// Form data
const form = ref({
  id_customer: null as number | null,
  date_appointment: '',
  time_start: '',
  in_duration: 60,
  tx_notes: '',
  tx_status: 'confirmed',
});

// Customers list
const customers = ref<any[]>([]);
const searchCustomer = ref('');

const filteredCustomers = computed(() => {
  if (!searchCustomer.value) return customers.value;
  const q = searchCustomer.value.toLowerCase();
  return customers.value.filter((c: any) =>
    `${c.tx_first_name} ${c.tx_last_name}`.toLowerCase().includes(q) ||
    c.tx_dni?.toLowerCase().includes(q)
  );
});

// Selected customer
const selectedCustomer = computed(() =>
  customers.value.find(c => c.id === form.value.id_customer)
);

// Available slots
const availableSlots = ref<any[]>([]);

// Duration options
const durationOptions = [
  { title: '15 minutos', value: 15 },
  { title: '30 minutos', value: 30 },
  { title: '45 minutos', value: 45 },
  { title: '1 hora', value: 60 },
  { title: '1 hora 30 min', value: 90 },
  { title: '2 horas', value: 120 },
];

const statusOptions = [
  { title: 'Confirmada', value: 'confirmed' },
  { title: 'Pendiente', value: 'pending' },
];

const fetchCustomers = async () => {
  try {
    const res = await axios.get(API.CUSTOMERS.ALL);
    if (res.data.status) customers.value = res.data.data;
  } catch (err) {
    notify('error', 'Error al cargar clientes');
  } finally {
    loadingCustomers.value = false;
  }
};

const fetchSlots = async () => {
  if (!form.value.date_appointment) {
    availableSlots.value = [];
    return;
  }
  loadingSlots.value = true;
  try {
    const res = await axios.get(API.APPOINTMENTS.SLOTS(form.value.date_appointment), {
      params: { duration: form.value.in_duration }
    });
    if (res.data.status) availableSlots.value = res.data.data;
  } catch (err) {
    availableSlots.value = [];
  } finally {
    loadingSlots.value = false;
  }
};

// Reset time when date or duration changes
watch(() => form.value.date_appointment, () => {
  form.value.time_start = '';
  fetchSlots();
});

watch(() => form.value.in_duration, () => {
  form.value.time_start = '';
  fetchSlots();
});

// Progress steps
const step = ref(1);

const selectCustomer = (c: any) => {
  form.value.id_customer = c.id;
  step.value = 2;
};

// Min date = today
const today = new Date().toISOString().slice(0, 10);

const handleSubmit = async () => {
  if (!form.value.id_customer || !form.value.date_appointment || !form.value.time_start) {
    notify('error', 'Complete todos los campos requeridos');
    return;
  }

  loading.value = true;
  try {
    const res = await axios.post(API.APPOINTMENTS.ADD, {
      id_customer: form.value.id_customer,
      date_appointment: form.value.date_appointment,
      time_start: form.value.time_start,
      in_duration: form.value.in_duration,
      tx_notes: form.value.tx_notes || null,
      tx_status: form.value.tx_status,
    });

    if (res.data.status) {
      notify('success', 'Cita creada exitosamente.');
      router.push({ name: 'Appointments' });
    } else {
      notify('error', res.data.msg || 'Error al crear la cita');
    }
  } catch (err: any) {
    notify('error', err.response?.data?.msg || 'Error al crear la cita');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  if (step.value === 2) step.value = 1;
  else router.push({ name: 'Appointments' });
};

onMounted(fetchCustomers);
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <div class="d-flex align-center mb-6">
          <v-btn icon variant="text" @click="goBack" class="mr-3">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div>
            <h2 class="text-h4 font-weight-bold text-grey-darken-3">Nueva Cita</h2>
            <p class="text-body-2 text-medium-emphasis">Complete la información para agendar una cita</p>
          </div>
        </div>

        <!-- Step Progress -->
        <div class="mb-6">
          <v-progress-linear
            :model-value="(step / 2) * 100"
            color="primary"
            height="6"
            rounded
          />
          <div class="d-flex justify-space-between mt-2 text-caption font-weight-bold text-uppercase">
            <span :class="step >= 1 ? 'text-primary' : 'text-grey'">1. Cliente</span>
            <span :class="step >= 2 ? 'text-primary' : 'text-grey'">2. Agenda</span>
          </div>
        </div>

        <!-- Step 1: Select Customer -->
        <div v-if="step === 1">
          <UiParentCard title="Seleccionar Cliente">
            <v-text-field
              v-model="searchCustomer"
              label="Buscar cliente por nombre o DNI"
              prepend-inner-icon="mdi-magnify"
              variant="solo"
              flat
              bg-color="white"
              class="mb-4"
              rounded="lg"
              :loading="loadingCustomers"
            />

            <v-progress-linear v-if="loadingCustomers" indeterminate color="primary" class="mb-4" />

            <v-row v-if="!loadingCustomers">
              <v-col v-for="c in filteredCustomers" :key="c.id" cols="12" sm="6" lg="4">
                <v-card
                  @click="selectCustomer(c)"
                  class="customer-card pa-4"
                  rounded="xl"
                  variant="outlined"
                  hover
                  :color="form.id_customer === c.id ? 'primary' : undefined"
                >
                  <div class="d-flex align-center">
                    <v-avatar color="primary-lighten-5" size="48" class="mr-3">
                      <span class="text-primary font-weight-bold">{{ c.tx_dni_type || '' }}</span>
                    </v-avatar>
                    <div class="text-truncate">
                      <div class="text-subtitle-1 font-weight-bold text-truncate">
                        {{ c.tx_first_name }} {{ c.tx_last_name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">DNI: {{ c.tx_dni }}</div>
                      <div class="text-caption text-medium-emphasis" v-if="c.tx_phone">{{ c.tx_phone }}</div>
                    </div>
                    <v-spacer />
                    <v-icon color="grey-lighten-1">mdi-chevron-right</v-icon>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-alert
              v-if="!loadingCustomers && filteredCustomers.length === 0"
              type="info" color="primary" variant="flat" rounded="lg" class="mt-4"
            >
              {{ searchCustomer ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados. Registre uno primero.' }}
            </v-alert>
          </UiParentCard>
        </div>

        <!-- Step 2: Schedule -->
        <div v-if="step === 2 && selectedCustomer">
          <UiParentCard :title="`Agendar para ${selectedCustomer.tx_first_name} ${selectedCustomer.tx_last_name}`">
            <template v-slot:action>
              <v-chip color="primary" variant="tonal" size="small">
                {{ selectedCustomer.tx_dni_type }} {{ selectedCustomer.tx_dni }}
              </v-chip>
            </template>

            <v-row dense>
              <!-- Date -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.date_appointment"
                  label="Fecha de la cita"
                  type="date"
                  :min="today"
                  variant="outlined"
                  required
                  hint="Seleccione la fecha deseada"
                  persistent-hint
                />
              </v-col>

              <!-- Duration -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.in_duration"
                  :items="durationOptions"
                  label="Duración de la cita"
                  variant="outlined"
                  required
                />
              </v-col>

              <!-- Status -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.tx_status"
                  :items="statusOptions"
                  label="Estado inicial"
                  variant="outlined"
                />
              </v-col>

              <!-- Notes -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.tx_notes"
                  label="Observaciones"
                  variant="outlined"
                  rows="2"
                  hint="Motivo de consulta, notas adicionales..."
                  persistent-hint
                />
              </v-col>
            </v-row>

            <!-- Available Slots -->
            <v-divider class="my-4" />
            <div class="text-subtitle-1 font-weight-bold mb-3">
              Horarios Disponibles
              <v-progress-circular
                v-if="loadingSlots"
                indeterminate
                size="16"
                width="2"
                color="primary"
                class="ml-2"
              />
            </div>

            <v-alert
              v-if="!form.date_appointment"
              type="info" color="primary" variant="tonal" rounded="lg"
            >
              Seleccione una fecha para ver los horarios disponibles.
            </v-alert>

            <v-alert
              v-else-if="!loadingSlots && availableSlots.length === 0"
              type="warning" variant="tonal" rounded="lg"
            >
              No hay horarios disponibles para esta fecha con la duración seleccionada.
              Intente con otra fecha o una duración diferente.
            </v-alert>

            <v-row v-else-if="!loadingSlots">
              <v-col
                v-for="(slot, idx) in availableSlots"
                :key="idx"
                cols="6" sm="4" md="3"
              >
                <v-btn
                  block
                  size="large"
                  :variant="form.time_start === slot.time_start ? 'flat' : 'outlined'"
                  :color="form.time_start === slot.time_start ? 'primary' : 'grey'"
                  :ripple="true"
                  class="slot-btn"
                  @click="form.time_start = slot.time_start"
                >
                  <v-icon start size="18">mdi-clock-outline</v-icon>
                  {{ slot.time_start }}
                </v-btn>
              </v-col>
            </v-row>
          </UiParentCard>

          <!-- Submit -->
          <div class="d-flex justify-end mt-6">
            <v-btn
              variant="outlined"
              color="grey"
              class="mr-3"
              @click="step = 1"
            >
              Volver
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              :loading="loading"
              :disabled="!form.date_appointment || !form.time_start"
              @click="handleSubmit"
            >
              <v-icon start>mdi-check</v-icon>
              Agendar Cita
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import UiParentCard from '@/components/shared/UiParentCard.vue';
export default {
  components: { UiParentCard }
};
</script>

<style scoped>
.customer-card {
  cursor: pointer;
  transition: all 0.2s ease;
}
.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.slot-btn {
  transition: all 0.15s ease;
}
.slot-btn:hover {
  transform: scale(1.03);
}
</style>
