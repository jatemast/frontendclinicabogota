<template>
    <div>
    <v-container v-if="history" class="pb-8 px-2 px-sm-4">
        
        <v-row class="mb-4">
            <v-col cols="12">
                <v-card elevation="0" rounded="xl" class="border-light bg-surface">
                    <v-card-text class="pa-4 pa-md-6">
                        <div class="d-flex flex-column flex-sm-row align-center text-center text-sm-left">
                            <v-avatar color="primary" size="64" class="mb-3 mb-sm-0 mr-sm-4 shadow-sm">
                                <v-icon color="white" size="32">mdi-account-details</v-icon>
                            </v-avatar>
                            <div class="flex-grow-1">
                                <h2 class="text-h5 text-md-h4 font-weight-bold mb-1">
                                    {{ history.tx_first_name }} {{ history.tx_last_name }}
                                </h2>
                                <div class="text-caption text-sm-subtitle-1 text-secondary d-flex flex-wrap justify-center justify-sm-start align-center">
                                    <v-chip size="x-small" color="primary" variant="flat" class="mr-2">#{{ history.tx_nro }}</v-chip>
                                    <span class="font-weight-bold">{{ history.tx_dni_type }}-{{ history.tx_dni }}</span>
                                    <v-divider vertical class="mx-2 d-none d-sm-inline"></v-divider>
                                    <v-icon start size="16" color="primary" class="ml-1">mdi-gender-male-female</v-icon>
                                    {{ history.tx_biological_sex }}
                                    <v-divider vertical class="mx-2 d-none d-sm-inline"></v-divider>
                                    <v-chip :color="getStatusColor(history.in_status)" size="x-small" :prepend-icon="getStatusIcon(history.in_status)">
                                        {{ getStatusLabel(history.in_status) }}
                                    </v-chip>
                                </div>
                            </div>
                            <div class="d-flex flex-column flex-sm-row align-center mt-4 mt-sm-0 ml-sm-4 ga-2">
                                <!-- Botón Validar HC (solo si está Iniciada) -->
                                <v-btn
                                    v-if="history.in_status === 1"
                                    color="success"
                                    variant="tonal"
                                    size="small"
                                    prepend-icon="mdi-check-circle"
                                    @click="showApproveDialog = true"
                                >
                                    Validar HC
                                </v-btn>
                                <!-- Botón Cerrar HC (solo si está Iniciada o Validada) -->
                                <v-btn
                                    v-if="history.in_status === 1 || history.in_status === 2"
                                    color="error"
                                    variant="tonal"
                                    size="small"
                                    prepend-icon="mdi-lock"
                                    @click="showCloseDialog = true"
                                >
                                    Cerrar HC
                                </v-btn>
                                <!-- Botón Descargar PDF -->
                                <v-btn
                                    color="warning"
                                    variant="tonal"
                                    size="small"
                                    prepend-icon="mdi-file-pdf-box"
                                    @click="downloadPdf"
                                    :loading="downloadingPdf"
                                >
                                    PDF
                                </v-btn>
                                <v-btn icon color="primary" variant="tonal" @click="router.back()">
                                    <v-icon>mdi-arrow-left</v-icon>
                                </v-btn>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-card v-if="hasAnyTabPermission" rounded="xl" elevation="0" class="border-light overflow-hidden">
            <v-tabs
                v-model="activeTab"
                color="primary"
                align-tabs="start"
                class="border-b px-2"
                show-arrows
            >
                <v-tab v-if="hasPermission('Historia Clinica Resumen')" value="resumen" class="text-none">Resumen</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Antecedentes')" value="antecedentes" class="text-none">Antecedentes</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Examen')" value="examen" class="text-none">Examen</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Diagnostico')" value="plan" class="text-none">Plan Quirurgico</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Aptitud')" value="aptitud" class="text-none">Aptitud</v-tab>
                <v-tab v-if="hasPermission('Historia Clinica Habitos')" value="habitos" class="text-none">Hábitos</v-tab>
                <v-tab value="receta" class="text-none">
                    <v-icon start>mdi-prescription</v-icon> Receta Médica
                </v-tab>
                <v-tab value="postoperatorios" class="text-none">
                    <v-badge :content="postopsCount" :model-value="postopsCount > 0" color="primary" dot>
                        <v-icon start>mdi-bandage</v-icon> Postoperatorios
                    </v-badge>
                </v-tab>
                <v-tab value="timeline" class="text-none">
                    <v-icon start>mdi-timeline</v-icon> Línea de Tiempo
                </v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="pa-4 pa-md-6" transition="fade-transition" disabled="false">
                
                <v-window-item value="resumen" v-if="hasPermission('Historia Clinica Resumen')">
                    <v-form @submit.prevent="updateSection('resumen')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Motivo</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'resumen'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>
                        <v-textarea v-model="history.tx_motivo_consulta" label="Razón de la visita" variant="outlined" rows="3" rounded="lg" counter="1000" persistent-counter density="comfortable"></v-textarea>
                        
                        <div class="text-overline text-primary mt-4 mb-2">Procedimientos vinculados</div>
                            <v-chip v-for="proc in history.procedures" :key="proc.id" class="me-2" color="success" variant="tonal" size="small" prepend-icon="mdi-needle">
                                {{ proc.tx_name }}
                            </v-chip>

                        <!-- ===== IMAGEN ANTES DEL PROCEDIMIENTO ===== -->
                        <v-divider class="my-4"></v-divider>
                        <div class="text-overline text-primary mb-2">
                            <v-icon start size="14">mdi-camera-before</v-icon> Foto ANTES del procedimiento
                        </div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <div v-if="history.tx_img_before" class="text-center">
                                    <v-img
                                        :src="history.tx_img_before"
                                        max-height="250"
                                        contain
                                        class="rounded-lg border mb-2"
                                    ></v-img>
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        :href="history.tx_img_before"
                                        target="_blank"
                                        prepend-icon="mdi-open-in-new"
                                    >Ver original</v-btn>
                                </div>
                                <div v-else class="text-center pa-6 bg-grey-lighten-4 rounded-lg">
                                    <v-icon size="48" color="grey-lighten-2">mdi-image-off</v-icon>
                                    <p class="text-caption text-grey mt-1">No hay foto registrada</p>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6" class="d-flex flex-column align-center justify-center">
                                <v-btn
                                    color="primary"
                                    variant="tonal"
                                    prepend-icon="mdi-camera-plus"
                                    @click="triggerBeforeFileInput"
                                    block
                                    rounded="lg"
                                    class="mb-2"
                                >
                                    {{ beforeFile ? 'Cambiar foto' : (history.tx_img_before ? 'Actualizar foto' : 'Subir foto del antes') }}
                                </v-btn>
                                <input
                                    ref="beforeFileInputRef"
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    style="display: none"
                                    @change="onBeforeImageSelected"
                                />
                                <v-chip v-if="beforePreview" color="success" variant="tonal" size="small">
                                    <v-icon start>mdi-check-circle</v-icon> Nueva foto lista para guardar
                                </v-chip>
                            </v-col>
                        </v-row>
                        <!-- Preview de la nueva imagen antes -->
                        <v-row v-if="beforePreview">
                            <v-col cols="12" class="text-center">
                                <v-img
                                    :src="beforePreview"
                                    max-height="200"
                                    contain
                                    class="rounded-lg border"
                                ></v-img>
                            </v-col>
                        </v-row>

                        <!-- ===== IMAGEN DESPUÉS DEL PROCEDIMIENTO ===== -->
                        <v-divider class="my-4"></v-divider>
                        <div class="text-overline text-primary mb-2">
                            <v-icon start size="14">mdi-camera-after</v-icon> Foto DESPUÉS del procedimiento
                        </div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <div v-if="history.tx_img_after" class="text-center">
                                    <v-img
                                        :src="history.tx_img_after"
                                        max-height="250"
                                        contain
                                        class="rounded-lg border mb-2"
                                    ></v-img>
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        :href="history.tx_img_after"
                                        target="_blank"
                                        prepend-icon="mdi-open-in-new"
                                    >Ver original</v-btn>
                                </div>
                                <div v-else class="text-center pa-6 bg-grey-lighten-4 rounded-lg">
                                    <v-icon size="48" color="grey-lighten-2">mdi-image-plus</v-icon>
                                    <p class="text-caption text-grey mt-1">Aún no se ha registrado foto del después</p>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6" class="d-flex flex-column align-center justify-center">
                                <v-btn
                                    color="primary"
                                    variant="tonal"
                                    prepend-icon="mdi-camera-plus"
                                    @click="triggerAfterFileInput"
                                    block
                                    rounded="lg"
                                    class="mb-2"
                                >
                                    {{ afterFile ? 'Cambiar foto' : (history.tx_img_after ? 'Actualizar foto' : 'Subir foto del después') }}
                                </v-btn>
                                <input
                                    ref="afterFileInputRef"
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    style="display: none"
                                    @change="onAfterImageSelected"
                                />
                                <v-chip v-if="afterPreview" color="success" variant="tonal" size="small">
                                    <v-icon start>mdi-check-circle</v-icon> Nueva foto lista para guardar
                                </v-chip>
                            </v-col>
                        </v-row>
                        <!-- Preview de la nueva imagen después -->
                        <v-row v-if="afterPreview">
                            <v-col cols="12" class="text-center">
                                <v-img
                                    :src="afterPreview"
                                    max-height="200"
                                    contain
                                    class="rounded-lg border"
                                ></v-img>
                            </v-col>
                        </v-row>

                        <!-- ===== FIRMA DE CONSENTIMIENTO (Digital - dibujar con mouse/dedo) ===== -->
                        <v-divider class="my-4"></v-divider>
                        <div class="text-overline text-primary mb-2">
                            <v-icon start size="14">mdi-draw</v-icon> Firma de Consentimiento del Paciente
                        </div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <div v-if="history.tx_signature && !signatureDrawn" class="text-center">
                                    <v-img
                                        :src="history.tx_signature"
                                        max-height="150"
                                        contain
                                        class="rounded-lg border mb-2"
                                        style="background: #fafafa;"
                                    ></v-img>
                                    <v-chip color="success" variant="tonal" size="x-small">
                                        <v-icon start>mdi-check-circle</v-icon> Firma registrada
                                    </v-chip>
                                    <v-btn
                                        size="small"
                                        color="warning"
                                        variant="tonal"
                                        prepend-icon="mdi-pencil"
                                        class="mt-2"
                                        @click="enableSignatureRedraw"
                                    >
                                        Volver a firmar
                                    </v-btn>
                                </div>
                                <div v-else-if="!signatureDrawn" class="text-center pa-6 bg-grey-lighten-4 rounded-lg">
                                    <v-icon size="48" color="grey-lighten-2">mdi-file-sign</v-icon>
                                    <p class="text-caption text-grey mt-1">Sin firma de consentimiento</p>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="signature-container">
                                    <canvas
                                        ref="signatureCanvas"
                                        :width="canvasWidth"
                                        :height="canvasHeight"
                                        class="signature-canvas border rounded-lg"
                                        @mousedown="startSign"
                                        @mousemove="drawSign"
                                        @mouseup="endSign"
                                        @mouseleave="endSign"
                                        @touchstart.prevent="onTouchStart"
                                        @touchmove.prevent="onTouchMove"
                                        @touchend="onTouchEnd"
                                    ></canvas>
                                    <div v-if="!signatureDrawn" class="signature-placeholder">
                                        <v-icon size="40" color="grey-lighten-2">mdi-draw</v-icon>
                                        <p class="text-caption text-grey mt-1">Firme aquí usando el mouse o su dedo</p>
                                    </div>
                                    <div class="d-flex justify-center ga-2 mt-2">
                                        <v-btn
                                            size="small"
                                            color="error"
                                            variant="tonal"
                                            prepend-icon="mdi-eraser"
                                            @click="clearSignature"
                                        >
                                            Limpiar
                                        </v-btn>
                                        <v-btn
                                            v-if="signatureDrawn"
                                            size="small"
                                            color="success"
                                            variant="tonal"
                                            prepend-icon="mdi-check"
                                            @click="confirmSignature"
                                        >
                                            Confirmar firma
                                        </v-btn>
                                    </div>
                                    <v-chip v-if="signatureConfirmed" color="success" variant="tonal" size="small" class="mt-2">
                                        <v-icon start>mdi-check-circle</v-icon> Firma lista para guardar
                                    </v-chip>
                                </div>
                                <p class="text-caption text-grey mt-2 text-center">
                                    La firma de consentimiento del paciente es requerida para validar la historia clínica.
                                </p>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="antecedentes" v-if="hasPermission('Historia Clinica Antecedentes')">
                    <v-form @submit.prevent="updateSection('antecedentes')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Antecedentes</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'antecedentes'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <p class="text-overline mb-2 text-primary">Personales</p>
                                <v-text-field label="Enfermedades Crónicas" v-model="history.tx_enfermedad_cronica" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                <v-text-field label="Cirugías Previas" v-model="history.tx_cirugia_previa" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                <v-text-field label="Alergias" v-model="history.tx_alergia" variant="outlined" rounded="lg" color="error" density="comfortable"></v-text-field>
                                <v-text-field label="Medicación Actual" v-model="history.tx_medicacion_actual" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <p class="text-overline mb-2 text-primary">Familiares</p>
                                <v-text-field label="Enfermedades Heredadas" v-model="history.tx_enfermedades_heredadas" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                <v-text-field label="Complicación Anestésica" v-model="history.tx_complicacion_anestecica" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="examen" v-if="hasPermission('Historia Clinica Examen')">
                    <v-form @submit.prevent="updateSection('examen')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Examen Físico</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'examen'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>
                        <v-row >
                            <v-col cols="12" lg="4">
                                <v-text-field label="Peso" v-model="history.tx_peso" variant="outlined" :rules="[decimalNumber]" flat @input="calculateIMC" type="text" density="compact" suffix="kg"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="4">
                                <v-text-field label="Talla" v-model="history.tx_talla" variant="outlined" :rules="[onlyNumbers]" flat @input="calculateIMC" type="text" density="compact" suffix="cm"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="4">
                                <v-text-field label="IMC" v-model="history.tx_imc" variant="outlined" flat readonly bg-color="white" density="compact" class="text-primary font-weight-bold"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-textarea label="Examen General" v-model="history.tx_examen_general" variant="outlined" rounded="lg" rows="2" density="comfortable"></v-textarea>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-textarea label="Evaluación de Zona" v-model="history.tx_evaluacion_zona" variant="outlined" rounded="lg" rows="2" density="comfortable"></v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Hallazgos Relevantes" v-model="history.tx_hallazgo_relevante" variant="outlined" rounded="lg" prepend-inner-icon="mdi-magnify-scan" density="comfortable"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="plan" v-if="hasPermission('Historia Clinica Diagnostico')">
                    <v-form @submit.prevent="updateSection('plan')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Plan Quirúrgico</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'plan'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>

                        <v-row>
                            <v-col cols="12">
                                <CustomDatePicker 
                                    label="Fecha Tentativa de Cirugía" 
                                    v-model="history.date_tentativa" 
                                    variant="outlined" rounded="lg" density="comfortable"
                                    class="mb-2"
                                />
                            </v-col>

                            <v-col cols="12" md="7">
                                <div class="pa-4  rounded-lg  bg-white">
                                    <p class="text-overline mb-4 text-primary"><v-icon start size="18">mdi-clipboard-pulse</v-icon> Definición del Caso</p>

                                    <v-text-field label="Diagnóstico Principal" v-model="history.tx_diagnostico" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                    <v-text-field label="Diagnóstico Secundario" v-model="history.tx_diagnostico_secundario" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                                    
                                    <v-textarea label="Riesgos Identificados" v-model="history.tx_riesgos" variant="outlined" rounded="lg" rows="2" color="warning" density="comfortable" prepend-inner-icon="mdi-alert-outline"></v-textarea>
                                </div>
                            </v-col>

                            <v-col cols="12" md="5">
                                <div class="pa-4  rounded-lg">
                                    <p class="text-overline mb-4 text-primary"><v-icon start size="18">mdi-needle</v-icon> Soporte Anestésico</p>
                                    
                                    <v-select 
                                        v-model="history.tx_anestecia" 
                                        label="Tipo de Anestesia" 
                                        :items="['Local', 'Local + Sedación', 'General', 'Regional', 'Epidural', 'TIVA']"
                                        variant="outlined" rounded="lg" density="comfortable"
                                    ></v-select>

                                    <v-text-field 
                                        label="Duración Estimada" 
                                        v-model="history.tx_duracion_anestecia" 
                                        variant="outlined" rounded="lg" 
                                        density="comfortable"
                                        placeholder="ej. 2 horas"
                                        prepend-inner-icon="mdi-clock-outline"
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12">
                                <div class="pa-4  rounded-lg bg-white">
                                    <p class="text-overline mb-2 text-primary"><v-icon start size="18">mdi-text-box-check-outline</v-icon> Indicaciones Pre-Quirúrgicas</p>
                                    <v-textarea 
                                        label="Recomendaciones para la cirugía" 
                                        v-model="history.tx_recomendaciones" 
                                        variant="outlined" rounded="lg" 
                                        rows="4" 
                                        density="comfortable"
                                        placeholder="Ayuno, medicación previa, etc."
                                    ></v-textarea>
                                </div>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="aptitud" v-if="hasPermission('Historia Clinica Aptitud')">
                    <v-form @submit.prevent="updateSection('aptitud')">
                        <div class="d-flex align-center justify-space-between mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Estado Final</h3>
                            <v-btn type="submit" color="primary" :loading="saving === 'aptitud'" :size="$vuetify.display.mobile ? 'small' : 'default'" prepend-icon="mdi-content-save">Guardar</v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12" sm="6" md="4">
                                <v-select v-model="history.tx_paciente_apto" label="¿Apto?" :items="['SI', 'NO', 'PENDIENTE']" variant="outlined" rounded="lg" density="comfortable"></v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-select v-model="history.in_valoracion_adicional" label="¿Valoración Extra?" :items="[{title: 'Si', value: '1'}, {title: 'No', value: '0'}]" variant="outlined" rounded="lg" density="comfortable"></v-select>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Especialidad" v-model="history.tx_especialidad" :disabled="history.in_valoracion_adicional == '0'" variant="outlined" rounded="lg" density="comfortable"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea label="Observaciones" v-model="history.tx_observaciones" variant="outlined" rounded="lg" rows="2" density="comfortable"></v-textarea>
                                <v-textarea label="Notas Internas" v-model="history.tx_notas" variant="outlined" rounded="lg" rows="2" density="comfortable"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-window-item>

                <v-window-item value="habitos" v-if="hasPermission('Historia Clinica Habitos')">
                <div class="d-flex align-center justify-space-between mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold text-uppercase">Hábitos del Paciente</h3>
                </div>

                <v-row class="mb-4">
                    <v-col cols="12" md="12" lg="12">
                        <v-text-field
                            v-model="newHabit"
                            label="Nuevo hábito (ej. Fumador, Sedentarismo)"
                            variant="outlined"
                            rounded="lg"
                            density="comfortable"
                            hide-details
                            @keyup.enter="addHabit"
                        >
                            <template v-slot:append-inner>
                                <v-btn 
                                    color="primary" 
                                    variant="text" 
                                    icon="mdi-plus-circle" 
                                    :loading="savingHabit"
                                    @click="addHabit"
                                ></v-btn>
                            </template>
                        </v-text-field>
                    </v-col>
                </v-row>

                <v-divider class="mb-6"></v-divider>

                <div v-if="loadingHabits" class="text-center pa-10">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="text-caption mt-2">Cargando hábitos...</p>
                </div>

                <div v-else>
                    <v-row v-if="habits.length > 0">
                        <v-col v-for="habit in habits" :key="habit.id" cols="12" sm="6" md="4">
                            <v-card variant="outlined" class="border-light rounded-lg d-flex align-center pa-3">
                                <v-icon color="secondary" class="mr-3">mdi-check-circle-outline</v-icon>
                                <span class="flex-grow-1 font-weight-medium">{{ habit.tx_habit }}</span>
                                <v-btn 
                                    icon="mdi-delete-outline" 
                                    variant="text" 
                                    color="error" 
                                    size="small"
                                    @click="deleteHabit(habit.id)"
                                ></v-btn>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-sheet v-else border rounded="lg" class="pa-10 text-center bg-grey-lighten-4">
                        <v-icon size="48" color="grey-lighten-1">mdi-emoticon-neutral-outline</v-icon>
                        <p class="text-subtitle-1 text-grey-darken-1 mt-2">No hay hábitos registrados para este paciente.</p>
                    </v-sheet>
                </div>
            </v-window-item>

            <!-- ========== PESTAÑA DE RECETA MÉDICA ========== -->
            <v-window-item value="receta">
                <div class="d-flex align-center justify-space-between mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold text-uppercase">
                        <v-icon start>mdi-prescription</v-icon> Receta Médica
                    </h3>
                </div>

                <!-- Formulario para agregar receta -->
                <v-card variant="outlined" rounded="lg" class="pa-4 mb-6 bg-grey-lighten-4 border-light">
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="prescriptionForm.tx_medication"
                                label="Medicamento *"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                hide-details="auto"
                                :rules="[v => !!v || 'El medicamento es obligatorio']"
                                placeholder="Nombre del medicamento"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field
                                v-model="prescriptionForm.tx_dosage"
                                label="Dosis"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                hide-details
                                placeholder="ej. 500mg"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field
                                v-model="prescriptionForm.tx_frequency"
                                label="Frecuencia"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                hide-details
                                placeholder="ej. Cada 8 horas"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field
                                v-model="prescriptionForm.tx_duration"
                                label="Duración"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                hide-details
                                placeholder="ej. 7 días"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="8">
                            <v-text-field
                                v-model="prescriptionForm.tx_notes"
                                label="Notas / Indicaciones"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                hide-details
                                placeholder="Indicaciones adicionales..."
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row class="mt-2">
                        <v-col cols="12" class="d-flex justify-end">
                            <v-btn
                                color="primary"
                                :loading="savingPrescription"
                                prepend-icon="mdi-plus"
                                size="small"
                                @click="addPrescription"
                                :disabled="!prescriptionForm.tx_medication.trim()"
                            >
                                Agregar Receta
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card>

                <!-- Lista de recetas -->
                <div v-if="loadingPrescriptions" class="text-center pa-10">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="text-caption mt-2">Cargando recetas...</p>
                </div>

                <div v-else-if="prescriptions.length === 0" class="text-center pa-10 bg-grey-lighten-4 rounded-lg">
                    <v-icon size="64" color="grey-lighten-2">mdi-prescription</v-icon>
                    <p class="text-subtitle-1 text-grey-darken-1 mt-2">No hay recetas registradas para esta historia clínica.</p>
                    <p class="text-caption text-grey">Use el formulario superior para agregar una nueva receta médica.</p>
                </div>

                <v-row v-else>
                    <v-col v-for="(prescription, pIdx) in prescriptions" :key="prescription.id" cols="12" md="6" lg="4">
                        <v-card variant="outlined" rounded="xl" class="border-light">
                            <v-card-text>
                                <div class="d-flex align-center mb-3">
                                    <v-avatar color="primary" size="40" class="mr-3">
                                        <v-icon color="white">mdi-pill</v-icon>
                                    </v-avatar>
                                    <div>
                                        <div class="text-subtitle-2 font-weight-bold">{{ prescription.tx_medication }}</div>
                                        <div class="text-caption text-grey">Receta #{{ prescription.id }}</div>
                                    </div>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        icon="mdi-file-pdf-box"
                                        variant="text"
                                        color="warning"
                                        size="small"
                                        @click="downloadPrescriptionPdf(prescription.id)"
                                    ></v-btn>
                                    <v-btn
                                        icon="mdi-delete-outline"
                                        variant="text"
                                        color="error"
                                        size="small"
                                        @click="deletePrescription(prescription.id)"
                                    ></v-btn>
                                </div>

                                <v-divider class="mb-3"></v-divider>

                                <v-row dense>
                                    <v-col cols="6" v-if="prescription.tx_dosage">
                                        <div class="text-caption text-grey">Dosis</div>
                                        <div class="text-body-2 font-weight-medium">{{ prescription.tx_dosage }}</div>
                                    </v-col>
                                    <v-col cols="6" v-if="prescription.tx_frequency">
                                        <div class="text-caption text-grey">Frecuencia</div>
                                        <div class="text-body-2 font-weight-medium">{{ prescription.tx_frequency }}</div>
                                    </v-col>
                                    <v-col cols="6" v-if="prescription.tx_duration">
                                        <div class="text-caption text-grey">Duración</div>
                                        <div class="text-body-2 font-weight-medium">{{ prescription.tx_duration }}</div>
                                    </v-col>
                                    <v-col cols="6" v-if="prescription.doctor_name">
                                        <div class="text-caption text-grey">Prescrito por</div>
                                        <div class="text-body-2 font-weight-medium">
                                            <v-icon start size="14" color="primary">mdi-doctor</v-icon>
                                            {{ prescription.doctor_name }}
                                        </div>
                                    </v-col>
                                </v-row>

                                <v-divider class="my-3" v-if="prescription.tx_notes"></v-divider>

                                <div v-if="prescription.tx_notes" class="text-caption text-grey mb-1">Notas:</div>
                                <p v-if="prescription.tx_notes" class="text-body-2" style="white-space: pre-wrap;">{{ prescription.tx_notes }}</p>

                                <div class="text-caption text-grey mt-2">
                                    <v-icon start size="12">mdi-calendar</v-icon>
                                    {{ formatDate(prescription.date_add) }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-window-item>

            <!-- ========== PESTAÑA DE POSTOPERATORIOS (Regla 3) ========== -->
            <v-window-item value="postoperatorios">
                <div class="d-flex align-center justify-space-between mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold text-uppercase">
                        <v-icon start>mdi-bandage</v-icon> Control Postoperatorio
                    </h3>
                    <v-btn
                        v-if="history.in_status !== 3"
                        color="primary"
                        prepend-icon="mdi-plus"
                        size="small"
                        @click="showAddPostop = true"
                    >
                        Nuevo Control
                    </v-btn>
                </div>

                <!-- Lista de postoperatorios -->
                <div v-if="loadingPostops" class="text-center pa-10">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="text-caption mt-2">Cargando controles postoperatorios...</p>
                </div>

                <div v-else-if="postops.length === 0" class="text-center pa-10 bg-grey-lighten-4 rounded-lg">
                    <v-icon size="64" color="grey-lighten-2">mdi-bandage</v-icon>
                    <p class="text-subtitle-1 text-grey-darken-1 mt-2">No hay controles postoperatorios registrados.</p>
                    <p class="text-caption text-grey">Agregue el primer control postoperatorio para dar seguimiento a la evolución del paciente.</p>
                </div>

                <v-row v-else>
                    <v-col v-for="postop in postops" :key="postop.id" cols="12" md="6" lg="4">
                        <v-card variant="outlined" rounded="xl" class="border-light">
                            <v-card-text>
                                <div class="d-flex align-center mb-3">
                                    <v-avatar color="primary" size="40" class="mr-3">
                                        <v-icon color="white">mdi-bandage</v-icon>
                                    </v-avatar>
                                    <div>
                                        <div class="text-subtitle-2 font-weight-bold">Control #{{ postop.id }}</div>
                                        <div class="text-caption text-grey">{{ formatDate(postop.date_add) }}</div>
                                    </div>
                                    <v-spacer></v-spacer>
                                    <v-chip
                                        :color="postop.in_status === 1 ? 'success' : 'grey'"
                                        size="x-small"
                                        variant="tonal"
                                    >
                                        {{ postop.in_status === 1 ? 'Activo' : 'Cerrado' }}
                                    </v-chip>
                                </div>

                                <v-divider class="mb-3"></v-divider>

                                <p class="text-body-2 mb-3">{{ postop.tx_observations || 'Sin observaciones' }}</p>

                                <!-- Fotos del postoperatorio -->
                                <div v-if="postop.tx_photos && postop.tx_photos.length > 0">
                                    <div class="text-caption text-grey mb-1">Fotos del control:</div>
                                    <v-row dense>
                                        <v-col v-for="(photo, pIdx) in postop.tx_photos" :key="pIdx" cols="4">
                                            <v-img
                                                :src="photo"
                                                max-height="80"
                                                cover
                                                class="rounded-lg border cursor-pointer"
                                                @click="openPhotoPreview(photo)"
                                            ></v-img>
                                        </v-col>
                                    </v-row>
                                </div>

                                <!-- Acciones del postoperatorio -->
                                <div class="d-flex mt-3 ga-2">
                                    <v-btn
                                        size="x-small"
                                        color="info"
                                        variant="tonal"
                                        prepend-icon="mdi-eye"
                                        @click="viewPostopDetail(postop)"
                                    >
                                        Ver más
                                    </v-btn>
                                    <v-btn
                                        v-if="postop.in_status === 1 && history.in_status !== 3"
                                        size="x-small"
                                        color="error"
                                        variant="tonal"
                                        prepend-icon="mdi-lock"
                                        @click="closePostop(postop)"
                                    >
                                        Cerrar
                                    </v-btn>
                                    <v-btn
                                        v-if="postop.in_status === 1 && history.in_status !== 3"
                                        size="x-small"
                                        color="warning"
                                        variant="tonal"
                                        prepend-icon="mdi-pencil"
                                        @click="editPostop(postop)"
                                    >
                                        Editar
                                    </v-btn>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Dialog para agregar/editar postoperatorio -->
                <v-dialog v-model="showAddPostop" max-width="600" persistent>
                    <v-card rounded="xl">
                        <v-card-title class="d-flex align-center pa-4 pb-0">
                            <v-icon start color="primary" size="28">mdi-bandage</v-icon>
                            <span class="text-h6 font-weight-bold">
                                {{ editingPostop ? 'Editar Control' : 'Nuevo Control Postoperatorio' }}
                            </span>
                            <v-spacer></v-spacer>
                            <v-btn icon variant="text" size="small" @click="cancelPostopForm">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text class="pa-4">
                            <v-textarea
                                v-model="postopForm.tx_observations"
                                label="Observaciones del control"
                                placeholder="Describa la evolución del paciente, hallazgos, recomendaciones..."
                                variant="outlined"
                                rounded="lg"
                                rows="4"
                                density="comfortable"
                                counter="500"
                                persistent-counter
                            ></v-textarea>

                            <v-label class="font-weight-bold mb-2 text-primary text-uppercase">
                                <v-icon start>mdi-camera</v-icon> Fotos del control
                            </v-label>
                            <v-row align="center" class="mb-3">
                                <v-col cols="12" sm="6">
                                    <v-btn
                                        color="primary"
                                        variant="tonal"
                                        prepend-icon="mdi-camera-plus"
                                        @click="triggerPostopFileInput"
                                        block
                                        rounded="lg"
                                        size="small"
                                    >
                                        {{ postopForm.newPhotos.length > 0 ? 'Agregar más fotos' : 'Seleccionar fotos' }}
                                    </v-btn>
                                    <input
                                        ref="postopFileInputRef"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style="display: none"
                                        @change="onPostopPhotosSelected"
                                    />
                                </v-col>
                                <v-col cols="12" sm="6" class="text-center">
                                    <v-chip v-if="postopForm.newPhotos.length > 0" color="success" variant="tonal" size="small">
                                        <v-icon start>mdi-check-circle</v-icon> {{ postopForm.newPhotos.length }} foto(s) seleccionada(s)
                                    </v-chip>
                                    <span v-else class="text-caption text-grey">Ninguna foto seleccionada</span>
                                </v-col>
                            </v-row>

                            <!-- Preview de fotos seleccionadas -->
                            <v-row v-if="postopForm.newPhotos.length > 0" dense>
                                <v-col v-for="(photo, pIdx) in postopForm.newPhotos" :key="'new-'+pIdx" cols="4" sm="3">
                                    <v-img
                                        :src="photo.preview"
                                        max-height="80"
                                        cover
                                        class="rounded-lg border"
                                    ></v-img>
                                </v-col>
                            </v-row>

                            <!-- Fotos existentes (en modo edición) -->
                            <div v-if="editingPostop && postopForm.existingPhotos.length > 0" class="mt-3">
                                <v-divider class="mb-3"></v-divider>
                                <div class="text-caption text-grey mb-1">Fotos actuales:</div>
                                <v-row dense>
                                    <v-col v-for="(photo, pIdx) in postopForm.existingPhotos" :key="'exist-'+pIdx" cols="4" sm="3">
                                        <v-img
                                            :src="photo"
                                            max-height="80"
                                            cover
                                            class="rounded-lg border"
                                        ></v-img>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-card-text>
                        <v-card-actions class="pa-4 pt-0">
                            <v-spacer></v-spacer>
                            <v-btn variant="text" color="grey-darken-1" @click="cancelPostopForm" :disabled="savingPostop">
                                Cancelar
                            </v-btn>
                            <v-btn
                                color="primary"
                                :loading="savingPostop"
                                prepend-icon="mdi-content-save"
                                @click="savePostop"
                            >
                                {{ editingPostop ? 'Actualizar' : 'Guardar Control' }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Dialog para cerrar postoperatorio -->
                <v-dialog v-model="showClosePostop" max-width="500" persistent>
                    <v-card rounded="xl">
                        <v-card-title class="d-flex align-center pa-4 pb-0">
                            <v-icon start color="error" size="28">mdi-lock</v-icon>
                            <span class="text-h6 font-weight-bold">Cerrar Control Postoperatorio</span>
                            <v-spacer></v-spacer>
                            <v-btn icon variant="text" size="small" @click="showClosePostop = false">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text class="pa-4">
                            <p class="text-body-2 text-medium-emphasis mb-4">
                                ¿Está seguro de cerrar este control postoperatorio? Una vez cerrado no podrá modificarse.
                            </p>
                        </v-card-text>
                        <v-card-actions class="pa-4 pt-0">
                            <v-spacer></v-spacer>
                            <v-btn variant="text" color="grey-darken-1" @click="showClosePostop = false" :disabled="closingPostop">
                                Cancelar
                            </v-btn>
                            <v-btn
                                color="error"
                                :loading="closingPostop"
                                prepend-icon="mdi-lock"
                                @click="confirmClosePostop"
                            >
                                Cerrar Control
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Dialog para previsualizar foto -->
                <v-dialog v-model="showPhotoPreview" max-width="600">
                    <v-card rounded="xl">
                        <v-card-text class="pa-4 text-center">
                            <v-img
                                :src="previewPhotoUrl"
                                max-height="500"
                                contain
                                class="rounded-lg"
                            ></v-img>
                        </v-card-text>
                        <v-card-actions class="pa-4 pt-0 justify-end">
                            <v-btn variant="text" color="grey-darken-1" @click="showPhotoPreview = false">Cerrar</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Dialog para ver detalle del postoperatorio -->
                <v-dialog v-model="showDetailPostop" max-width="650" scrollable>
                    <v-card rounded="xl">
                        <v-card-title class="d-flex align-center pa-4 pb-0">
                            <v-icon start color="info" size="28">mdi-information-outline</v-icon>
                            <span class="text-h6 font-weight-bold">Detalle del Control Postoperatorio</span>
                            <v-spacer></v-spacer>
                            <v-btn icon variant="text" size="small" @click="showDetailPostop = false">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>

                        <v-card-text class="pa-4" v-if="detailPostop">
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Control #</div>
                                    <div class="text-body-2 font-weight-bold">{{ detailPostop.id }}</div>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Estado</div>
                                    <v-chip
                                        :color="detailPostop.in_status === 1 ? 'success' : 'grey'"
                                        size="x-small"
                                        variant="tonal"
                                    >
                                        {{ detailPostop.in_status === 1 ? 'Activo' : 'Cerrado' }}
                                    </v-chip>
                                </v-col>
                            </v-row>

                            <v-divider class="my-3"></v-divider>

                            <v-row>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Creado por</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14" color="primary">mdi-account</v-icon>
                                        {{ detailPostop.creator_name || '—' }}
                                    </div>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Fecha de creación</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14" color="primary">mdi-calendar</v-icon>
                                        {{ formatDateTime(detailPostop.date_add) }}
                                    </div>
                                </v-col>
                            </v-row>

                            <v-row v-if="detailPostop.updater_name">
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Última modificación por</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14" color="warning">mdi-account-edit</v-icon>
                                        {{ detailPostop.updater_name }}
                                    </div>
                                </v-col>
                                <v-col cols="12" sm="6" v-if="detailPostop.date_upd">
                                    <div class="text-caption text-grey mb-1">Fecha de modificación</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14" color="warning">mdi-calendar-edit</v-icon>
                                        {{ formatDateTime(detailPostop.date_upd) }}
                                    </div>
                                </v-col>
                            </v-row>

                            <v-row v-if="detailPostop.closer_name">
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Cerrado por</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14" color="error">mdi-account-lock</v-icon>
                                        {{ detailPostop.closer_name }}
                                    </div>
                                </v-col>
                                <v-col cols="12" sm="6" v-if="detailPostop.date_close">
                                    <div class="text-caption text-grey mb-1">Fecha de cierre</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14" color="error">mdi-calendar-lock</v-icon>
                                        {{ formatDateTime(detailPostop.date_close) }}
                                    </div>
                                </v-col>
                            </v-row>

                            <v-divider class="my-3"></v-divider>

                            <div class="text-caption text-grey mb-1">Observaciones</div>
                            <v-card variant="outlined" rounded="lg" class="pa-3 bg-grey-lighten-4 mb-3">
                                <p class="text-body-2" style="white-space: pre-wrap;">{{ detailPostop.tx_observations || 'Sin observaciones' }}</p>
                            </v-card>

                            <!-- Fotos del detalle -->
                            <div v-if="detailPostop.tx_photos && detailPostop.tx_photos.length > 0">
                                <div class="text-caption text-grey mb-1">Fotos del control ({{ detailPostop.tx_photos.length }})</div>
                                <v-row dense>
                                    <v-col v-for="(photo, pIdx) in detailPostop.tx_photos" :key="pIdx" cols="4" sm="3">
                                        <v-img
                                            :src="photo"
                                            max-height="120"
                                            cover
                                            class="rounded-lg border cursor-pointer"
                                            @click="openPhotoPreview(photo)"
                                        ></v-img>
                                    </v-col>
                                </v-row>
                            </div>
                            <div v-else class="text-caption text-grey">No hay fotos registradas en este control.</div>
                        </v-card-text>

                        <v-card-text class="pa-4 text-center" v-else>
                            <v-progress-circular indeterminate color="info"></v-progress-circular>
                            <p class="text-caption mt-2">Cargando detalle...</p>
                        </v-card-text>

                        <v-card-actions class="pa-4 pt-0 justify-end">
                            <v-btn variant="text" color="grey-darken-1" @click="showDetailPostop = false">Cerrar</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-window-item>

            <!-- ========== PESTAÑA DE LÍNEA DE TIEMPO (Regla 8) ========== -->
            <v-window-item value="timeline">
                <div class="d-flex align-center justify-space-between mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold text-uppercase">
                        <v-icon start>mdi-timeline</v-icon> Línea de Tiempo de la Historia Clínica
                    </h3>
                </div>

                <div v-if="loadingTimeline" class="text-center pa-10">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="text-caption mt-2">Cargando línea de tiempo...</p>
                </div>

                <div v-else-if="timeline.length === 0" class="text-center pa-10 bg-grey-lighten-4 rounded-lg">
                    <v-icon size="64" color="grey-lighten-2">mdi-timeline</v-icon>
                    <p class="text-subtitle-1 text-grey-darken-1 mt-2">No hay eventos registrados en la línea de tiempo.</p>
                </div>

                <v-timeline v-else side="end" align="start" density="compact">
                    <v-timeline-item
                        v-for="(event, eIdx) in timeline"
                        :key="eIdx"
                        :dot-color="event.color || 'primary'"
                        :icon="event.icon || 'mdi-circle-medium'"
                        size="small"
                    >
                        <div class="d-flex align-center mb-1">
                            <strong class="text-body-2">{{ event.title }}</strong>
                            <v-spacer></v-spacer>
                            <span class="text-caption text-grey">{{ formatDateTime(event.date) }}</span>
                        </div>
                        <div v-if="event.description" class="text-caption text-medium-emphasis mb-1">
                            {{ event.description }}
                        </div>
                        <div v-if="event.user_name" class="text-caption text-grey mb-2">
                            <v-icon start size="12">mdi-account</v-icon> {{ event.user_name }}
                            <v-chip v-if="event.user_type" size="x-small" variant="tonal" class="ml-1" color="primary">
                                {{ event.user_type }}
                            </v-chip>
                        </div>
                        <div class="d-flex">
                            <v-btn
                                size="x-small"
                                color="info"
                                variant="tonal"
                                prepend-icon="mdi-eye"
                                @click="viewTimelineDetail(event)"
                            >
                                Ver más
                            </v-btn>
                        </div>
                    </v-timeline-item>
                </v-timeline>
                <!-- Dialog para ver detalle del evento de timeline -->
                <v-dialog v-model="showTimelineDetail" max-width="600">
                    <v-card rounded="xl">
                        <v-card-title class="d-flex align-center pa-4 pb-0">
                            <v-icon start :color="timelineEvent?.color || 'info'" size="28">{{ timelineEvent?.icon || 'mdi-information' }}</v-icon>
                            <span class="text-h6 font-weight-bold">Detalle del Evento</span>
                            <v-spacer></v-spacer>
                            <v-btn icon variant="text" size="small" @click="showTimelineDetail = false">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>

                        <v-card-text class="pa-4" v-if="timelineEvent">
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Tipo de evento</div>
                                    <v-chip size="x-small" :color="timelineEvent.color" variant="tonal">
                                        <v-icon start size="12">{{ timelineEvent.icon }}</v-icon>
                                        {{ timelineEvent.title }}
                                    </v-chip>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Fecha y hora</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14">mdi-calendar-clock</v-icon>
                                        {{ formatDateTime(timelineEvent.date) }}
                                    </div>
                                </v-col>
                            </v-row>

                            <v-divider class="my-3"></v-divider>

                            <div class="text-caption text-grey mb-1">Descripción</div>
                            <v-card variant="outlined" rounded="lg" class="pa-3 bg-grey-lighten-4 mb-3">
                                <p class="text-body-2">{{ timelineEvent.description || 'Sin descripción' }}</p>
                            </v-card>

                            <v-divider class="my-3"></v-divider>

                            <div class="text-subtitle-2 font-weight-bold mb-2">
                                <v-icon start size="16">mdi-account-details</v-icon> Usuario que realizó la acción
                            </div>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Nombre</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14" color="primary">mdi-account</v-icon>
                                        {{ timelineEvent.user_name || '—' }}
                                    </div>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <div class="text-caption text-grey mb-1">Correo electrónico</div>
                                    <div class="text-body-2">
                                        <v-icon start size="14" color="primary">mdi-email</v-icon>
                                        {{ timelineEvent.user_email || '—' }}
                                    </div>
                                </v-col>
                            </v-row>
                            <v-row v-if="timelineEvent.user_type">
                                <v-col cols="12">
                                    <div class="text-caption text-grey mb-1">Tipo de usuario</div>
                                    <v-chip size="x-small" color="primary" variant="tonal">
                                        <v-icon start size="12">mdi-shield-account</v-icon>
                                        {{ timelineEvent.user_type }}
                                    </v-chip>
                                </v-col>
                            </v-row>

                            <!-- Metadata adicional si existe -->
                            <template v-if="timelineEvent.metadata">
                                <v-divider class="my-3"></v-divider>
                                <div class="text-subtitle-2 font-weight-bold mb-2">
                                    <v-icon start size="16">mdi-information-outline</v-icon> Información adicional
                                </div>
                                <v-card variant="outlined" rounded="lg" class="pa-3 bg-grey-lighten-4">
                                    <pre class="text-caption mb-0" style="white-space: pre-wrap;">{{ JSON.stringify(timelineEvent.metadata, null, 2) }}</pre>
                                </v-card>
                            </template>

                            <!-- Fotos si el evento es un postoperatorio -->
                            <template v-if="timelineEvent.photos && timelineEvent.photos.length > 0">
                                <v-divider class="my-3"></v-divider>
                                <div class="text-caption text-grey mb-1">Fotos del postoperatorio ({{ timelineEvent.photos.length }})</div>
                                <v-row dense>
                                    <v-col v-for="(photo, pIdx) in timelineEvent.photos" :key="pIdx" cols="4" sm="3">
                                        <v-img
                                            :src="photo"
                                            max-height="100"
                                            cover
                                            class="rounded-lg border cursor-pointer"
                                            @click="openPhotoPreview(photo)"
                                        ></v-img>
                                    </v-col>
                                </v-row>
                            </template>

                            <!-- Estado del postoperatorio si aplica -->
                            <template v-if="timelineEvent.status">
                                <v-divider class="my-3"></v-divider>
                                <div class="text-caption text-grey mb-1">Estado del postoperatorio</div>
                                <v-chip
                                    :color="timelineEvent.status === 'Abierto' ? 'success' : 'grey'"
                                    size="x-small"
                                    variant="tonal"
                                >
                                    {{ timelineEvent.status }}
                                </v-chip>
                            </template>
                        </v-card-text>

                        <v-card-actions class="pa-4 pt-0 justify-end">
                            <v-btn variant="text" color="grey-darken-1" @click="showTimelineDetail = false">Cerrar</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-window-item>

            </v-window>
            
        </v-card>

        <v-alert
            v-else
            type="primary"
            variant="tonal"
            rounded="xl"
            title="Acceso Restringido"
            text="No cuentas con los permisos necesarios para visualizar o editar ninguna sección de esta historia clínica. Contacta al administrador si crees que esto es un error."
            icon="mdi-shield-lock"
            class="mt-4"
        >
            <template v-slot:append>
                <v-btn variant="text" color="primary" @click="router.back()">Volver</v-btn>
            </template>
        </v-alert>

        <!-- Diálogo de Validación Médica -->
        <v-dialog v-model="showApproveDialog" max-width="500" persistent>
            <v-card rounded="xl">
                <v-card-title class="d-flex align-center pa-4 pb-0">
                    <v-icon start color="success" size="28">mdi-check-circle</v-icon>
                    <span class="text-h6 font-weight-bold">Validar Historia Clínica</span>
                    <v-spacer></v-spacer>
                    <v-btn icon variant="text" size="small" @click="showApproveDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="pa-4">
                    <p class="text-body-2 text-medium-emphasis mb-4">
                        Al validar esta historia clínica, confirmas que has revisado y aprobado
                        toda la información registrada. Esta acción quedará registrada con tu firma digital.
                    </p>
                    <v-alert
                        type="warning"
                        variant="tonal"
                        density="compact"
                        rounded="lg"
                        class="text-caption mb-3"
                        icon="mdi-alert-circle"
                    >
                        Una vez validada, la historia clínica pasará a estado "Validada" y no podrá ser modificada sin autorización.
                    </v-alert>
                </v-card-text>
                <v-card-actions class="pa-4 pt-0">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" color="grey-darken-1" @click="showApproveDialog = false" :disabled="approving">
                        Cancelar
                    </v-btn>
                    <v-btn
                        color="success"
                        :loading="approving"
                        prepend-icon="mdi-check-circle"
                        @click="confirmApprove"
                    >
                        Validar HC
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Diálogo de Cierre Definitivo -->
        <v-dialog v-model="showCloseDialog" max-width="500" persistent>
            <v-card rounded="xl">
                <v-card-title class="d-flex align-center pa-4 pb-0">
                    <v-icon start color="error" size="28">mdi-lock</v-icon>
                    <span class="text-h6 font-weight-bold">Cerrar Historia Clínica</span>
                    <v-spacer></v-spacer>
                    <v-btn icon variant="text" size="small" @click="showCloseDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="pa-4">
                    <p class="text-body-2 text-medium-emphasis mb-4">
                        El cierre definitivo de la historia clínica es una acción <strong>irreversible</strong>.
                        Una vez cerrada, no se podrán agregar ni modificar datos.
                    </p>
                    <v-textarea
                        v-model="closeReason"
                        label="Motivo del cierre"
                        placeholder="Indique la razón del cierre (ej. tratamiento completado, paciente dado de alta)"
                        variant="outlined"
                        rounded="lg"
                        rows="3"
                        density="comfortable"
                        :rules="[v => !!v || 'El motivo es obligatorio']"
                        hide-details="auto"
                    ></v-textarea>
                </v-card-text>
                <v-card-actions class="pa-4 pt-0">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" color="grey-darken-1" @click="showCloseDialog = false" :disabled="closing">
                        Cancelar
                    </v-btn>
                    <v-btn
                        color="error"
                        :loading="closing"
                        :disabled="!closeReason.trim()"
                        prepend-icon="mdi-lock"
                        @click="confirmClose"
                    >
                        Cerrar Definitivamente
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>

    <v-container v-else class="fill-height">
        <v-row justify="center" align="center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-row>
    </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useNotification } from '@/utils/useNotification';
import CustomDatePicker from '@/components/shared/AppDatePicker.vue';
import { required, email, onlyNumbers, notOnlySpaces, decimalNumber} from '@/utils/validators';
import { API } from '@/api/endpoints';

const route = useRoute();
const router = useRouter();
const { notify } = useNotification();

const activeTab = ref(null);
const history = ref(null);
const saving = ref(null);
const permissions = ref([]);

const habits = ref([]);
const loadingHabits = ref(false);
const newHabit = ref('');
const savingHabit = ref(false);

// --- Imagen ANTES ---
const beforeFileInputRef = ref(null);
const beforeFile = ref(null);
const beforePreview = ref('');

const triggerBeforeFileInput = () => {
    beforeFileInputRef.value?.click();
};

const onBeforeImageSelected = (event) => {
    const target = event.target;
    if (target.files && target.files[0]) {
        beforeFile.value = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            beforePreview.value = e.target?.result;
        };
        reader.readAsDataURL(target.files[0]);
    }
};

