<script setup lang="ts">
const props = defineProps({
  heading: String,
});
</script>

<template>
  <v-card class="overflow-hidden border" rounded="xl" elevation="0">
    <v-toolbar color="transparent" class="px-2">
        <v-card-title class="text-h5 font-weight-bold text-primary">{{ heading }}</v-card-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-divider class="opacity-60"></v-divider>
    <div class="pa-6">
      <slot />
    </div>
  </v-card>
</template>