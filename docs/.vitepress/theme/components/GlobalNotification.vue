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
/* 全局通知组件样式已全量迁移合并至全局的 \docs\.vitepress\theme\styles\home.css 中进行统一管理 */
</style>
