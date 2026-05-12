import * as github from '@actions/github';
import * as core from '@actions/core';

export default {
  async load() {
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
};

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
