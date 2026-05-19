<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const { notify } = useNotification();
const loading = ref(false);
const tenants = ref([]);
const API_BASE = import.meta.env.VITE_API_URL;
const dialog = ref(false);

const form = ref({
    tx_name: '',
    tx_owner: '',
    tx_owner_email: '',
    tx_owner_phone: '',
    tx_address: '',
    date_validity: '',
    admin_password: '',
    tx_logo: null as File | null
});

const page = ref({ title: 'Empresas (Tenants)' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '/dashboard' },
    { text: 'SaaS Admin', disabled: true, href: '#' },
    { text: 'Empresas', disabled: true, href: '#' }
]);

const fetchTenants = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${API_BASE}api/saas/businesses`);
        if (response.data.status) {
            tenants.value = response.data.data;
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al cargar empresas');
    } finally {
        loading.value = false;
    }
};

const saveTenant = async () => {
    loading.value = true;
    try {
        const formData = new FormData();
        Object.keys(form.value).forEach(key => {
            const val = form.value[key as keyof typeof form.value];
            if (val !== null && val !== '') {
                if (key === 'tx_logo' && Array.isArray(val) && val.length > 0) {
                    formData.append(key, val[0]);
                } else if (key !== 'tx_logo') {
                    formData.append(key, val as string);
                }
            }
        });

        const response = await axios.post(`${API_BASE}api/saas/businesses`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.status) {
            notify('success', response.data.msg);
            dialog.value = false;
            fetchTenants();
            // reset form
            Object.keys(form.value).forEach(key => {
                if (key === 'tx_logo') {
                    form.value[key] = null;
                } else {
                    form.value[key as keyof typeof form.value] = '' as any;
                }
            });
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al guardar empresa');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchTenants();
});
</script>

<template>
    <div class="mb-4 text-h5 font-weight-bold">
        {{ page.title }}
    </div>

    <v-row>
        <v-col cols="12">
            <UiParentCard title="Lista de Clientes">
                <template v-slot:action>
                    <v-btn color="primary" @click="dialog = true">Nueva Empresa</v-btn>
                </template>

                <v-table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Empresa</th>
                            <th>Propietario</th>
                            <th>Email</th>
                            <th>Válido Hasta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tenant in tenants" :key="tenant.id">
                            <td>{{ tenant.id }}</td>
                            <td>{{ tenant.tx_name }}</td>
                            <td>{{ tenant.tx_owner }}</td>
                            <td>{{ tenant.tx_owner_email }}</td>
                            <td>{{ tenant.date_validity }}</td>
                            <td>
                                <!-- Botones de acción futuros -->
                                <v-btn size="small" color="primary" variant="text" icon="mdi-pencil"></v-btn>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </UiParentCard>
        </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="600">
        <v-card>
            <v-card-title>Registrar Nueva Empresa</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_name" label="Nombre de la Empresa" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_owner" label="Propietario" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_owner_email" label="Email Propietario" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.tx_owner_phone" label="Teléfono" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="form.tx_address" label="Dirección" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.date_validity" type="date" label="Válido Hasta" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.admin_password" label="Contraseña del Admin" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-file-input 
                            v-model="form.tx_logo" 
                            accept="image/png, image/jpeg, image/jpg" 
                            label="Logo de la Empresa (Opcional)" 
                            variant="outlined" 
                            prepend-icon="mdi-camera"
                            show-size
                        ></v-file-input>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="text" @click="dialog = false">Cancelar</v-btn>
                <v-btn color="primary" :loading="loading" @click="saveTenant">Guardar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
