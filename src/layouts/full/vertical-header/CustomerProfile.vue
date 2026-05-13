<script setup lang="ts">
import { UserIcon, MailIcon, ListCheckIcon } from 'vue-tabler-icons';
import { useRouter } from 'vue-router';
import { useNotification } from '@/utils/useNotification';
import axios from 'axios';

const router = useRouter();
const { notify } = useNotification();
const API_BASE = import.meta.env.VITE_API_URL;

const logout = async () => {

    try {
        await axios.post(`${API_BASE}customer/logout`);
    } catch (err) {
        console.warn('Could not log out in the backend:', err);
    }

  localStorage.removeItem('customer_token_expiration');

  notify('info', 'Session closed successfully');
  router.push('/customer/');
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
            <div class="pt-4 pb-4 px-5 text-center">
                <v-btn @click="logout" color="primary" variant="outlined" class="rounded-pill" block>Log out</v-btn>
            </div>
        </v-sheet>
    </v-menu>
</template>
