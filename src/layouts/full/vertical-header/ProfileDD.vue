<script setup lang="ts">
import { UserIcon, MailIcon, ListCheckIcon } from 'vue-tabler-icons';
import { useRouter } from 'vue-router';
import { useNotification } from '@/utils/useNotification';
import axios from 'axios';

const router = useRouter();
const { notify } = useNotification();
const API_BASE = import.meta.env.VITE_API_URL;

const logout = async () => {
    const token = localStorage.getItem('token');

    try {
        await axios.post(`${API_BASE}logout`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
        });
    } catch (err) {
        console.warn('No se pudo cerrar sesión en el backend:', err);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('token_expiration');

    notify('info', 'Sesión cerrada exitosamente');
    router.push('/');
};
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn class="" variant="text" v-bind="props" icon>
                <v-avatar size="35">
                    <img src="@/assets/images/profile/user-1.jpg" height="35" alt="user" />
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="xl" width="200" elevation="10" class="mt-2">
            <!--<v-list class="py-0" lines="one" density="compact">
                <v-list-item value="item1" color="primary" >
                    <template v-slot:prepend>
                        <UserIcon stroke-width="1.5" size="20"/>
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Profile</v-list-item-title>
                </v-list-item>
                <v-list-item value="item2" color="primary">
                    <template v-slot:prepend>
                        <MailIcon stroke-width="1.5" size="20"/>
                    </template>
                    <v-list-item-title  class="pl-4 text-body-1">My Account</v-list-item-title>
                </v-list-item>
                <v-list-item value="item3" color="primary"> 
                    <template v-slot:prepend>
                        <ListCheckIcon stroke-width="1.5"  size="20"/>
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Task</v-list-item-title>
                </v-list-item>
            </v-list>-->
            <div class="pt-4 pb-4 px-5 text-center">
                <v-btn @click="logout" color="primary" variant="outlined" class="rounded-pill" block>Cerrar Sesión</v-btn>
            </div>
        </v-sheet>
    </v-menu>
</template>
