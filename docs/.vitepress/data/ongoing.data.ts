import fs from 'node:fs';
import { defineLoader } from 'vitepress';

export type Campus = '宣城校区' | '屯溪路校区' | '翡翠湖校区';

export type OngoingEvent = {
  title: string;
  campus: Campus[];
  start: string;
  end: string;
  href: string;
  note?: string;
};

export type OngoingData = {
  $schema: string;
  events: OngoingEvent[];
};

declare const data: OngoingData;
export { data };

const schemaRef = './ongoing.schema.json';
const allowedCampus = new Set<Campus>([
  '宣城校区',
  '屯溪路校区',
  '翡翠湖校区',
]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function assertEvent(event: unknown, index: number): asserts event is OngoingEvent {
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

export default defineLoader({
  watch: ['./ongoing.json', './ongoing.schema.json'],
  load() {
    const dataUrl = new URL('./ongoing.json', import.meta.url);
    const raw = fs.readFileSync(dataUrl, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    assertOngoingData(parsed);
    return parsed;
  },
});
