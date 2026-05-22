import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
// @ts-ignore
// import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        // basicSsl(),
        vuetify({
            autoImport: true,
            styles: { configFile: 'src/scss/variables.scss' }
        })
    ],
    define: {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    },
    // CONFIGURACIÓN DE SERVIDOR PARA HTTPS Y RED LOCAL
    // server: {
    //     host: true, // Escuchar en 192.168.31.100
    //     https: true  // Habilitar el protocolo seguro
    // },
    base: "/",/*"/spike-vue-free/",*/
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {}
        }
    },
    optimizeDeps: {
        exclude: ['vuetify'],
        entries: ['./src/**/*.vue']
    },
    build: {
        rollupOptions: {
            treeshake: false
        }
    },
});
