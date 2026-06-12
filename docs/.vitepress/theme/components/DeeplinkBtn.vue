<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    /** DeepLink 地址，格式：hfut_schedule://host */
    href: string;
    /** 按钮文本 */
    text?: string;
    /** Android 包名，默认：com.hfut.schedule */
    packageName?: string;
    /** 跳转失败后的回退路径 */
    fallbackPath?: string;
  }>(),
  {
    text: '在聚在工大 App 打开',
    packageName: 'com.hfut.schedule.debug', // 记得改回去
    fallbackPath: '/life/app?deeplink_failed=1#%E8%81%9A%E5%9C%A8%E5%B7%A5%E5%A4%A7',
  },
);

const isAndroid = ref(false);

onMounted(() => {
  if (typeof navigator !== 'undefined') {
    isAndroid.value = /android/i.test(navigator.userAgent);
  }
});

/**
 * 将 hfut_schedule:// 转换为 Android intent:// URL
 *
 * 背景：hfut_schedule 包含下划线，不符合标准 URI scheme 规范。
 * 浏览器会将其误认为是相对路径，导致跳转到当前域名的 404 页面。
 * 解决办法：在 Android 上转换为 intent:// 协议，确保正确拉起 App。
 */
const toAndroidIntentUrl = (rawUrl: string): string => {
  if (typeof window === 'undefined') return rawUrl;

  const fallbackUrl = encodeURIComponent(window.location.origin + props.fallbackPath);

  const match = rawUrl.match(/^([a-zA-Z][a-zA-Z0-9+._-]*):\/\/(.+)$/);
  if (!match) return rawUrl;

  const scheme = match[1];
  const body = match[2];

  // 只转换 hfut_schedule scheme
  if (scheme !== 'hfut_schedule') return rawUrl;

  return `intent://${body}#Intent;scheme=${scheme};package=${props.packageName};S.browser_fallback_url=${fallbackUrl};end`;
};

const handleClick = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  if (!isAndroid.value) return;

  const targetUrl = toAndroidIntentUrl(props.href);
  const fallbackUrl = window.location.origin + props.fallbackPath;

  // 使用隐藏的 iframe 尝试打开 DeepLink
  // 这样即使 App 未安装，也不会显示系统错误弹窗
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = targetUrl;
  document.body.appendChild(iframe);

  // 标记是否成功跳转
  let hasLeft = false;

  const onHidden = () => {
    hasLeft = true;
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHidden();
  }, { once: true });
  window.addEventListener('pagehide', onHidden, { once: true });
  window.addEventListener('blur', onHidden, { once: true });

  // 2.5 秒内没有跳出，则跳转 fallback 页面
  setTimeout(() => {
    // 清理 iframe
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }

    if (!hasLeft) {
      window.location.href = fallbackUrl;
    }
  }, 2500);
};
</script>

<template>
  <div class="deeplink-container">
    <button
      class="deeplink-btn"
      :class="{ 'is-disabled': !isAndroid }"
      :title="isAndroid ? text : '仅支持安卓系统手机'"
      @click="handleClick"
    >
      <svg class="icon" viewBox="0 0 24 24" width="14" height="14">
        <!-- Smartphone icon -->
        <path
          fill="currentColor"
          d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"
        />
      </svg>
      <span><slot>{{ text }}</slot></span>
    </button>
    <div class="tip">*仅支持安卓系统手机</div>
  </div>
</template>

<style scoped>
.deeplink-container {
  margin: 10px 0;
}
.deeplink-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--vp-c-brand-2);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.deeplink-btn:hover:not(.is-disabled) {
  background: var(--vp-c-brand-3);
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

.tip {
  color: var(--vp-c-text-3);
  font-size: 12px;
}
</style>
