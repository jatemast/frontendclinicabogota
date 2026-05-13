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
        <v-btn 
          icon="mdi-chevron-left" 
          variant="text" 
          size="small" 
          @click="currentView === 'calendar' ? adjustMonth(-1) : adjustYearPage(-1)"
        ></v-btn>
        
        <div class="text-center cursor-pointer px-2 rounded-lg hover-bg" @click="toggleView">
          <div class="text-subtitle-2 font-weight-black text-uppercase text-primary">
            {{ months[activeDate.getMonth()] }}
          </div>
          <div class="text-caption font-weight-bold text-grey">
            {{ activeDate.getFullYear() }}
            <v-icon size="small" class="ml-1">{{ currentView === 'calendar' ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
          </div>
        </div>

        <v-btn 
          icon="mdi-chevron-right" 
          variant="text" 
          size="small" 
          @click="currentView === 'calendar' ? adjustMonth(1) : adjustYearPage(1)"
        ></v-btn>
      </div>

      <div v-if="currentView === 'calendar'">
        <div class="days-grid mb-2">
          <span v-for="d in ['L','M','M','J','V','S','D']" :key="d" class="day-header">{{ d }}</span>
          <v-btn
            v-for="day in daysInMonth"
            :key="day.date.toISOString()"
            variant="text"
            size="x-small"
            :color="selectedDate && isSameDay(day.date, selectedDate) ? 'primary' : ''"
            :class="[
              'day-item', 
              { 
                'not-current': !day.currentMonth, 
                'selected-day': selectedDate && isSameDay(day.date, selectedDate),
                'is-today': isSameDay(day.date, new Date()) 
              }
            ]"
            @click="selectDay(day.date)"
          >
            {{ day.date.getDate() }}
          </v-btn>
        </div>
      </div>

      <div v-else class="selector-container">
        <div class="month-grid-selection mb-4">
          <v-btn
            v-for="(m, idx) in months"
            :key="m"
            variant="tonal"
            size="small"
            :color="activeDate.getMonth() === idx ? 'primary' : 'grey-lighten-3'"
            class="month-selection-item"
            @click="jumpToMonth(idx)"
          >
            {{ m }}
          </v-btn>
        </div>

        <v-divider class="mb-3"></v-divider>

        <div class="year-list-container">
          <v-btn
            v-for="year in years"
            :key="year"
            variant="text"
            size="small"
            :color="activeDate.getFullYear() === year ? 'primary' : ''"
            :class="{ 'font-weight-black': activeDate.getFullYear() === year }"
            class="year-item-btn"
            @click="jumpToYear(year)"
          >
            {{ year }}
          </v-btn>
        </div>
      </div>

      <v-btn 
        v-if="currentView !== 'calendar'" 
        block 
        variant="text" 
        color="primary" 
        size="small" 
        class="mt-2" 
        @click="currentView = 'calendar'"
      >
        Volver al calendario
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, parseISO, setYear
} from 'date-fns';

interface Props {
  modelValue: string | null;
  label?: string;
  icon?: string;
  rules?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Seleccionar Fecha',
  icon: 'mdi-calendar-edit',
  rules: () => []
});

const emit = defineEmits(['update:modelValue']);

const isMenuOpen = ref(false);
const currentView = ref<'calendar' | 'selectors'>('calendar');
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const selectedDate = computed(() => 
  props.modelValue ? parseISO(props.modelValue) : null
);

const activeDate = ref(new Date());

// Generar lista de años (desde 1920 hasta hoy + 5 años)
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const list = [];
  for (let i = currentYear + 5; i >= 1920; i--) {
    list.push(i);
  }
  return list;
});

watch(isMenuOpen, (isOpen) => {
  if (isOpen) {
    activeDate.value = selectedDate.value ? new Date(selectedDate.value) : new Date();
    currentView.value = 'calendar';
  }
});

const formattedDisplayDate = computed(() => 
  selectedDate.value ? format(selectedDate.value, 'dd/MM/yyyy') : ''
);

const daysInMonth = computed(() => {
    const start = startOfWeek(startOfMonth(activeDate.value), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(activeDate.value), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map(date => ({
        date,
        currentMonth: isSameMonth(date, activeDate.value)
    }));
});

const toggleView = () => {
  currentView.value = currentView.value === 'calendar' ? 'selectors' : 'calendar';
};

const selectDay = (date: Date) => {
    emit('update:modelValue', format(date, 'yyyy-MM-dd')); 
    isMenuOpen.value = false;
};

const adjustMonth = (step: number) => activeDate.value = addMonths(activeDate.value, step);

const jumpToMonth = (idx: number) => {
    const newDate = new Date(activeDate.value);
    newDate.setMonth(idx);
    activeDate.value = newDate;
    currentView.value = 'calendar'; // Volver al calendario tras elegir mes
};

const jumpToYear = (year: number) => {
    activeDate.value = setYear(activeDate.value, year);
    // No cerramos la vista aquí por si quiere cambiar el mes también
};

const adjustYearPage = (step: number) => {
  // Si estamos en vista calendario, ajusta mes. Si no, ajusta año rápido.
  if (currentView.value === 'calendar') {
    adjustMonth(step);
  } else {
    activeDate.value = setYear(activeDate.value, activeDate.value.getFullYear() + step);
  }
};
</script>

<style scoped>
.hover-bg {
  transition: background 0.2s;
}
.hover-bg:hover {
  background: #f1f5f9;
}

.days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.day-header { font-size: 0.7rem; font-weight: bold; text-align: center; padding-bottom: 8px; color: #64748b; }
.day-item { min-width: 38px !important; height: 38px !important; padding: 0 !important; font-size: 0.75rem !important; border-radius: 10px !important; }
.day-item.not-current { color: #cbd5e1 !important; opacity: 0.4; }
.is-today { border: 1px dashed rgb(var(--v-theme-primary), 0.5) !important; }

/* Selección de Meses */
.month-grid-selection {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.month-selection-item {
  height: 32px !important;
  font-size: 0.7rem !important;
  text-transform: none !important;
}

/* Lista de Años */
.year-list-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-height: 150px;
  overflow-y: auto;
  gap: 4px;
  padding-right: 4px;
}
.year-list-container::-webkit-scrollbar {
  width: 4px;
}
.year-list-container::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.year-item-btn {
  height: 28px !important;
  font-size: 0.75rem !important;
}

.cursor-pointer { cursor: pointer; }
</style>