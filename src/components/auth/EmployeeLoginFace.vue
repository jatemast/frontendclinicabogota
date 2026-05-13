<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import { useRouter, useRoute } from 'vue-router';
import { useNotification } from '@/utils/useNotification';
import sidebarItems from '@/layouts/full/vertical-sidebar/sidebarItem';

const router = useRouter();
const route = useRoute();
const { notify } = useNotification();

const userIdFromRoute = route.params.id;

const videoRef = ref<HTMLVideoElement | null>(null);
const isLoading = ref(true);
const statusMsg = ref('Loading AI models...');
const isCameraReady = ref(false);

 const API_BASE = import.meta.env.VITE_API_URL;

// 1. Cargar modelos al montar
onMounted(async () => {
    try {
        // Forzamos la ruta base de tu proyecto
        const MODEL_URL = '/aeiworkshop/models';
        
        console.log("Cargando modelos desde:", MODEL_URL);

        // Cargamos los modelos
        // Nota: face-api.js maneja internamente las peticiones a los .json
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        statusMsg.value = 'AI Ready. Align your face.';
        startVideo();
    } catch (err) {
        console.error("Error técnico de tensores:", err);
        notify('error', 'Model Data Corrupted. Please clear browser cache.');
        statusMsg.value = 'Data error. Redownload models.';
    }
});

// 2. Iniciar la cámara
const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then((stream) => {
            if (videoRef.value) {
                videoRef.value.srcObject = stream;
                isCameraReady.value = true;
                isLoading.value = false;
                statusMsg.value = 'Align your face in the circle';
                startDetection();
            }
        })
        .catch(err => {
            notify('error', 'Could not access camera');
            router.push('/login');
        });
};

// 3. Detección continua
// const startDetection = async () => {
//     if (!videoRef.value) return;

//     const interval = setInterval(async () => {
//         if (!videoRef.value || isLoading.value) return;
        
//         const detection = await faceapi.detectSingleFace(
//             videoRef.value, 
//             new faceapi.TinyFaceDetectorOptions()
//         ).withFaceLandmarks().withFaceDescriptor();

//         if (detection) {
//             // Pausamos el intervalo para evitar múltiples peticiones mientras procesamos
//             isLoading.value = true; 
//             statusMsg.value = "Processing Face ID...";

//             const descriptorArray = Array.from(detection.descriptor);

//             try {
//                 // Enviamos al backend. Nota: Aquí deberías saber qué usuario es 
//                 // (por ejemplo, si ya puso su correo en un paso previo)
//                 const res = await axios.post(`${API_BASE}login/face-check`, {
//                     descriptor: descriptorArray,
//                     idUser: 1 // Ajusta esto según tu lógica
//                 });

//                 if (res.data.action === 'registered') {
//                     notify('success', 'Face ID registered for the first time!');
//                     router.push('/login');
//                     clearInterval(interval);
//                 } else if (res.data.action === 'login_success') {
//                     notify('success', 'Identity verified. Welcome!');
//                     router.push('/tv');
//                     clearInterval(interval);
//                 } else {
//                     statusMsg.value = "Face not recognized. Try again.";
//                     isLoading.value = false;
//                 }
//             } catch (err) {
//                 console.error(err);
//                 statusMsg.value = "Error connecting to server.";
//                 isLoading.value = false;
//             }
//         }
//     }, 2000); // 2 segundos entre intentos para no saturar
// };

const finalizeLogin = async (responseData: any) => {
    // Guardar estado básico
    const expiration = Date.now() + responseData.expires_in * 1000;
    localStorage.setItem('token_expiration', expiration.toString());
    localStorage.setItem('is_logged_in', 'true');

    try {
        // Consultar permisos para decidir a dónde redirigir
        const permRes = await axios.get(`${API_BASE}api/users/permissions/list`);
        
        if (permRes.data.status && permRes.data.data.length > 0) {
            const userModules = permRes.data.data;
            
            // Suponiendo que sidebarItems está disponible en el scope
            const firstAllowed = sidebarItems.find(item => 
                !item.header && item.module && userModules.includes(item.module)
            );

            if (firstAllowed && firstAllowed.to) {
                router.push(firstAllowed.to);
                return;
            }
        }
    } catch (e) { 
        console.error("Error cargando permisos:", e); 
    }

    // Redirección por defecto si fallan los permisos
    router.push('/dashboard');
};

const startDetection = async () => {
    if (!videoRef.value) return;

    const interval = setInterval(async () => {
        if (!videoRef.value || isLoading.value) return;
        
        const detection = await faceapi.detectSingleFace(
            videoRef.value, 
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
            isLoading.value = true; 
            statusMsg.value = "Verifying Identity...";

            const descriptorArray = Array.from(detection.descriptor);

            try {
                const res = await axios.post(`${API_BASE}login/face-check`, {
                    descriptor: descriptorArray,
                    idUser: 21 
                });

                if (res.data.status) {
                    // Detenemos procesos visuales y de cámara inmediatamente
                    clearInterval(interval);
                    stopCamera();

                    if (res.data.action === 'registered') {
                        // CASO REGISTRO: Solo informar y mandarlo a loguearse
                        notify('success', 'Face ID registered! Please login to continue.');
                        router.push('/login');
                    } 
                    else if (res.data.action === 'login_success') {
                        // CASO LOGIN EXITOSO: Crear sesión real
                        notify('success', 'Identity verified. Welcome!');
                        await finalizeLogin(res.data);
                    }
                } else {
                    // Caso: Unrecognized o error de validación
                    statusMsg.value = res.data.msg || "Face not recognized. Try again.";
                    isLoading.value = false;
                    router.push('/');
                }
            } catch (err) {
                console.error(err);
                statusMsg.value = "Error connecting to server.";
                isLoading.value = false;
            }
        }
    }, 2000);
};

// Función auxiliar para detener la cámara limpiamente
const stopCamera = () => {
    if (videoRef.value?.srcObject) {
        const stream = videoRef.value.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
    }
};

onBeforeUnmount(() => {
    // Detener cámara al salir
    if (videoRef.value?.srcObject) {
        const stream = videoRef.value.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
    }
});
</script>

<template>
    <v-container class="fill-height d-flex flex-column align-center justify-center">
        <h2 class="text-h5 mb-4">{{ statusMsg }}</h2>
        
        <div class="video-container" :class="{ 'processing': isLoading }">
            <video 
                ref="videoRef" 
                autoplay 
                muted 
                playsinline
                class="face-video"
            ></video>
            <div class="face-overlay"></div>
        </div>

        <v-btn color="error" variant="text" class="mt-6" @click="router.back()">
            Cancel
        </v-btn>
    </v-container>
</template>

<style scoped>
.video-container {
    position: relative;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid #4bd08b;
    background: #000;
}
.face-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.face-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 0 100px rgba(0,0,0,0.2);
    pointer-events: none;
}

/* Añade esto a tu CSS */
.video-container.processing {
    border-color: #ff9800; /* Naranja mientras procesa */
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0px rgba(75, 208, 139, 0.4); }
    70% { box-shadow: 0 0 0 20px rgba(75, 208, 139, 0); }
    100% { box-shadow: 0 0 0 0px rgba(75, 208, 139, 0); }
}
</style>