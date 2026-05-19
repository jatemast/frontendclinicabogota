<script setup>
import { DotsIcon } from 'vue-tabler-icons';
const props = defineProps({ item: Object, railMode: Boolean });
</script>

<template>
    <v-tooltip 
        v-if="railMode" 
        location="right" 
        :text="props.item.header"
    >
        <template v-slot:activator="{ props: tooltip }">
            <div v-bind="tooltip" class="group-separator my-2">
                <div class="line"></div>
                <DotsIcon size="14" class="text-primary opacity-40" />
                <div class="line"></div>
            </div>
        </template>
    </v-tooltip>

    <v-list-subheader 
        v-else 
        class="text-uppercase text-caption font-weight-bold ml-4 mt-6 text-primary"
    >
        {{ props.item.header }}
    </v-list-subheader>
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