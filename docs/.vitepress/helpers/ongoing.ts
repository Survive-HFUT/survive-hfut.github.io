export type OngoingEvent = {
  title: string;
  campus: ('宣城校区' | '屯溪路校区' | '翡翠湖校区')[];
  start: string;
  end: string;
  href: string;
  note?: string;
};

export const events: OngoingEvent[] = [
  {
    title: '宣城校区校运会',
    campus: ['宣城校区'],
    start: '2026-05-14',
    end: '2026-05-16',
    href: '/life/sports_meet#宣区',
    note: '来源于 2025-2026 学年校历',
  },
  {
    title: '合肥校区校运会',
    campus: ['屯溪路校区', '翡翠湖校区'],
    start: '2025-10-30',
    end: '2025-11-01',
    href: '/life/sports_meet#肥区',
    note: '来源于 2025-2026 学年校历',
  },
  {
    title: '合肥校区大学生医保缴费',
    campus: ['屯溪路校区', '翡翠湖校区'],
    start: '2025-10-29',
    end: '2025-11-30',
    href: '/life/medical_insurance#参保缴费',
    note: '以 2025 年通知为例',
  },
  {
    title: '宣城校区大学生医保报销',
    campus: ['宣城校区'],
    start: '2026-05-21',
    end: '2026-05-22',
    href: '/life/medical_insurance#门诊报销',
    note: '记得去校区医院301报销哦',
  },
  {
    title: '第一学期期末考试周',
    campus: ['屯溪路校区', '翡翠湖校区', '宣城校区'],
    start: '2025-12-19',
    end: '2025-12-25',
    href: '/life/calendar',
    note: '来源于 2025-2026 学年校历',
  },
  {
    title: '第二学期期末考试月',
    campus: ['屯溪路校区', '翡翠湖校区', '宣城校区'],
    start: '2026-06-01',
    end: '2026-07-12',
    href: '/life/calendar',
    note: '来源于 2025-2026 学年校历',
  },
];
