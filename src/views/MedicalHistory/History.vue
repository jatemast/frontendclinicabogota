<template>
    <v-container v-if="history" class="pb-8 px-2 px-sm-4">
        
        <v-row class="mb-4">
            <v-col cols="12">
                <v-card elevation="0" rounded="xl" class="border-light bg-surface">
                    <v-card-text class="pa-4 pa-md-6">
                        <div class="d-flex flex-column flex-sm-row align-center text-center text-sm-left">
                            <v-avatar color="primary" size="64" class="mb-3 mb-sm-0 mr-sm-4 shadow-sm">
                                <v-icon color="white" size="32">mdi-account-details</v-icon>
                            </v-avatar>
                            <div class="flex-grow-1">
                                <h2 class="text-h5 text-md-h4 font-weight-bold mb-1">
                                    {{ history.tx_first_name }} {{ history.tx_last_name }}
                                </h2>
                                <div class="text-caption text-sm-subtitle-1 text-secondary d-flex flex-wrap justify-center justify-sm-start align-center">
                                    <v-chip size="x-small" color="primary" variant="flat" class="mr-2">#{{ history.tx_nro }}</v-chip>
                                    <span class="font-weight-bold">{{ history.tx_dni_type }}-{{ history.tx_dni }}</span>
                                    <v-divider vertical class="mx-2 d-none d-sm-inline"></v-divider>
                                    <v-icon start size="16" color="primary" class="ml-1">mdi-gender-male-female</v-icon> 
                                    {{ history.tx_biological_sex }}
                                </div>
                            </div>
                            <v-btn icon color="primary" variant="tonal" @click="router.back()" class="mt-4 mt-sm-0 ml-sm-4">
                                <v-icon>mdi-arrow-left</v-icon>
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-card v-if="hasAnyTabPermission" rounded="xl" elevation="0" class="border-light overflow-hidden">
            <v-tabs 
                v-model="activeTab" 
                color="primary" 
                align-tabs="start" 
                class="border-b px-2" 
                show-arrows
            >
                <v-tab v-if="hasPermission('Historia Clinica Resumen')" value="resumen" class="text-none">Resumen</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Antecedentes')" value="antecedentes" class="text-none">Antecedentes</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Examen')" value="examen" class="text-none">Examen</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Diagnostico')" value="plan" class="text-none">Plan Quirurgico</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Aptitud')" value="aptitud" class="text-none">Aptitud</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Habitos')" value="habitos" class="text-none">Hábitos</v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="pa-4 pa-md-6" transition="fade-transition" disabled="false">
                
                <v-window-item value="resumen" v-if="hasPermission('Historia Clinica Resumen')">
                    <v-form @submit.prevent="updateSection('resumen')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Motivo</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'resumen'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>
                        <v-textarea v-model="history.tx_motivo_consulta" label="Razón de la visita" variant="outlined" rows="3" rounded="lg" counter="250" persistent-counter density="comfortable"></v-textarea>
                        
                        <div class="text-overline text-primary mt-4 mb-2">Procedimientos vinculados</div>
                            <v-chip v-for="proc in history.procedures" :key="proc.id" class="me-2" color="success" variant="tonal" size="small" prepend-icon="mdi-needle">
                                {{ proc.tx_name }}
                            </v-chip>

                        <!-- ===== IMAGEN ANTES DEL PROCEDIMIENTO ===== -->
                        <v-divider class="my-4"></v-divider>
                        <div class="text-overline text-primary mb-2">
                            <v-icon start size="14">mdi-camera-before</v-icon> Foto ANTES del procedimiento
                        </div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <div v-if="history.tx_img_before" class="text-center">
                                    <v-img
                                        :src="history.tx_img_before"
                                        max-height="250"
                                        contain
                                        class="rounded-lg border mb-2"
                                    ></v-img>
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        :href="history.tx_img_before"
                                        target="_blank"
                                        prepend-icon="mdi-open-in-new"
                                    >Ver original</v-btn>
                                </div>
                                <div v-else class="text-center pa-6 bg-grey-lighten-4 rounded-lg">
                                    <v-icon size="48" color="grey-lighten-2">mdi-image-off</v-icon>
                                    <p class="text-caption text-grey mt-1">No hay foto registrada</p>
                                </div>
                            </v-col>
                        </v-row>

                        <!-- ===== IMAGEN DESPUÉS DEL PROCEDIMIENTO ===== -->
                        <v-divider class="my-4"></v-divider>
                        <div class="text-overline text-primary mb-2">
                            <v-icon start size="14">mdi-camera-after</v-icon> Foto DESPUÉS del procedimiento
                        </div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <div v-if="history.tx_img_after" class="text-center">
                                    <v-img
                                        :src="history.tx_img_after"
                                        max-height="250"
                                        contain
                                        class="rounded-lg border mb-2"
                                    ></v-img>
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        :href="history.tx_img_after"
                                        target="_blank"
                                        prepend-icon="mdi-open-in-new"
                                    >Ver original</v-btn>
                                </div>
                                <div v-else class="text-center pa-6 bg-grey-lighten-4 rounded-lg">
                                    <v-icon size="48" color="grey-lighten-2">mdi-image-plus</v-icon>
                                    <p class="text-caption text-grey mt-1">Aún no se ha registrado foto del después</p>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6" class="d-flex flex-column align-center justify-center">
                                <v-btn
                                    color="primary"
                                    variant="tonal"
                                    prepend-icon="mdi-camera-plus"
                                    @click="triggerAfterFileInput"
                                    block
                                    rounded="lg"
                                    class="mb-2"
                                >
                                    {{ afterFile ? 'Cambiar foto' : 'Subir foto del después' }}
                                </v-btn>
                                <input
                                    ref="afterFileInputRef"
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    style="display: none"
                                    @change="onAfterImageSelected"
                                />
                                <v-chip v-if="afterPreview" color="success" variant="tonal" size="small">
                                    <v-icon start>mdi-check-circle</v-icon> Nueva foto lista para guardar
                                </v-chip>
                            </v-col>
                        </v-row>
                        <!-- Preview de la nueva imagen después -->
                        <v-row v-if="afterPreview">
                            <v-col cols="12" class="text-center">
                                <v-img
                                    :src="afterPreview"
                                    max-height="200"
                                    contain
                                    class="rounded-lg border"
                                ></v-img>
                            </v-col>
                        </v-row>

                        <!-- ===== FIRMA DE CONSENTIMIENTO ===== -->
                        <v-divider class="my-4"></v-divider>
                        <div class="text-overline text-primary mb-2">
                            <v-icon start size="14">mdi-draw</v-icon> Firma de Consentimiento
                        </div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <div v-if="history.tx_signature" class="text-center">
                                    <v-img
                                        :src="history.tx_signature"
                                        max-height="150"
                                        contain
                                        class="rounded-lg border mb-2"
                                        style="background: #fafafa;"
                                    ></v-img>
                                    <v-chip color="success" variant="tonal" size="x-small">
                                        <v-icon start>mdi-check-circle</v-icon> Firma registrada
                                    </v-chip>
                                </div>
                                <div v-else class="text-center pa-6 bg-grey-lighten-4 rounded-lg">
                                    <v-icon size="48" color="grey-lighten-2">mdi-file-sign</v-icon>
                                    <p class="text-caption text-grey mt-1">Sin firma de consentimiento</p>
                                </div>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="antecedentes" v-if="hasPermission('Historia Clinica Antecedentes')">
                    <v-form @submit.prevent="updateSection('antecedentes')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Antecedentes</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'antecedentes'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <p class="text-overline mb-2 text-primary">Personales</p>
                                <v-text-field label="Enfermedades Crónicas" v-model="history.tx_enfermedad_cronica" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                <v-text-field label="Cirugías Previas" v-model="history.tx_cirugia_previa" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                <v-text-field label="Alergias" v-model="history.tx_alergia" variant="outlined" rounded="lg" color="error" density="comfortable"></v-text-field>
                                <v-text-field label="Medicación Actual" v-model="history.tx_medicacion_actual" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <p class="text-overline mb-2 text-primary">Familiares</p>
                                <v-text-field label="Enfermedades Heredadas" v-model="history.tx_enfermedades_heredadas" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                <v-text-field label="Complicación Anestésica" v-model="history.tx_complicacion_anestecica" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="examen" v-if="hasPermission('Historia Clinica Examen')">
                    <v-form @submit.prevent="updateSection('examen')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Examen Físico</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'examen'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>
                        <v-row >
                            <v-col cols="12" lg="4">
                                <v-text-field label="Peso" v-model="history.tx_peso" variant="outlined" :rules="[decimalNumber]" flat @input="calculateIMC" type="text" density="compact" suffix="kg"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="4">
                                <v-text-field label="Talla" v-model="history.tx_talla" variant="outlined" :rules="[onlyNumbers]" flat @input="calculateIMC" type="text" density="compact" suffix="cm"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="4">
                                <v-text-field label="IMC" v-model="history.tx_imc" variant="outlined" flat readonly bg-color="white" density="compact" class="text-primary font-weight-bold"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-textarea label="Examen General" v-model="history.tx_examen_general" variant="outlined" rounded="lg" rows="2" density="comfortable"></v-textarea>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-textarea label="Evaluación de Zona" v-model="history.tx_evaluacion_zona" variant="outlined" rounded="lg" rows="2" density="comfortable"></v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Hallazgos Relevantes" v-model="history.tx_hallazgo_relevante" variant="outlined" rounded="lg" prepend-inner-icon="mdi-magnify-scan" density="comfortable"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="plan" v-if="hasPermission('Historia Clinica Diagnostico')">
                    <v-form @submit.prevent="updateSection('plan')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Plan Quirúrgico</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'plan'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>

                        <v-row>
                            <v-col cols="12">
                                <CustomDatePicker 
                                    label="Fecha Tentativa de Cirugía" 
                                    v-model="history.date_tentativa" 
                                    variant="outlined" rounded="lg" density="comfortable"
                                    class="mb-2"
                                />
                            </v-col>

                            <v-col cols="12" md="7">
                                <div class="pa-4  rounded-lg  bg-white">
                                    <p class="text-overline mb-4 text-primary"><v-icon start size="18">mdi-clipboard-pulse</v-icon> Definición del Caso</p>

                                    <v-text-field label="Diagnóstico Principal" v-model="history.tx_diagnostico" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                    <v-text-field label="Diagnóstico Secundario" v-model="history.tx_diagnostico_secundario" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                    
                                    <v-textarea label="Riesgos Identificados" v-model="history.tx_riesgos" variant="outlined" rounded="lg" rows="2" color="warning" density="comfortable" prepend-inner-icon="mdi-alert-outline"></v-textarea>
                                </div>
                            </v-col>

                            <v-col cols="12" md="5">
                                <div class="pa-4  rounded-lg">
                                    <p class="text-overline mb-4 text-primary"><v-icon start size="18">mdi-needle</v-icon> Soporte Anestésico</p>
                                    
                                    <v-select 
                                        v-model="history.tx_anestecia" 
                                        label="Tipo de Anestesia" 
                                        :items="['Local', 'Local + Sedación', 'General', 'Regional', 'Epidural', 'TIVA']"
                                        variant="outlined" rounded="lg" density="comfortable"
                                    ></v-select>

                                    <v-text-field 
                                        label="Duración Estimada" 
                                        v-model="history.tx_duracion_anestecia" 
                                        variant="outlined" rounded="lg" 
                                        density="comfortable"
                                        placeholder="ej. 2 horas"
                                        prepend-inner-icon="mdi-clock-outline"
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12">
                                <div class="pa-4  rounded-lg bg-white">
                                    <p class="text-overline mb-2 text-primary"><v-icon start size="18">mdi-text-box-check-outline</v-icon> Indicaciones Pre-Quirúrgicas</p>
                                    <v-textarea 
                                        label="Recomendaciones para la cirugía" 
                                        v-model="history.tx_recomendaciones" 
                                        variant="outlined" rounded="lg" 
                                        rows="4" 
                                        density="comfortable"
                                        placeholder="Ayuno, medicación previa, etc."
                                    ></v-textarea>
                                </div>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="aptitud" v-if="hasPermission('Historia Clinica Aptitud')">
                    <v-form @submit.prevent="updateSection('aptitud')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Estado Final</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'aptitud'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12" sm="6" md="4">
                                <v-select v-model="history.tx_paciente_apto" label="¿Apto?" :items="['SI', 'NO', 'PENDIENTE']" variant="outlined" rounded="lg" density="comfortable"></v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-select v-model="history.in_valoracion_adicional" label="¿Valoración Extra?" :items="[{title: 'Si', value: '1'}, {title: 'No', value: '0'}]" variant="outlined" rounded="lg" density="comfortable"></v-select>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Especialidad" v-model="history.tx_especialidad" :disabled="history.in_valoracion_adicional == '0'" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea label="Observaciones" v-model="history.tx_observaciones" variant="outlined" rounded="lg" rows="2" density="comfortable"></v-textarea>
                                <v-textarea label="Notas Internas" v-model="history.tx_notas" variant="outlined" rounded="lg" rows="2" density="comfortable"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="habitos" v-if="hasPermission('Historia Clinica Habitos')">
                <div class="d-flex align-center justify-space-between mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Hábitos del Paciente</h3>
                </div>

                <v-row class="mb-4">
                    <v-col cols="12" md="12" lg="12">
                        <v-text-field
                            v-model="newHabit"
                            label="Nuevo hábito (ej. Fumador, Sedentarismo)"
                            variant="outlined"
                            rounded="lg"
                            density="comfortable"
                            hide-details
                            @keyup.enter="addHabit"
                        >
                            <template v-slot:append-inner>
                                <v-btn 
                                    color="primary" 
                                    variant="text" 
                                    icon="mdi-plus-circle" 
                                    :loading="savingHabit"
                                    @click="addHabit"
                                ></v-btn>
                            </template>
                        </v-text-field>
                    </v-col>
                </v-row>

                <v-divider class="mb-6"></v-divider>

                <div v-if="loadingHabits" class="text-center pa-10">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="text-caption mt-2">Cargando hábitos...</p>
                </div>

                <div v-else>
                    <v-row v-if="habits.length > 0">
                        <v-col v-for="habit in habits" :key="habit.id" cols="12" sm="6" md="4">
                            <v-card variant="outlined" class="border-light rounded-lg d-flex align-center pa-3">
                                <v-icon color="secondary" class="mr-3">mdi-check-circle-outline</v-icon>
                                <span class="flex-grow-1 font-weight-medium">{{ habit.tx_habit }}</span>
                                <v-btn 
                                    icon="mdi-delete-outline" 
                                    variant="text" 
                                    color="error" 
                                    size="small"
                                    @click="deleteHabit(habit.id)"
                                ></v-btn>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-sheet v-else border rounded="lg" class="pa-10 text-center bg-grey-lighten-4">
                        <v-icon size="48" color="grey-lighten-1">mdi-emoticon-neutral-outline</v-icon>
                        <p class="text-subtitle-1 text-grey-darken-1 mt-2">No hay hábitos registrados para este paciente.</p>
                    </v-sheet>
                </div>
            </v-window-item>

            </v-window>
            
        </v-card>

        <v-alert
            v-else
            type="primary"
            variant="tonal"
            rounded="xl"
            title="Acceso Restringido"
            text="No cuentas con los permisos necesarios para visualizar o editar ninguna sección de esta historia clínica. Contacta al administrador si crees que esto es un error."
            icon="mdi-shield-lock"
            class="mt-4"
        >
            <template v-slot:append>
                <v-btn variant="text" color="primary" @click="router.back()">Volver</v-btn>
            </template>
        </v-alert>
    </v-container>

    <v-container v-else class="fill-height">
        <v-row justify="center" align="center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import CustomDatePicker from '@/components/shared/AppDatePicker.vue';
