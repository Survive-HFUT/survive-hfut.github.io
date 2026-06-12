/**
 * 聚在工大 App DeepLink 映射
 *
 * 集中维护所有 DeepLink 地址，避免在页面中散写字符串。
 * DeepLink 格式：hfut_schedule://host
 * 带参数格式：hfut_schedule://host?query=value
 */

const SCHEME = 'hfut_schedule';

export const hfutScheduleDeepLinks = {
  // 生活服务
  dormitory: `${SCHEME}://dormitory`,
  fee: `${SCHEME}://fee`,
  haileWashing: `${SCHEME}://washing`,
  holiday: `${SCHEME}://holiday`,
  life: `${SCHEME}://life`,
  notifications: `${SCHEME}://notifications`,
  officeHall: `${SCHEME}://office_hall`,
  personInfo: `${SCHEME}://person_info`,
  scanQrCode: `${SCHEME}://scan_qr_code`,
  bus: `${SCHEME}://bus`,

  // 设置页面
  settingsAbout: `${SCHEME}://settings_about`,
  settingsAboutDeveloper: `${SCHEME}://settings_about_developer`,
  settingsAppearance: `${SCHEME}://settings_appearance`,
  settingsBackup: `${SCHEME}://settings_backup`,
  settingsConfiguration: `${SCHEME}://settings_configurations`,
  settingsDeepLink: `${SCHEME}://settings_deeplink`,
  settingsTips: `${SCHEME}://settings_tips`,
  settingsNetwork: `${SCHEME}://settings_network`,

  // 学业功能
  termReport: `${SCHEME}://term_report`,
  track: `${SCHEME}://track`,
  versionInfo: `${SCHEME}://version_info`,
  webVpn: `${SCHEME}://webvpn`,
  work: `${SCHEME}://work`,

  // 图书馆
  library: `${SCHEME}://library`,
  libraryBorrowed: `${SCHEME}://library_borrowed`,
  updateSuccessfully: `${SCHEME}://update_successfully`,
  agreement: `${SCHEME}://agreement`,
  login: `${SCHEME}://login`,

  // 课程与考试
  classroom: `${SCHEME}://classroom`,
  averageGrade: `${SCHEME}://average_grade`,
  allPrograms: `${SCHEME}://all_programs`,
  exam: `${SCHEME}://exam`,
  grade: `${SCHEME}://grade`,
  programCompetition: `${SCHEME}://program_competition`,
  program: `${SCHEME}://program`,
  termCourses: `${SCHEME}://term_courses`,
  workAndRest: `${SCHEME}://work_and_rest`,
  addEvent: `${SCHEME}://add_event`,
  allExam: `${SCHEME}://all_exam`,
  admission: `${SCHEME}://admission`,

  /**
   * 新闻搜索
   * @param keyword 搜索关键词
   */
  news: (keyword?: string) =>
    keyword
      ? `${SCHEME}://news?keyword=${encodeURIComponent(keyword)}`
      : `${SCHEME}://news`,

  /**
   * 教师搜索
   * @param name 教师姓名
   */
  teacherSearch: (name?: string) =>
    name
      ? `${SCHEME}://teacher_search?name=${encodeURIComponent(name)}`
      : `${SCHEME}://teacher_search`,

  /**
   * 挂科率查询
   * @param courseName 课程名称
   * @param lessonCode 教学班号（可选）
   */
  failRate: (courseName?: string, lessonCode?: string) => {
    if (!courseName) return `${SCHEME}://fail_rate`;

    const params = new URLSearchParams();
    params.set('course_name', courseName);

    if (lessonCode) {
      params.set('lesson_code', lessonCode);
    }

    return `${SCHEME}://fail_rate?${params.toString()}`;
  },

  /**
   * 课程同学查询
   * @param lessonId 教学班 ID
   */
  courseClassmates: (lessonId: number) =>
    `${SCHEME}://course_classmates?lesson_id=${lessonId}`,

  /**
   * 首页指定页面
   * @param page 页面名称
   */
  homePage: (page: string) =>
    `${SCHEME}://home?page=${encodeURIComponent(page)}`,
} as const;

export type HfutScheduleDeepLinks = typeof hfutScheduleDeepLinks;