// --- Imagen DESPUÉS ---
const afterFileInputRef = ref(null);
const afterFile = ref(null);
const afterPreview = ref('');

const triggerAfterFileInput = () => {
    afterFileInputRef.value?.click();
};

const onAfterImageSelected = (event) => {
    const target = event.target;
    if (target.files && target.files[0]) {
        afterFile.value = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            afterPreview.value = e.target?.result;
        };
        reader.readAsDataURL(target.files[0]);
    }
};

// --- FIRMA DIGITAL (Canvas con mouse/touch) ---
const signatureCanvas = ref(null);
const canvasWidth = ref(500);
const canvasHeight = ref(200);
const isDrawing = ref(false);
const signatureDrawn = ref(false);
const signatureConfirmed = ref(false);
let canvasContext = null;

const getCanvasPos = (e) => {
    const canvas = signatureCanvas.value;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
};

const startSign = (e) => {
    if (signatureConfirmed.value) return;
    isDrawing.value = true;
    signatureDrawn.value = true;
    const ctx = signatureCanvas.value?.getContext('2d');
    if (!ctx) return;
    canvasContext = ctx;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
};

const drawSign = (e) => {
    if (!isDrawing.value || !canvasContext) return;
    const pos = getCanvasPos(e);
    canvasContext.lineWidth = 3;
    canvasContext.lineCap = 'round';
    canvasContext.strokeStyle = '#1a1a2e';
    canvasContext.lineTo(pos.x, pos.y);
    canvasContext.stroke();
};

