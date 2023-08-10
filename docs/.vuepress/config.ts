import { defineUserConfig } from 'vuepress'
import { defaultTheme } from 'vuepress'
import { searchPlugin } from '@vuepress/plugin-search'
import theme from "./theme"


export default defineUserConfig({
  lang: 'zh-CN',
  title: '肥工生存手册',
  description: '更适合泥工宝宝体质的生存手册',
  theme,
  plugins: [
    searchPlugin({
      // 配置项
    }),
  ],
})