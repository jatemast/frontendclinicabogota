<script setup lang="ts">
import { ref } from 'vue';
import CotyTable from '@/components/Coty/CotyTable.vue';

</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">

      <div class="d-flex justify-end align-center mb-4">
        <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'CotyAdd' }">
          Nueva Cotizacion
        </v-btn>

      </div>

      <CotyTable />

    </v-col>
  </v-row>
</template>

