<template>
  <div class="d-flex flex-column align-center justify-center py-12 px-4 text-center">
    <v-icon
      :icon="icon"
      :size="size"
      :color="color"
      class="mb-4 animate-bounce"
    ></v-icon>
    
    <h3 class="text-h6 font-weight-bold text-grey-darken-1">
      {{ title }}
    </h3>
    
    <p class="text-body-2 text-grey-darken-1 mb-4" v-if="description">
      {{ description }}
    </p>

    <slot name="actions"></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  size?: string | number;
}

withDefaults(defineProps<Props>(), {
  title: 'No se encontraron resultados',
  description: '',
  icon: 'mdi-close',
  color: 'error',
  size: 80
});
</script>

<style scoped>
.animate-bounce {
  animation: bounce 3s infinite ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>