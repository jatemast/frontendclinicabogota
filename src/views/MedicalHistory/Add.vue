<template>
    <v-container :class="{ 'pb-16': step === 2 }">
        <v-row justify="center" class="mb-6">
            <v-col cols="12" md="12" class="text-center">
                <h2 class="text-h4 font-weight-bold mb-4">Iniciar Historia Clínica</h2>
                <v-progress-linear :model-value="(step / 2) * 100" color="primary" height="8" rounded></v-progress-linear>
                <div class="d-flex justify-space-between mt-2 text-caption font-weight-bold text-uppercase">
                    <span :class="step >= 1 ? 'text-primary' : 'text-grey'">1. Seleccionar Cotización</span>
                    <span :class="step >= 2 ? 'text-primary' : 'text-grey'">2. Motivo de Consulta</span>
                </div>
            </v-col>
        </v-row>

        <div v-if="step === 1">
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="searchCoty"
                        label="Buscar por Nro Cotización o Nombre de Paciente"
                        prepend-inner-icon="mdi-magnify"
                        variant="solo"
                        flat
                        bg-color="white"
                        class="shadow-soft mb-6"
                        rounded="lg"
                        hide-details
                    ></v-text-field>

                    <v-row v-if="loading">
                        <v-col cols="12" class="text-center pa-10">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </v-col>
                    </v-row>

                    <v-row v-else-if="filteredCotys.length > 0">
                        <v-col v-for="coty in filteredCotys" :key="coty.id" cols="12" sm="6" lg="4">
                            <v-card @click="selectCoty(coty)" class="coty-card pa-4" rounded="xl" elevation="0">
                                <div class="d-flex align-center">
                                    <v-avatar color="primary" size="54" class="mr-4 shadow-sm">
                                        <span class="text-caption font-weight-bold text-white">#{{ coty.tx_nro }}</span>
                                    </v-avatar>
                                    <div class="text-truncate">
                                        <div class="text-subtitle-1 font-weight-bold">{{ coty.tx_full_name }}</div>
                                        <div class="text-caption text-secondary">DNI: {{ coty.tx_dni }}</div>
                                    </div>
                                    <v-spacer></v-spacer>
                                    <v-icon color="primary">mdi-arrow-right-circle</v-icon>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </div>

        <div v-if="step === 2 && selectedCoty">
            <v-row justify="center">
                <v-col cols="12" md="12">
                    <UiParentCard title="Información Inicial de la Consulta">
                        <template v-slot:action>
                            <v-btn icon color="primary" variant="text" @click="step = 1"><v-icon>mdi-arrow-left</v-icon></v-btn>
                        </template>

                        <div class="selected-coty-info mb-6 pa-4 rounded-lg">
                            <div class="text-overline text-primary">Paciente Seleccionado</div>
                            <div class="text-h6 font-weight-bold">{{ selectedCoty.tx_full_name }}</div>
                            <div class="text-body-2">Cotización: <strong>#{{ selectedCoty.tx_nro }}</strong> | DNI: {{ selectedCoty.tx_dni }}</div>
                        </div>

                        <!-- DATOS DEL PROFESIONAL RESPONSABLE -->
                        <div v-if="doctorData" class="doctor-info-card mb-6 pa-4 rounded-lg">
                            <div class="d-flex align-center mb-3">
                                <v-avatar color="primary" size="40" class="mr-3">
                                    <v-icon color="white">mdi-doctor</v-icon>
                                </v-avatar>
                                <div>
                                    <div class="text-overline text-primary">Profesional Responsable</div>
                                    <div class="text-subtitle-1 font-weight-bold">{{ doctorData.tx_first_name }} {{ doctorData.tx_last_name }}</div>
                                </div>
                                <v-spacer></v-spacer>
                                <v-chip color="primary" variant="tonal" size="small" class="font-weight-bold">
                                    {{ doctorData.tx_user_type || 'Profesional' }}
                                </v-chip>
                            </div>
                            <v-divider class="mb-3"></v-divider>
                            <v-row dense>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey">Cédula Profesional</div>
                                    <div class="text-body-2 font-weight-medium">{{ doctorData.tx_document_id || '—' }}</div>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey">Registro Médico</div>
                                    <div class="text-body-2 font-weight-medium">{{ doctorData.tx_medical_registration || '—' }}</div>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey">Especialidad</div>
                                    <div class="text-body-2 font-weight-medium">{{ doctorData.tx_specialty || '—' }}</div>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey">Cargo / Rol</div>
                                    <div class="text-body-2 font-weight-medium">{{ doctorData.tx_user_type || '—' }}</div>
                                </v-col>
                            </v-row>
                            <!-- Firma del doctor -->
                            <div v-if="doctorData.tx_signature" class="mt-3 pt-3 border-top">
                                <div class="text-caption text-grey mb-1">Firma Digital</div>
                                <v-img
                                    :src="doctorData.tx_signature"
                                    max-height="50"
                                    max-width="200"
                                    contain
                                    class="rounded"
                                ></v-img>
                            </div>
                            <div v-else class="mt-3 pt-3 border-top">
                                <v-alert type="warning" variant="tonal" density="compact" rounded="lg" class="text-caption">
                                    <v-icon start>mdi-alert-circle</v-icon>
                                    El profesional aún no ha registrado su firma digital.
                                    <router-link to="/users" class="text-primary font-weight-bold">Ir a configuración</router-link>
                                </v-alert>
                            </div>
                        </div>

                        <!-- Procedimientos a realizar -->
                        <v-label class="font-weight-bold mb-2 text-primary text-uppercase">Procedimientos a realizar</v-label>
                        <div class="mb-4">
                            <div v-if="loadingProcedures" class="d-flex align-center pa-4">
                                <v-progress-circular indeterminate size="20" width="2" color="primary" class="mr-3"></v-progress-circular>
                                <span class="text-caption">Cargando procedimientos...</span>
                            </div>
                            
                            <v-chip
                                v-else-if="procedures.length > 0"
                                v-for="proc in procedures"
                                :key="proc.id"
                                color="success"
                                variant="tonal"
                                size="small"
                                class="me-2"
                                prepend-icon="mdi-needle"
                            >
                                {{ proc.tx_name }}
                            </v-chip>

                            <v-alert
                                v-else
                                type="warning"
                                variant="tonal"
                                density="compact"
                                rounded="lg"
                                class="text-caption"
                            >
                                Esta cotización no tiene procedimientos asignados.
                            </v-alert>
                        </div>

                        <!-- Imágenes ANTES del procedimiento estético -->
                        <v-divider class="mb-4"></v-divider>
                        <v-label class="font-weight-bold mb-3 text-primary text-uppercase">
                            <v-icon start>mdi-camera</v-icon> Fotos ANTES del procedimiento
                        </v-label>
                        <div class="mb-4">
                            <!-- Previews de imágenes ANTES -->
                            <v-row v-if="imagesBefore.length > 0" class="mb-3">
                                <v-col
                                    v-for="(img, idx) in imagesBefore"
                                    :key="'before-' + idx"
                                    cols="6" sm="4" md="3"
                                >
                                    <div class="image-preview-card">
                                        <v-img
                                            :src="img.preview"
                                            cover
                                            aspect-ratio="1"
                                            class="rounded-lg border"
                                        >
                                            <div class="image-overlay">
                                                <v-btn
                                                    icon="mdi-close-circle"
                                                    size="x-small"
                                                    color="error"
                                                    variant="flat"
                                                    @click="removeImageBefore(idx)"
                                                ></v-btn>
                                            </div>
                                        </v-img>
                                        <div class="text-caption text-center mt-1 text-grey">Antes #{{ idx + 1 }}</div>
                                    </div>
                                </v-col>
                            </v-row>
                            <!-- Botón para agregar más imágenes ANTES -->
                            <v-btn
                                color="primary"
                                variant="tonal"
                                prepend-icon="mdi-camera-plus"
                                @click="triggerFileInput('before')"
                                rounded="lg"
                                :block="imagesBefore.length === 0"
                            >
                                {{ imagesBefore.length > 0 ? 'Agregar otra foto ANTES' : 'Tomar o seleccionar foto ANTES' }}
                            </v-btn>
                            <input
                                ref="fileInputBeforeRef"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                style="display: none"
                                @change="onMultipleImagesSelected($event, 'before')"
                            />
                            <div v-if="imagesBefore.length === 0" class="text-caption text-grey text-center mt-2">
                                Ninguna foto seleccionada
                            </div>
                        </div>

                        <!-- Imágenes DESPUÉS del procedimiento estético -->
                        <v-divider class="mb-4"></v-divider>
                        <v-label class="font-weight-bold mb-3 text-primary text-uppercase">
                            <v-icon start>mdi-camera</v-icon> Fotos DESPUÉS del procedimiento
                        </v-label>
                        <div class="mb-4">
                            <!-- Previews de imágenes DESPUÉS -->
                            <v-row v-if="imagesAfter.length > 0" class="mb-3">
                                <v-col
                                    v-for="(img, idx) in imagesAfter"
                                    :key="'after-' + idx"
                                    cols="6" sm="4" md="3"
                                >
                                    <div class="image-preview-card">
                                        <v-img
                                            :src="img.preview"
                                            cover
                                            aspect-ratio="1"
                                            class="rounded-lg border"
                                        >
                                            <div class="image-overlay">
                                                <v-btn
                                                    icon="mdi-close-circle"
                                                    size="x-small"
                                                    color="error"
                                                    variant="flat"
                                                    @click="removeImageAfter(idx)"
                                                ></v-btn>
                                            </div>
                                        </v-img>
                                        <div class="text-caption text-center mt-1 text-grey">Después #{{ idx + 1 }}</div>
                                    </div>
                                </v-col>
                            </v-row>
                            <!-- Botón para agregar más imágenes DESPUÉS -->
                            <v-btn
                                color="secondary"
                                variant="tonal"
                                prepend-icon="mdi-image-plus"
                                @click="triggerFileInput('after')"
                                rounded="lg"
                                :block="imagesAfter.length === 0"
                            >
                                {{ imagesAfter.length > 0 ? 'Agregar otra foto DESPUÉS' : 'Tomar o seleccionar foto DESPUÉS' }}
                            </v-btn>
                            <input
                                ref="fileInputAfterRef"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                style="display: none"
                                @change="onMultipleImagesSelected($event, 'after')"
                            />
                            <div v-if="imagesAfter.length === 0" class="text-caption text-grey text-center mt-2">
                                Ninguna foto seleccionada
                            </div>
                        </div>

                        <!-- FIRMA DIGITAL -->
                        <v-divider class="mb-4"></v-divider>
                        <v-label class="font-weight-bold mb-2 text-primary text-uppercase">
                            <v-icon start>mdi-draw</v-icon> Firma de Consentimiento
                        </v-label>
                        <div class="mb-4">
                            <v-row>
                                <v-col cols="12" class="text-center">
                                    <div class="signature-container">
                                        <canvas
                                            ref="signatureCanvas"
                                            :width="canvasWidth"
                                            :height="canvasHeight"
                                            class="signature-canvas border rounded-lg"
                                            @mousedown="startSign"
                                            @mousemove="drawSign"
                                            @mouseup="endSign"
                                            @mouseleave="endSign"
                                            @touchstart.prevent="onTouchStart"
                                            @touchmove.prevent="onTouchMove"
                                            @touchend="onTouchEnd"
                                        ></canvas>
                                        <div v-if="!signatureDrawn" class="signature-placeholder">
                                            <v-icon size="40" color="grey-lighten-2">mdi-draw</v-icon>
                                            <p class="text-caption text-grey mt-1">Firme aquí usando el mouse o su dedo</p>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-center ga-2 mt-2">
                                        <v-btn
                                            size="small"
                                            color="error"
                                            variant="tonal"
                                            prepend-icon="mdi-eraser"
                                            @click="clearSignature"
                                        >
                                            Limpiar
                                        </v-btn>
                                        <v-btn
                                            v-if="signatureDrawn"
                                            size="small"
                                            color="success"
                                            variant="tonal"
                                            prepend-icon="mdi-check"
                                            @click="confirmSignature"
                                        >
                                            Confirmar firma
                                        </v-btn>
                                    </div>
                                    <v-chip v-if="signatureConfirmed" color="success" variant="tonal" size="small" class="mt-2">
                                        <v-icon start>mdi-check-circle</v-icon> Firma registrada
                                    </v-chip>
                                </v-col>
                            </v-row>
                        </div>

                        <!-- Motivo de Consulta -->
                        <v-divider class="mb-4"></v-divider>
                        <v-label class="font-weight-bold mb-2 text-primary text-uppercase">Motivo de Consulta</v-label>
                        <v-textarea
                            v-model="form.tx_motivo_consulta"
                            placeholder="Escriba aquí la razón principal..."
                            variant="outlined"
                            counter="1000"
                            maxlength="1000"
                            rows="4"
                            persistent-counter
                            class="modern-textarea"
                            rounded="lg"
                        ></v-textarea>

                        <v-btn 
                            block size="x-large" color="primary" 
                            class="mt-10 btn-gradient d-none d-md-flex" 
                            :loading="isSubmitting"
                            :disabled="!form.tx_motivo_consulta"
                            @click="submitHistory"
                        >
                            <v-icon start>mdi-content-save-check</v-icon>
                            CREAR HISTORIA MÉDICA
                        </v-btn>
                    </UiParentCard>
                </v-col>
            </v-row>
        </div>

        <!-- Overlay de progreso de subida -->
        <v-overlay
            v-model="showProgressOverlay"
            persistent
            contained
            class="align-center justify-center"
        >
            <v-card width="420" rounded="xl" class="pa-6 mx-4">
                <div class="text-center mb-4">
                    <v-icon size="48" color="primary" class="mb-2">{{ progressIcon }}</v-icon>
                    <h3 class="text-h6 font-weight-bold">{{ progressTitle }}</h3>
                    <p class="text-caption text-grey mt-1">{{ progressMessage }}</p>
                </div>

                <v-progress-linear
                    :model-value="uploadProgress"
                    color="primary"
                    height="10"
                    rounded
                    striped
                    class="mb-4"
                ></v-progress-linear>

                <div class="d-flex justify-space-between text-caption text-grey mb-2">
                    <span>{{ progressDetail }}</span>
                    <span class="font-weight-bold">{{ uploadProgress }}%</span>
                </div>

                <!-- Detalle de imágenes -->
                <div class="mt-2 text-caption text-grey">
                    <div v-if="totalImages > 0">
                        <v-icon start size="14">mdi-camera</v-icon>
                        {{ totalImages }} imagen(es) para subir
                    </div>
                </div>

                <div class="mt-4 text-center">
                    <v-chip color="primary" variant="tonal" size="small">
                        <v-icon start>mdi-clock-outline</v-icon>
                        No cierre esta ventana
                    </v-chip>
                </div>
            </v-card>
        </v-overlay>

        <v-footer v-if="step === 2 && !loading" app class="d-md-none pa-4 bg-white border-t">
            <v-btn block size="x-large" color="primary" class="btn-gradient" :loading="isSubmitting" :disabled="!form.tx_motivo_consulta" @click="submitHistory">
                <v-icon start>mdi-content-save-check</v-icon> CREAR HISTORIA MÉDICA
            </v-btn>
        </v-footer>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { API } from '@/api/endpoints';

