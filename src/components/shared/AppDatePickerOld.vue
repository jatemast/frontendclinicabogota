<template>
  <v-menu
    v-model="isMenuOpen"
    :close-on-content-click="false"
    location="bottom center"
    transition="slide-y-transition"
    min-width="320"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        v-bind="props"
        :label="label"
        :model-value="formattedDisplayDate"
        readonly
        variant="outlined"
        density="comfortable"
        :prepend-inner-icon="icon"
        :rules="rules"
        color="primary"
        hide-details="auto"
      />
    </template>

    <v-card width="320" class="pa-4 rounded-xl border shadow-lg bg-white">
      <div class="d-flex align-center justify-space-between mb-4">
        <v-btn icon="mdi-chevron-left" variant="text" size="small" @click="adjustMonth(-1)"></v-btn>
        <div class="text-center">
          <div class="text-subtitle-2 font-weight-black text-uppercase text-primary">
            {{ months[activeDate.getMonth()] }}
          </div>
          <div class="text-caption font-weight-bold text-grey">{{ activeDate.getFullYear() }}</div>
        </div>
        <v-btn icon="mdi-chevron-right" variant="text" size="small" @click="adjustMonth(1)"></v-btn>
      </div>

      <div class="days-grid mb-4">
        <span v-for="d in ['S','M','T','W','T','F','S']" :key="d" class="day-header">{{ d }}</span>
        <v-btn
          v-for="day in daysInMonth"
          :key="day.date.toISOString()"
          variant="text"
          size="x-small"
          :color="isSameDay(day.date, selectedDate) ? 'primary' : ''"
          :class="['day-item', { 'not-current': !day.currentMonth, 'selected-day': isSameDay(day.date, selectedDate) }]"
          @click="selectDay(day.date)"
        >
          {{ day.date.getDate() }}
        </v-btn>
      </div>

      <v-divider class="mb-3"></v-divider>

      <div class="month-quick-select">
        <v-btn
          v-for="(m, idx) in months"
          :key="m"
          variant="tonal"
          size="x-small"
          :color="activeDate.getMonth() === idx ? 'primary' : 'grey'"
          class="month-chip"
          @click="jumpToMonth(idx)"
        >
          {{ m }}
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, parseISO 
} from 'date-fns';

interface Props {
  modelValue: string; // Espera formato YYYY-MM-DD
  label?: string;
  icon?: string;
  rules?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Select Date',
  icon: 'mdi-calendar-edit',
  rules: () => []
});

const emit = defineEmits(['update:modelValue']);

const isMenuOpen = ref(false);
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Sincronización interna de fechas
const selectedDate = computed(() => props.modelValue ? parseISO(props.modelValue) : new Date());
const activeDate = ref(new Date(selectedDate.value));

// Actualizar el foco del calendario cuando se abre
watch(isMenuOpen, (val) => {
  // CAMBIO: era activeDate.ref, debe ser activeDate.value
  if (val) activeDate.value = new Date(selectedDate.value);
});

const formattedDisplayDate = computed(() => format(selectedDate.value, 'MM/dd/yyyy'));

const daysInMonth = computed(() => {
    const start = startOfWeek(startOfMonth(activeDate.value));
    const end = endOfWeek(endOfMonth(activeDate.value));
    return eachDayOfInterval({ start, end }).map(date => ({
        date,
        currentMonth: isSameMonth(date, activeDate.value)
    }));
});

const selectDay = (date: Date) => {
    // Esto es lo que se envía al v-model del padre (form.date_payment)
    // El backend lo recibirá como 2024-05-20
    emit('update:modelValue', format(date, 'yyyy-MM-dd')); 
    isMenuOpen.value = false;
};

const adjustMonth = (step: number) => activeDate.value = addMonths(activeDate.value, step);
const jumpToMonth = (idx: number) => {
    const newDate = new Date(activeDate.value);
    newDate.setMonth(idx);
    activeDate.value = newDate;
};
</script>

<style scoped>
.days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.day-header { font-size: 0.7rem; font-weight: bold; text-align: center; padding-bottom: 8px; }
.day-item { min-width: 32px !important; height: 32px !important; padding: 0 !important; font-size: 0.75rem !important; }
.day-item.not-current { color: #cbd5e1 !important; opacity: 0.5; }
.selected-day { font-weight: bold !important; }
.month-quick-select { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.month-chip { font-size: 0.65rem !important; height: 24px !important; text-transform: none !important; }
</style>