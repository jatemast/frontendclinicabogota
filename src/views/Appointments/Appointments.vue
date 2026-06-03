<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppointmentTable from '@/components/Appointments/AppointmentTable.vue';
import AppointmentCalendar from '@/components/Appointments/AppointmentCalendar.vue';

const router = useRouter();
const viewMode = ref<'calendar' | 'list'>('calendar');
</script>

<template>
  <v-row>
    <v-col cols="12">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h2 class="text-h4 font-weight-bold text-grey-darken-3">
            <v-icon size="32" color="primary" class="mr-2">mdi-calendar-month</v-icon>
            Agendamiento de Citas
          </h2>
          <p class="text-body-2 text-medium-emphasis mt-1 ml-1">
            Gestión profesional de citas y agenda clínica
          </p>
        </div>
        <div class="d-flex gap-2">
          <v-btn-toggle v-model="viewMode" mandatory density="comfortable" color="primary" variant="outlined" divided>
            <v-btn value="calendar" size="small">
              <v-icon start>mdi-calendar-month</v-icon>
              Calendario
            </v-btn>
            <v-btn value="list" size="small">
              <v-icon start>mdi-format-list-bulleted</v-icon>
              Lista
            </v-btn>
          </v-btn-toggle>
          <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'AppointmentsAdd' }" class="ml-3">
            Nueva Cita
          </v-btn>
        </div>
      </div>

      <AppointmentCalendar v-if="viewMode === 'calendar'" />
      <AppointmentTable v-else />
    </v-col>
  </v-row>
</template>
