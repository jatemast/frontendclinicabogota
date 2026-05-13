<template>
  <div class="d-flex align-center w-100">
    <v-btn
      icon
      variant="text"
      class="custom-hover-primary text-muted"
      @click="toggleTheme"
    >
      <v-icon 
        :icon="currentTheme === 'DARK_THEME' ? 'mdi-weather-sunny' : 'mdi-weather-night'" 
        size="22" 
      />
      <v-tooltip activator="parent" location="bottom">
        {{ currentTheme === 'DARK_THEME' ? 'Light Mode' : 'Dark Mode' }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

// Computada para detectar el tema actual
const currentTheme = computed(() => theme.global.name.value);

// Función para cambiar entre temas
const toggleTheme = () => {
  const newTheme = currentTheme.value === 'DARK_THEME' ? 'BLUE_THEME' : 'DARK_THEME';
  theme.global.name.value = newTheme;
  localStorage.setItem('theme', newTheme);
};

onMounted(() => {
  // Cargar tema persistente al montar el componente
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.global.name.value = savedTheme;
  }
});
</script>

<style scoped>
.custom-hover-primary:hover {
  color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>