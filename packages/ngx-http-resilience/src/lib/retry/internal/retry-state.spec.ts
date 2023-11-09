import {
  createRetryState,
  getUpdatedRetryState,
  totalDelay,
} from './retry-state';

describe('createRetryState', () => {
  it('should create a retry state', () => {
    expect(createRetryState()).toEqual({
      attempt: 0,
      startTime: expect.any(Number),
    });
  });
});

describe('getUpdatedRetryState', () => {
  it('should increment the attemps only', () => {
    const state = createRetryState();

    expect(getUpdatedRetryState(state)).toEqual({
      attempt: 1,
      startTime: state.startTime,
    });
  });
});

describe('totalDelay', () => {
  it('should return the difference', () => {
    const state = createRetryState();

    const delay = totalDelay(state);

    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThanOrEqual(1);
  });
});
