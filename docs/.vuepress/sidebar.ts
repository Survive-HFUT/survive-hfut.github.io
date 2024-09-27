import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  '/',
  '/links/',
  {
    link: '/enrollment/',
    text: '😍 初入肥宣',
    children: [
      '/enrollment/card',
      '/enrollment/preparation',
      '/enrollment/transport',
      '/enrollment/books',
      '/enrollment/military_training',
      '/enrollment/city_center',
    ],
    collapsible: true
  },
  {
    link: '/campus/',
    text: '🦢 校园',
    children: [
      '/campus/library',
      '/campus/colleges',
      '/campus/activity_center',
      '/campus/gym',
      '/campus/playground',
      '/campus/dorm',
      '/campus/cafeterias',
    ],
    collapsible: true
  },
  {
    link: '/life/',
    text: '💈 生活',
    children: [
      '/life/dormitory',
      '/life/alimony',
      '/life/network',
      '/life/exercise',
      '/life/couriers',
      '/life/app',
      '/life/organization',
      '/life/voluntarily',
      '/life/group',
    ],
    collapsible: true
  },
  {
    text: '🎓 学习',
    children: [
      '/study/first',
      '/study/second',
      '/study/electives',
      '/study/change_major',
      '/study/exemption',
      '/study/CPC',
      '/study/lab',
      '/study/contest',
    ],
    collapsible: true
  },
  '/surroundings/',
  '/xuan/',
  '/other/',
  '/forum/'
]);