const endSign = () => {
    isDrawing.value = false;
};

let lastTouchPos = null;

const onTouchStart = (e) => {
    if (signatureConfirmed.value) return;
    isDrawing.value = true;
    signatureDrawn.value = true;
    const ctx = signatureCanvas.value?.getContext('2d');
    if (!ctx) return;
    canvasContext = ctx;
    const touch = e.touches[0];
    const pos = getCanvasPos(touch);
    lastTouchPos = pos;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
};

const onTouchMove = (e) => {
    if (!isDrawing.value || !canvasContext) return;
    const touch = e.touches[0];
    const pos = getCanvasPos(touch);
    canvasContext.lineWidth = 3;
    canvasContext.lineCap = 'round';
    canvasContext.strokeStyle = '#1a1a2e';
    canvasContext.lineTo(pos.x, pos.y);
    canvasContext.stroke();
    lastTouchPos = pos;
};

const onTouchEnd = () => {
    isDrawing.value = false;
    lastTouchPos = null;
};

const clearSignature = () => {
    const canvas = signatureCanvas.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureDrawn.value = false;
    signatureConfirmed.value = false;
};

const confirmSignature = () => {
    if (!signatureDrawn.value) return;
    const canvas = signatureCanvas.value;
    if (!canvas) return;
    // Convertir a PNG base64
    history.value.tx_signature = canvas.toDataURL('image/png');
    signatureConfirmed.value = true;
};

