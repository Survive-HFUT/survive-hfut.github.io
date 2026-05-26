const ALLOWED_CAMPUS = new Set(['宣城校区', '屯溪路校区', '翡翠湖校区']);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'GET' && url.pathname === '/') {
      return json({ status: 'ok', message: 'survive-hfut ongoing webhook' });
    }

    const secret = url.searchParams.get('secret');
    if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
      return json({ error: 'Unauthorized' }, 401);
    }

    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (body.challenge && typeof body.challenge === 'string') {
      return json({ challenge: body.challenge });
    }

    const log = {
      source: 'wps-form-webhook',
      receivedAt: new Date().toISOString(),
      rawBody: JSON.stringify(body).slice(0, 2000),
      fieldMapping: {
        FIELD_TITLE: env.FIELD_TITLE,
        FIELD_CAMPUS: env.FIELD_CAMPUS,
        FIELD_START: env.FIELD_START,
        FIELD_END: env.FIELD_END,
        FIELD_HREF: env.FIELD_HREF,
        FIELD_NOTE: env.FIELD_NOTE,
      },
    };

    try {
      const formData = extractFormData(body, env);

      const missing = [];
      if (!formData.title) missing.push('事项名称');
      if (!formData.campus?.length) missing.push('适用校区');
      if (!formData.start) missing.push('开始日期/时间');
      if (!formData.end) missing.push('结束日期/时间');
      if (!formData.href) missing.push('相关链接');

      if (missing.length > 0) {
        log.error = `缺少必填项: ${missing.join('、')}`;
        console.error(JSON.stringify(log));
        return json({ error: `缺少必填项: ${missing.join('、')}` }, 400);
      }

      const invalidCampus = formData.campus.filter(c => !ALLOWED_CAMPUS.has(c));
      if (invalidCampus.length > 0) {
        log.error = `非法校区值: ${invalidCampus.join(', ')}`;
        console.error(JSON.stringify(log));
        return json({ error: `非法校区值: ${invalidCampus.join(', ')}` }, 400);
      }

      formData.href = validateHref(formData.href);
      validateDateTime(formData.start, '开始日期/时间');
      validateDateTime(formData.end, '结束日期/时间');
      compareDateTime(formData.start, formData.end);

      // WPS submission ID 永久去重
      const submissionId = getSubmissionId(body);
      if (submissionId) {
        const ok = await checkKvOnce(env.KV, `wps:${submissionId}`);
        if (!ok) {
          log.info = `duplicate wps submission: ${submissionId}`;
          console.log(JSON.stringify(log));
          return json({ success: true, note: 'duplicate, already processed' });
        }
      }

      // 全局限流
      await checkRateLimit(env.KV, 'rate:10m', 20, 600);
      await checkRateLimit(env.KV, 'rate:1h', 60, 3600);
      await checkRateLimit(env.KV, 'rate:1d', 200, 86400);

      // href 去重
      if (formData.href) {
        const hrefKey = `fp:href:${await hashString(formData.href)}`;
        const ok = await checkKvOnce(env.KV, hrefKey, 86400);
        if (!ok) throw new Error('该链接已有投稿记录，24 小时内不可重复提交');
      }

      // 事件指纹去重 (title + campus + start + end + href)
      const fpParts = [formData.title, [...formData.campus].sort().join(','), formData.start, formData.end, formData.href].join('|');
      const fpKey = `fp:event:${await hashString(fpParts)}`;
      const fpOk = await checkKvOnce(env.KV, fpKey, 86400);
      if (!fpOk) throw new Error('该事项已有投稿记录，24 小时内不可重复提交');

      // title + date 弱去重
      const weakParts = [formData.title, formData.start, formData.end].join('|');
      const weakKey = `fp:title-date:${await hashString(weakParts)}`;
      const weakOk = await checkKvOnce(env.KV, weakKey, 86400);
      if (!weakOk) throw new Error('同标题和日期的投稿已存在');

      const issue = await createGithubIssue(formData, env);

      log.issueNumber = issue.number;
      log.issueUrl = issue.html_url;
      console.log(JSON.stringify(log));

      return json({
        success: true,
        issue_number: issue.number,
        issue_url: issue.html_url,
      });
    } catch (error) {
      log.error = error.message;
      console.error(JSON.stringify(log));
      return json({ error: error.message }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function extractFormData(body, env) {
  const entry = body.entry || body.data || body.fields || body;

  const rawTitle = getFieldValue(entry, env.FIELD_TITLE, 'title', '事件标题', '事项名称', 'field_1');
  const rawCampus = getFieldValue(entry, env.FIELD_CAMPUS, 'campus', '适用校区', 'field_2');
  const rawStart = getFieldValue(entry, env.FIELD_START, 'start', '开始日期', '开始日期/时间', 'field_3');
  const rawEnd = getFieldValue(entry, env.FIELD_END, 'end', '结束日期', '结束日期/时间', 'field_4');
  const rawHref = getFieldValue(entry, env.FIELD_HREF, 'href', '详情链接', '相关链接', 'field_5');
  const rawNote = getFieldValue(entry, env.FIELD_NOTE, 'note', '页面备注', '备注', 'field_6');

  return {
    title: trimOrEmpty(rawTitle),
    campus: normalizeCampus(rawCampus),
    start: trimOrEmpty(rawStart),
    end: trimOrEmpty(rawEnd),
    href: trimOrEmpty(rawHref),
    note: trimOptional(rawNote),
  };
}

function getFieldValue(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of keys) {
    if (key == null) continue;
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== null && val !== undefined && val !== '') {
        if (typeof val === 'string' && val.trim() === '_No response_') continue;
        return val;
      }
    }
  }
  return undefined;
}