const router = useRouter();
const { notify } = useNotification();

const step = ref(1);
const loading = ref(false);
const loadingProcedures = ref(false);
const isSubmitting = ref(false);

const cotys = ref<any[]>([]);
const procedures = ref<any[]>([]);
const searchCoty = ref('');
const selectedCoty = ref<any>(null);
const doctorData = ref<any>(null);

const form = ref({
    id_coty: '',
    tx_motivo_consulta: '',
    tx_img_before: [] as string[],
    tx_img_after: [] as string[],
    tx_signature: ''
});

// --- Imágenes ANTES y DESPUÉS (múltiples) ---
interface ImageEntry {
    file: File | null;
    preview: string;       // base64 para preview local
}
const fileInputBeforeRef = ref<HTMLInputElement | null>(null);
const fileInputAfterRef = ref<HTMLInputElement | null>(null);
const imagesBefore = ref<ImageEntry[]>([]);
const imagesAfter = ref<ImageEntry[]>([]);

const triggerFileInput = (type: 'before' | 'after') => {
    if (type === 'before') {
        fileInputBeforeRef.value?.click();
    } else {
        fileInputAfterRef.value?.click();
    }
};

const onMultipleImagesSelected = (event: Event, type: 'before' | 'after') => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        const targetArray = type === 'before' ? imagesBefore : imagesAfter;
        // Procesar cada archivo seleccionado
        Array.from(target.files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = e.target?.result as string;
                targetArray.value.push({ file, preview });
                // Actualizar el array en el form para envío
                if (type === 'before') {
                    form.value.tx_img_before.push(preview);
                } else {
                    form.value.tx_img_after.push(preview);
                }
            };
            reader.readAsDataURL(file);
        });
    }
    // Limpiar el input para permitir re-seleccionar los mismos archivos
    target.value = '';
};

