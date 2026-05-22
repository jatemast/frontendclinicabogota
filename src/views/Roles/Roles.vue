<script setup lang="ts">
import { ref } from 'vue';
import RolTable from '@/components/Roles/RolTable.vue';
import { can } from '@/utils/permissions';

</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">

      <div class="d-flex justify-end align-center mb-4">
        <v-btn
          v-if="can('Modulo de Roles')"
          color="primary"
          prepend-icon="mdi-plus"
          :to="{ name: 'RolesAdd' }"
        >
          Nuevo Rol
        </v-btn>

      </div>

      <RolTable />

    </v-col>
  </v-row>
</template>