function trimOrEmpty(value) {
  if (typeof value === 'string') return value.trim();
  return String(value ?? '');
}

function trimOptional(value) {
  if (!value) return undefined;
  const s = String(value).trim();
  if (!s || s === '_No response_') return undefined;
  return s;
}

function validateHref(value) {
  const v = String(value || '').trim();
  const isInternal = v.startsWith('/');
  const isHttp = /^https?:\/\//i.test(v);
  if (!isInternal && !isHttp) {
    throw new Error('相关链接只能是站内链接或 http/https 链接');
  }
  if (/^(javascript|data|vbscript):/i.test(v)) {
    throw new Error('相关链接包含危险协议');
  }
  return v;
}

function validateDateTime(value, fieldName) {
  const s = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/.test(s)) {
    throw new Error(`${fieldName} 必须是 YYYY-MM-DD 或 YYYY-MM-DD HH:mm`);
  }
  return s;
}

function compareDateTime(start, end) {
  const normalize = v => v.length === 10 ? `${v} 00:00` : v;
  if (normalize(end) < normalize(start)) {
    throw new Error('结束日期/时间不能早于开始日期/时间');
  }
}

function getSubmissionId(body) {
  return body.submission_id || body.record_id || body.entry_id || body.submissionId || null;
}

async function checkKvOnce(kv, key, ttl) {
  const exists = await kv.get(key);
  if (exists) return false;
  await kv.put(key, '1', { expirationTtl: ttl });
  return true;
}

async function checkRateLimit(kv, prefix, max, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const win = Math.floor(now / windowSeconds) * windowSeconds;
  const key = `${prefix}:${win}`;
  const current = parseInt(await kv.get(key) || '0', 10);
  if (current >= max) throw new Error(`触发全局限流 (${prefix})`);
  await kv.put(key, String(current + 1), { expirationTtl: windowSeconds });
}

async function hashString(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 16);
}

function normalizeCampus(value) {
  if (!value) return [];
  let items;
  if (Array.isArray(value)) {
    items = value;
  } else if (typeof value === 'string') {
    items = value.split(/[,，、/\s]+/);
  } else {
    items = [String(value)];
  }
  return [...new Set(items.map(v => String(v).trim()).filter(Boolean))];
}

async function createGithubIssue(formData, env) {
  const token = env.GITHUB_TOKEN;
  const repo = env.GITHUB_REPO || 'Survive-HFUT/survive-hfut.github.io';

  const bodyLines = [
    '### 事项名称',
    '',
    formData.title,
    '',
    '### 适用校区',
    '',
    ...['宣城校区', '屯溪路校区', '翡翠湖校区'].map(c =>
      `- [${formData.campus.includes(c) ? 'x' : ' '}] ${c}`,
    ),
    '',
    '### 开始日期/时间',
    '',
    formData.start,
    '',
    '### 结束日期/时间',
    '',
    formData.end,
    '',
    '### 相关链接',
    '',
    formData.href,
    '',
    '### 备注',
    '',
    formData.note || '',
  ];

  const issueTitle = `【正在发生】新增事项: ${formData.title}`;

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'survive-hfut-ongoing-webhook',
    },
    body: JSON.stringify({ title: issueTitle, body: bodyLines.join('\n') }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub create issue failed (${res.status}): ${text}`);
  }

  const issue = await res.json();

  const labelRes = await fetch(
    `https://api.github.com/repos/${repo}/issues/${issue.number}/labels`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'survive-hfut-ongoing-webhook',
      },
      body: JSON.stringify({ labels: ['ongoing-event'] }),
    },
  );

  if (!labelRes.ok) {
    const text = await labelRes.text();
    throw new Error(`GitHub add label failed (${labelRes.status}): ${text}`);
  }

  return issue;
}
