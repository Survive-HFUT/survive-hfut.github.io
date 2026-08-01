<script lang="ts" setup>
import { WalineInitOptions } from '@waline/client';
import { Waline } from '@waline/client/component';
import { useRoute } from 'vitepress';
import { computed } from 'vue';

const url = 'https://waline-on-worker.gforoosge.workers.dev/'; // 临时

const emoji: WalineInitOptions['emoji'] = [
  'https://unpkg.com/@waline/emojis@1.4.0/tieba',
];

const route = useRoute();
const path = computed(() => route.path);
</script>

<template>
  <Waline
    class="waline-container"
    :serverURL="url"
    :path="path"
    :emoji="emoji"
    login="force"
    dark="html.dark"
    :pageSize="15"
    :wordLimit="[5, 500]"
    noRss
    noCopyright
  />
</template>

<style scoped>
.waline-container {
  margin-top: 20px;
  --waline-border-color: var(--vp-c-divider);
  --waline-theme-color: var(--vp-c-brand-1);
  --waline-active-color: var(--vp-c-brand);
  --waline-avatar-size: 2.5rem;
  --waline-bg-color: transparent;
}

:deep(.wl-login-info) {
  margin: 0 20px 0 0;
}

:deep(.wl-panel) {
  padding: 5px 10px;
  margin: 0 0 20px 0;
}

:deep(p),
:deep(.wl-content),
:deep(textarea) {
  color: var(--vp-c-text-1) !important;
  font-family: inherit;
}
</style>
