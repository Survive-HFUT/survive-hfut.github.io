import * as github from '@actions/github';
import * as core from '@actions/core';
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
    const platformDetails = await core.platform.getDetails();

    return {
      time: new Date().toISOString(),
      node: {
        version: clean(process.version),
      },

      platform: {
        type: clean(platformDetails.platform),
        arch: clean(platformDetails.arch),
        version: clean(platformDetails.version),
        name: clean(platformDetails.name),
      },

      context: {
        repository: tryGet(() => github.context.repo),
        sha: tryGet(() => github.context.sha),
        ref: tryGet(() => github.context.ref),

        workflow: {
          name: tryGet(() => github.context.workflow),
          event: tryGet(() => github.context.eventName),
          actor: tryGet(() => github.context.actor),

          job: {
            name: tryGet(() => github.context.job),
            id: tryGet(() => github.context.runId),
            number: tryGet(() => github.context.runNumber),
            attempt: tryGet(() => github.context.runAttempt),
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
