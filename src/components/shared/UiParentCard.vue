<script setup lang="ts">
const props = defineProps({
    title: String
});
</script>

<template>
    <v-card elevation="0" rounded="xl" class="border">
        <v-card-item class="py-4 px-6">
            <div class="d-sm-flex align-center justify-space-between">
                <v-card-title class="text-h5 font-weight-bold text-primary">{{ title }}</v-card-title>
                <slot name="action"></slot>
            </div>
        </v-card-item>
        <v-divider class="opacity-60"></v-divider>
        <v-card-text class="pa-6">
            <slot />
        </v-card-text>
    </v-card>
</template>
