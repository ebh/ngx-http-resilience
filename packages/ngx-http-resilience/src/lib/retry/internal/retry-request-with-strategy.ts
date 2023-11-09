import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, catchError, switchMap, timer } from 'rxjs';
import { RetryPolicy } from '../types';
import { createRetryState, getUpdatedRetryState } from './retry-state';

export function retryRequestWithStrategy(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  strategy: RetryPolicy
): Observable<HttpEvent<unknown>> {
  let state = createRetryState();

  function retry(
    sourceFn: () => Observable<HttpEvent<unknown>>
  ): Observable<HttpEvent<unknown>> {
    return sourceFn().pipe(
      catchError((err: unknown) => {
        if (!strategy.shouldHandleError(err)) {
          throw err;
        }

        state = getUpdatedRetryState(state);

        if (
          strategy.maxRetryAttempts &&
          state.attempt > strategy.maxRetryAttempts
        ) {
          throw err;
        }

        return timer(strategy.delay(state)).pipe(
          switchMap(() => retry(sourceFn))
        );
      })
    );
  }

  return retry(() => next(req));
}