const enableSignatureRedraw = () => {
    signatureDrawn.value = true;
    signatureConfirmed.value = false;
    // Limpiar canvas
    const canvas = signatureCanvas.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Ajustar canvas width según el ancho de pantalla
const updateCanvasWidth = () => {
    const container = signatureCanvas.value?.parentElement;
    if (container) {
        const w = Math.min(container.clientWidth - 32, 500);
        canvasWidth.value = w;
    }
};

// ========== ESTADOS DE POSTOPERATORIOS (Regla 3) ==========
const postops = ref([]);
const loadingPostops = ref(false);
const showAddPostop = ref(false);
const savingPostop = ref(false);
const editingPostop = ref(null);
const showClosePostop = ref(false);
const closingPostop = ref(false);
const selectedPostop = ref(null);
const showPhotoPreview = ref(false);
const previewPhotoUrl = ref('');
const postopFileInputRef = ref(null);
const showDetailPostop = ref(false);
const detailPostop = ref(null);
const loadingDetailPostop = ref(false);

const postopForm = ref({
    tx_observations: '',
    newPhotos: [],
    existingPhotos: []
});

// ========== ESTADOS DE TIMELINE (Regla 8) ==========
const timeline = ref([]);
const loadingTimeline = ref(false);
const showTimelineDetail = ref(false);
const timelineEvent = ref(null);

// ========== ESTADOS DE RECETA MÉDICA ==========
const prescriptions = ref([]);
const loadingPrescriptions = ref(false);
const savingPrescription = ref(false);
const downloadingPdf = ref(false);

const prescriptionForm = ref({
    tx_medication: '',
    tx_dosage: '',
    tx_frequency: '',
    tx_duration: '',
    tx_notes: ''
});

// ========== ESTADOS DE VALIDACIÓN Y CIERRE (Reglas 5 y 6) ==========
const showApproveDialog = ref(false);
const showCloseDialog = ref(false);
const approving = ref(false);
const closing = ref(false);
const closeReason = ref('');

// --- Computed: conteo de postoperatorios ---
const postopsCount = computed(() => postops.value.length);

// --- Helpers de estado de HC ---
function getStatusLabel(status) {
    switch (status) {
        case 0: return 'Inactivo';
        case 1: return 'Iniciada';
        case 2: return 'Validada';
        case 3: return 'Cerrada';
        default: return 'Desconocido';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 0: return 'grey';
        case 1: return 'primary';
        case 2: return 'success';
        case 3: return 'error';
        default: return 'grey';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 0: return 'mdi-cancel';
        case 1: return 'mdi-progress-check';
        case 2: return 'mdi-check-circle';
        case 3: return 'mdi-lock';
        default: return 'mdi-help-circle';
    }
}

// --- Helpers de formato ---
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Mapeo de valores de tab a nombres de permisos
const tabPermissions = [
    { value: 'resumen', permission: 'Historia Clinica Resumen' },
    { value: 'antecedentes', permission: 'Historia Clinica Antecedentes' },
    { value: 'examen', permission: 'Historia Clinica Examen' },
    { value: 'plan', permission: 'Historia Clinica Diagnostico' },
    { value: 'aptitud', permission: 'Historia Clinica Aptitud' },
    { value: 'habitos', permission: 'Historia Clinica Habitos' },
    { value: 'receta', permission: 'Historia Clinica Receta' },
];

watch(activeTab, (newVal) => {
    if (newVal === 'habitos' && habits.value.length === 0) {
        fetchHabits();
    }
    if (newVal === 'receta' && prescriptions.value.length === 0) {
        fetchPrescriptions();
    }
    if (newVal === 'postoperatorios' && postops.value.length === 0) {
        fetchPostops();
    }
    if (newVal === 'timeline' && timeline.value.length === 0) {
        fetchTimeline();
    }
});

onMounted(async () => {
    await fetchPermissions();
    await fetchHistory();
    
    // Ajustar tamaño del canvas de firma
    setTimeout(() => updateCanvasWidth(), 300);
    
    // Si viene con query param tab=timeline, activar esa pestaña
    if (route.query.tab === 'timeline') {
        activeTab.value = 'timeline';
        await fetchTimeline();
    } else {
        setInitialTab();
    }
});

const hasAnyTabPermission = computed(() => {
    return tabPermissions.some(t => hasPermission(t.permission));
});

const fetchPermissions = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/users/permissions/list`);
        if (response.data?.status) {
            permissions.value = response.data.data;
        }
    } catch (error) {
        console.error("Error cargando permisos", error);
    }
};

const hasPermission = (permissionName) => {
    return permissions.value.includes(permissionName);
};

const setInitialTab = () => {
    const firstAllowed = tabPermissions.find(t => hasPermission(t.permission));
    if (firstAllowed) {
        activeTab.value = firstAllowed.value;
    }
};

const fetchHistory = async () => {
    try {
        const id = route.params.id;
        const response = await axios.get(API.MEDICAL_HISTORY.GET(id));
        if (response.data?.status) {
            const data = response.data.data;
            
            if (data.tx_peso) {
                data.tx_peso = String(data.tx_peso).replace('.', ',');
            }
            
            history.value = data;
        }
    } catch (error) {
        notify('error', 'Error al cargar datos');
    }
};

const fetchHabits = async () => {
    loadingHabits.value = true;
    try {
        const id = route.params.id;
        const response = await axios.get(API.MEDICAL_HISTORY.HABITS.ALL(id));
        if (response.data?.status) {
            habits.value = response.data.data;
        }
    } catch (error) {
        notify('error', 'Error al cargar hábitos');
    } finally {
        loadingHabits.value = false;
    }
};

const calculateIMC = () => {
    if (!history.value.tx_peso || !history.value.tx_talla) {
        history.value.tx_imc = null;
        return;
    }

    const pesoStr = String(history.value.tx_peso).replace(',', '.');
    const tallaStr = String(history.value.tx_talla).replace(',', '.');

    const peso = parseFloat(pesoStr);
    const talla = parseFloat(tallaStr) / 100;

    if (peso > 0 && talla > 0) {
        const imc = (peso / (talla * talla)).toFixed(2);
        history.value.tx_imc = imc;
    } else {
        history.value.tx_imc = null;
    }
};

const updateSection = async (sectionName) => {
    saving.value = sectionName;
    try {
        if (sectionName === 'resumen' && beforePreview.value) {
            history.value.tx_img_before = beforePreview.value;
            beforeFile.value = null;
            beforePreview.value = '';
            if (beforeFileInputRef.value) beforeFileInputRef.value.value = '';
        }

        if (sectionName === 'resumen' && afterPreview.value) {
            history.value.tx_img_after = afterPreview.value;
            afterFile.value = null;
            afterPreview.value = '';
            if (afterFileInputRef.value) afterFileInputRef.value.value = '';
        }

        if (sectionName === 'resumen' && signatureConfirmed.value) {
            // La firma ya se asignó a history.value.tx_signature en confirmSignature()
            signatureDrawn.value = false;
            signatureConfirmed.value = false;
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}medicalhistory/upd`, history.value);
        if (response.data.status) {
            notify('success', `Sección actualizada correctamente`);
        } else {
            notify('warning', response.data.msg || 'Error al actualizar');
        }
    } catch (error) {
        console.error('Error al actualizar historia clínica:', error);
        let errorMsg = 'Error de conexión';
        if (error.response) {
            errorMsg = `Error ${error.response.status}: ${error.response.data?.msg || error.response.data?.message || error.response.statusText}`;
            console.error('Respuesta del servidor:', error.response.data);
        } else if (error.request) {
            errorMsg = 'No se recibió respuesta del servidor. Verifica que el backend esté corriendo.';
        } else {
            errorMsg = error.message;
        }
        notify('error', errorMsg);
    } finally {
        saving.value = null;
    }
};

