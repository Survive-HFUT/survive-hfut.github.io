import fs from 'node:fs';
import path from 'node:path';
import core from '@actions/core';

const schemaRef = './ongoing.schema.json';
const allowedCampus = new Set(['宣城校区', '屯溪路校区', '翡翠湖校区']);

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function readRequiredString(value) {
    if (!isNonEmptyString(value)) {
        return '';
    }

    return value.trim();
}

function readOptionalString(value) {
    if (!isNonEmptyString(value)) {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed || trimmed === '_No response_') {
        return undefined;
    }

    return trimmed;
}

function normalizeCampus(value) {
    const rawList = Array.isArray(value)
        ? value
        : isNonEmptyString(value)
            ? [value]
            : [];

    const cleaned = rawList
        .map((item) => (isNonEmptyString(item) ? item.trim() : ''))
        .filter(Boolean);

    const unique = Array.from(new Set(cleaned));
    const invalid = unique.filter((campus) => !allowedCampus.has(campus));

    return { campus: unique, invalid };
}

function assertEvent(event, index) {
    if (!event || typeof event !== 'object') {
        throw new Error(`ongoing.json: event[${index}] is not an object`);
    }

    const record = event;
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
            throw new Error(`ongoing.json: event[${index}] has unexpected key: ${key}`);
        }
    }

    if (!isNonEmptyString(record.title)) {
        throw new Error(`ongoing.json: event[${index}].title is required`);
    }

    if (!Array.isArray(record.campus) || record.campus.length === 0) {
        throw new Error(`ongoing.json: event[${index}].campus is required`);
    }

    for (const campus of record.campus) {
        if (!isNonEmptyString(campus) || !allowedCampus.has(campus)) {
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

function assertOngoingData(value) {
    if (!value || typeof value !== 'object') {
        throw new Error('ongoing.json: root must be an object');
    }

    if (value.$schema !== schemaRef) {
        throw new Error(`ongoing.json: $schema must be ${schemaRef}`);
    }

    if (!Array.isArray(value.events)) {
        throw new Error('ongoing.json: events must be an array');
    }

    value.events.forEach((event, index) => {
        assertEvent(event, index);
    });
}

function formatPrBody({
    issueNumber,
    issueUrl,
    title,
    campus,
    start,
    end,
    href,
    note,
}) {
    const lines = [];
    lines.push('该 PR 由 Issue 表单触发。');

    if (issueNumber) {
        lines.push(`触发来源：#${issueNumber}`);
    }

    if (issueUrl) {
        lines.push(`Issue 链接：${issueUrl}`);
    }

    if (issueNumber) {
        lines.push(`Fixes #${issueNumber}`);
    }

    lines.push('');
    lines.push('提交参数：');
    lines.push(`- 事项名称：${title}`);
    lines.push(`- 适用校区：${campus.join('、')}`);
    lines.push(`- 开始日期/时间：${start}`);
    lines.push(`- 结束日期/时间：${end}`);
    lines.push(`- 相关链接：${href}`);
    lines.push(`- 备注：${note || '无'}`);

    return lines.join('\n');
}

try {
    const issueJson = process.env.ISSUE_PARSER_JSON;
    if (!issueJson) {
        core.setFailed('ISSUE_PARSER_JSON is not provided');
        process.exit(1);
    }

    let parsed;
    try {
        parsed = JSON.parse(issueJson);
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

    const missing = [];
    if (!title) missing.push('事项名称');
    if (!campusResult.campus.length) missing.push('适用校区');
    if (!start) missing.push('开始日期/时间');
    if (!end) missing.push('结束日期/时间');
    if (!href) missing.push('相关链接');

    if (campusResult.invalid.length > 0) {
        core.setFailed(
            `适用校区包含非法值: ${campusResult.invalid.join(', ')}`,
        );
        process.exit(1);
    }

    if (missing.length > 0) {
        core.setFailed(`Issue 表单缺少必填项: ${missing.join('、')}`);
        process.exit(1);
    }

    const newEvent = {
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
    const data = JSON.parse(content);
    assertOngoingData(data);

    data.events.push(newEvent);
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);

    const issueNumber = process.env.ISSUE_NUMBER || '';
    const issueUrl = process.env.ISSUE_URL || '';
    const prTitle = issueNumber
        ? `📅 正在发生：${title}（来自 #${issueNumber}）`
        : `📅 正在发生：${title}`;
    const prBody = formatPrBody({
        issueNumber,
        issueUrl,
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
