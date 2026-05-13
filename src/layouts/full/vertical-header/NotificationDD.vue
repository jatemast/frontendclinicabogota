<template>
  <div class="d-flex align-center w-100">
    <v-spacer />

    <v-btn
      icon
      variant="text"
      class="custom-hover-primary text-muted"
      @click="toggleTheme"
    >
      <v-icon :icon="currentTheme === 'DARK_THEME' ? 'mdi-weather-sunny' : 'mdi-weather-night'" size="22" />
    </v-btn>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const currentTheme = computed(() => theme.global.name.value);

const toggleTheme = () => {
  theme.global.name.value = currentTheme.value === 'DARK_THEME' ? 'BLUE_THEME' : 'DARK_THEME';
  localStorage.setItem('theme', theme.global.name.value);
};

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) theme.global.name.value = savedTheme;
});
</script>