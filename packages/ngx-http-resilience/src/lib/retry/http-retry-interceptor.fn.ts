import { HttpInterceptorFn } from '@angular/common/http';
import { retryRequestWithStrategy } from './internal';
import { RetryPolicy } from './types';

/**
 * Creates an HttpInterceptorFn that will retry requests based on the provided
 * strategy.
 *
 * @param policy The retry strategy to use
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    shouldHandleRequest: matchPattern({method: 'GET' }),
 *    shouldHandleError: (err) => err instanceof HttpErrorResponse && err.status === 500,
 *
 */
export function createHttpRetryInterceptorFn(
  policy: RetryPolicy
): HttpInterceptorFn {
  validateRetryStrategy(policy);

  return (req, next) => {
    if (!policy.shouldHandleRequest(req)) {
      return next(req);
    }

    return retryRequestWithStrategy(req, next, policy);
  };
}

export function validateRetryStrategy(strategy: RetryPolicy): void {
  if (strategy.maxRetryAttempts && strategy.maxRetryAttempts < 1) {
    throw new Error('maxRetryAttempts must be greater than or equal to 1');
  }

  if (strategy.maxTotalDelay && strategy.maxTotalDelay < 1) {
    throw new Error('maxTotalDelay must be greater than or equal to 1');
  }
}
