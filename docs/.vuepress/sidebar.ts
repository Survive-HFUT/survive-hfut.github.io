import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  '/',
  '/enrollment/',
  '/links/',
  '/campus/',
  {
    link: '/life/',
    text: '💈 生活',
    children: [
      '/life/dormitory',
      '/life/alimony',
      '/life/app',
      '/life/network',
      '/life/organization',
      '/life/voluntarily',
      '/life/group',
    ],
    collapsible: false
  },
  {
    text: '🎓 学习',
    children: [
      '/study/first',
      '/study/second',
      '/study/electives',
      '/study/change_major',
      '/study/exemption',
      '/study/lab',
      '/study/contest',

    ],
    collapsible: false
  },
  '/surroundings/',
  '/xuan/',
  '/other/'
]);