const removeImageBefore = (idx: number) => {
    imagesBefore.value.splice(idx, 1);
    form.value.tx_img_before.splice(idx, 1);
};

const removeImageAfter = (idx: number) => {
    imagesAfter.value.splice(idx, 1);
    form.value.tx_img_after.splice(idx, 1);
};

// --- FIRMA DIGITAL ---
const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(500);
const canvasHeight = ref(200);
const isDrawing = ref(false);
const signatureDrawn = ref(false);
const signatureConfirmed = ref(false);
let canvasContext: CanvasRenderingContext2D | null = null;

const getCanvasPos = (e: MouseEvent | Touch) => {
    const canvas = signatureCanvas.value;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
};

const startSign = (e: MouseEvent) => {
    if (signatureConfirmed.value) return;
    isDrawing.value = true;
    signatureDrawn.value = true;
    const ctx = signatureCanvas.value?.getContext('2d');
    if (!ctx) return;
    canvasContext = ctx;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
};

const drawSign = (e: MouseEvent) => {
    if (!isDrawing.value || !canvasContext) return;
    const pos = getCanvasPos(e);
    canvasContext.lineWidth = 3;
    canvasContext.lineCap = 'round';
    canvasContext.strokeStyle = '#1a1a2e';
    canvasContext.lineTo(pos.x, pos.y);
    canvasContext.stroke();
};

