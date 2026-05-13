<script setup lang="ts">
import { ref } from 'vue';
import AccessLogsTable from '@/components/Users/AccessLogsTable.vue';

const showAddUser = ref(false);
</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">

      <AccessLogsTable />

    </v-col>
  </v-row>
</template>

