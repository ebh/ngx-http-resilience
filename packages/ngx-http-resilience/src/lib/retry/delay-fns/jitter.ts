import { RetryState } from '../internal';
import { DelayFn } from '../types';

export interface JitterOptions {
  min: number;
  max: number;
}

/* TODO - Add other algorithms that smooth and increase decorrelation
 * see:
 *  - https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
 *  - https://github.com/Polly-Contrib/Polly.Contrib.WaitAndRetry#new-jitter-recommendation
 *  - https://github.com/Polly-Contrib/Polly.Contrib.WaitAndRetry/blob/master/src/Polly.Contrib.WaitAndRetry/Backoff.DecorrelatedJitterV2.cs
 *  - https://github.com/App-vNext/Polly/issues/530
 */

export function addJitter(
  delayFn: DelayFn,
  options: JitterOptions,
  fastFirst = false
): DelayFn {
  if (options.min > options.max) {
    throw new Error('Min must be less than or equal to max');
  }

  if (fastFirst) {
    return (state) =>
      state.attempt === 1 ? 0 : addJitterToDelay(delayFn, state, options);
  }

  return (state) => {
    return addJitterToDelay(delayFn, state, options);
  };
}

function addJitterToDelay(
  delayFn: DelayFn,
  state: RetryState,
  options: JitterOptions
): number {
  return applyMinimumThreshold(
    delayFn(state) + jitter(options.min, options.max)
  );
}

function applyMinimumThreshold(delay: number): number {
  return delay < 0 ? 0 : delay;
}

function jitter(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
