# 内网资源访问助手

:::info

请先在[WebVPN 系统](https://webvpn.hfut.edu.cn/)登录，以确保 cookie 中带有 access token。

:::

:::tip

你也可以通过“聚在工大”App 实现类似的转换功能

<AppBtn href="hfut_schedule://webvpn" text="在聚在工大 App 打开WebVPN转换"/>

:::

## 输入

<script setup>
import WebVPNConverter from '../.vitepress/theme/components/WebVPNConverter.vue'
import { ref } from 'vue'

const w = ref({});
</script>

<WebVPNConverter ref="w" />

## 输出

```txt-vue
{{w.result||'-'}}
```

<a v-if="w.result" :href="w.result" target="_blank">在新标签页中打开此网址</a>
