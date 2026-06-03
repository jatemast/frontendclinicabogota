<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { API } from '@/api/endpoints';

const { notify } = useNotification();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const loadingData = ref(true);
const loadingSlots = ref(false);

const appointmentId = route.params.id as string;

const form = ref({
  id_customer: null as number | null,
  date_appointment: '',
  time_start: '',
  in_duration: 60,
  tx_notes: '',
  tx_status: 'confirmed',
});

const appointmentData = ref<any>(null);
const availableSlots = ref<any[]>([]);

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
  { title: 'Cancelada', value: 'cancelled' },
  { title: 'Completada', value: 'completed' },
];

const fetchAppointment = async () => {
  try {
    const res = await axios.get(API.APPOINTMENTS.EDIT(appointmentId));
    if (res.data.status) {
      const data = res.data.data;
      appointmentData.value = data;
      form.value = {
        id_customer: data.id_customer,
        date_appointment: data.date_appointment,
        time_start: data.time_start,
        in_duration: data.in_duration,
        tx_notes: data.tx_notes || '',
        tx_status: data.tx_status,
      };
    } else {
      notify('error', res.data.msg || 'Cita no encontrada');
      router.push({ name: 'Appointments' });
    }
  } catch (err: any) {
    notify('error', 'Error al cargar la cita');
    router.push({ name: 'Appointments' });
  } finally {
    loadingData.value = false;
  }
};

const fetchSlots = async () => {
  if (!form.value.date_appointment) return;
  loadingSlots.value = true;
  try {
    const res = await axios.get(API.APPOINTMENTS.SLOTS(form.value.date_appointment), {
      params: { duration: form.value.in_duration }
    });
    if (res.data.status) {
      availableSlots.value = res.data.data;
      // Ensure current time is included in available slots even if it shows as unavailable
      // (it's unavailable because of this same appointment)
      const currentSlot = availableSlots.value.find((s: any) => s.time_start === form.value.time_start);
      if (!currentSlot) {
        availableSlots.value.push({
          time_start: form.value.time_start,
          time_end: form.value.time_start, // will be recalculated
        });
        availableSlots.value.sort((a: any, b: any) => a.time_start.localeCompare(b.time_start));
      }
    }
  } catch (err) {
    availableSlots.value = [];
  } finally {
    loadingSlots.value = false;
  }
};

// Re-fetch slots when date or duration changes
watch(() => form.value.date_appointment, () => {
  form.value.time_start = '';
  fetchSlots();
});

watch(() => form.value.in_duration, () => {
  form.value.time_start = '';
  fetchSlots();
});

// Min date = today
const today = new Date().toISOString().slice(0, 10);

const handleSubmit = async () => {
  if (!form.value.id_customer || !form.value.date_appointment || !form.value.time_start) {
    notify('error', 'Complete todos los campos requeridos');
    return;
  }

  loading.value = true;
  try {
    const res = await axios.post(API.APPOINTMENTS.UPDATE(appointmentId), {
      id_customer: form.value.id_customer,
      date_appointment: form.value.date_appointment,
      time_start: form.value.time_start,
      in_duration: form.value.in_duration,
      tx_notes: form.value.tx_notes || null,
      tx_status: form.value.tx_status,
    });

    if (res.data.status) {
      notify('success', 'Cita actualizada exitosamente.');
      router.push({ name: 'Appointments' });
    } else {
      notify('error', res.data.msg || 'Error al actualizar la cita');
    }
  } catch (err: any) {
    notify('error', err.response?.data?.msg || 'Error al actualizar la cita');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchAppointment();
  if (form.value.date_appointment) fetchSlots();
});
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-progress-linear v-if="loadingData" indeterminate color="primary" class="mb-6" />

        <template v-else>
          <div class="d-flex align-center mb-6">
            <v-btn icon variant="text" :to="{ name: 'Appointments' }" class="mr-3">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div>
              <h2 class="text-h4 font-weight-bold text-grey-darken-3">Editar Cita #{{ appointmentId }}</h2>
              <p class="text-body-2 text-medium-emphasis">
                {{ appointmentData?.tx_customer_name || '' }}
              </p>
            </div>
          </div>

          <UiParentCard title="Detalles de la Cita">
            <v-row dense>
              <!-- Customer (readonly display) -->
              <v-col cols="12">
                <v-alert
                  type="info"
                  variant="tonal"
                  rounded="lg"
                  :text="`Cliente: ${appointmentData?.tx_customer_name || ''} (${appointmentData?.tx_dni_type || ''} ${appointmentData?.tx_dni || ''})`"
                  icon="mdi-account"
                />
              </v-col>

              <!-- Date -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.date_appointment"
                  label="Fecha de la cita"
                  type="date"
                  variant="outlined"
                  required
                />
              </v-col>

              <!-- Duration -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.in_duration"
                  :items="durationOptions"
                  label="Duración"
                  variant="outlined"
                  required
                />
              </v-col>

              <!-- Status -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.tx_status"
                  :items="statusOptions"
                  label="Estado"
                  variant="outlined"
                >
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon
                          :color="{
                            confirmed: 'success',
                            pending: 'warning',
                            cancelled: 'error',
                            completed: 'info'
                          }[item.value] || 'grey'"
                          size="18"
                          class="mr-2"
                        >
                          {{
                            {
                              confirmed: 'mdi-check-circle',
                              pending: 'mdi-clock-outline',
                              cancelled: 'mdi-close-circle',
                              completed: 'mdi-check-all'
                            }[item.value] || 'mdi-help'
                          }}
                        </v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <!-- Notes -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.tx_notes"
                  label="Observaciones"
                  variant="outlined"
                  rows="2"
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

            <v-row v-else-if="!loadingSlots && availableSlots.length > 0">
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
                  class="slot-btn"
                  @click="form.time_start = slot.time_start"
                >
                  <v-icon start size="18">mdi-clock-outline</v-icon>
                  {{ slot.time_start }}
                </v-btn>
              </v-col>
            </v-row>
          </UiParentCard>

          <!-- Actions -->
          <div class="d-flex justify-end mt-6">
            <v-btn
              variant="outlined"
              color="grey"
              class="mr-3"
              :to="{ name: 'Appointments' }"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              :loading="loading"
              :disabled="!form.date_appointment || !form.time_start"
              @click="handleSubmit"
            >
              <v-icon start>mdi-content-save</v-icon>
              Guardar Cambios
            </v-btn>
          </div>
        </template>
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
.slot-btn {
  transition: all 0.15s ease;
}
.slot-btn:hover {
  transform: scale(1.03);
}
</style>
