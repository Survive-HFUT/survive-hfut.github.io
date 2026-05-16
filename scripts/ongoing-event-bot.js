import fs from 'fs';
import path from 'path';

const issueBody = process.env.ISSUE_BODY;
if (!issueBody) {
  console.error('ISSUE_BODY is not provided');
  process.exit(1);
}

const filePath = path.join(process.cwd(), 'docs/.vitepress/helpers/ongoing.ts');

function parseIssue(body) {
  const data = {};
  const sections = body.split('###').slice(1);
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const header = lines[0].trim();
    const value = lines.slice(1).join('\n').trim();
    
    if (header === '事项名称') data.title = value;
    if (header === '适用校区') {
      data.campus = value.split('\n')
        .filter(line => line.includes('[x]'))
        .map(line => line.replace('- [x] ', '').trim());
    }
    if (header === '开始日期/时间') data.start = value;
    if (header === '结束日期/时间') data.end = value;
    if (header === '相关链接') data.href = value;
    if (header === '备注') data.note = (value === '_No response_' || value === '') ? undefined : value;
  });
  
  return data;
}

const newEvent = parseIssue(issueBody);
let content = fs.readFileSync(filePath, 'utf-8');

const newEventStr = `  {
    title: '${newEvent.title}',
    campus: [${newEvent.campus.map(c => `'${c}'`).join(', ')}],
    start: '${newEvent.start}',
    end: '${newEvent.end}',
    href: '${newEvent.href}',
    ${newEvent.note ? `note: '${newEvent.note}',` : ''}
  },
];`;

content = content.replace(/];\s*$/, newEventStr);

fs.writeFileSync(filePath, content);
console.log('Successfully updated ongoing.ts');
