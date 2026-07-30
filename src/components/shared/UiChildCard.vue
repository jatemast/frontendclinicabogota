<script setup lang="ts">
const props = defineProps({
    title: String
});
</script>

<template>
    <v-card elevation="0" rounded="xl" class="border bg-surface">
        <v-card-item class="py-4 px-6">
            <v-card-title class="text-h6 font-weight-semibold text-primary">{{ title }}</v-card-title>
        </v-card-item>
        <v-divider class="opacity-60" />
        <v-card-text class="pa-6">
            <slot />
        </v-card-text>
    </v-card>
</template>
