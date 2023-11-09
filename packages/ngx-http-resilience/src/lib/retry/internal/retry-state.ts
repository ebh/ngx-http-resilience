import { RetryState } from './types';

export function createRetryState(): RetryState {
  return {
    attempt: 0,
    startTime: Date.now(),
  };
}

export function getUpdatedRetryState(state: RetryState): RetryState {
  return {
    attempt: state.attempt + 1,
    startTime: state.startTime,
  };
}

export function totalDelay(state: RetryState): number {
  return Date.now() - state.startTime;
}
