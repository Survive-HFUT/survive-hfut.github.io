<script lang="ts" setup>
import { Waline } from '@waline/client/component';
import { useRoute } from 'vitepress';
import { computed } from 'vue';

const url = 'https://api.survive-hfut.cc/';
const route = useRoute();
const path = computed(() => route.path);
</script>

<template>
  <Waline
    class="waline-container"
    :serverURL="url"
    :path="path"
    :emoji="[]"
    login="force"
    dark="html.dark"
    :pageSize="15"
    :wordLimit="[1, 1000]"
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

:deep(label.wl-action[for='wl-image-upload']),
:deep(.wl-image-upload) {
  display: none;
  visibility: hidden;
}

:deep(.wl-editor) {
  font-size: 14px;
}
</style>
