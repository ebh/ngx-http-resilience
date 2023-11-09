import { DelayFn } from '../types';

/**
 * Wait for a linearly increasing amount of time before retrying
 * @param delay The amount of time in milliseconds to increase the delay by
 * @param fastFirst Whether to immediately retry for the first attempt
 */
export function linearDelay(delay: number, fastFirst = false): DelayFn {
  if (delay <= 0) {
    throw new Error('Delay must be greater than 0');
  }

  if (fastFirst) {
    return (state) => (state.attempt === 1 ? 0 : delay * (state.attempt - 1));
  }

  return (state) => delay * state.attempt;
}
