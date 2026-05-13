<script setup lang="ts">
import { ref } from 'vue';
import EpsTable from '@/components/Eps/EpsTable.vue';

const showAddUser = ref(false);
</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">

      <EpsTable />

    </v-col>
  </v-row>
</template>