import { required, email, onlyNumbers, notOnlySpaces, decimalNumber} from '@/utils/validators';

const route = useRoute();
const router = useRouter();
const { notify } = useNotification();

const activeTab = ref(null); // Empezamos en null para calcularla según permisos
const history = ref(null);
const saving = ref(null);
const permissions = ref([]);

const habits = ref([]);
const loadingHabits = ref(false);
const newHabit = ref('');
const savingHabit = ref(false);

// --- Imagen DESPUÉS ---
const afterFileInputRef = ref(null);
const afterFile = ref(null);
const afterPreview = ref('');

const triggerAfterFileInput = () => {
    afterFileInputRef.value?.click();
};

const onAfterImageSelected = (event) => {
    const target = event.target;
    if (target.files && target.files[0]) {
        afterFile.value = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            afterPreview.value = e.target?.result;
        };
        reader.readAsDataURL(target.files[0]);
    }
};

const uploadImageToImgbb = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}api/imgbb/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data?.success && response.data?.data?.url) {
            return response.data.data.url;
        }
        throw new Error(response.data?.message || 'Error al subir imagen');
    } catch (error) {
        console.error('Error uploading to ImgBB', error);
        throw error;
    }
};

// Mapeo de valores de tab a nombres de permisos de tu API
const tabPermissions = [
    { value: 'resumen', permission: 'Historia Clinica Resumen' },
    { value: 'antecedentes', permission: 'Historia Clinica Antecedentes' },
    { value: 'examen', permission: 'Historia Clinica Examen' },
    { value: 'plan', permission: 'Historia Clinica Diagnostico' },
    { value: 'aptitud', permission: 'Historia Clinica Aptitud' },
    { value: 'habitos', permission: 'Historia Clinica Habitos' },
];

