<script setup lang="ts">
import { ref, onMounted, computed, useTemplateRef } from 'vue';
import { useDisplay } from 'vuetify';
import sidebarItems from './vertical-sidebar/sidebarItem';
import NavGroup from './vertical-sidebar/NavGroup/index.vue';
import NavItem from './vertical-sidebar/NavItem/index.vue';
import Logo from './logo/Logo.vue';
import { Menu2Icon, ChevronUpIcon, ChevronDownIcon } from 'vue-tabler-icons';
import NotificationDD from './vertical-header/NotificationDD.vue';
import ProfileDD from './vertical-header/ProfileDD.vue';
import { userPermissions, refreshPermissions, can } from '@/utils/permissions';

const { lgAndUp } = useDisplay();
const sDrawer = ref(true);
const railMode = ref(true); // Nuevo estado para controlar el modo colapsado/expandido
const isLoading = ref(true);
const isImpersonating = ref(false); // Indica si el usuario actual está en modo de suplantación (impersonating) de un cliente.

const appBarTopOffset = computed(() => {
    return isImpersonating.value ? 48 : 0; // 48px es la altura estimada de la alerta
});
const appBarDynamicTop = computed(() => {
    return `calc(20px + ${appBarTopOffset.value}px)`;
});

const checkImpersonation = () => { // Verifica si existe un 'master_token' en localStorage, lo que indica que se está suplantando a un cliente.
    isImpersonating.value = !!localStorage.getItem('master_token');
};

// Lógica para detectar el scroll
const scrollContainer = useTemplateRef<HTMLElement>('scrollContainer');
const canScrollUp = ref(false);
const canScrollDown = ref(false);

const checkScroll = () => {
    const el = scrollContainer.value;
    if (el) {
        canScrollUp.value = el.scrollTop > 10;
        canScrollDown.value = el.scrollHeight - el.scrollTop - el.clientHeight > 10;
    }
};

onMounted(async () => {
    checkImpersonation();
    await refreshPermissions(); 
    isLoading.value = false;
    setTimeout(checkScroll, 500); // Verificación inicial
});

const returnToMaster = () => { // Revierte el modo de suplantación, restaurando el token y el ID de negocio del usuario maestro, y recarga la página.
    const masterToken = localStorage.getItem('master_token');
    if (masterToken && masterToken !== 'null' && masterToken !== 'undefined') {
        localStorage.setItem('access_token', masterToken);
        localStorage.setItem('token', masterToken);
    } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
    }
    localStorage.removeItem('master_token');
    localStorage.setItem('is_master', 'true');
    localStorage.setItem('id_business', '9999'); // ID especial que indica el modo MASTER.
    window.location.href = '/';
};

const filteredMenu = computed(() => { // Filtra los elementos del menú lateral basándose en los permisos del usuario actual y si es el usuario maestro o un cliente suplantado.
    const result = [];
    const items = sidebarItems;
    const isMaster = localStorage.getItem('is_master') === 'true';

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.masterOnly && !isMaster) continue;

        if (item.header) {
            let hasVisibleChildren = false;
            for (let j = i + 1; j < items.length; j++) {
                const nextItem = items[j];
                if (nextItem.header) break;
                if (nextItem.masterOnly && !isMaster) continue;
                
                // Usar can() en lugar de includes() para respetar master y personificación
                const isItemVisible = !nextItem.module || can(nextItem.module);
                if (isItemVisible) {
                    hasVisibleChildren = true;
                    break;
                }
            }
            if (hasVisibleChildren) result.push(item);
        } else {
            // Usar can() en lugar de includes() para respetar master y personificación
            const isVisible = !item.module || can(item.module);
            if (isVisible) result.push(item);
        }
    }
    return result;
});
</script>

