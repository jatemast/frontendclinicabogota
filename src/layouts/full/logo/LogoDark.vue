<script setup lang="ts">
import { RouterLink } from 'vue-router';
import logo from '@/assets/images/logos/logo.png';
</script>
<template>
    <div class="logo " >
        <RouterLink to="/">
            <img :src="logo" alt="home" style="width: 200px; height: 200px;" />
        </RouterLink>
    </div>
</template>