watch(activeTab, (newVal) => {
    if (newVal === 'habitos' && habits.value.length === 0) {
        fetchHabits();
    }
});

onMounted(async () => {
    await fetchPermissions();
    await fetchHistory();
    setInitialTab();
});

const hasAnyTabPermission = computed(() => {
    return tabPermissions.some(t => hasPermission(t.permission));
});

const fetchPermissions = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/users/permissions/list`);
        if (response.data?.status) {
            permissions.value = response.data.data;
        }
    } catch (error) {
        console.error("Error cargando permisos", error);
    }
};

const hasPermission = (permissionName) => {
    return permissions.value.includes(permissionName);
};

// Establece la primera pestaña permitida como activa
const setInitialTab = () => {
    const firstAllowed = tabPermissions.find(t => hasPermission(t.permission));
    if (firstAllowed) {
        activeTab.value = firstAllowed.value;
    }
};

const fetchHistory = async () => {
    try {
        const id = route.params.id;
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/medicalhistory/get/${id}`);
        if (response.data?.status) {
            const data = response.data.data;
            
            if (data.tx_peso) {
                data.tx_peso = String(data.tx_peso).replace('.', ',');
            }
            
            history.value = data;
        }
    } catch (error) {
        notify('error', 'Error al cargar datos');
    }
};

