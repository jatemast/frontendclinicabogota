<script setup lang="ts">
import { ref, onMounted, computed, useTemplateRef } from 'vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import sidebarItems from './vertical-sidebar/sidebarItem';
import NavGroup from './vertical-sidebar/NavGroup/index.vue';
import NavItem from './vertical-sidebar/NavItem/index.vue';
import Logo from './logo/Logo.vue';
import { Menu2Icon, ChevronUpIcon, ChevronDownIcon, LogoutIcon, UserIcon } from 'vue-tabler-icons';
import NotificationDD from './vertical-header/NotificationDD.vue';
import ProfileDD from './vertical-header/ProfileDD.vue';
import { userPermissions, refreshPermissions, can } from '@/utils/permissions';
import { useNotification } from '@/utils/useNotification';
import axios from 'axios';

const { lgAndUp } = useDisplay();
const router = useRouter();
const { notify } = useNotification();
const sDrawer = ref(true);
const railMode = ref(false); // Inicia expandido por defecto como LogicSurgi
const isLoading = ref(true);
const isImpersonating = ref(false);

const userName = computed(() => localStorage.getItem('user_display') || 'Usuario');
const userPhoto = computed(() => {
    const photo = localStorage.getItem('user_photo');
    return photo ? `${import.meta.env.VITE_API_URL}${photo}` : '';
});

const appBarTopOffset = computed(() => {
    return isImpersonating.value ? 48 : 0;
});
const appBarDynamicTop = computed(() => {
    return `calc(20px + ${appBarTopOffset.value}px)`;
});

const checkImpersonation = () => {
    isImpersonating.value = !!localStorage.getItem('master_token');
};

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
    setTimeout(checkScroll, 500);
});

const returnToMaster = () => {
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
    localStorage.setItem('id_business', '9999');
    window.location.href = '/';
};

const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (err) {
        console.warn('No se pudo cerrar sesión en el backend:', err);
    }
    localStorage.clear();
    notify('info', 'Sesión cerrada exitosamente');
    router.push('/');
};

