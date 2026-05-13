<template>
  <div class="mb-4">
    <div class="text-caption text-grey-darken-1 text-uppercase font-weight-bold d-flex align-center">
      <v-icon v-if="icon" start size="14" :color="color">{{ icon }}</v-icon>
      {{ label }}
    </div>
    <div :class="['text-body-1 mt-1 px-3 py-2 rounded-lg bg-grey-lighten-5', color ? `text-${color}` : '']">
      {{ value || 'No registrado' }}
    </div>
  </div>
</template>

<script setup>
defineProps(['label', 'value', 'icon', 'color']);
</script>