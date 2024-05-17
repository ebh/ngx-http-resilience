import { HttpInterceptorFn } from '@angular/common/http';
import { Subject, throwError, timeout } from 'rxjs';
import { retryRequestWithStrategy } from './internal';
import {
  RetryInterceptorEvent,
  RetryInterceptorOptions,
  RetryPolicy,
} from './types';

/**
 * Creates an HttpInterceptorFn that will retry requests based on the provided
 * strategy.
 *
 * @param policy The retry strategy to use
 * @param options Additional options for the interceptor
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    shouldHandleRequest: matchPattern({method: 'GET' }),
 *    shouldHandleError: (err) => err instanceof HttpErrorResponse && err.status === 500,
 *
 */
export function createHttpRetryInterceptorFn(
  policy: RetryPolicy,
  options: RetryInterceptorOptions = {}
): HttpInterceptorFn {
  validateRetryStrategy(policy);

  const events$ = options.events$ || new Subject<RetryInterceptorEvent>();

  return (req, next) => {
    if (!policy.shouldHandleRequest(req)) {
      if (options.events$) {
        options.events$.next({ type: 'Ignored', req });
      }

      return next(req);
    }

    const retryRequest$ = retryRequestWithStrategy(req, next, policy, events$);

    return policy.maxTotalDelay
      ? retryRequest$.pipe(
          timeout({
            each: policy.maxTotalDelay,
            with: () => throwError(() => new Error('Max total delay exceeded')),
          })
        )
      : retryRequest$;
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
