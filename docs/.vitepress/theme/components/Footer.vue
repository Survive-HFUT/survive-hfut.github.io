<script setup lang="ts">
import { useLayout } from 'vitepress/theme';
import { data } from '../../data/metadata.data';

const { hasSidebar } = useLayout();
</script>

<template>
  <footer class="VPFooter" :class="{ 'has-sidebar': hasSidebar }">
    <div class="container">
      <p>
        使用 <a href="https://vitepress.dev" target="_blank">VitePress</a> 构建
      </p>
      <p>
        <span>
          最后更新于
          {{
            new Date(data.time).toLocaleString('zh-CN', {
              timeZone: 'Asia/Shanghai',
            })
          }}
        </span>
        <template v-if="data.context.sha">
          <span style="margin: 0 4px">·</span>
          <code :title="data.context.sha">
            {{ data.context.sha.substring(0, 7) }}
          </code>
        </template>
      </p>
      <p>未作特别声明的内容，均按照 CC-BY-SA 4.0 协议进行分发</p>
    </div>
  </footer>
</template>

<style scoped>
/**
    https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/components/VPFooter.vue
*/

.VPFooter {
  position: relative;
  z-index: var(--vp-z-index-footer);
  border-top: 1px solid var(--vp-c-gutter);
  padding: 32px 24px;
  background-color: var(--vp-c-bg);
}

.VPFooter.has-sidebar {
  display: none;
}

.VPFooter :deep(a) {
  text-decoration-line: underline;
  text-underline-offset: 2px;
  transition: color 0.25s;
}

.VPFooter :deep(a:hover) {
  color: var(--vp-c-text-1);
}

@media (min-width: 768px) {
  .VPFooter {
    padding: 32px;
  }
}

.container {
  margin: 0 auto;
  max-width: var(--vp-layout-max-width);
  text-align: center;
}

.container > * {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
