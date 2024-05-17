import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
} from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { Observable, ReplaySubject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import * as td from 'testdouble';
import { createHttpRetryInterceptorFn } from '.';
import {
  DelayFn,
  ErrorPredicate,
  RequestPredicate,
  RetryInterceptorEvent,
} from './types';

let req: HttpRequest<unknown>;
let sentEvent: HttpSentEvent;
let response: HttpResponse<unknown>;
let err: HttpErrorResponse;

let testScheduler: TestScheduler;

let interceptorFn: HttpInterceptorFn;
const next = td.func<HttpHandlerFn>();

beforeEach(() => {
  req = new HttpRequest<string>(
    faker.internet.httpMethod(),
    faker.internet.url(),
    faker.string.sample()
  );

  sentEvent = { type: HttpEventType.Sent };
  response = new HttpResponse<string>({
    body: faker.string.sample(),
    status: faker.number.int(),
  });
  err = new HttpErrorResponse({ status: faker.number.int() });

  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

describe('createHttpRetryInterceptorFn', () => {
  const shouldHandleRequest = td.func<RequestPredicate>();
  const shouldHandleError = td.func<ErrorPredicate>();
  const delay = td.func<DelayFn>();

  it('should use verifyRetryStrategy', () => {
    expect(() =>
      createHttpRetryInterceptorFn({
        shouldHandleRequest,
        shouldHandleError,
        delay,
        maxRetryAttempts: -1,
      })
    ).toThrow();
  });

  describe('when interceptor successfully created', () => {
    beforeEach(() => {
      interceptorFn = createHttpRetryInterceptorFn({
        shouldHandleRequest,
        shouldHandleError,
        delay,
      });
    });

    describe('when shouldHandleRequest predicate returns false', () => {
      beforeEach(() => {
        td.when(shouldHandleRequest(req)).thenReturn(false);
      });

      it('should return http events when no error', () => {
        testScheduler.run(({ cold, expectObservable }) => {
          const source$: Observable<HttpEvent<unknown>> = cold('-s-r|', {
            s: sentEvent,
            r: response,
          });

          td.when(next(req)).thenReturn(source$);

          const result$ = interceptorFn(req, next);

          expectObservable(result$).toEqual(source$);
        });
      });

      it('should return http events when error', () => {
        testScheduler.run(({ cold, expectObservable }) => {
          const source$: Observable<HttpEvent<unknown>> = cold(
            '-s-#',
            { s: sentEvent },
            err
          );

          td.when(next(req)).thenReturn(source$);

          const result$ = interceptorFn(req, next);

          expectObservable(result$).toEqual(source$);
        });
      });
    });

    describe('when shouldHandleRequest predicate returns true', () => {
      beforeEach(() => {
        td.when(shouldHandleRequest(req)).thenReturn(true);
      });

      it('should return http events when no error', () => {
        testScheduler.run(({ cold, expectObservable }) => {
          const source$: Observable<HttpEvent<unknown>> = cold('-s-r|', {
            s: sentEvent,
            r: response,
          });

          td.when(next(req)).thenReturn(source$);

          const result$ = interceptorFn(req, next);

          expectObservable(result$).toEqual(source$);
        });
      });

      it('should return http events when error when shouldHandleError returns false', () => {
        td.when(shouldHandleError(err)).thenReturn(false);

        testScheduler.run(({ cold, expectObservable }) => {
          const source$: Observable<HttpEvent<unknown>> = cold(
            '-s-#',
            { s: sentEvent },
            err
          );

          td.when(next(req)).thenReturn(source$);

          const result$ = interceptorFn(req, next);

          expectObservable(result$).toEqual(source$);
        });
      });

      describe('when shouldHandleError predicate returns true', () => {
        beforeEach(() => {
          td.when(shouldHandleError(err)).thenReturn(true);
        });

        it('should wait for duration returned by delay', () => {
          const delayValue = faker.number.int({ min: 50, max: 150 });
          td.when(
            delay({ attempt: 1, startTime: td.matchers.anything() })
          ).thenReturn(delayValue);

          testScheduler.run(({ cold, expectObservable }) => {
            const failedSource$: Observable<HttpEvent<unknown>> = cold(
              '-s-#',
              { s: sentEvent },
              err
            );

            const successSource$: Observable<HttpEvent<unknown>> = cold(
              '-s-r|',
              {
                s: sentEvent,
                r: response,
              }
            );

            td.when(next(req)).thenReturn(failedSource$, successSource$);

            const result$ = interceptorFn(req, next);

            expectObservable(result$).toBe(`-s ${delayValue}ms --s-r|`, {
              s: sentEvent,
              r: response,
            });
          });
        });

        it('should wait for duration returned by delay when multiple attempts', () => {
          const delayValue1 = faker.number.int({ min: 50, max: 150 });
          const delayValue2 = faker.number.int({ min: 50, max: 150 });

          td.when(
            delay({ attempt: 1, startTime: td.matchers.anything() })
          ).thenReturn(delayValue1);
          td.when(
            delay({ attempt: 2, startTime: td.matchers.anything() })
          ).thenReturn(delayValue2);

          testScheduler.run(({ cold, expectObservable }) => {
            const failedSource$: Observable<HttpEvent<unknown>> = cold(
              '-s-#',
              { s: sentEvent },
              err
            );

            const successSource$: Observable<HttpEvent<unknown>> = cold(
              '-s-r|',
              {
                s: sentEvent,
                r: response,
              }
            );

            td.when(next(req)).thenReturn(
              failedSource$,
              failedSource$,
              successSource$
            );

            const result$ = interceptorFn(req, next);

            expectObservable(result$).toBe(
              `-s ${delayValue1}ms --s ${delayValue2}ms --s-r|`,
              {
                s: sentEvent,
                r: response,
              }
            );
          });
        });
      });
    });
  });

  describe('when events$ is provided', () => {
    it('should emit RetryInterceptorRequestIgnoredEvent when shouldHandleRequest returns false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const source$: Observable<HttpEvent<unknown>> = cold('-s-r|', {
          s: sentEvent,
          r: response,
        });

        td.when(shouldHandleRequest(req)).thenReturn(false);
        td.when(next(req)).thenReturn(source$);

        const events$ = new ReplaySubject<RetryInterceptorEvent>(100);

        interceptorFn = createHttpRetryInterceptorFn(
          {
            shouldHandleRequest,
            shouldHandleError,
            delay,
          },
          { events$ }
        );

        const result$ = interceptorFn(req, next);

        expectObservable(result$).toBe('-s-r|', {
          s: sentEvent,
          r: response,
        });

        expectObservable(events$).toBe('e', {
          e: { req, type: 'Ignored' },
        });
      });
    });

    it('should emit RetryInterceptorRequestFailedEvent when shouldHandleError returns false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const failedSource$: Observable<HttpEvent<unknown>> = cold(
          '-s-#',
          { s: sentEvent },
          err
        );

        td.when(shouldHandleRequest(req)).thenReturn(true);
        td.when(shouldHandleError(err)).thenReturn(false);
        td.when(next(req)).thenReturn(failedSource$);

        const events$ = new ReplaySubject<RetryInterceptorEvent>(100);

        interceptorFn = createHttpRetryInterceptorFn(
          {
            shouldHandleRequest,
            shouldHandleError,
            delay,
          },
          { events$ }
        );

        const result$ = interceptorFn(req, next);

        expectObservable(result$).toBe('-s-#', { s: sentEvent }, err);

        expectObservable(events$).toBe('---e', {
          e: { req, type: 'FailedTryingAgain', error: err, attempt: 1 },
        });
      });
    });
  });

  describe('when maxTotalDelay is provided', () => {
    let maxTotalDelay: number;
    beforeEach(() => {
      maxTotalDelay = faker.number.int({ min: 50, max: 150 });

      interceptorFn = createHttpRetryInterceptorFn({
        shouldHandleRequest,
        shouldHandleError,
        delay,
        maxTotalDelay,
      });
    });

    it('should not retry when total delay exceeds maxTotalDelay', () => {
      td.when(shouldHandleRequest(td.matchers.anything())).thenReturn(true);
      td.when(shouldHandleError(td.matchers.anything())).thenReturn(true);

      td.when(
        delay({ attempt: 1, startTime: td.matchers.anything() })
      ).thenReturn(maxTotalDelay + 1000);

      testScheduler.run(({ cold, expectObservable }) => {
        const source$: Observable<HttpEvent<unknown>> = cold(
          `-s- ${maxTotalDelay}ms ------r`,
          { s: sentEvent, r: response }
        );

        td.when(next(req)).thenReturn(source$);

        const result$ = interceptorFn(req, next);

        expectObservable(result$).toBe(
          `-s-- ${maxTotalDelay - 3}ms #`,
          {
            s: sentEvent,
          },
          new Error('Max total delay exceeded')
        );
      });
    });
  });
});

describe('validateRetryStrategy', () => {
  it('should throw error when maxRetryAttempts is negative number', () => {
    expect(() =>
      createHttpRetryInterceptorFn({
        shouldHandleRequest: () => true,
        shouldHandleError: () => true,
        delay: () => 0,
        maxRetryAttempts: -1,
      })
    ).toThrow();
  });

  it('should throw error when maxTotalDelay is negative number', () => {
    expect(() =>
      createHttpRetryInterceptorFn({
        shouldHandleRequest: () => true,
        shouldHandleError: () => true,
        delay: () => 0,
        maxTotalDelay: -1,
      })
    ).toThrow();
  });
});
