<script setup lang="ts">
import { ref } from 'vue';
import UserTable from '@/components/Users/UserTable.vue';
import { can } from '@/utils/permissions';

const showAddUser = ref(false);
</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">

      <div class="d-flex justify-end align-center mb-4 ">
        <v-btn
          v-if="can('Crear Usuario')"
          color="primary"
          prepend-icon="mdi-plus"
          :to="{ name: 'UsersAdd' }"
        >
          Nuevo Usuario
        </v-btn>

      </div>

      <UserTable />

    </v-col>
  </v-row>
</template>

