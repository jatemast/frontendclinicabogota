<script setup lang="ts">
import { ref } from 'vue';
import CustomersTable from '@/components/Customers/CustomersTable.vue';

</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">

      <div class="d-flex justify-end align-center mb-4">
        <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'CustomersAdd' }">
          Nuevo Cliente
        </v-btn>

      </div>

      <CustomersTable />

    </v-col>
  </v-row>
</template>