const fetchHabits = async () => {
    loadingHabits.value = true;
    try {
        const id = route.params.id;
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/medicalhistory/habits/all/${id}`);
        if (response.data?.status) {
            habits.value = response.data.data;
        }
    } catch (error) {
        notify('error', 'Error al cargar hábitos');
    } finally {
        loadingHabits.value = false;
    }
};

const calculateIMC = () => {
    if (!history.value.tx_peso || !history.value.tx_talla) {
        history.value.tx_imc = null;
        return;
    }

    // Reemplazamos coma por punto por si el usuario usa teclado latino
    const pesoStr = String(history.value.tx_peso).replace(',', '.');
    const tallaStr = String(history.value.tx_talla).replace(',', '.');

    const peso = parseFloat(pesoStr);
    const talla = parseFloat(tallaStr) / 100; // Convertimos cm a metros

    if (peso > 0 && talla > 0) {
        // Fórmula: peso / (talla^2)
        const imc = (peso / (talla * talla)).toFixed(2);
        history.value.tx_imc = imc;
    } else {
        history.value.tx_imc = null;
    }
};

const updateSection = async (sectionName) => {
    saving.value = sectionName;
    try {
        // Si es la sección resumen y hay una nueva imagen "después", subirla primero
        if (sectionName === 'resumen' && afterFile.value) {
            try {
                const imgUrl = await uploadImageToImgbb(afterFile.value);
                history.value.tx_img_after = imgUrl;
                afterFile.value = null;
                afterPreview.value = '';
                // Resetear el input file
                if (afterFileInputRef.value) afterFileInputRef.value.value = '';
            } catch {
                notify('error', 'Error al subir la imagen del después. Intente de nuevo.');
                saving.value = null;
                return;
            }
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}medicalhistory/upd`, history.value);
        if (response.data.status) {
            notify('success', `Sección actualizada correctamente`);
        } else {
            notify('warning', response.data.msg || 'Error al actualizar');
        }
    } catch (error) {
        notify('error', 'Error de conexión');
    } finally {
        saving.value = null;
    }
};

const addHabit = async () => {
    if (!newHabit.value.trim()) return;
    savingHabit.value = true;
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}medicalhistory/habits/add`, {
            id_history: route.params.id,
            tx_habit: newHabit.value
        });

        if (response.data.status) {
            newHabit.value = '';
            await fetchHabits(); 
            notify('success', response.data.msg || 'Hábito agregado');
        }else{
            notify('error', response.data.msg || 'Error al agregar hábito');
        }

    } catch (error) {
        notify('error', 'Error al agregar hábito');
    } finally {
        savingHabit.value = false;
    }
};

const deleteHabit = async (id) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_API_URL}medicalhistory/habits/del/${id}`);
        if (response.data.status) {
            habits.value = habits.value.filter(h => h.id !== id);
            notify('success', response.data.msg || 'Hábito eliminado');
        }else{
            notify('error', response.data.msg || 'Error al eliminar hábito');
        }
    } catch (error) {
        notify('error', 'Error al eliminar');
    }
};
</script>

<style scoped>
.border-light { border: 1px solid rgba(0,0,0,0.08); }
.shadow-sm { box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important; }
.bg-blue-grey-lighten-5 { background-color: #f8fafb; }
.v-tab { min-width: 100px; }
</style>