<script setup lang="ts">
import Logo from '@/layouts/full/logo/LogoDark.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<template>
    <div class="login-wrapper d-flex align-center justify-center min-vh-100 py-8">
        <v-container fluid class="pa-0">
            <v-row class="d-flex justify-center align-center ma-0">
                <v-col cols="12" sm="8" md="5" lg="4" xl="3" class="d-flex align-center justify-center">
                    <v-card rounded="xl" elevation="0" class="login-card w-100 pa-2">
                        <v-card-item class="pa-6 pa-sm-8">
                            <div class="d-flex justify-center mb-6">
                                <Logo />
                            </div>

                            <LoginForm />
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<style scoped>
.login-wrapper {
    min-height: 100vh;
    background: radial-gradient(circle at 10% 20%, rgba(24, 182, 201, 0.06) 0%, rgba(247, 249, 252, 1) 90%);
}

.login-card {
    border-radius: 22px !important;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(16px);
    border: 1px solid #E5E7EB !important;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.05) !important;
}
</style>