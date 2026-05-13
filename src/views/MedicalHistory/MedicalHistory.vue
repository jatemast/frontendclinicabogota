<script setup lang="ts">
import { ref } from 'vue';
import MedicalHistoryTable from '@/components/MedicalHistory/MedicalHistoryTable.vue';

</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">

      <div class="d-flex justify-end align-center mb-4">
        <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'MedicalHistoryAdd' }">
          Iniciar Historia Clínica
        </v-btn>

      </div>

      <MedicalHistoryTable />

    </v-col>
  </v-row>
</template>

