import { viteBundler } from "@vuepress/bundler-vite";
import { markdownMathPlugin } from "@vuepress/plugin-markdown-math";
import { searchPlugin } from "@vuepress/plugin-search";
import { defineUserConfig } from "vuepress";
import theme from "./theme";
import { markdownImagePlugin } from "@vuepress/plugin-markdown-image";

export default defineUserConfig({
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),

  base: "/",

  lang: "zh-CN",
  title: "活在肥宣",
  description: "你的薰化路 301 号指南",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
  ],
  theme,

  plugins: [
    searchPlugin({}),
    markdownMathPlugin({}),
    markdownImagePlugin({
      figure: true,
      lazyload: true,
      mark: true,
      size: true,
    }),
  ],
});