const addHabit = async () => {
    if (!newHabit.value.trim()) return;
    savingHabit.value = true;
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}medicalhistory/habits/add`, {
            id_history: route.params.id,
            tx_habit: newHabit.value
        });

        if (response.data.status) {
            newHabit.value = '';
            await fetchHabits();
            notify('success', response.data.msg || 'Hábito agregado');
        }else{
            notify('error', response.data.msg || 'Error al agregar hábito');
        }

    } catch (error) {
        notify('error', 'Error al agregar hábito');
    } finally {
        savingHabit.value = false;
    }
};

const deleteHabit = async (id) => {
    try {
        const response = await axios.delete(API.MEDICAL_HISTORY.HABITS.DELETE(id));
        if (response.data.status) {
            habits.value = habits.value.filter(h => h.id !== id);
            notify('success', response.data.msg || 'Hábito eliminado');
        }else{
            notify('error', response.data.msg || 'Error al eliminar hábito');
        }
    } catch (error) {
        notify('error', 'Error al eliminar');
    }
};

// ========== FUNCIONES DE RECETA MÉDICA ==========
const fetchPrescriptions = async () => {
    loadingPrescriptions.value = true;
    try {
        const id = route.params.id;
        const response = await axios.get(API.MEDICAL_HISTORY.PRESCRIPTIONS.ALL(id));
        if (response.data?.status) {
            prescriptions.value = response.data.data || [];
        }
    } catch (error) {
        console.error('Error cargando recetas:', error);
    } finally {
        loadingPrescriptions.value = false;
    }
};

const addPrescription = async () => {
    if (!prescriptionForm.value.tx_medication.trim()) {
        notify('warning', 'El nombre del medicamento es obligatorio');
        return;
    }
    savingPrescription.value = true;
    try {
        const response = await axios.post(API.MEDICAL_HISTORY.PRESCRIPTIONS.ADD, {
            id_history: route.params.id,
            tx_medication: prescriptionForm.value.tx_medication,
            tx_dosage: prescriptionForm.value.tx_dosage,
            tx_frequency: prescriptionForm.value.tx_frequency,
            tx_duration: prescriptionForm.value.tx_duration,
            tx_notes: prescriptionForm.value.tx_notes
        });

        if (response.data.status) {
            prescriptionForm.value = {
                tx_medication: '',
                tx_dosage: '',
                tx_frequency: '',
                tx_duration: '',
                tx_notes: ''
            };
            await fetchPrescriptions();
            notify('success', response.data.msg || 'Receta agregada correctamente');
        } else {
            notify('error', response.data.msg || 'Error al agregar receta');
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
    } finally {
        savingPrescription.value = false;
    }
};

const deletePrescription = async (id) => {
    try {
        const response = await axios.delete(API.MEDICAL_HISTORY.PRESCRIPTIONS.DELETE(id));
        if (response.data.status) {
            prescriptions.value = prescriptions.value.filter(p => p.id !== id);
            notify('success', response.data.msg || 'Receta eliminada');
        } else {
            notify('error', response.data.msg || 'Error al eliminar receta');
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
    }
};

// ========== DESCARGA DE PDF ==========
const downloadPdf = async () => {
    downloadingPdf.value = true;
    try {
        const id = route.params.id;
        const response = await axios.get(API.MEDICAL_HISTORY.PDF(id), {
            responseType: 'json'
        });

        if (response.data?.status && response.data?.data?.pdf_base64) {
            const byteCharacters = atob(response.data.data.pdf_base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const patientName = history.value ? `${history.value.tx_first_name}_${history.value.tx_last_name}` : 'historia_clinica';
            link.download = `HC_${patientName}_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            notify('success', 'PDF descargado correctamente');
        } else {
            notify('error', response.data?.msg || 'Error al generar el PDF');
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
    } finally {
        downloadingPdf.value = false;
    }
};

