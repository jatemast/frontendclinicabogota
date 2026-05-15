<script setup lang="ts">
import { ref } from 'vue';
import MedicalHistoryTable from '@/components/MedicalHistory/MedicalHistoryTable.vue';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';

const { notify } = useNotification();
const API_BASE = import.meta.env.VITE_API_URL;

const searchDni = ref('');
const downloading = ref(false);
const showSearchDialog = ref(false);

async function downloadByDni() {
  const dni = searchDni.value.trim();
  if (!dni) {
    notify('warning', 'Ingrese un número de cédula');
    return;
  }

  downloading.value = true;
  try {
    const response = await axios.get(`${API_BASE}api/medicalhistory/download-by-dni/${dni}`);
    
    if (response.data?.status) {
      // Decodificar base64 y descargar
      const byteCharacters = atob(response.data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.data.filename || `historia_clinica_${dni}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notify('success', 'PDF descargado correctamente');
      showSearchDialog.value = false;
      searchDni.value = '';
    } else {
      notify('error', response.data?.msg || 'No se encontraron historias clínicas para esta cédula');
    }
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error?.message || 'Error al descargar el PDF';
    notify('error', msg);
  } finally {
    downloading.value = false;
  }
}

function openSearchDialog() {
  searchDni.value = '';
  showSearchDialog.value = true;
}
</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">

      <div class="d-flex justify-end align-center mb-4 ga-2">
        <v-btn
          color="secondary"
          prepend-icon="mdi-download-box"
          variant="tonal"
          @click="openSearchDialog"
        >
          Descargar Historias por Cédula
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'MedicalHistoryAdd' }">
          Iniciar Historia Clínica
        </v-btn>
      </div>

      <MedicalHistoryTable />

      <!-- Dialog para buscar por cédula y descargar -->
      <v-dialog v-model="showSearchDialog" max-width="450" persistent>
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center pa-4 pb-0">
            <v-icon start color="primary" size="28">mdi-download-box</v-icon>
            <span class="text-h6 font-weight-bold">Descargar Historias Clínicas</span>
            <v-spacer></v-spacer>
            <v-btn icon variant="text" size="small" @click="showSearchDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-4">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Ingrese el número de cédula del paciente para descargar un PDF con <strong>todas sus historias clínicas</strong>,
              incluyendo datos personales, antecedentes, exámenes, diagnósticos, procedimientos, imágenes y firma.
            </p>

            <v-text-field
              v-model="searchDni"
              label="Número de Cédula"
              placeholder="Ej: 12345678"
              prepend-inner-icon="mdi-card-account-details"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              hide-details
              autofocus
              @keyup.enter="downloadByDni"
              :disabled="downloading"
            ></v-text-field>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              color="grey-darken-1"
              @click="showSearchDialog = false"
              :disabled="downloading"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              :loading="downloading"
              :disabled="!searchDni.trim()"
              prepend-icon="mdi-download"
              @click="downloadByDni"
            >
              Descargar PDF
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-col>
  </v-row>
</template>