<template>
    <v-navigation-drawer 
        v-model="sDrawer" 
        app 
        :permanent="lgAndUp"
        :temporary="!lgAndUp"
        :width="lgAndUp ? (railMode ? 95 : 280) : 280" 
        :class="[lgAndUp ? 'premium-sidebar-rail' : 'mobile-sidebar', { 'expanded-sidebar': lgAndUp && !railMode }]"
        elevation="0"
        :rail="lgAndUp && railMode"
    >
        <div class="d-flex flex-column h-100 py-6">
            <div :class="[
                'logo-wrapper', 
                lgAndUp ? 'logo-pc mb-6' : 'logo-mobile w-100 px-6 mb-6'
                 ]">
                <Logo :is-mini="lgAndUp && railMode" /> <!-- Modificado para pasar is-mini basado en railMode -->
            </div>

            <v-divider class="w-50 mb-4 opacity-10 align-self-center" v-if="lgAndUp && railMode"></v-divider> <!-- Divider condicional -->

            <div class="scroll-wrapper flex-grow-1">
                <Transition name="fade">
                    <div v-if="lgAndUp && canScrollUp" class="scroll-indicator up">

                        <v-btn size="36" color="primary" variant="flat" class="text-primary icon-bounce mt-6" >
                            <v-icon  >mdi-arrow-up</v-icon>
                        </v-btn>
                        
                    </div>
                </Transition>

                <div 
                    class="scroll-area h-100" 
                    ref="scrollContainer" 
                    @scroll="checkScroll"
                >
                    <div class="menu-items-container w-100">
                        <template v-for="(item, i) in filteredMenu">
                            <div v-if="item.header" :key="item.title" class="w-100">
                                <NavGroup v-if="lgAndUp" :item="item" :rail-mode="railMode" />
                                <v-list-subheader v-else class="text-uppercase text-caption font-weight-bold ml-4 text-primary">
                                    {{ item.header }}
                                </v-list-subheader>
                            </div>
                            
                            <NavItem v-else :item="item" :key="i" :is-mobile="!lgAndUp" :rail-mode="railMode" />
                        </template>
                    </div>
                </div>

                <Transition name="fade">
                    <div v-if="lgAndUp && canScrollDown" class="scroll-indicator down">
                        <v-btn size="36" color="primary" variant="flat" class="text-primary icon-bounce mb-6" >
                            <v-icon  >mdi-arrow-down</v-icon>
                        </v-btn>
                    </div>
                </Transition>
            </div>
        </div>
    </v-navigation-drawer>

    <div class="container verticalLayout">
        <v-alert
            v-if="isImpersonating"
            color="warning"
            variant="flat"
            class="text-center rounded-0 font-weight-bold"
            density="compact"
        >
            <div class="d-flex align-center justify-center">
                <v-icon class="mr-2">mdi-incognito</v-icon>
                <span>ESTÁS EN MODO CLIENTE (IMPERSONACIÓN)</span>
                <v-btn 
                    size="small" 
                    color="black" 
                    variant="outlined" 
                    class="ml-4" 
                    @click="returnToMaster"
                >
                    Volver a MASTER
                </v-btn>
            </div>
        </v-alert>

        <div class="maxWidth">
            <v-app-bar elevation="0" height="75" color="transparent" flat class="modern-app-bar"
                :style="{ top: appBarDynamicTop + ' !important' }"
            >
                <div class="d-flex align-center justify-space-between w-100 px-6">
                    <div class="d-flex align-center floating-group px-4 py-2">
                        <v-btn 
                            class="hidden-lg-and-up text-muted mr-2" 
                            @click="sDrawer = !sDrawer" 
                            icon
                            variant="text" 
                            size="small"
                        >
                            <Menu2Icon size="20" />
                        </v-btn>

                        <v-btn
                            v-if="lgAndUp"
                            class="text-muted ml-2"
                            @click="railMode = !railMode"
                            icon
                            variant="text"
                            size="small"
                        >
                            <v-icon>{{ railMode ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
                        </v-btn>
                    </div>

                    <div class="d-flex align-center gap-2 floating-group px-3 py-1">
                        <NotificationDD />
                        <v-divider vertical inset class="mx-2 my-3"></v-divider>
                        <ProfileDD />
                    </div>
                </div>
            </v-app-bar>
        </div>
    </div>
</template>

<style scoped>
.premium-sidebar-rail {
    backdrop-filter: blur(15px) saturate(180%);
    border-right: 1px solid rgba(var(--v-theme-primary), 0.1) !important;
    margin: 15px 0 15px 15px !important; 
    height: calc(100vh - 30px) !important;
    border-radius: 24px !important;
    overflow: hidden !important;
}

.logo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estilo para PC (Riel estrecho) */
.logo-pc {
    width: 100%;
    padding: 0 10px;
}

.logo-pc :deep(img), 
.logo-pc :deep(svg) {
    width: 48px !important; /* Tamaño optimizado para el riel de 95px */
    height: auto;
    object-fit: contain;
}

/* Estilo para Móvil (Drawer ancho) */
.logo-mobile {
    justify-content: center; /* Alineado a la izquierda para un look de app móvil */
    margin-top: 10px;
}

.logo-mobile :deep(img), 
.logo-mobile :deep(svg) {
    width: 120px !important; /* Tamaño más legible en móviles */
    height: auto;
}

/* Efecto Hover Premium solo en PC */
@media (min-width: 1264px) {
    .logo-pc:hover {
        transform: scale(1.05) rotate(-2deg);
    }
}

.mobile-sidebar {
    background: white !important;
    margin: 0 !important;
    height: 100vh !important;
}

/* Clases para el sidebar expandido en desktop */
.expanded-sidebar {
    width: 280px !important; /* Ancho completo */
    .logo-pc :deep(img),
    .logo-pc :deep(svg) {
        width: 120px !important; /* Logotipo más grande */
    }
    .menu-items-container {
        align-items: flex-start; /* Alinea los items a la izquierda */
        padding-left: 15px; /* Pequeño padding para el texto */
    }
    /* Asegúrate de que los subencabezados de los grupos sean visibles */
    :deep(.v-list-subheader) {
        opacity: 1 !important;
        visibility: visible !important;
        height: auto !important; /* Permite que el contenido tome la altura necesaria */
    }
}


/* --- SCROLL LOGIC --- */
.scroll-wrapper {
    position: relative;
    overflow: hidden;
}

.scroll-area {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: rgba(46, 236, 213, 0.2) transparent;
    padding: 0 10px;
    
    /* Efecto de máscara para intuición de scroll */
    mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
}

/* Estilo de barra para Chrome/Edge/Safari */
.scroll-area::-webkit-scrollbar {
    width: 4px;
}
.scroll-area::-webkit-scrollbar-thumb {
    background: rgba(46, 236, 213, 0.15);
    border-radius: 10px;
}
.scroll-area:hover::-webkit-scrollbar-thumb {
    background: rgba(46, 236, 213, 0.45);
}

/* Indicadores visuales */
.scroll-indicator {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 20;
    display: flex;
    justify-content: center;
    height: 35px;
    align-items: center;
    pointer-events: none;
}
.scroll-indicator.up { 
    top: 0; 
}
.scroll-indicator.down { 
    bottom: 0; 
}

/* Animaciones de íconos */
.icon-bounce { animation: bounceUp 2s infinite; }
.icon-bounce-reverse { animation: bounceDown 2s infinite; }

@keyframes bounceUp {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-4px); }
    60% { transform: translateY(-2px); }
}
@keyframes bounceDown {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(4px); }
    60% { transform: translateY(2px); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.menu-items-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    padding: 30px 0;
}

.section-dot {
    width: 6px;
    height: 6px;
    background: #2eced5;
    border-radius: 50%;
    margin: 20px auto 10px;
    opacity: 0.3;
}

.floating-group {
    backdrop-filter: blur(10px);
    border-radius: 16px;
}
</style>