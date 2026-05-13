<template>
  <div class="search-wrapper">
    <div 
      class="search-box" 
      :class="{ 'expanded': isExpanded || modelValue }"
    >
      <v-icon 
        :color="modelValue ? 'error' : 'primary'" 
        class="main-icon" 
        :class="{ 'rotate-icon': modelValue }"
        @click="handleIconClick"
      >
        {{ modelValue ? 'mdi-close' : 'mdi-magnify' }}
      </v-icon>

      <input
        ref="inputRef"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="label"
        class="native-input"
        @focus="isExpanded = true"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Añadimos la prop 'label' con un valor por defecto
interface Props {
  modelValue: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Buscar registros...'
});

const emit = defineEmits(['update:modelValue']);

const isExpanded = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const handleIconClick = () => {
  if (props.modelValue) {
    emit('update:modelValue', '');
    inputRef.value?.focus();
  } else {
    inputRef.value?.focus();
  }
};

const handleBlur = () => {
  isExpanded.value = false;
};
</script>

<style scoped>
/* Mantén tus estilos anteriores aquí, son perfectos para el responsive */
.search-wrapper {
  display: flex;
  justify-content: flex-end;
  height: 42px;
  min-width: 42px; 
}
.search-box {
  display: flex;
  align-items: center;
  border-radius: 21px;
  height: 42px;
  width: 42px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid transparent;
}
.search-box.expanded {
  width: 320px;
  border-color: #e0e0e0;
  padding: 0 4px;
}

.main-icon {
  min-width: 42px;
  height: 42px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, color 0.2s ease;
  z-index: 2;
}
.rotate-icon {
  transform: rotate(90deg);
}
.native-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 16px 0 4px;
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  width: 100%;
}
.search-box.expanded .native-input {
  opacity: 1;
}
@media (max-width: 600px) {
  .search-wrapper { flex-grow: 1; margin-left: 8px; }
  .search-box.expanded { width: 100%; max-width: 100%; }
}
.search-box:not(.expanded):hover { background: #e8eaed; }
</style>