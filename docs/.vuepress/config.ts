import { defineUserConfig } from "vuepress";
import theme from "./theme";
import { searchPlugin } from '@vuepress/plugin-search'

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "肥工生存手册",
  description: "更适合泥工宝宝体质的生存手册",

  theme,

  plugins: [
    searchPlugin({
      // 配置项
    }),
  ],

  // Enable it with pwa
  // shouldPrefetch: false,
});
