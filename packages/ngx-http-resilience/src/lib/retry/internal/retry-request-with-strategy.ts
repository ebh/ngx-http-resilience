import {
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, Subject, catchError, switchMap, tap, timer } from 'rxjs';
import { RetryInterceptorEvent, RetryPolicy } from '../types';
import { getUpdatedRetryState } from './retry-state';
import { RetryState } from './types';

export function retryRequestWithStrategy(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  strategy: RetryPolicy,
  state: RetryState,
  events$: Subject<RetryInterceptorEvent>
): Observable<HttpEvent<unknown>> {
  function retry(
    sourceFn: () => Observable<HttpEvent<unknown>>
  ): Observable<HttpEvent<unknown>> {
    return sourceFn().pipe(
      catchError((err: unknown) => {
        if (!strategy.shouldHandleError(err)) {
          events$.next({
            type: 'UnhandledError',
            req,
            err,
            attempt: state.attempt + 1,
            totalTime: Date.now() - state.startTime,
          });
          throw err;
        }

        state = getUpdatedRetryState(state);

        if (
          strategy.maxRetryAttempts &&
          state.attempt > strategy.maxRetryAttempts
        ) {
          events$.next({
            type: 'FailedMaxAttemptsExceeded',
            req,
            err,
            attempt: state.attempt + 1,
            totalTime: Date.now() - state.startTime,
          });
          throw err;
        } else {
          events$.next({
            type: 'FailedTryingAgain',
            req,
            err,
            attempt: state.attempt,
            totalTime: Date.now() - state.startTime,
          });
        }

        return timer(strategy.delay(state)).pipe(
          switchMap(() => retry(sourceFn))
        );
      })
    );
  }

  return retry(() => next(req)).pipe(
    tap((httpEvent) => sendSuccessEvents(req, httpEvent, state, events$))
  );
}

function sendSuccessEvents(
  req: HttpRequest<unknown>,
  event: HttpEvent<unknown>,
  state: RetryState,
  events$: Subject<RetryInterceptorEvent>
) {
  if (event.type !== HttpEventType.Sent) {
    events$.next({
      type: 'Succeeded',
      req,
      res: event,
      attempt: state.attempt + 1,
      totalTime: Date.now() - state.startTime,
    });
  }
}
