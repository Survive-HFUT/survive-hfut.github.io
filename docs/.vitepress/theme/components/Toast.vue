<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  toastMessage: string;
  showToast: boolean;
}>();

const _toastMessage = computed(() => props.toastMessage);
const _showToast = computed(() => props.showToast);
</script>

<template>
  <!-- 全局 Toast 提示 -->
  <Transition name="toast">
    <div v-if="_showToast" class="global-toast">
      {{ _toastMessage }}
    </div>
  </Transition>
</template>

<style scoped>
/* Global Toast Styles */
.global-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--vp-c-text-1);
  color: var(--vp-c-bg);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  pointer-events: none;
  text-align: center;
  max-width: 90vw;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
