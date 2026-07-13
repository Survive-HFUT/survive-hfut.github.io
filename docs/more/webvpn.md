# 内网资源访问助手

## 准备 Access Token

请先在[WebVPN 系统](https://webvpn.hfut.edu.cn/)登录，以确保 cookie 中带有 access token。

## 输入

<script setup>
import WebVPN from '../.vitepress/theme/components/WebVPN.vue'
import { ref } from 'vue'

const w = ref({});
</script>

<WebVPN ref="w" />

## 输出

```txt-vue
{{w.result||'-'}}
```

<a v-if="w.result" :href="w.result" target="_blank">在新标签页中打开此网址</a>