const endSign = () => {
    isDrawing.value = false;
};

let lastTouchPos: { x: number; y: number } | null = null;

const onTouchStart = (e: TouchEvent) => {
    if (signatureConfirmed.value) return;
    isDrawing.value = true;
    signatureDrawn.value = true;
    const ctx = signatureCanvas.value?.getContext('2d');
    if (!ctx) return;
    canvasContext = ctx;
    const touch = e.touches[0];
    const pos = getCanvasPos(touch);
    lastTouchPos = pos;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
};

const onTouchMove = (e: TouchEvent) => {
    if (!isDrawing.value || !canvasContext) return;
    const touch = e.touches[0];
    const pos = getCanvasPos(touch);
    canvasContext.lineWidth = 3;
    canvasContext.lineCap = 'round';
    canvasContext.strokeStyle = '#1a1a2e';
    canvasContext.lineTo(pos.x, pos.y);
    canvasContext.stroke();
    lastTouchPos = pos;
};

const onTouchEnd = () => {
    isDrawing.value = false;
    lastTouchPos = null;
};

const clearSignature = () => {
    const canvas = signatureCanvas.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureDrawn.value = false;
    signatureConfirmed.value = false;
    form.value.tx_signature = '';
};

const confirmSignature = () => {
    if (!signatureDrawn.value) return;
    const canvas = signatureCanvas.value;
    if (!canvas) return;
    // Convertir a PNG base64
    form.value.tx_signature = canvas.toDataURL('image/png');
    signatureConfirmed.value = true;
    notify('success', 'Firma registrada correctamente');
};

