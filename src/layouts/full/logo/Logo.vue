<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import axios from 'axios';
import fallbackLogo from '@/assets/images/logos/logo.png';
import { API } from '@/api/endpoints';

const props = defineProps<{ isMini?: boolean }>();

const logoUrl = ref<string>(fallbackLogo);
const loading = ref(true);

const API_BASE = import.meta.env.VITE_API_URL;

onMounted(async () => {
  try {
    const res = await axios.get(API.BUSINESS.DETAILS);
    if (res.data?.status && res.data?.data) {
      const business = res.data.data;
      
      // Prioridad 1: URL completa devuelta por el backend (tx_logo_url)
      if (business.tx_logo_url) {
        logoUrl.value = business.tx_logo_url;
      }
      // Prioridad 2: tx_logo es una URL HTTP (ImgBB u otro hosting externo)
      else if (business.tx_logo && business.tx_logo.startsWith('http')) {
        logoUrl.value = business.tx_logo;
      }
      // Prioridad 3: tx_logo es un filename, construir URL local
      else if (business.tx_logo) {
        const idBusiness = localStorage.getItem('id_business') || '1';
        logoUrl.value = `${API_BASE}uploads/logos/${idBusiness}/${business.tx_logo}`;
      }
    }
  } catch (error) {
    console.warn('No se pudo cargar el logo del negocio, usando logo por defecto');
  } finally {
    loading.value = false;
  }
});
</script>
<template>
  <div class="logo">
    <RouterLink to="/dashboard">
      <img
        :src="logoUrl"
        alt="Logo"
        :style="isMini ? 'width: 100%; height: auto; max-height: 50px;' : 'width: 120%; height: 120px; object-fit: contain;'"
        @error="logoUrl = fallbackLogo"
      />
    </RouterLink>
  </div>
</template>
