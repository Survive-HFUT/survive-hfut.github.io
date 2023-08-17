import { defineUserConfig } from "vuepress";
import theme from "./theme";
import { searchPlugin } from '@vuepress/plugin-search'

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "活在肥宣",
  description: "你的薰化路 301 号指南",

  theme,

  plugins: [
    searchPlugin({
      // 配置项
    }),
  ],

  // Enable it with pwa
  // shouldPrefetch: false,
});