// Ajustar canvas width según el ancho de pantalla
const updateCanvasWidth = () => {
    const container = signatureCanvas.value?.parentElement;
    if (container) {
        const w = Math.min(container.clientWidth - 32, 500);
        canvasWidth.value = w;
    }
};

// --- Cargar datos del doctor autenticado ---
const fetchDoctorData = async () => {
    try {
        const response = await axios.get(API.USERS.ME);
        if (response.data.status) {
            doctorData.value = response.data.data;
        }
    } catch (error) {
        console.error("Error al cargar datos del doctor", error);
    }
};

onMounted(() => {
    fetchCotys();
    fetchDoctorData();
    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateCanvasWidth);
});

// --- Funciones existentes ---
const fetchCotys = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/coty/all`);
        if (response.data.status) cotys.value = response.data.data;
    } catch (error) {
        notify('error', 'Error al cargar cotizaciones');
    } finally {
        loading.value = false;
    }
};

const selectCoty = async (coty: any) => {
    selectedCoty.value = coty;
    form.value.id_coty = coty.id;
    step.value = 2;
    window.scrollTo(0, 0);
    
    // Reiniciar imágenes y firma al seleccionar nueva cotización
    imagesBefore.value = [];
    imagesAfter.value = [];
    form.value.tx_img_before = [];
    form.value.tx_img_after = [];
    form.value.tx_signature = '';
    clearSignature();
    
    // Cargar procedimientos de esta cotización específica
    loadingProcedures.value = true;
    procedures.value = [];
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/coty/allprocedures/${coty.id}`);
        if (res.data.status) {
            procedures.value = res.data.data;
        }
    } catch (error) {
        console.error("Error cargando procedimientos", error);
    } finally {
        loadingProcedures.value = false;
    }
};

