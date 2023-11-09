import { DelayFn } from '../types';

/**
 * Always wait for the same amount of time before retrying
 * @param delay The amount of time in milliseconds to wait
 * @param fastFirst Whether to immediately retry for the first attempt
 */
export function constantDelay(delay: number, fastFirst = false): DelayFn {
  if (delay < 0) {
    throw new Error('Delay must be greater than or equal to 0');
  }

  if (fastFirst) {
    return (state) => (state.attempt === 1 ? 0 : delay);
  }

  return () => delay;
}
