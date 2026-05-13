<script setup lang="ts">
import { RouterLink } from 'vue-router';
import logo from '@/assets/images/logos/logo.png';
</script>
<template>
  <div class="logo " >
        <RouterLink to="/dashboard">
            <img :src="logo" alt="home" style="width: 120%; height: 120px" />
        </RouterLink>
    </div>
</template>
