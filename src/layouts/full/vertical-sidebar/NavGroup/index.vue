<script setup>
import { DotsIcon } from 'vue-tabler-icons';
const props = defineProps({ item: Object });
</script>

<template>
    <v-tooltip location="right" :text="props.item.header">
        <template v-slot:activator="{ props: tooltip }">
            <div v-bind="tooltip" class="group-separator my-2">
                <div class="line"></div>
                <DotsIcon size="14" class="text-primary opacity-40" />
                <div class="line"></div>
            </div>
        </template>
    </v-tooltip>
</template>

<style scoped>
.group-separator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
}

.line {
    width: 1px;
    height: 10px;
    background: rgba(0, 0, 0, 0.05);
}
</style>