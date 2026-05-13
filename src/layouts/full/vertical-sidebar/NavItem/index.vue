<script setup>
import Icon from '../Icon.vue';
const props = defineProps({ 
    item: Object, 
    level: Number,
    isMobile: Boolean 
});
</script>

<template>
    <v-tooltip 
        v-if="!isMobile"
        location="right" 
        offset="15"
        transition="slide-x-transition"
    >
        <template v-slot:activator="{ props: tooltip }">
            <v-btn
                v-bind="tooltip"
                :to="item.to"
                exact 
                icon
                variant="text"
                class="nav-btn-rail"
                active-class="active-rail"
                size="52"
            >
                <Icon :item="item.icon" :level="level" size="22" stroke-width="1.5" />
            </v-btn>
        </template>
        <div class="glass-label px-3 py-1">
            <span class="text-caption font-weight-bold text-primary">{{ item.title }}</span>
        </div>
    </v-tooltip>

    <v-list-item
        v-else
        :to="item.to"
        exact
        class="mobile-nav-item mx-4 mb-2"
        rounded="xl"
        active-class="active-mobile"
    >
        <template v-slot:prepend>
            <Icon :item="item.icon" size="20" class="mr-3" />
        </template>
        <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
    </v-list-item>
</template>

<style scoped>
/* --- ESTILO DESKTOP (RIEL) --- */
.nav-btn-rail {
    border-radius: 16px !important;
    color: #707a82 !important; 
    transition: all 0.3s ease;
}

/* Forzamos la aplicación con .v-btn--active por si active-class falla */
.nav-btn-rail.active-rail,
.nav-btn-rail.v-btn--active {
    background: linear-gradient(135deg, #2eced5 0%, #29b6bc 100%) !important;
    color: white !important; 
    box-shadow: 0 8px 15px rgba(46, 236, 213, 0.3) !important;
    opacity: 1 !important;
}

/* Aseguramos que el icono dentro del botón activo sea blanco */
.nav-btn-rail.v-btn--active :deep(.v-icon),
.nav-btn-rail.v-btn--active :deep(svg) {
    color: white !important;
}

.nav-btn-rail:hover:not(.v-btn--active) {
    color: #2eced5 !important;
    background: rgba(46, 236, 213, 0.08) !important;
}

/* --- ESTILO MÓVIL --- */
.mobile-nav-item {
    color: #2A3547 !important;
}

.mobile-nav-item.active-mobile,
.mobile-nav-item.v-list-item--active {
    background: rgba(46, 236, 213, 0.12) !important;
    color: #2eced5 !important;
}

/* --- TOOLTIP & OTROS --- */
.glass-label {
    background: white;
    border-radius: 8px;
    box-shadow: 4px 4px 10px rgba(0,0,0,0.1);
    border: 1px solid rgba(46, 236, 213, 0.2);
}

:deep(.v-overlay__content) {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
}
</style>