import {
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, Subject, catchError, switchMap, tap, timer } from 'rxjs';
import { RetryInterceptorEvent, RetryPolicy } from '../types';
import { createRetryState, getUpdatedRetryState } from './retry-state';
import { RetryState } from './types';

export function retryRequestWithStrategy(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  strategy: RetryPolicy,
  events$: Subject<RetryInterceptorEvent>
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
      }),
      tap((httpEvent) => sendSuccessEvents(req, httpEvent, state, events$)),
      catchError((err: unknown) => {
        sendFailedEvents(req, err, state, events$);
        throw err;
      })
    );
  }

  return retry(() => next(req));
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
    });
  }
}

function sendFailedEvents(
  req: HttpRequest<unknown>,
  err: unknown,
  state: RetryState,
  events$: Subject<RetryInterceptorEvent>
) {
  events$.next({
    type: 'Failed',
    req,
    error: err,
    attempt: state.attempt + 1,
  });
}
