<template>
  <v-row>
    <v-col cols="12">
      <UiParentCard :title="`Editar Cliente: ${form.tx_first_name} ${form.tx_last_name}`" :loading="loadingData">
        <template v-slot:action>
             <v-btn icon color="primary" variant="text" @click="cancel">
                <v-icon>mdi-arrow-left</v-icon>
             </v-btn>
        </template>
        
        <v-card-text v-if="!loadingData">
          <v-form ref="formRef" @submit.prevent="submit">
            
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center">
              <v-icon start size="20">mdi-card-account-details-outline</v-icon> Identificación y Nombres
            </div>
            <v-row class="mb-2">
              <v-col cols="12" sm="6" md="2">
                <v-select
                  label="Tipo DNI"
                  v-model="form.tx_dni_type"
                  :items="['CC', 'TI', 'RC', 'CE', 'PA']"
                  :rules="[required]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6" md="2">
                <v-text-field label="Número DNI" v-model="form.tx_dni" :rules="[required, onlyNumbers]" variant="outlined" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="Nombres" v-model="form.tx_first_name" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="Apellidos" v-model="form.tx_last_name" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-account-outline" />
              </v-col>
            </v-row>

            <v-divider class="my-6"></v-divider>
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center">
              <v-icon start size="20">mdi-map-marker-outline</v-icon> Datos Demográficos
            </div>
            <v-row class="mb-2">
              <v-col cols="12" sm="6" md="3">
                <CustomDatePicker 
                  label="Fecha de Nacimiento" 
                  v-model="form.date_birth" 
                  :rules="[required]"
                  icon="mdi-calendar"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field label="Lugar de Nacimiento" v-model="form.tx_place_birth" :rules="[required]" variant="outlined" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select label="Sexo Biológico" v-model="form.tx_biological_sex" :items="['Masculino', 'Femenino', 'Intersexual']" :rules="[required]" variant="outlined" />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select label="Estado Civil" v-model="form.tx_marital_status" :items="['Soltero/a', 'Casado/a', 'Unión Libre', 'Divorciado/a', 'Viudo/a']" :rules="[required]" variant="outlined" />
              </v-col>
            </v-row>

            <v-divider class="my-6"></v-divider>
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center">
              <v-icon start size="20">mdi-phone-outline</v-icon> Ubicación y Contacto
            </div>
            <v-row class="mb-2">
                <v-col cols="12" sm="6" md="3">
                    <v-autocomplete
                    label="Departamento"
                    v-model="form.tx_deparment"
                    :items="departments"
                    item-title="name"
                    item-value="name"
                    :loading="loadingLocations"
                    :rules="[required]"
                    variant="outlined"
                    density="comfortable"
                    @update:model-value="onDepartmentChange"
                    />
                </v-col>

                <v-col cols="12" sm="6" md="3">
                    <v-autocomplete
                    label="Ciudad"
                    v-model="form.tx_city"
                    :items="filteredCities"
                    :disabled="!form.tx_deparment"
                    :loading="loadingLocations"
                    :rules="[required]"
                    variant="outlined"
                    density="comfortable"
                    />
                </v-col>

              <v-col cols="12" sm="6" md="6">
                <v-text-field label="Dirección" v-model="form.tx_address" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-home-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="Correo Electrónico" v-model="form.tx_email" :rules="[required, email]" variant="outlined" prepend-inner-icon="mdi-email-outline" />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="Teléfono" v-model="form.tx_phone" :rules="[required, onlyNumbers]" variant="outlined" maxlength="10">
                  <template v-slot:prepend-inner>
                    <div class="d-flex align-center mr-2"><v-img src="https://flagcdn.com/w20/co.png" width="20" class="mr-1"></v-img>+57</div>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="Contacto Emergencia" v-model="form.tx_emergency_contact" :rules="[required]" variant="outlined" prepend-inner-icon="mdi-alert-circle-outline" />
              </v-col>
            </v-row>

            <v-divider class="my-6"></v-divider>
            <div class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center">
              <v-icon start size="20">mdi-hospital-building</v-icon> Seguridad Social y Otros
            </div>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-autocomplete
                  label="EPS"
                  v-model="form.tx_eps"
                  :items="epsList"
                  item-title="tx_name"
                  item-value="tx_name"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-shield-check-outline"
                />
              </v-col>
              
              <v-col v-if="isMinor" cols="12" sm="6" md="4">
                <v-text-field 
                  label="Nombre del Responsable / Acudiente" 
                  v-model="form.tx_responsible" 
                  :rules="[required]" 
                  variant="outlined" 
                  density="comfortable"
                  prepend-inner-icon="mdi-account-child-circle"
                  hint="Campo obligatorio para menores de edad"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-select
                  label="Estado del Cliente"
                  v-model="form.in_status"
                  :items="[{title: 'Activo', value: '1'}, {title: 'Inactivo', value: '0'}]"
                  :rules="[required]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions v-if="!loadingData">
          <v-spacer />
          <v-btn variant="text" color="primary" :loading="isSubmitting" @click="submit" class="px-8"> 
            Actualizar 
          </v-btn>
          <v-btn variant="text" color="error" @click="cancel"> Cancelar </v-btn>
        </v-card-actions>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import CustomDatePicker from '@/components/shared/AppDatePicker.vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { required, email, onlyNumbers } from '@/utils/validators';

