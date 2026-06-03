<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { API } from '@/api/endpoints';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';

const { notify } = useNotification();
const loading = ref(true);
const events = ref<any[]>([]);
const activeView = ref<'month' | 'week' | 'day'>('month');
const selectedDate = ref(new Date());

interface Appointment {
  id: number;
  id_customer: number;
  date_appointment: string;
  time_start: string;
  time_end: string;
  tx_customer_name: string;
  tx_dni: string;
  tx_notes: string;
  tx_status: string;
  in_duration: number;
}

const statusColors: Record<string, string> = {
  confirmed: '#4caf50',
  pending: '#ff9800',
  cancelled: '#f44336',
  completed: '#2196f3',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const statusIcons: Record<string, string> = {
  confirmed: 'mdi-check-circle',
  pending: 'mdi-clock-outline',
  cancelled: 'mdi-close-circle',
  completed: 'mdi-check-all',
};

const fetchAppointments = async () => {
  loading.value = true;
  try {
    const res = await axios.get(API.APPOINTMENTS.ALL);
    if (res.data.status) {
      const apps: Appointment[] = res.data.data;
      events.value = apps.map((apt) => ({
        id: apt.id,
        start: `${apt.date_appointment} ${apt.time_start}`,
        end: `${apt.date_appointment} ${apt.time_end}`,
        title: `${apt.tx_customer_name} (${apt.tx_dni || ''})`,
        content: apt.tx_notes ? `<i>${apt.tx_notes.substring(0, 60)}${apt.tx_notes.length > 60 ? '...' : ''}</i>` : '',
        class: `appointment-${apt.tx_status}`,
        background: true,
        color: apt.tx_status === 'cancelled' ? '#bdbdbd' : undefined,
        // Custom fields
        status: apt.tx_status,
        customerName: apt.tx_customer_name,
        customerDni: apt.tx_dni,
        duration: apt.in_duration,
        raw: apt,
      }));
    }
  } catch (err) {
    notify('error', 'Error al cargar citas del calendario');
  } finally {
    loading.value = false;
  }
};

const selectedEvent = ref<any>(null);
const showEventDialog = ref(false);

const onEventClick = (event: any, e: Event) => {
  selectedEvent.value = event.raw || event;
  showEventDialog.value = true;
};

const closeDialog = () => {
  showEventDialog.value = false;
  selectedEvent.value = null;
};

const formatDate = (d: string) => {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const quickStatusChange = async (id: number, newStatus: string) => {
  try {
    await axios.post(API.APPOINTMENTS.STATUS(id), { tx_status: newStatus });
    notify('success', `Cita ${statusLabels[newStatus].toLowerCase()}.`);
    closeDialog();
    fetchAppointments();
  } catch (err: any) {
    notify('error', err.response?.data?.msg || 'Error al cambiar estado');
  }
};

const getEventClass = (status: string, isBackground: boolean) => {
  if (!isBackground) return '';
  const map: Record<string, string> = {
    confirmed: 'event-confirmed',
    pending: 'event-pending',
    completed: 'event-completed',
    cancelled: 'event-cancelled',
  };
  return map[status] || '';
};

const vueCalEvents = computed(() => {
  return events.value.map(ev => ({
    ...ev,
    title: `${ev.title}`,
    class: getEventClass(ev.status, !!ev.background),
  }));
});

onMounted(fetchAppointments);
</script>

<template>
  <UiParentCard title="Calendario de Citas">
    <template v-slot:action>
      <div class="d-flex align-center gap-2">
        <v-btn-toggle v-model="activeView" mandatory density="comfortable" color="primary" variant="outlined" divided>
          <v-btn value="month" size="x-small">
            <v-icon start size="16">mdi-calendar-month</v-icon> Mes
          </v-btn>
          <v-btn value="week" size="x-small">
            <v-icon start size="16">mdi-calendar-week</v-icon> Semana
          </v-btn>
          <v-btn value="day" size="x-small">
            <v-icon start size="16">mdi-calendar-today</v-icon> Día
          </v-btn>
        </v-btn-toggle>
        <v-btn icon size="small" variant="text" @click="fetchAppointments" :loading="loading">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </template>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <div class="calendar-wrapper">
      <vue-cal
        :active-view="activeView"
        :events="vueCalEvents"
        :selected-date="selectedDate"
        :time="true"
        :time-step="30"
        :time-from="8 * 60"
        :time-to="18 * 60"
        :disable-views="['years', 'year']"
        :show-week-numbers="false"
        :show-all-week-events="false"
        :snap-to-time="15"
        :overlap="false"
        :editable-events="false"
        :drag-to-create-event="false"
        style="height: 650px"
        locale="es"
        @event-click="onEventClick"
        @ready="loading = false"
      >
        <template #event-renderer="{ event, view }">
          <div
            class="vuecal__event-title"
            :style="{
              backgroundColor: event.status ? statusColors[event.status] : undefined,
              color: event.status === 'pending' ? '#333' : '#fff',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: view === 'month' ? '10px' : '12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }"
          >
            <span v-if="view !== 'month'" style="font-weight:600;font-size:11px;">
              {{ event.start?.toTimeString?.()?.substring(0,5) || '' }}
            </span>
            <span>{{ event.title }}</span>
          </div>
        </template>
      </vue-cal>
    </div>

    <!-- Event Detail Dialog -->
    <v-dialog v-model="showEventDialog" max-width="500" v-if="selectedEvent">
      <v-card rounded="xl">
        <v-toolbar :color="statusColors[selectedEvent.tx_status] || 'primary'" density="compact">
          <v-toolbar-title class="text-white">
            <v-icon class="mr-2">{{ statusIcons[selectedEvent.tx_status] || 'mdi-calendar' }}</v-icon>
            {{ statusLabels[selectedEvent.tx_status] || selectedEvent.tx_status }}
          </v-toolbar-title>
          <v-btn icon dark @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis">CLIENTE</div>
            <div class="text-h6 font-weight-bold">
              {{ selectedEvent.tx_customer_name || selectedEvent.customerName }}
            </div>
            <div class="text-body-2 text-medium-emphasis" v-if="selectedEvent.tx_dni || selectedEvent.customerDni">
              DNI: {{ selectedEvent.tx_dni || selectedEvent.customerDni }}
            </div>
          </div>

          <v-divider class="mb-4" />

          <v-row dense>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">FECHA</div>
              <div class="text-body-1 font-weight-medium">
                {{ formatDate(selectedEvent.date_appointment) }}
              </div>
            </v-col>
            <v-col cols="3">
              <div class="text-caption text-medium-emphasis">INICIO</div>
              <div class="text-body-1 font-weight-medium">{{ selectedEvent.time_start }}</div>
            </v-col>
            <v-col cols="3">
              <div class="text-caption text-medium-emphasis">FIN</div>
              <div class="text-body-1 font-weight-medium">{{ selectedEvent.time_end }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">DURACIÓN</div>
              <div class="text-body-1 font-weight-medium">{{ selectedEvent.in_duration || selectedEvent.duration }} min</div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div v-if="selectedEvent.tx_notes">
            <div class="text-caption text-medium-emphasis">OBSERVACIONES</div>
            <div class="text-body-2 mt-1">{{ selectedEvent.tx_notes }}</div>
            <v-divider class="my-4" />
          </div>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 d-flex flex-wrap gap-2">
          <v-btn
            v-if="selectedEvent.tx_status !== 'confirmed' && selectedEvent.tx_status !== 'completed'"
            color="success" variant="flat" size="small"
            @click="quickStatusChange(selectedEvent.id, 'confirmed')"
          >
            <v-icon start>mdi-check</v-icon> Confirmar
          </v-btn>
          <v-btn
            v-if="selectedEvent.tx_status === 'confirmed'"
            color="info" variant="flat" size="small"
            @click="quickStatusChange(selectedEvent.id, 'completed')"
          >
            <v-icon start>mdi-check-all</v-icon> Completar
          </v-btn>
          <v-btn
            v-if="selectedEvent.tx_status !== 'cancelled'"
            color="warning" variant="flat" size="small"
            @click="quickStatusChange(selectedEvent.id, 'pending')"
          >
            <v-icon start>mdi-clock-outline</v-icon> Pendiente
          </v-btn>
          <v-btn
            v-if="selectedEvent.tx_status !== 'cancelled'"
            color="error" variant="tonal" size="small"
            @click="quickStatusChange(selectedEvent.id, 'cancelled')"
          >
            <v-icon start>mdi-cancel</v-icon> Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary" variant="outlined" size="small"
            :to="{ name: 'AppointmentsEdt', params: { id: selectedEvent.id } }"
          >
            <v-icon start>mdi-pencil</v-icon> Editar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiParentCard>
</template>

<script lang="ts">
import UiParentCard from '@/components/shared/UiParentCard.vue';
export default {
  components: { UiParentCard }
};
</script>

<style scoped>
.calendar-wrapper {
  position: relative;
}

:deep(.vuecal__event) {
  cursor: pointer;
}

:deep(.vuecal__event.event-confirmed) {
  background-color: #4caf50 !important;
  color: white !important;
}

:deep(.vuecal__event.event-pending .vuecal__event-title) {
  background-color: #ff9800 !important;
  color: #333 !important;
}

:deep(.vuecal__event.event-completed .vuecal__event-title) {
  background-color: #2196f3 !important;
  color: white !important;
}

:deep(.vuecal__event.event-cancelled .vuecal__event-title) {
  background-color: #f44336 !important;
  color: white !important;
  text-decoration: line-through;
  opacity: 0.7;
}

:deep(.vuecal__title) {
  font-size: 18px;
  font-weight: 700;
}
</style>
