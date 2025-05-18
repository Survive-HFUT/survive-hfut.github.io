import { DefaultTheme, UserConfig } from 'vitepress';

const main: Partial<DefaultTheme.Config> = {
  outline: {
    label: '页面导航',
  },

  lastUpdated: {
    text: '此页最后更新于',
    formatOptions: {
      dateStyle: 'short',
      timeStyle: 'medium',
    },
  },

  docFooter: {
    prev: '上一篇',
    next: '下一篇',
  },
  
  darkModeSwitchLabel: '外观',
  returnToTopLabel: '返回顶部',
  sidebarMenuLabel: '菜单',
  langMenuLabel: '多语言',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
};

const search: DefaultTheme.LocalSearchOptions['translations'] = {
  button: {
    buttonText: '搜索',
    buttonAriaLabel: '搜索',
  },

  modal: {
    backButtonTitle: '返回',
    displayDetails: '显示详情',
    noResultsText: '没有找到结果',
    resetButtonTitle: '重置',
    footer: {
      closeKeyAriaLabel: '关闭',
      closeText: '关闭',
      navigateDownKeyAriaLabel: '下一个',
      navigateText: '导航',
      navigateUpKeyAriaLabel: '上一个',
      selectKeyAriaLabel: '选择',
      selectText: '选择',
    },
  },
};

const markdown: UserConfig<DefaultTheme.Config>['markdown'] = {
  container: {
    tipLabel: '💡 提示',
    warningLabel: '⚠️ 警告',
    dangerLabel: '🚫 危险',
    infoLabel: '📚 信息',
    detailsLabel: '📜 详细信息',
  },
};

export default { main, search, markdown };
