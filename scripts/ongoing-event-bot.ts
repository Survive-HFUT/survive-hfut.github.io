import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'node:fs';
import path from 'node:path';

type Campus = '宣城校区' | '屯溪路校区' | '翡翠湖校区';

type OngoingEvent = {
  title: string;
  campus: Campus[];
  start: string;
  end: string;
  href: string;
  note?: string;
};

type OngoingData = {
  $schema: string;
  events: OngoingEvent[];
};

type CampusResult = {
  campus: Campus[];
  invalid: string[];
};

const schemaRef = './ongoing.schema.json';
const allowedCampus = new Set<Campus>(['宣城校区', '屯溪路校区', '翡翠湖校区']);
const issueJson = process.env.INPUT_ISSUE_PARSER_JSON;

core.info('Starting ongoing-event-bot...');
core.info(`Received ISSUE_PARSER_JSON: ${issueJson ?? '(empty)'}`);

try {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(issueJson ?? '{}') as Record<string, unknown>;
  } catch (error) {
    core.setFailed('ISSUE_PARSER_JSON is not valid JSON');
    process.exit(1);
  }

  const title = readRequiredString(parsed.title);
  const start = readRequiredString(parsed.start);
  const end = readRequiredString(parsed.end);
  const href = readRequiredString(parsed.href);
  const note = readOptionalString(parsed.note);
  const campusResult = normalizeCampus(parsed.campus);

  const missing: string[] = [];
  if (!title) missing.push('事项名称');
  if (!campusResult.campus.length) missing.push('适用校区');
  if (!start) missing.push('开始日期/时间');
  if (!end) missing.push('结束日期/时间');
  if (!href) missing.push('相关链接');

  if (campusResult.invalid.length > 0) {
    core.setFailed(`适用校区包含非法值: ${campusResult.invalid.join(', ')}`);
    process.exit(1);
  }

  if (missing.length > 0) {
    core.setFailed(`Issue 表单缺少必填项: ${missing.join('、')}`);
    process.exit(1);
  }

  const newEvent: OngoingEvent = {
    title,
    campus: campusResult.campus,
    start,
    end,
    href,
    ...(note ? { note } : {}),
  };

  const filePath = path.join(
    process.cwd(),
    'docs',
    '.vitepress',
    'data',
    'ongoing.json',
  );

  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content) as unknown;
  assertOngoingData(data);

  data.events.push(newEvent);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);

  const issueNumber = github.context.issue.number;
  const prTitle = issueNumber
    ? `📅 正在发生：${title}（来自 #${issueNumber}）`
    : `📅 正在发生：${title}`;
  const prBody = formatPrBody({
    issueNumber,
    title,
    campus: campusResult.campus,
    start,
    end,
    href,
    note,
  });
  const commitMessage = issueNumber
    ? `feat: 新增正在发生事项（#${issueNumber}）`
    : 'feat: 新增正在发生事项';

  core.setOutput('event-title', title);
  core.setOutput('event-campus', campusResult.campus.join('、'));
  core.setOutput('event-start', start);
  core.setOutput('event-end', end);
  core.setOutput('event-href', href);
  core.setOutput('event-note', note || '');
  core.setOutput('pr-title', prTitle);
  core.setOutput('pr-body', prBody);
  core.setOutput('commit-message', commitMessage);

  console.log('Successfully updated ongoing.json');
} catch (error) {
  core.setFailed(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function readRequiredString(value: unknown): string {
  if (!isNonEmptyString(value)) {
    return '';
  }

  return value.trim();
}

function readOptionalString(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === '_No response_') {
    return undefined;
  }

  return trimmed;
}

function normalizeCampus(value: unknown): CampusResult {
  const rawList = Array.isArray(value)
    ? value
    : isNonEmptyString(value)
      ? [value]
      : [];

  const cleaned = rawList
    .map((item) => (isNonEmptyString(item) ? item.trim() : ''))
    .filter(Boolean);

  const unique = Array.from(new Set(cleaned));
  const invalid = unique.filter(
    (campus) => !allowedCampus.has(campus as Campus),
  );
  const campus = unique.filter((campus) =>
    allowedCampus.has(campus as Campus),
  ) as Campus[];

  return { campus, invalid };
}

function assertEvent(
  event: unknown,
  index: number,
): asserts event is OngoingEvent {
  if (!event || typeof event !== 'object') {
    throw new Error(`ongoing.json: event[${index}] is not an object`);
  }

  const record = event as Record<string, unknown>;
  const allowedKeys = new Set([
    'title',
    'campus',
    'start',
    'end',
    'href',
    'note',
  ]);

  for (const key of Object.keys(record)) {
    if (!allowedKeys.has(key)) {
      throw new Error(
        `ongoing.json: event[${index}] has unexpected key: ${key}`,
      );
    }
  }

  if (!isNonEmptyString(record.title)) {
    throw new Error(`ongoing.json: event[${index}].title is required`);
  }

  if (!Array.isArray(record.campus) || record.campus.length === 0) {
    throw new Error(`ongoing.json: event[${index}].campus is required`);
  }

  for (const campus of record.campus) {
    if (!isNonEmptyString(campus) || !allowedCampus.has(campus as Campus)) {
      throw new Error(
        `ongoing.json: event[${index}].campus has invalid value: ${String(
          campus,
        )}`,
      );
    }
  }

  if (!isNonEmptyString(record.start)) {
    throw new Error(`ongoing.json: event[${index}].start is required`);
  }

  if (!isNonEmptyString(record.end)) {
    throw new Error(`ongoing.json: event[${index}].end is required`);
  }

  if (!isNonEmptyString(record.href)) {
    throw new Error(`ongoing.json: event[${index}].href is required`);
  }

  if (record.note !== undefined && !isNonEmptyString(record.note)) {
    throw new Error(`ongoing.json: event[${index}].note must be a string`);
  }
}

function assertOngoingData(value: unknown): asserts value is OngoingData {
  if (!value || typeof value !== 'object') {
    throw new Error('ongoing.json: root must be an object');
  }

  const record = value as Record<string, unknown>;
  if (record.$schema !== schemaRef) {
    throw new Error(`ongoing.json: $schema must be ${schemaRef}`);
  }

  if (!Array.isArray(record.events)) {
    throw new Error('ongoing.json: events must be an array');
  }

  record.events.forEach((event, index) => {
    assertEvent(event, index);
  });
}

function formatPrBody({
  issueNumber,
  title,
  campus,
  start,
  end,
  href,
  note,
}: {
  issueNumber: number;
  title: string;
  campus: Campus[];
  start: string;
  end: string;
  href: string;
  note?: string;
}): string {
  const lines: string[] = [];
  lines.push('*该 PR 由 Issue 表单触发。*');

  if (issueNumber) {
    lines.push(`触发来源：#${issueNumber}`);
    lines.push(`Fixes #${issueNumber}`);
    lines.push('');
    lines.push('---');
  }

  lines.push('');
  lines.push('提交参数：');
  lines.push(`- 事项名称：${title}`);
  lines.push(`- 适用校区：${campus.join('、')}`);
  lines.push(`- 开始日期/时间：${start}`);
  lines.push(`- 结束日期/时间：${end}`);
  lines.push(`- 相关链接：\`${href}\``);
  lines.push(`- 备注：${note || '无'}`);

  return lines.join('\n');
}

function parseCoAuthors(value: string): number[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is number => typeof item === 'number' && Number.isFinite(item),
    );
  } catch {
    return [];
  }
}
