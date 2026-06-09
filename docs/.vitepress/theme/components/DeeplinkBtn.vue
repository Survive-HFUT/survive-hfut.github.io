<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  href: string;
  text?: string;
}>(), {
  text: '在聚在工大 App 打开'
});

const isAndroid = ref(false);

onMounted(() => {
  if (typeof navigator !== 'undefined') {
    isAndroid.value = /android/i.test(navigator.userAgent);
  }
});

const handleClick = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  if (isAndroid.value) {
    let targetUrl = props.href;
    
    // 修复：hfut_schedule 包含下划线，不符合标准 URI scheme 规范。
    // 浏览器会将其误认为是相对路径，导致跳转到当前域名的 404 页面。
    // 解决办法：转换为安卓标准的 intent:// 协议
    const match = targetUrl.match(/^([a-zA-Z0-9_]+):\/\/(.*)$/);
    if (match && match[1].includes('_')) {
      const scheme = match[1];
      const path = match[2];
      targetUrl = `intent://${path}#Intent;scheme=${scheme};end`;
    }

    const fallbackUrl = window.location.origin + '/life/app?deeplink_failed=1#%E8%81%9A%E5%9C%A8%E5%B7%A5%E5%A4%A7';

    // 尝试跳转
    window.location.href = targetUrl;

    // 监听页面可见性变化
    let isHidden = false;
    const visibilityChangeHandler = () => {
      if (document.visibilityState === 'hidden') {
        isHidden = true;
      }
    };
    document.addEventListener('visibilitychange', visibilityChangeHandler, { once: true });

    // 延时判断：如果没有跳出 App 且没有弹窗（失去焦点），则执行降级跳转
    setTimeout(() => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
      // 如果页面一直没有隐藏，且当前焦点还在页面上（说明没有被系统弹窗遮挡）
      if (!isHidden && document.hasFocus()) {
        window.location.href = fallbackUrl;
      }
    }, 2500);
  }
};
</script>

<template>
  <button 
    class="deeplink-btn" 
    :class="{ 'is-disabled': !isAndroid }"
    @click="handleClick"
    :title="!isAndroid ? '仅安卓手机支持 App 内打开' : ''"
  >
    <svg class="icon" viewBox="0 0 24 24" width="14" height="14">
      <!-- Smartphone icon -->
      <path fill="currentColor" d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
    </svg>
    <span><slot>{{ text }}</slot></span>
  </button>
</template>

<style scoped>
.deeplink-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 4px 0;
}

.deeplink-btn:hover:not(.is-disabled) {
  background: var(--vp-c-brand-1);
  color: white;
}

.deeplink-btn:active:not(.is-disabled) {
  transform: translateY(1px);
}

.deeplink-btn.is-disabled {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  cursor: not-allowed;
  border: 1px solid var(--vp-c-divider);
}

.deeplink-btn.is-disabled:hover {
  background: var(--vp-c-bg-mute);
}

.icon {
  flex-shrink: 0;
  opacity: 0.9;
}
</style>