const filteredCotys = computed(() => {
    if (!searchCoty.value) return cotys.value;
    const search = searchCoty.value.toLowerCase();
    return cotys.value.filter(c => 
        c.tx_nro.includes(search) || 
        c.tx_full_name.toLowerCase().includes(search) || 
        c.tx_dni.includes(search)
    );
});

// --- Progreso de subida ---
const showProgressOverlay = ref(false);
const uploadProgress = ref(0);
const progressTitle = ref('Guardando...');
const progressMessage = ref('Preparando datos');
const progressDetail = ref('');
const progressIcon = ref('mdi-cloud-upload');
let progressInterval: ReturnType<typeof setInterval> | null = null;

const totalImages = computed(() => {
    return form.value.tx_img_before.length + form.value.tx_img_after.length;
});

const startProgressSimulation = () => {
    uploadProgress.value = 0;
    let phase = 0;
    
    progressInterval = setInterval(() => {
        uploadProgress.value += 1;
        
        if (uploadProgress.value <= 25) {
            progressTitle.value = 'Preparando datos...';
            progressMessage.value = 'Organizando información de la historia clínica';
            progressIcon.value = 'mdi-file-document-edit';
        } else if (uploadProgress.value <= 50) {
            progressTitle.value = 'Subiendo imágenes...';
            progressMessage.value = 'Cargando fotos ANTES y DESPUÉS al servidor';
            progressIcon.value = 'mdi-camera';
            progressDetail.value = `${totalImages.value} imagen(es) en proceso`;
        } else if (uploadProgress.value <= 75) {
            progressTitle.value = 'Procesando...';
            progressMessage.value = 'El servidor está almacenando las imágenes en ImgBB';
            progressIcon.value = 'mdi-cloud-sync';
        } else if (uploadProgress.value <= 90) {
            progressTitle.value = 'Finalizando...';
            progressMessage.value = 'Registrando historia clínica y firma digital';
            progressIcon.value = 'mdi-check-circle';
        }
        
        if (uploadProgress.value >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            progressInterval = null;
        }
    }, 120);
};