const router = useRouter();
const route = useRoute();
const { notify } = useNotification();
const formRef = ref();

const isSubmitting = ref(false);
const loadingData = ref(true);
const loadingLocations = ref(false);

const departments = ref<{ id: number; name: string }[]>([]);
const filteredCities = ref<string[]>([]);
const allCities = ref<any[]>([]);
const epsList = ref([]);

const form = ref({
  tx_dni_type: '',
  tx_dni: '',
  tx_first_name: '',
  tx_last_name: '',
  tx_place_birth: '',
  date_birth: null,
  tx_biological_sex: '',
  tx_marital_status: '',
  tx_address: '',
  tx_city: '',
  tx_deparment: '',
  tx_phone: '',
  tx_email: '',
  tx_eps: null,
  tx_responsible: '',
  tx_emergency_contact: '',
  in_status: '1'
});

// Lógica para mostrar campo responsable si es TI o RC
const isMinor = computed(() => ['TI', 'RC'].includes(form.value.tx_dni_type));

onMounted(async () => {
    const customerId = route.params.id;
    await fetchInitialData();
    await fetchCustomerData(customerId);
});

const fetchInitialData = async () => {
    try {
        // Cargar EPS
        const resEps = await axios.get(`${import.meta.env.VITE_API_URL}api/eps/all`);
        epsList.value = resEps.data.data;

        // Cargar Division Política
        loadingLocations.value = true;
        const depRes = await fetch('https://api-colombia.com/api/v1/Department');
        const depData = await depRes.json();
        departments.value = depData.sort((a: any, b: any) => a.name.localeCompare(b.name));

        const cityRes = await fetch('https://api-colombia.com/api/v1/City');
        allCities.value = await cityRes.json();
    } catch (error) {
        notify('error', 'Error al cargar datos iniciales');
    } finally {
        loadingLocations.value = false;
    }
};

const fetchCustomerData = async (id: any) => {
    try {
        loadingData.value = true;
        const response = await axios.get(`${import.meta.env.VITE_API_URL}customers/edt/${id}`);
        
        if (response.data.status) {
            const d = response.data.data;
            
            // Limpiamos el prefijo +57 si existe para que el validador de 10 dígitos no falle
            const cleanPhone = d.tx_phone ? d.tx_phone.replace('+57', '') : '';

            form.value = {
                ...d,
                tx_phone: cleanPhone
            };

            // Disparar el filtrado de ciudades una vez cargado el departamento
            if (form.value.tx_deparment) {
                onDepartmentChange(form.value.tx_deparment);
                // Forzamos que la ciudad se mantenga (onDepartmentChange la limpia)
                form.value.tx_city = d.tx_city;
            }
        }
    } catch (error) {
        notify('error', 'No se pudo obtener la información del cliente');
        router.back();
    } finally {
        loadingData.value = false;
    }
};

const onDepartmentChange = (departmentName: string) => {
    form.value.tx_city = ''; 
    if (departmentName) {
        const dep = departments.value.find(d => d.name === departmentName);
        if (dep) {
            filteredCities.value = allCities.value
                .filter(c => c.departmentId === dep.id)
                .map(c => c.name)
                .sort();
        }
    } else {
        filteredCities.value = [];
    }
};

const submit = async () => {
    const validationResult = await formRef.value?.validate();
    if (!validationResult?.valid) return;

    isSubmitting.value = true;
    try {
        const customerId = route.params.id;
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}customers/upd/${customerId}`,
            form.value
        );

        if (response.data.status) {
            notify('success', response.data.msg || 'Cliente actualizado exitosamente');
            router.push('/customers');
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error al actualizar el cliente');
    } finally {
        isSubmitting.value = false;
    }
};

const cancel = () => router.back();
</script>