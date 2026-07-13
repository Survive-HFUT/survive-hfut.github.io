import * as os from 'os';
import { defineLoader } from 'vitepress';

type Nullable<T> = T | null;

export type MetadataData = {
  time: string;
  node: {
    version: string;
  };
  platform: {
    type: string;
    arch: string;
    version: string;
    name: string;
  };
  context: {
    repository: Nullable<{ owner: string; repo: string }>;
    sha: Nullable<string>;
    ref: Nullable<string>;
    workflow: {
      name: Nullable<string>;
      event: Nullable<string>;
      actor: Nullable<string>;
      job: {
        name: Nullable<string>;
        id: Nullable<number>;
        number: Nullable<number>;
        attempt: Nullable<number>;
      };
    };
  };
};

declare const data: MetadataData;
export { data };

export default defineLoader({
  async load(): Promise<MetadataData> {
    return {
      time: new Date().toISOString(),
      node: {
        version: clean(process.version),
      },

      platform: {
        type: clean(os.platform()),
        arch: clean(os.arch()),
        version: clean(os.release()),
        name: clean(os.type()),
      },

      context: {
        repository: tryGet(() => {
          const repo = process.env.GITHUB_REPOSITORY;
          if (repo) {
            const [owner, name] = repo.split('/');
            return { owner, repo: name };
          }
          return null;
        }),
        sha: tryGet(() => process.env.GITHUB_SHA || null),
        ref: tryGet(() => process.env.GITHUB_REF || null),

        workflow: {
          name: tryGet(() => process.env.GITHUB_WORKFLOW || null),
          event: tryGet(() => process.env.GITHUB_EVENT_NAME || null),
          actor: tryGet(() => process.env.GITHUB_ACTOR || null),

          job: {
            name: tryGet(() => process.env.GITHUB_JOB || null),
            id: tryGet(() => process.env.GITHUB_RUN_ID ? parseInt(process.env.GITHUB_RUN_ID) : null),
            number: tryGet(() => process.env.GITHUB_RUN_NUMBER ? parseInt(process.env.GITHUB_RUN_NUMBER) : null),
            attempt: tryGet(() => process.env.GITHUB_RUN_ATTEMPT ? parseInt(process.env.GITHUB_RUN_ATTEMPT) : null),
          },
        },
      },
    };
  },
});

function clean(v: any) {
  return v || null;
}

function tryGet<T>(value: () => T): T | null {
  try {
    return clean(value());
  } catch {
    return null;
  }
}
