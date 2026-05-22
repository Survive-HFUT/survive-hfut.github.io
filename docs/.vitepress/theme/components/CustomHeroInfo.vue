<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { inBrowser, useData } from 'vitepress';

const { frontmatter, isDark } = useData();

type HeroVariant = {
  name: string;
  text: string;
};

const variants = computed<HeroVariant[]>(() => {
  const rawNames = normalizeStrings(frontmatter.value.hero?.names);
  const rawTexts = normalizeStrings(frontmatter.value.hero?.texts);

  if (rawNames.length > 0 || rawTexts.length > 0) {
    const length = Math.max(rawNames.length, rawTexts.length);

    return Array.from({ length }, (_, index) => ({
      name:
        rawNames.length > 0
          ? (rawNames[index % rawNames.length] ?? '')
          : (frontmatter.value.hero?.name ?? ''),
      text:
        rawTexts.length > 0
          ? (rawTexts[index % rawTexts.length] ?? '')
          : (frontmatter.value.hero?.text ?? ''),
    })).filter((item) => item.name.length > 0 || item.text.length > 0);
  }

  return frontmatter.value.hero?.name || frontmatter.value.hero?.text
    ? [
        {
          name: frontmatter.value.hero?.name ?? '',
          text: frontmatter.value.hero?.text ?? '',
        },
      ]
    : [];
});
const displayedName = ref(
  variants.value[0]?.name ?? frontmatter.value.hero?.name ?? '',
);
const displayedText = ref('');
const activeTextForImage = ref(
  variants.value[0]?.text ?? frontmatter.value.hero?.text ?? '',
);
const hasTexts = computed(
  () =>
    Array.isArray(frontmatter.value.hero?.texts) &&
    frontmatter.value.hero.texts.length > 0,
);
const hasFallbackText = computed(() => !!frontmatter.value.hero?.text);
const showText = computed(() => hasTexts.value || hasFallbackText.value);

const isScrolled = ref(false);
const handleScroll = () => {
  if (inBrowser) {
    isScrolled.value = window.scrollY > 50;
  }
};

const imageSourceInfo = computed(() => {
  const text = activeTextForImage.value || displayedText.value || '';
  if (text.includes('薰化路')) {
    return {
      campus: '宣城校区',
      author: 'HenryPan',
      link: 'https://github.com/HenryPanHFUT',
    };
  }
  if (text.includes('翡翠')) {
    return {
      campus: '翡翠湖校区',
      author: '工大官网',
      link: 'https://www.hfut.edu.cn/',
    };
  }
  if (text.includes('屯溪路')) {
    return {
      campus: '屯溪路校区',
      author: '工大官网',
      link: 'https://www.hfut.edu.cn/',
    };
  }
  return null;
});

const showBgSourceTag = computed(() => {
  return !isDark.value && 
         isInitialDelayPassed.value && 
         currentBgImage.value && 
         !isScrolled.value && 
         imageSourceInfo.value;
});

const currentCampus = ref('');
const currentAuthor = ref('');
const currentLink = ref('');
let authorDelayTimer: any = null;

watch(
  imageSourceInfo,
  (newInfo) => {
    if (authorDelayTimer) {
      clearTimeout(authorDelayTimer);
      authorDelayTimer = null;
    }

    if (!newInfo) {
      currentCampus.value = '';
      currentAuthor.value = '';
      currentLink.value = '';
      return;
    }

    // 1. 立即更新校区名称，瞬间触发翻转过渡
    currentCampus.value = newInfo.campus;

    // 2. 80ms 黄金微延迟更新作者和链接，完美防抖，如果前后内容一致则自动静止
    authorDelayTimer = setTimeout(() => {
      currentAuthor.value = newInfo.author;
      currentLink.value = newInfo.link || '';
    }, 80);
  },
  { immediate: true, deep: true }
);

const isMounted = ref(false);

const bgImageMap: Record<string, string> = {
  xuanhua: new URL('../../../media/east_gate_new.jpg', import.meta.url).href,
  feicui: new URL('../../../campus/fch/dongfengguangchang.jpg', import.meta.url)
    .href,
  tunxi: new URL(
    '../../../campus/txl/main_academic_building.png',
    import.meta.url,
  ).href,
};

const isInitialDelayPassed = ref(false);
let pendingBgUrl = '';

const currentBgImage = computed(() => {
  if (isDark.value) {
    return '';
  }
  const text = activeTextForImage.value || displayedText.value || '';
  if (text.includes('薰化路')) return bgImageMap.xuanhua;
  if (text.includes('翡翠')) return bgImageMap.feicui;
  if (text.includes('屯溪路')) return bgImageMap.tunxi;
  return '';
});

let activeBgLayer: 'a' | 'b' = 'a';
let activeBgUrl = '';

watch(
  currentBgImage,
  (url) => {
    if (!inBrowser || typeof window === 'undefined') {
      return;
    }

    if (!url || isDark.value) {
      clearHomeBg();
      pendingBgUrl = '';
      return;
    }

    if (typeof Image === 'undefined') {
      setHomeBg(url);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (!isDark.value) {
        setHomeBg(url);
      } else {
        clearHomeBg();
      }
    };
    img.onerror = () => {
      clearHomeBg();
    };
    img.src = url;
  },
  { immediate: true },
);

let stopped = false;

// 打乱数组顺序
function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 随机上下浮动
function jitter(baseMs: number, ratio = 0.5) {
  const min = baseMs * (1 - ratio);
  const max = baseMs * (1 + ratio);
  return Math.round(min + Math.random() * (max - min));
}

function normalizeStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item: unknown): item is string => typeof item === 'string',
  );
}

function setHomeBg(url: string) {
  if (!isInitialDelayPassed.value) {
    pendingBgUrl = url;
    return;
  }

  if (url === activeBgUrl) {
    return;
  }

  const root = document.documentElement;
  const cssUrl = `url("${url}")`;

  if (!root.classList.contains('has-home-hero-bg')) {
    activeBgLayer = 'a';
    root.style.setProperty('--home-hero-bg-image-a', cssUrl);
    root.style.setProperty('--home-hero-bg-image-b', cssUrl);
    root.classList.remove('home-hero-bg-b-active');
  } else if (activeBgLayer === 'a') {
    activeBgLayer = 'b';
    root.style.setProperty('--home-hero-bg-image-b', cssUrl);
    root.classList.add('home-hero-bg-b-active');
  } else {
    activeBgLayer = 'a';
    root.style.setProperty('--home-hero-bg-image-a', cssUrl);
    root.classList.remove('home-hero-bg-b-active');
  }

  activeBgUrl = url;
  document.documentElement.classList.add('has-home-hero-bg');
}

function clearHomeBg() {
  const root = document.documentElement;
  root.style.removeProperty('--home-hero-bg-image-a');
  root.style.removeProperty('--home-hero-bg-image-b');
  root.classList.remove('has-home-hero-bg', 'home-hero-bg-b-active');
  activeBgUrl = '';
  activeBgLayer = 'a';
  pendingBgUrl = '';
}

// 打字机效果
async function runTypewriter() {
  const items = shuffle(variants.value);

  if (items.length === 0) {
    displayedName.value = frontmatter.value.hero?.name ?? '';
    displayedText.value = frontmatter.value.hero?.text ?? '';
    return;
  }

  displayedName.value = items[0]?.name ?? frontmatter.value.hero?.name ?? '';
  activeTextForImage.value = items[0]?.text ?? frontmatter.value.hero?.text ?? '';

  let index = 0;
  while (!stopped) {
    const current = items[index] ?? { name: '', text: '' };
    displayedName.value = current.name || frontmatter.value.hero?.name || '';
    activeTextForImage.value =
      current.text || frontmatter.value.hero?.text || '';

    for (let i = 0; i <= current.text.length && !stopped; i += 1) {
      displayedText.value = current.text.slice(0, i);
      await sleep(jitter(90));
    }

    await sleep(2500);

    for (let i = current.text.length; i >= 0 && !stopped; i -= 1) {
      displayedText.value = current.text.slice(0, i);
      await sleep(jitter(50));
    }

    await sleep(300);

    index += 1;
    if (index >= items.length) {
      index = 0;
    }
  }
}

onMounted(() => {
  stopped = false;
  isMounted.value = true;
  if (inBrowser && typeof document !== 'undefined') {
    document.documentElement.classList.add('is-home-layout');
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  runTypewriter();
  window.setTimeout(() => {
    isInitialDelayPassed.value = true;
    if (!stopped && !isDark.value) {
      if (pendingBgUrl) {
        setHomeBg(pendingBgUrl);
        pendingBgUrl = '';
      } else if (currentBgImage.value) {
        setHomeBg(currentBgImage.value);
      }
    }
  }, 1500);
});

onBeforeUnmount(() => {
  stopped = true;
  isMounted.value = false;
  if (authorDelayTimer) {
    clearTimeout(authorDelayTimer);
    authorDelayTimer = null;
  }
  if (inBrowser && typeof window !== 'undefined') {
    clearHomeBg();
    window.removeEventListener('scroll', handleScroll);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('is-home-layout');
    }
  }
});
</script>
<template>
  <h1 class="heading">
    <span
      v-if="displayedName || frontmatter.hero?.name"
      v-html="displayedName || frontmatter.hero?.name"
      class="name clip"
    ></span>
    <span v-if="showText" class="text">
      <span class="text-content" v-html="displayedText"></span>
      <span class="cursor" aria-hidden="true">_</span>
    </span>
  </h1>
  <p
    v-if="frontmatter.hero?.tagline"
    v-html="frontmatter.hero.tagline"
    class="tagline"
  ></p>

  <!-- 背景图片版权来源小标签 -->
  <Teleport v-if="isMounted" to="body">
    <Transition name="fade">
      <div 
        v-if="showBgSourceTag" 
        class="bg-source-tag"
      >
        <div class="source-content-wrapper">
          <!-- 1. 校区名称独立翻转 -->
          <div class="campus-part">
            <Transition name="slide-up" mode="out-in">
              <span :key="currentCampus" class="campus-name">
                {{ currentCampus }}
              </span>
            </Transition>
          </div>
          
          <span class="source-divider">|</span>
          
          <!-- 2. 作者来源部分独立翻转（如果都是工大官网，此部分将稳如磐石） -->
          <div class="author-part">
            <Transition name="slide-up" mode="out-in">
              <span :key="currentAuthor" class="source-author-wrap">
                <span>来源：</span>
                <a 
                  v-if="currentLink" 
                  :href="currentLink" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="source-author-link"
                >
                  {{ currentAuthor }}
                </a>
                <span v-else class="source-author-text">{{ currentAuthor }}</span>
              </span>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 此组件的样式已全量搬移合并至全局的 D:\Codes\Web\survive-hfut\docs\.vitepress\theme\styles\home.css 中进行统一管理 */
</style>
