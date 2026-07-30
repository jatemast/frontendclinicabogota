<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import Logo from '@/layouts/full/logo/LogoDark.vue';
import LoginForm from '@/components/auth/LoginForm.vue';

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'DARK_THEME');

const toggleTheme = () => {
  const newTheme = isDark.value ? 'BLUE_THEME' : 'DARK_THEME';
  theme.global.name.value = newTheme;
  localStorage.setItem('theme', newTheme);
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.global.name.value = savedTheme;
  }
});
</script>

<template>
  <v-app :theme="theme.global.name.value" class="login-app-root">
    <div :class="['login-hero-container min-vh-100 d-flex flex-column justify-space-between position-relative overflow-hidden pa-4 pa-sm-6 pa-lg-8', isDark ? 'dark-mode' : 'light-mode']">
      
      <!-- DECORACIÓN AMBIENTAL DE FONDO -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>

      <!-- BARRA SUPERIOR CON BOTÓN DE TEMA (SOL / LUNA) -->
      <div class="d-flex align-center justify-space-between w-100 z-index-10 no-print mb-4">
        <div class="d-flex align-center gap-2">
          <v-avatar color="primary" size="38" rounded="lg" class="elevation-2">
            <v-icon color="white" size="22">mdi-medical-bag</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black text-primary letter-spacing-1">LogicSurgi</span>
        </div>

        <v-btn
          variant="flat"
          :color="isDark ? 'amber-darken-1' : 'primary'"
          size="medium"
          rounded="pill"
          class="theme-toggle-btn font-weight-bold px-4 elevation-3"
          @click="toggleTheme"
        >
          <v-icon start size="18">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
          <span class="d-none d-sm-inline">{{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}</span>
        </v-btn>
      </div>

      <!-- TARJETA PRINCIPAL RESPONSIVA DE LUJO SIN TEXTOS DE MARKETING -->
      <v-container fluid class="pa-0 my-auto z-index-10">
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="12" lg="9" xl="7">
            <v-card rounded="24" elevation="0" class="login-main-card border overflow-hidden">
              <v-row no-gutters>
                <!-- PANEL IZQUIERDO: BANNER VISUAL ESTÉTICO (SIN TEXTOS DE MÁS) -->
                <v-col cols="12" md="6" class="visual-brand-panel d-none d-md-flex position-relative">
                  <div class="visual-bg-image"></div>
                  <div class="visual-gradient-overlay d-flex flex-column justify-space-between h-100 pa-8">
                    <!-- TOP BRAND BADGE -->
                    <div class="d-flex align-center gap-3">
                      <div class="brand-glass-circle pa-2 rounded-circle">
                        <v-icon color="#FFFFFF" size="24">mdi-shield-cross-outline</v-icon>
                      </div>
                      <span class="text-subtitle-1 font-weight-black text-white letter-spacing-1">LogicSurgi</span>
                    </div>

                    <!-- FOOTER BADGE DE SEGURIDAD VISUAL -->
                    <div class="glass-info-badge pa-4 rounded-xl">
                      <div class="d-flex align-center gap-3">
                        <v-avatar color="rgba(24, 182, 201, 0.3)" size="42" rounded="lg">
                          <v-icon color="#18B6C9" size="24">mdi-shield-check</v-icon>
                        </v-avatar>
                        <div>
                          <p class="text-subtitle-2 font-weight-bold text-white mb-0">Plataforma Médica Cifrada</p>
                          <p class="text-caption text-grey-lighten-2 mb-0">Seguridad & Cumplimiento SSL 256-bit</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-col>

                <!-- PANEL DERECHO: FORMULARIO LIMPIO DE ACCESO -->
                <v-col cols="12" md="6" class="form-panel pa-6 pa-sm-10 pa-lg-12 bg-surface d-flex flex-column justify-center">
                  <div class="w-100 max-width-form mx-auto">
                    <!-- LOGO INSTITUCIONAL -->
                    <div class="d-flex justify-center mb-6 logo-container">
                      <Logo />
                    </div>

                    <!-- FORMULARIO LOGIN -->
                    <LoginForm />
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- FOOTER GENERAL -->
      <div class="text-center py-2 no-print z-index-10">
        <p class="text-caption text-secondary font-weight-medium mb-0">
          © 2026 LogicSurgi • Plataforma Médica Multitenant
        </p>
      </div>
    </div>
  </v-app>
</template>

<style scoped>
.login-hero-container {
  transition: all 0.4s ease;
}

/* FONDOS DINÁMICOS MODO CLARO & OSCURO */
.light-mode {
  background: radial-gradient(circle at 10% 20%, rgba(24, 182, 201, 0.15) 0%, rgba(244, 246, 249, 1) 80%) !important;
}

.dark-mode {
  background: radial-gradient(circle at 10% 20%, rgba(24, 182, 201, 0.12) 0%, #0B1120 80%) !important;
}

/* ORBES AMBIENTALES GLOW */
.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 1;
}

.glow-1 {
  top: -80px;
  left: -80px;
  width: 400px;
  height: 400px;
  background: rgba(24, 182, 201, 0.2);
}

.glow-2 {
  bottom: -100px;
  right: -100px;
  width: 450px;
  height: 450px;
  background: rgba(15, 118, 110, 0.15);
}

/* TARJETA PRINCIPAL */
.login-main-card {
  border-radius: 28px !important;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgb(var(--v-theme-borderColor)) !important;
  backdrop-filter: blur(20px);
}

/* PANEL VISUAL ESTÉTICO (IZQUIERDA) */
.visual-brand-panel {
  min-height: 480px;
  overflow: hidden;
}

.visual-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/aesthetic_procedure.png') center/cover no-repeat;
  filter: brightness(0.85);
  transition: transform 0.6s ease;
}

.visual-brand-panel:hover .visual-bg-image {
  transform: scale(1.04);
}

.visual-gradient-overlay {
  position: relative;
  z-index: 2;
  background: linear-gradient(180deg, rgba(11, 17, 32, 0.4) 0%, rgba(11, 17, 32, 0.85) 100%);
}

.brand-glass-circle {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-info-badge {
  background: rgba(11, 17, 32, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.max-width-form {
  max-width: 380px;
}

.z-index-10 {
  z-index: 10;
}

.logo-container img {
  max-width: 170px !important;
  height: auto !important;
  filter: drop-shadow(0 4px 10px rgba(24, 182, 201, 0.15));
}
</style>