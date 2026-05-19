<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const { notify } = useNotification();
const loading = ref(false);
const API_BASE = import.meta.env.VITE_API_URL;
const dialog = ref(false);

const form = ref({
    tx_first_name: '',
    tx_last_name: '',
    tx_email: '',
    tx_password: ''
});

const page = ref({ title: 'Gestión de Masters' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '/dashboard' },
    { text: 'SaaS Admin', disabled: true, href: '#' },
    { text: 'Masters', disabled: true, href: '#' }
]);

const saveMaster = async () => {
    loading.value = true;
    try {
        const response = await axios.post(`${API_BASE}api/saas/master`, form.value);
        if (response.data.status) {
            notify('success', response.data.msg);
            dialog.value = false;
            // reset form
            Object.keys(form.value).forEach(key => form.value[key as keyof typeof form.value] = '');
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al crear usuario master');
    } finally {
        loading.value = false;
    }
};

</script>

<template>
    <div class="mb-4 text-h5 font-weight-bold">
        {{ page.title }}
    </div>

    <v-row>
        <v-col cols="12">
            <UiParentCard title="Usuarios SuperAdmin (Master)">
                <template v-slot:action>
                    <v-btn color="primary" @click="dialog = true">Nuevo Master</v-btn>
                </template>

                <div class="text-center pa-5">
                    <p class="text-secondary">Los usuarios creados aquí tendrán acceso absoluto al panel de administración SaaS.</p>
                </div>
            </UiParentCard>
        </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
        <v-card>
            <v-card-title>Crear Nuevo Master</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_first_name" label="Nombre" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_last_name" label="Apellido" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="form.tx_email" label="Correo Electrónico" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="form.tx_password" type="password" label="Contraseña" variant="outlined"></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="text" @click="dialog = false">Cancelar</v-btn>
                <v-btn color="primary" :loading="loading" @click="saveMaster">Crear</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
