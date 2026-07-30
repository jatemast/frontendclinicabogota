<script setup>
import Icon from '../Icon.vue';
const props = defineProps({ 
    item: Object, 
    level: Number,
    isMobile: Boolean,
    railMode: Boolean
});
</script>

<template>
    <!-- Versión móvil (siempre expandida) -->
    <v-list-item
        v-if="isMobile"
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

    <!-- Versión desktop - Colapsada (solo ícono con tooltip) -->
    <v-tooltip 
        v-else-if="railMode"
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

    <!-- Versión desktop - Expandida (ícono y texto) -->
    <v-list-item
        v-else
        :to="item.to"
        exact
        class="desktop-nav-item w-100 px-3 mb-1"
        rounded="lg"
        active-class="active-desktop"
    >
        <template v-slot:prepend>
            <Icon :item="item.icon" size="19" class="mr-2" />
        </template>
        <v-list-item-title class="font-weight-medium text-body-2">{{ item.title }}</v-list-item-title>
    </v-list-item>
</template>

<style scoped>
/* --- ESTILO DESKTOP (RIEL) --- */
.nav-btn-rail {
    border-radius: 14px !important;
    color: rgb(var(--v-theme-textSecondary)) !important; 
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-btn-rail.active-rail,
.nav-btn-rail.v-btn--active {
    background: linear-gradient(135deg, #18B6C9 0%, #0F766E 100%) !important;
    color: #FFFFFF !important; 
    box-shadow: 0 8px 18px rgba(24, 182, 201, 0.35) !important;
    opacity: 1 !important;
}

.nav-btn-rail.v-btn--active :deep(.v-icon),
.nav-btn-rail.v-btn--active :deep(svg) {
    color: #FFFFFF !important;
}

.nav-btn-rail:hover:not(.v-btn--active) {
    color: #18B6C9 !important;
    background: rgba(24, 182, 201, 0.12) !important;
}

/* --- ESTILO MÓVIL --- */
.mobile-nav-item {
    color: rgb(var(--v-theme-textPrimary)) !important;
    border-radius: 14px !important;
}

.mobile-nav-item.active-mobile,
.mobile-nav-item.v-list-item--active {
    background: linear-gradient(135deg, #18B6C9 0%, #0F766E 100%) !important;
    color: #FFFFFF !important;
    font-weight: 600 !important;
    box-shadow: 0 6px 16px rgba(24, 182, 201, 0.3) !important;
}

.mobile-nav-item.v-list-item--active :deep(.v-icon),
.mobile-nav-item.v-list-item--active :deep(svg),
.mobile-nav-item.v-list-item--active :deep(.v-list-item-title) {
    color: #FFFFFF !important;
}

/* --- ESTILO DESKTOP EXPANDIDO --- */
.desktop-nav-item {
    color: rgb(var(--v-theme-textSecondary)) !important;
    margin-top: 2px;
    margin-bottom: 2px;
    height: 44px !important;
    border-radius: 14px !important;
    transition: all 0.25s ease !important;
}

.desktop-nav-item :deep(.v-icon),
.desktop-nav-item :deep(svg),
.desktop-nav-item :deep(.v-list-item-title) {
    color: rgb(var(--v-theme-textSecondary)) !important;
}

.desktop-nav-item .v-list-item__prepend > .v-icon {
    width: 20px;
    height: 20px;
}

.desktop-nav-item.active-desktop,
.desktop-nav-item.v-list-item--active {
    background: linear-gradient(135deg, #18B6C9 0%, #0F766E 100%) !important;
    color: #FFFFFF !important; 
    box-shadow: 0 8px 18px rgba(24, 182, 201, 0.35) !important;
}

.desktop-nav-item.active-desktop :deep(.v-icon),
.desktop-nav-item.active-desktop :deep(svg),
.desktop-nav-item.active-desktop :deep(.v-list-item-title),
.desktop-nav-item.v-list-item--active :deep(.v-icon),
.desktop-nav-item.v-list-item--active :deep(svg),
.desktop-nav-item.v-list-item--active :deep(.v-list-item-title) {
    color: #FFFFFF !important;
}

.desktop-nav-item:hover:not(.v-list-item--active) {
    color: #18B6C9 !important;
    background: rgba(24, 182, 201, 0.12) !important;

    :deep(.v-icon), :deep(svg), :deep(.v-list-item-title) {
        color: #18B6C9 !important;
    }
}

/* --- TOOLTIP & OTROS --- */
.glass-label {
    background: rgb(var(--v-theme-surface));
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    border: 1px solid rgb(var(--v-theme-borderColor));
}

:deep(.v-overlay__content) {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
}
</style>