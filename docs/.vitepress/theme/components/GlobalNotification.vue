<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { inBrowser, useData, useRouter, useRoute } from 'vitepress';

const { frontmatter } = useData();
const router = useRouter();
const route = useRoute();

// 仅在首页展示
const isHome = computed(() => frontmatter.value?.layout === 'home');
const isVisible = ref(false);
const isScrolled = ref(false);

const closeNotice = () => {
  isVisible.value = false;
  if (inBrowser) {
    localStorage.setItem('dismissed-contribution-notice', 'true');
  }
};

// 点击消息跳转
const goToContribute = (e: MouseEvent) => {
  // 如果用户点击的是关闭按钮 (X) 或者是关闭按钮内部的 SVG，就不进行跳转
  const target = e.target as HTMLElement;
  if (target.closest('.close-btn')) {
    return;
  }
  
  // 跳转到 /about/contribute 征稿页面
  router.go('/about/contribute');
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// 触发通知显示的统一定时器逻辑
let timerId: ReturnType<typeof setTimeout> | null = null;

const triggerNotice = () => {
  if (!inBrowser) return;

  // 检查是否已经关闭过
  const isDismissed = localStorage.getItem('dismissed-contribution-notice');
  if (isDismissed === 'true') {
    return;
  }

  // 清除之前的定时器，防止叠加
  if (timerId) {
    clearTimeout(timerId);
  }

  // 延迟 2500ms 展现，在首屏大图 1.5s 完全载入淡入完成过一会儿后浮现，极致高雅
  timerId = setTimeout(() => {
    // 再次确认定时器触发时仍处于首页，防止快速切走后漏弹
    if (isHome.value) {
      isVisible.value = true;
    }
  }, 2500);
};

onMounted(() => {
  if (inBrowser) {
    // 初始化滚动状态
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 初始化时如果就是首页，触发延迟显示
    if (isHome.value) {
      triggerNotice();
    }
  }
});

onUnmounted(() => {
  if (inBrowser) {
    window.removeEventListener('scroll', handleScroll);
    if (timerId) {
      clearTimeout(timerId);
    }
  }
});

// 监听路由路径变化，支持 SPA 切回首页时重新延迟弹出，离开首页时瞬间收回
watch(
  () => route.path,
  () => {
    if (isHome.value) {
      triggerNotice();
    } else {
      isVisible.value = false;
    }
  }
);
</script>

<template>
  <Transition name="notif-slide">
    <div 
      v-if="isHome && isVisible" 
      class="global-notification" 
      :class="{ 'is-scrolled': isScrolled }"
      role="alert" 
      aria-live="polite"
      @click="goToContribute"
    >
      <!-- 顶部的精致渐变彩条 -->
      <div class="accent-bar"></div>
      
      <div class="notification-body">
        <div class="notification-header">
          <div class="notification-title">
            <!-- 喇叭图标 -->
            <svg class="speaker-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>征稿启事</span>
          </div>
          
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="closeNotice" aria-label="关闭通知">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- 正文 -->
        <p class="notification-content">
          本站点仍有部分文字、图片不完整，欢迎来补充！
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 悬浮窗主体 - 默认在大图顶部：暗色高透磨砂 */
.global-notification {
  position: fixed;
  top: 80px;
  right: 24px;
  width: 320px;
  z-index: 100;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer; /* 鼠标手形提示可点击跳转 */
  
  /* 默认暗灰色毛玻璃（与大图电影深色滤镜深度呼应） */
  background: rgba(30, 32, 35, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  
  /* 软阴影 */
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.16), 
    0 2px 8px rgba(0, 0, 0, 0.08);
  
  /* 全过渡动效，使滚动反色时背景和文字颜色顺滑变色 */
  transition: 
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 默认顶部状态下的各文字颜色：晶莹皓白 */
.notification-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.5px;
  transition: color 0.4s ease;
}

.notification-content {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
  word-break: break-all;
  transition: color 0.4s ease;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
}

.close-btn svg {
  width: 13px;
  height: 13px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: rotate(90deg);
}

/* ---------------------------------
   1. 滚动反色效果 (跟随首页反色)
   --------------------------------- */

/* 仅在亮色模式下（即 html 没有 .dark 类），当用户滚动页面后，卡片反色变白 */
:not(:global(.dark)) .global-notification.is-scrolled {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.06), 
    0 2px 8px rgba(0, 0, 0, 0.03);
}

