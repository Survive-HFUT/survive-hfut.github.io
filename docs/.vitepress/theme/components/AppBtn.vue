<script setup lang="ts">
import { onMounted, ref } from 'vue';

const TIMEOUT = 2500;
const FALLBACK_PATH =
  '/life/app?deeplink_failed=1#%E8%81%9A%E5%9C%A8%E5%B7%A5%E5%A4%A7';

const props = withDefaults(
  defineProps<{
    /** DeepLink 地址，格式：hfut_schedule://host */
    href: string;
    /** 按钮文本 */
    text?: string;
  }>(),
  {
    text: '在聚在工大 App 打开',
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
 *
 * 注意：不使用 S.browser_fallback_url，因为 App 未安装时会立即触发，
 * 而不是等待我们自己的定时器来处理 fallback。
 */
const toAndroidIntentUrl = (rawUrl: string, packageName: string): string => {
  if (typeof window === 'undefined') return rawUrl;

  const match = rawUrl.match(/^([a-zA-Z][a-zA-Z0-9+._-]*):\/\/(.+)$/);
  if (!match) return rawUrl;

  const scheme = match[1];
  const body = match[2];

  // 只转换 hfut_schedule scheme
  if (scheme !== 'hfut_schedule') return rawUrl;

  return `intent://${body}#Intent;scheme=${scheme};package=${packageName};end`;
};

/**
 * 尝试通过指定包名打开 App，在超时内返回是否成功打开
 */
const tryOpenApp = (
  packageName: string,
  timeout: number = TIMEOUT,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const targetUrl = toAndroidIntentUrl(props.href, packageName);
    let hasLeft = false;

    const visibilityChangeHandler = () => {
      if (document.visibilityState === 'hidden') {
        hasLeft = true;
        document.removeEventListener(
          'visibilitychange',
          visibilityChangeHandler,
        );
        resolve(true);
      }
    };
    document.addEventListener('visibilitychange', visibilityChangeHandler, {
      once: true,
    });

    window.location.href = targetUrl;

    setTimeout(() => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
      resolve(false);
    }, timeout);
  });
};

const handleClick = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  if (!isAndroid.value || !props.href) return;

  // 尝试主包
  if (await tryOpenApp('com.hfut.schedule')) return;
  // 尝试 debug 包（等待时间减半）
  if (await tryOpenApp('com.hfut.schedule.debug', 1500)) return;

  // 两个包都打不开，跳转 fallback 页面
  window.location.href = window.location.origin + FALLBACK_PATH;
};
</script>

<template>
  <div class="wrapper">
    <button
      class="btn"
      :class="{ disabled: !isAndroid }"
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
      <span>
        <slot>{{ text }}</slot>
      </span>
    </button>
    <div class="tip">*仅支持安卓系统手机</div>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 10px 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 4px 0;
}

.btn:hover:not(.disabled) {
  background: var(--vp-c-brand-1);
  color: white;
}

.btn:active:not(.disabled) {
  transform: translateY(1px);
}

.btn.disabled {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  cursor: not-allowed;
  border: 1px solid var(--vp-c-divider);
}

.btn.disabled:hover {
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