const completeProgress = () => {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    uploadProgress.value = 100;
    progressTitle.value = '¡Completado!';
    progressMessage.value = 'Historia clínica guardada exitosamente';
    progressIcon.value = 'mdi-check-circle';
    progressDetail.value = '';
};

const submitHistory = async () => {
    if (!form.value.tx_motivo_consulta) return;
    
    isSubmitting.value = true;
    showProgressOverlay.value = true;
    startProgressSimulation();
    
    try {
        // Construir el payload: enviar arrays de imágenes base64
        const payload: any = {
            id_coty: form.value.id_coty,
            tx_motivo_consulta: form.value.tx_motivo_consulta,
            tx_img_before: form.value.tx_img_before.length > 0 ? form.value.tx_img_before : undefined,
            tx_img_after: form.value.tx_img_after.length > 0 ? form.value.tx_img_after : undefined,
            tx_signature: form.value.tx_signature || undefined,
        };

        // Crear historia clínica (el backend sube las imágenes a ImgBB internamente)
        const response = await axios.post(`${import.meta.env.VITE_API_URL}medicalhistory/add`, payload);
        
        // Completar barra al 100%
        completeProgress();
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (response.data.status) {
            showProgressOverlay.value = false;
            notify('success', response.data.msg || response.data.data || 'Historia clínica creada exitosamente');
            setTimeout(() => {
                router.push('/medical-history');
            }, 800);
        } else {
            showProgressOverlay.value = false;
            notify('error', response.data.msg || response.data.data || 'Error al iniciar historia clínica');
        }
    } catch (error) {
        showProgressOverlay.value = false;
        notify('error', 'Error al guardar');
    } finally {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
        isSubmitting.value = false;
    }
};

// Limpiar intervalo al desmontar
onBeforeUnmount(() => {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
});
</script>

<style scoped>
.coty-card { border: 2px solid transparent; cursor: pointer; transition: all 0.2s ease;  }
.coty-card:hover { border-color: rgb(var(--v-theme-primary)); transform: translateY(-2px); }
.selected-coty-info { background: rgba(var(--v-theme-primary), 0.05); border-left: 4px solid rgb(var(--v-theme-primary)); }
.doctor-info-card { background: linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%); border: 1px solid #d0d5ff; border-left: 4px solid rgb(var(--v-theme-primary)); }
.doctor-info-card .border-top { border-top: 1px solid #e0e0e0; }
.btn-gradient { background: linear-gradient(45deg, rgb(var(--v-theme-primary)), #4db6ac) !important; color: white !important; }

.image-preview-card {
    position: relative;
}
.image-preview-card .image-overlay {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 1;
}

.signature-container {
    position: relative;
    display: inline-block;
    width: 100%;
    max-width: 500px;
}
.signature-canvas {
    width: 100%;
    height: 200px;
    border: 2px dashed #ccc;
    background: #fafafa;
    cursor: crosshair;
    touch-action: none;
}
.signature-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    text-align: center;
}
</style>