const filteredMenu = computed(() => {
    const result = [];
    const items = sidebarItems;
    const isMaster = localStorage.getItem('is_master') === 'true';
    const historyPlural = localStorage.getItem('customer_type_plural') || 'Historias Clínicas';

    for (let i = 0; i < items.length; i++) {
        let item = { ...items[i] };
        
        if (item.masterOnly && !isMaster) continue;

        if (item.header) {
            if (item.header === 'Historias Clínicas') {
                item.header = historyPlural;
            }
            let hasVisibleChildren = false;
            for (let j = i + 1; j < items.length; j++) {
                const nextItem = items[j];
                if (nextItem.header) break;
                if (nextItem.masterOnly && !isMaster) continue;
                
                const isItemVisible = !nextItem.module || can(nextItem.module);
                if (isItemVisible) {
                    hasVisibleChildren = true;
                    break;
                }
            }
            if (hasVisibleChildren) result.push(item);
        } else {
            if (item.title === 'Historias Clínicas') {
                item.title = historyPlural;
            }
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
        :width="lgAndUp ? (railMode ? 90 : 260) : 260" 
        :class="[lgAndUp ? 'premium-sidebar-rail' : 'mobile-sidebar', { 'expanded-sidebar': lgAndUp && !railMode }]"
        elevation="0"
        :rail="lgAndUp && railMode"
    >
        <div class="d-flex flex-column h-100 py-5 px-3">
            <!-- Logo Section -->
            <div class="logo-wrapper mb-4 text-center">
                <Logo :is-mini="lgAndUp && railMode" />
            </div>

            <!-- Doctor / User Header Card (Style LogicSurgi) -->
            <div v-if="!railMode || !lgAndUp" class="user-sidebar-card mb-4 pa-3 d-flex align-center gap-3">
                <v-avatar size="42" color="primary" class="border">
                    <img v-if="userPhoto" :src="userPhoto" alt="User Photo" style="object-fit: cover; width: 100%; height: 100%;" />
                    <UserIcon v-else size="22" color="white" />
                </v-avatar>
                <div class="user-info text-truncate">
                    <h5 class="text-subtitle-2 font-weight-bold text-truncate text-primary mb-0">{{ userName }}</h5>
                    <span class="text-caption text-secondary font-weight-medium">Especialista / Admin</span>
                </div>
            </div>

            <v-divider class="mb-3 opacity-20"></v-divider>

            <!-- Scrollable Navigation Items -->
            <div class="scroll-wrapper flex-grow-1">
                <Transition name="fade">
                    <div v-if="lgAndUp && canScrollUp" class="scroll-indicator up">
                        <v-btn size="32" color="primary" variant="flat" class="text-primary icon-bounce">
                            <v-icon size="18">mdi-arrow-up</v-icon>
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
                                <v-list-subheader v-else class="text-uppercase text-caption font-weight-bold ml-2 text-primary">
                                    {{ item.header }}
                                </v-list-subheader>
                            </div>
                            
                            <NavItem v-else :item="item" :key="i" :is-mobile="!lgAndUp" :rail-mode="railMode" />
                        </template>
                    </div>
                </div>

                <Transition name="fade">
                    <div v-if="lgAndUp && canScrollDown" class="scroll-indicator down">
                        <v-btn size="32" color="primary" variant="flat" class="text-primary icon-bounce">
                            <v-icon size="18">mdi-arrow-down</v-icon>
                        </v-btn>
                    </div>
                </Transition>
            </div>

            <!-- Footer / Logout Section -->
            <div class="sidebar-footer pt-3 mt-auto border-top">
                <v-btn 
                    v-if="!railMode || !lgAndUp"
                    block 
                    variant="tonal" 
                    color="error" 
                    class="rounded-lg font-weight-semibold text-caption"
                    @click="handleLogout"
                >
                    <LogoutIcon size="16" class="mr-2" />
                    Cerrar sesión
                </v-btn>
                <v-btn
                    v-else
                    icon
                    variant="tonal"
                    color="error"
                    size="40"
                    class="mx-auto d-block rounded-lg"
                    @click="handleLogout"
                >
                    <LogoutIcon size="18" />
                </v-btn>
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
            <v-app-bar elevation="0" height="70" color="transparent" flat class="modern-app-bar"
                :style="{ top: appBarDynamicTop + ' !important' }"
            >
                <div class="d-flex align-center justify-space-between w-100 px-6">
                    <div class="d-flex align-center floating-group px-3 py-1">
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
                            class="text-muted ml-1"
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
                        <v-divider vertical inset class="mx-2 my-2"></v-divider>
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
    border-right: 1px solid rgb(var(--v-theme-borderColor)) !important;
    margin: 15px 0 15px 15px !important; 
    height: calc(100vh - 30px) !important;
    border-radius: 22px !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
    background: rgb(var(--v-theme-surface)) !important;
    overflow: hidden !important;
}

.logo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-pc {
    width: 100%;
    padding: 0 10px;
}

.logo-pc :deep(img), 
.logo-pc :deep(svg) {
    width: 48px !important;
    height: auto;
    object-fit: contain;
}

.logo-mobile {
    justify-content: center;
    margin-top: 10px;
}

.logo-mobile :deep(img), 
.logo-mobile :deep(svg) {
    width: 120px !important;
    height: auto;
}

@media (min-width: 1264px) {
    .logo-pc:hover {
        transform: scale(1.05);
    }
}

.mobile-sidebar {
    background: rgb(var(--v-theme-surface)) !important;
    margin: 0 !important;
    height: 100vh !important;
}

.expanded-sidebar {
    width: 280px !important;
    .logo-pc :deep(img),
    .logo-pc :deep(svg) {
        width: 120px !important;
    }
    .menu-items-container {
        align-items: flex-start;
        padding-left: 12px;
        padding-right: 12px;
    }
    :deep(.v-list-subheader) {
        opacity: 1 !important;
        visibility: visible !important;
        height: auto !important;
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
    scrollbar-width: thin;
    scrollbar-color: rgba(24, 182, 201, 0.25) transparent;
    padding: 0 10px;
    
    mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
}

.scroll-area::-webkit-scrollbar {
    width: 4px;
}
.scroll-area::-webkit-scrollbar-thumb {
    background: rgba(24, 182, 201, 0.2);
    border-radius: 10px;
}
.scroll-area:hover::-webkit-scrollbar-thumb {
    background: rgba(24, 182, 201, 0.5);
}

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
    gap: 8px;
    align-items: center;
    padding: 20px 0;
}

.section-dot {
    width: 6px;
    height: 6px;
    background: #18B6C9;
    border-radius: 50%;
    margin: 20px auto 10px;
    opacity: 0.3;
}

.floating-group {
    background: rgb(var(--v-theme-surface));
    backdrop-filter: blur(12px);
    border: 1px solid rgb(var(--v-theme-borderColor));
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border-radius: 16px;
}

.user-sidebar-card {
    background: rgb(var(--v-theme-bglight));
    border: 1px solid rgb(var(--v-theme-borderColor));
    border-radius: 16px;
}
</style>