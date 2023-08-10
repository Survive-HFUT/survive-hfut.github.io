import { hopeTheme } from "vuepress-theme-hope";

// 我们默认导出了主题对象
export default hopeTheme({
    navbar: [
        {
            text: '首页',
            link: '/',
        },
    ],
    sidebar: [
        '/',
        '/enrollment/',
        '/life/',
        '/study/',
        '/other/'
    ],
    plugins: {
        mdEnhance: {
            // 启用 figure
            figure: true,
            // 启用图片懒加载
            imgLazyload: true,
            // 启用图片标记
            imgMark: true,
            // 启用图片大小
            imgSize: true,
        },
    },
});