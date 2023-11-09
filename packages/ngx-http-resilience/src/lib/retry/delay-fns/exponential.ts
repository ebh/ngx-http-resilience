import { DelayFn } from '../types';

/**
 * Wait for an exponential increasing amount of time before retrying
 * @param initialDelay The initial amount of time in milliseconds to wait
 * @param factor The factor to increase the delay by
 * @param fastFirst Whether to immediately retry for the first attempt
 */
export function exponentialDelay(
  initialDelay: number,
  factor = 2,
  fastFirst = false
): DelayFn {
  if (initialDelay <= 0) {
    throw new Error('Initial delay must be greater than 0');
  }

  if (factor <= 0) {
    throw new Error('Factor must be greater than 0');
  }

  if (fastFirst) {
    return (state) =>
      state.attempt === 1 ? 0 : initialDelay * factor ** (state.attempt - 2);
  }

  return (state) => initialDelay * factor ** (state.attempt - 1);
}