// ========== DESCARGA DE PDF DE RECETA INDIVIDUAL ==========
const downloadPrescriptionPdf = async (id) => {
    downloadingPdf.value = true;
    try {
        const response = await axios.get(API.MEDICAL_HISTORY.PRESCRIPTION_PDF(id), {
            responseType: 'json'
        });

        if (response.data?.status && response.data?.data?.pdf_base64) {
            const byteCharacters = atob(response.data.data.pdf_base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = response.data.filename || `receta_medica_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            notify('success', 'PDF de receta descargado correctamente');
        } else {
            notify('error', response.data?.msg || 'Error al generar el PDF de la receta');
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
    } finally {
        downloadingPdf.value = false;
    }
};

// ========== FUNCIONES DE POSTOPERATORIOS (Regla 3) ==========
const fetchPostops = async () => {
    loadingPostops.value = true;
    try {
        const id = route.params.id;
        const response = await axios.get(API.POSTCLINICA.BY_HISTORY(id));
        if (response.data?.status) {
            postops.value = response.data.data || [];
        }
    } catch (error) {
        console.error('Error cargando postoperatorios:', error);
    } finally {
        loadingPostops.value = false;
    }
};

const triggerPostopFileInput = () => {
    postopFileInputRef.value?.click();
};

const onPostopPhotosSelected = (event) => {
    const target = event.target;
    if (target.files) {
        for (const file of target.files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                postopForm.value.newPhotos.push({
                    file: file,
                    preview: e.target?.result
                });
            };
            reader.readAsDataURL(file);
        }
    }
};

const cancelPostopForm = () => {
    showAddPostop.value = false;
    editingPostop.value = null;
    postopForm.value = {
        tx_observations: '',
        newPhotos: [],
        existingPhotos: []
    };
};

const editPostop = (postop) => {
    editingPostop.value = postop;
    postopForm.value = {
        tx_observations: postop.tx_observations || '',
        newPhotos: [],
        existingPhotos: postop.tx_photos || []
    };
    showAddPostop.value = true;
};

const savePostop = async () => {
    if (!postopForm.value.tx_observations.trim()) {
        notify('warning', 'Las observaciones son obligatorias');
        return;
    }
    savingPostop.value = true;
    try {
        const payload = {
            id_history: route.params.id,
            tx_observations: postopForm.value.tx_observations
        };

        // Convertir nuevas fotos a base64
        if (postopForm.value.newPhotos.length > 0) {
            payload.tx_photos = postopForm.value.newPhotos.map(p => p.preview);
        }

        let response;
        if (editingPostop.value) {
            // Actualizar
            payload.id = editingPostop.value.id;
            // Incluir fotos existentes
            if (postopForm.value.existingPhotos.length > 0) {
                if (!payload.tx_photos) payload.tx_photos = [];
                payload.tx_photos = [...payload.tx_photos, ...postopForm.value.existingPhotos];
            }
            response = await axios.post(API.POSTCLINICA.UPDATE, payload);
        } else {
            response = await axios.post(API.POSTCLINICA.ADD, payload);
        }

        if (response.data.status) {
            notify('success', editingPostop.value ? 'Control actualizado' : 'Control creado correctamente');
            cancelPostopForm();
            await fetchPostops();
        } else {
            notify('error', response.data.msg || 'Error al guardar el control');
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
    } finally {
        savingPostop.value = false;
    }
};

const closePostop = (postop) => {
    selectedPostop.value = postop;
    showClosePostop.value = true;
};

const confirmClosePostop = async () => {
    if (!selectedPostop.value) return;
    closingPostop.value = true;
    try {
        const response = await axios.post(API.POSTCLINICA.CLOSE(selectedPostop.value.id));
        if (response.data.status) {
            notify('success', 'Control postoperatorio cerrado correctamente');
            showClosePostop.value = false;
            selectedPostop.value = null;
            await fetchPostops();
        } else {
            notify('error', response.data.msg || 'Error al cerrar el control');
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
    } finally {
        closingPostop.value = false;
    }
};

const openPhotoPreview = (url) => {
    previewPhotoUrl.value = url;
    showPhotoPreview.value = true;
};

// ========== VER DETALLE DEL POSTOPERATORIO ==========
const viewPostopDetail = async (postop) => {
    showDetailPostop.value = true;
    detailPostop.value = null;
    loadingDetailPostop.value = true;
    try {
        const response = await axios.get(API.POSTCLINICA.GET(postop.id));
        if (response.data?.status) {
            detailPostop.value = response.data.data;
        } else {
            notify('error', response.data?.msg || 'Error al cargar detalle del postoperatorio');
            showDetailPostop.value = false;
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
        showDetailPostop.value = false;
    } finally {
        loadingDetailPostop.value = false;
    }
};

// ========== FUNCIONES DE TIMELINE (Regla 8) ==========
const fetchTimeline = async () => {
    loadingTimeline.value = true;
    try {
        const id = route.params.id;
        const response = await axios.get(API.MEDICAL_HISTORY.TIMELINE(id));
        if (response.data?.status) {
            timeline.value = response.data.data || [];
        }
    } catch (error) {
        console.error('Error cargando timeline:', error);
    } finally {
        loadingTimeline.value = false;
    }
};

const viewTimelineDetail = (event) => {
    timelineEvent.value = event;
    showTimelineDetail.value = true;
};

// ========== FUNCIONES DE VALIDACIÓN MÉDICA (Regla 5) ==========
const confirmApprove = async () => {
    approving.value = true;
    try {
        const id = route.params.id;
        const response = await axios.post(API.MEDICAL_HISTORY.APPROVE(id));
        if (response.data.status) {
            notify('success', response.data.msg || 'Historia clínica validada correctamente');
            showApproveDialog.value = false;
            await fetchHistory(); // Recargar para actualizar estado
        } else {
            notify('error', response.data.msg || 'Error al validar la historia clínica');
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
    } finally {
        approving.value = false;
    }
};

// ========== FUNCIONES DE CIERRE DEFINITIVO (Regla 6) ==========
const confirmClose = async () => {
    if (!closeReason.value.trim()) {
        notify('warning', 'Debe indicar el motivo del cierre');
        return;
    }
    closing.value = true;
    try {
        const id = route.params.id;
        const response = await axios.post(API.MEDICAL_HISTORY.CLOSE(id), {
            tx_close_reason: closeReason.value
        });
        if (response.data.status) {
            notify('success', response.data.msg || 'Historia clínica cerrada correctamente');
            showCloseDialog.value = false;
            closeReason.value = '';
            await fetchHistory(); // Recargar para actualizar estado
        } else {
            notify('error', response.data.msg || 'Error al cerrar la historia clínica');
        }
    } catch (error) {
        const msg = error?.response?.data?.msg || error?.message || 'Error de conexión';
        notify('error', msg);
    } finally {
        closing.value = false;
    }
};
</script>

<style scoped>
.border-light { border: 1px solid rgba(0,0,0,0.08); }
.shadow-sm { box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important; }
.bg-blue-grey-lighten-5 { background-color: #f8fafb; }
.v-tab { min-width: 100px; }

.signature-container {
    position: relative;
    display: inline-block;
    width: 100%;
    max-width: 500px;
}
.signature-canvas {
    width: 100%;
    height: 200px;
    border: 2px dashed #ccc;
    background: #fafafa;
    cursor: crosshair;
    touch-action: none;
}
.signature-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    text-align: center;
}
</style>