:not(:global(.dark)) .global-notification.is-scrolled .notification-title {
  color: var(--vp-c-text-1);
}

:not(:global(.dark)) .global-notification.is-scrolled .notification-content {
  color: var(--vp-c-text-2);
}

:not(:global(.dark)) .global-notification.is-scrolled .close-btn {
  color: var(--vp-c-text-2);
}

:not(:global(.dark)) .global-notification.is-scrolled .close-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--vp-c-text-1);
}

/* ---------------------------------
   2. 深色模式状态 (Dark Mode)
   --------------------------------- */

/* 在深色模式下，通知卡片始终采用质感黑高透玻璃，无需跟随向下滑动反白 */
:global(.dark) .global-notification {
  background: rgba(30, 32, 35, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.24), 
    0 2px 8px rgba(0, 0, 0, 0.12);
}

:global(.dark) .global-notification .notification-title {
  color: var(--vp-c-text-1);
}

:global(.dark) .global-notification .notification-content {
  color: var(--vp-c-text-2);
}

:global(.dark) .global-notification .close-btn {
  color: var(--vp-c-text-2);
}

:global(.dark) .global-notification .close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--vp-c-text-1);
}

/* ---------------------------------
   3. Hover 提升微动效
   --------------------------------- */
@media (hover: hover) {
  .global-notification:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 18px 40px rgba(0, 0, 0, 0.22), 
      0 4px 14px rgba(0, 0, 0, 0.12);
    border-color: rgba(62, 175, 124, 0.36);
  }
  
  /* 滚动后亮色模式下的 hover */
  :not(:global(.dark)) .global-notification.is-scrolled:hover {
    box-shadow: 
      0 18px 40px rgba(0, 0, 0, 0.08), 
      0 4px 14px rgba(0, 0, 0, 0.04);
    border-color: rgba(62, 175, 124, 0.32);
  }

  /* 深色模式下的 hover */
  :global(.dark) .global-notification:hover {
    box-shadow: 
      0 18px 40px rgba(0, 0, 0, 0.36), 
      0 4px 14px rgba(0, 0, 0, 0.18);
    border-color: rgba(62, 175, 124, 0.45);
  }
}

/* 顶部色彩渐变装饰条 */
.accent-bar {
  height: 3.5px;
  background: linear-gradient(90deg, #3eaf7c, #3b82f6, #a855f7);
  background-size: 200% 200%;
  animation: gradient-flow 6s ease infinite;
}

@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 内容布局 */
.notification-body {
  padding: 14px 16px 16px 16px;
}

/* 头部排版 */
.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

/* 喇叭图标 */
.speaker-icon {
  width: 17px;
  height: 17px;
  color: #3eaf7c;
  animation: speaker-bounce 2s ease-in-out infinite;
}

@keyframes speaker-bounce {
  0%, 100% { transform: rotate(0); }
  15% { transform: rotate(-10deg); }
  30% { transform: rotate(12deg); }
  45% { transform: rotate(-10deg); }
  60% { transform: rotate(8deg); }
  75% { transform: rotate(-4deg); }
}

/* 响应式样式（移动端） */
@media (max-width: 768px) {
  .global-notification {
    top: 76px;
    left: 16px;
    right: 16px;
    width: auto;
    /* 移动端取消或弱化向上位移，以防横向布局触控体验不适 */
    transform: none !important;
  }
  
  @media (hover: hover) {
    .global-notification:hover {
      transform: none !important;
    }
  }
}

/* Vue 过渡动画：从右侧 40px 处滑入并淡入，极度优雅 */
.notif-slide-enter-active,
.notif-slide-leave-active {
  transition: 
    opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.notif-slide-enter-from,
.notif-slide-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

@media (max-width: 768px) {
  /* 移动端同样从右侧滑入，滑行距离缩短以适配窄屏 */
  .notif-slide-enter-from,
  .notif-slide-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
}
</style>
