<script setup lang="ts">
import Logo from '@/layouts/full/logo/LogoDark.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<template>
    <div>
        <v-container fluid class="pa-0 mt-2">
            <v-row class="d-flex justify-center align-center" >
                <v-col cols="12" sm="8" md="6" lg="4" class="d-flex align-center">
                    <v-card rounded="xl" elevation="10" class="mx-auto" max-width="450" width="100%">
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