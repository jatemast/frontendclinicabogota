<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
// Importamos directamente el menú de clientes
import SidebarCustomer from './vertical-sidebar/SidebarCustomer'; 
import NavGroup from './vertical-sidebar/NavGroup/index.vue';
import NavItem from './vertical-sidebar/NavItem/index.vue';
import Logo from './Customer/Logo.vue';
import { Menu2Icon } from 'vue-tabler-icons';
import NotificationCustomer from './vertical-header/NotificationCustomer.vue';
import CustomerProfile from './vertical-header/CustomerProfile.vue';

const { mdAndUp, lgAndUp } = useDisplay();
const rail = ref(true); 
const sDrawer = ref(true);

// No necesitamos isLoading ni userPermissions porque el menú de clientes es fijo
const menuItems = SidebarCustomer;

</script>

<template>
   <v-navigation-drawer 
        v-model="sDrawer" 
        app 
        :rail="lgAndUp && rail"
        :expand-on-hover="lgAndUp && rail"
        :permanent="lgAndUp"
        :temporary="!lgAndUp"
        @update:rail="rail = $event"
        class="leftSidebar border-none mt-sm-0 mt-md-0" 
        :class="lgAndUp ? ' ml-sm-5 mt-md-5' : ''"
        elevation="10" 
        :width="270"
    >
        <div class="logo-wrapper d-flex align-center justify-center py-5">
            <div v-if="!rail" class="mt-md-5"><Logo /></div>
            <v-avatar v-if="rail" size="35" color="primary" class="elevation-2">
                <v-icon color="white" size="20">mdi-car-wrench</v-icon>
            </v-avatar>
        </div>
        
        <perfect-scrollbar class="scrollnavbar">
            <v-list class="pa-2 custom-menu-list">
                <template v-for="(item, i) in menuItems">
                    <NavGroup :item="item" v-if="item.header" v-show="!rail" :key="item.header" />
                    <NavItem :item="item" v-else :key="item.title" />
                </template>
            </v-list>
        </perfect-scrollbar>
    </v-navigation-drawer>

    <div class="container verticalLayout">
        <div class="maxWidth">
            <v-app-bar elevation="0" height="70">
                <div class="d-flex align-center justify-space-between w-100 px-4">
                    <div class="d-flex align-center">
                        <v-btn class="hidden-lg-and-up text-muted mr-2" @click="sDrawer = !sDrawer" icon
                            variant="flat" size="small">
                            <Menu2Icon size="20" stroke-width="1.5" />
                        </v-btn>
                        <!-- <h3 class="text-h6 font-weight-medium hidden-sm-and-down">Customer Portal</h3> -->
                         <NotificationCustomer />
                    </div>

                    <div class="d-flex align-center">
                        <!-- <NotificationDD /> -->
                        <div class="ml-2">
                            <CustomerProfile />
                        </div>
                    </div>
                </div>
            </v-app-bar>
        </div>
    </div>
</template>

<style scoped>
.logo-wrapper {
    height: 100px; /* Ajustado para que no ocupe demasiado espacio */
    transition: all 0.3s ease;
}

/* Evita que los iconos se vean pegados al borde en Tablets */
.custom-menu-list :deep(.v-list-item) {
    margin-bottom: 4px;
    border-radius: 8px !important;
    padding-inline: 12px !important;
}

/* Solo aplicamos el ocultar texto si estamos en PC y en modo rail */
.v-navigation-drawer--rail :deep(.v-list-item-title),
.v-navigation-drawer--rail :deep(.v-list-subheader) {
    opacity: 0;
}
</style>