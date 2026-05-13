<template>
  <v-row>
    <v-col cols="12">
      <div v-if="!ageGroupSelected" class="mb-6">
        <div class="text-h5 font-weight-bold mb-6 text-center">Registro de Cliente: Rango de Edad</div>
        <v-row justify="center">
          <v-col v-for="type in ageGroups" :key="type.value" cols="12" sm="4">
            <v-card 
              @click="selectAgeGroup(type.value)"
              class="type-card py-6 text-center cursor-pointer h-100"
              elevation="0"
            >
              <v-avatar size="80" :color="type.color" variant="tonal" class="mb-4">
                <v-icon size="40">{{ type.icon }}</v-icon>
              </v-avatar>
              <v-card-title class="justify-center font-weight-bold">{{ type.label }}</v-card-title>
              <v-card-subtitle>{{ type.description }}</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <UiParentCard v-else :title="`Nuevo Cliente: ${selectedAgeLabel}`">
        <template v-slot:action>
             <v-btn icon color="primary" variant="text" @click="ageGroupSelected = false">
                <v-icon>mdi-arrow-left</v-icon>
             </v-btn>
        </template>
        
        <v-card-text>
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
                <v-text-field label="Teléfono" v-model="form.tx_phone" :rules="[required, onlyNumbers, colombianPhone]" variant="outlined" maxlength="10">
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
              
              <v-col v-if="ageGroup === 'minor'" cols="12" sm="6" md="8">
                <v-text-field 
                  label="Nombre del Responsable / Acudiente" 
                  v-model="form.tx_responsible" 
                  :rules="[required]" 
                  variant="outlined" 
                  prepend-inner-icon="mdi-account-child-circle"
                  hint="Campo obligatorio para menores de edad"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="primary" :loading="isSubmitting" @click="submit" class="px-8"> 
            Guardar 
          </v-btn>
          <v-btn variant="text" color="error" @click="cancel"> Cancelar </v-btn>
        </v-card-actions>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import CustomDatePicker from '@/components/shared/AppDatePicker.vue'; // IMPORTANTE: Importar tu componente
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import { required, email, onlyNumbers, colombianPhone } from '@/utils/validators';

const router = useRouter();
const formRef = ref();
const isSubmitting = ref(false); 
const { notify } = useNotification();

const loadingLocations = ref(false);
const departments = ref<{ id: number; name: string }[]>([]);
const filteredCities = ref<string[]>([]);
const allCities = ref<any[]>([]);

const ageGroupSelected = ref(false);
const ageGroup = ref('');
const epsList = ref([]);

const ageGroups = [
  { value: 'minor', label: 'Menor de Edad', icon: 'mdi-human-child', color: 'orange', description: 'Pacientes de 0 a 17 años (Requiere responsable).' },
  { value: 'adult', label: 'Adulto', icon: 'mdi-human-male-female', color: 'indigo', description: 'Pacientes de 18 años en adelante.' }
];

const form = ref({
  tx_dni_type: '',
  tx_dni: '',
  tx_first_name: '',
  tx_last_name: '',
  tx_place_birth: '',
  date_birth: null, // Ahora inicia en null para el CustomDatePicker
  tx_biological_sex: '',
  tx_gender: '',
  tx_marital_status: '',
  tx_address: '',
  tx_city: '',
  tx_deparment: '',
  tx_phone: '',
  tx_email: '',
  tx_eps: null,
  tx_responsible: '',
  tx_emergency_contact: '',
  in_status: 1
});

const selectedAgeLabel = computed(() => ageGroups.find(a => a.value === ageGroup.value)?.label || '');

const selectAgeGroup = (group: string) => {
    ageGroup.value = group;
    if(group === 'adult') form.value.tx_responsible = '';
    ageGroupSelected.value = true;
};

onMounted(async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/eps/all`);
        epsList.value = res.data.data;
    } catch (error) {
        console.error("Error al cargar EPS", error);
    }

    try {
        loadingLocations.value = true;
        
        // Usamos la API de Colombia (es más rápida y no bloquea por CORS)
        const depRes = await fetch('https://api-colombia.com/api/v1/Department');
        const depData = await depRes.json();
        
        // Guardamos departamentos ordenados
        departments.value = depData.sort((a: any, b: any) => a.name.localeCompare(b.name));

        // Cargamos todas las ciudades de una vez para filtrar en memoria
        const cityRes = await fetch('https://api-colombia.com/api/v1/City');
        allCities.value = await cityRes.json();
        
    } catch (error) {
        console.error("Error cargando division política:", error);
        notify('error', 'No se pudo cargar la lista de ciudades');
    } finally {
        loadingLocations.value = false;
    }
});

const onDepartmentChange = (departmentName: string) => {
    form.value.tx_city = ''; 
    
    if (departmentName) {
        // Buscamos el ID del departamento seleccionado
        const dep = departments.value.find(d => d.name === departmentName);
        
        if (dep) {
            // Filtramos las ciudades que pertenezcan a ese ID de departamento
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
    if (!validationResult?.valid) {
        notify('warning', 'Complete todos los campos obligatorios');
        return;
    }

    isSubmitting.value = true;
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}customers/add`,
            form.value,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
            notify('success', response.data.msg || 'Cliente registrado exitosamente');
            router.push('/customers');
        } else {
            notify('error', response.data.msg);
        }
    } catch (error) {
        notify('error', 'Error en el servidor');
    } finally {
        isSubmitting.value = false;
    }
};

const cancel = () => router.back();
</script>

<style scoped>
.type-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  transition: all 0.3s ease;
}
.type-card:hover {
  transform: translateY(-5px);
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
}
.cursor-pointer { cursor: pointer; }
</style>