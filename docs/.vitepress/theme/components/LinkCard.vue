<script setup lang="ts">
defineProps<{
  href: string;
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <a :href="href" class="link-card">
    <div v-if="title || $slots.text || $slots.icon" class="card-header">
      <div class="title-group">
        <span v-if="title" class="card-title">{{ title }}</span>
        <span v-if="subtitle" class="card-subtitle">{{ subtitle }}</span>
        <slot name="title-suffix" />
      </div>
      <slot name="right" />
    </div>
    <div v-if="$slots.default" class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </a>
</template>

<style scoped>
.link-card {
  --card-radius: 10px;
  --card-padding: 18px;
  --card-header-align: flex-start;

  display: block;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 400;
  padding: var(--card-padding);
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--card-radius);
  background: var(--vp-c-bg-soft);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.link-card:hover {
  border-color: var(--vp-c-brand-1);
  background: color-mix(
    in srgb,
    var(--vp-c-bg-soft) 96%,
    var(--vp-c-brand-soft)
  );
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: var(--card-header-align);
  gap: 16px;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.card-title {
  font-weight: var(--card-title-weight, 600);
  font-size: var(--card-title-size, 16px);
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.card-subtitle {
  font-size: 14px;
  color: var(--vp-c-brand-1);
}

.card-text {
  font-size: 14px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.card-body {
  margin-top: 12px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.card-footer {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .card-extra {
    align-items: flex-start;
  }
}
</style>
