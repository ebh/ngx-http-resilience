import {
  HttpErrorResponse,
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
} from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { ReplaySubject, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import * as td from 'testdouble';
import {
  DelayFn,
  ErrorPredicate,
  RequestPredicate,
  RetryInterceptorEvent,
} from '../types';
import { retryRequestWithStrategy } from './retry-request-with-strategy';
import { createRetryState } from './retry-state';
import { RetryState } from './types';

let req: HttpRequest<unknown>;
let sentEvent: HttpSentEvent;
let response: HttpResponse<unknown>;
let err: HttpErrorResponse;

let testScheduler: TestScheduler;

let next: HttpHandlerFn;
let shouldHandleRequest: RequestPredicate;
let shouldHandleError: ErrorPredicate;
let delay: DelayFn;

let state: RetryState;

beforeEach(() => {
  next = td.func<HttpHandlerFn>();
  shouldHandleRequest = td.func<RequestPredicate>();
  shouldHandleError = td.func<ErrorPredicate>();
  delay = td.func<DelayFn>();

  state = createRetryState();

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

describe('retryRequestWithStrategy', () => {
  it('should return response and only subscribe once when no error occurs', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const events$ = new ReplaySubject<RetryInterceptorEvent>(100);

      const source$ = cold('-s-r|', {
        s: sentEvent,
        r: response,
      });

      td.when(next(req)).thenReturn(source$);

      const sub = ['^---!'];

      const result$ = retryRequestWithStrategy(
        req,
        next,
        {
          shouldHandleRequest,
          shouldHandleError,
          delay,
          maxRetryAttempts: faker.helpers.maybe(() => faker.number.int()),
          maxTotalDelay: faker.helpers.maybe(() => faker.number.int()),
        },
        state,
        events$
      );

      expectObservable(result$).toBe('-s-r|', {
        s: sentEvent,
        r: response,
      });
      expectSubscriptions(source$.subscriptions).toBe(sub);
      expectObservable(events$).toBe('---e', {
        e: { type: 'Succeeded', req, res: response, attempt: 1 },
      });
    });
  });

  it('should return error and subscribe only once when unhandled error occurs', () => {
    td.when(shouldHandleError(err)).thenReturn(false);

    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const events$ = new ReplaySubject<RetryInterceptorEvent>(100);

      const source$ = cold(
        '-s-#',
        {
          s: sentEvent,
        },
        err
      );

      td.when(next(req)).thenReturn(source$);

      const sub = ['^--!'];

      const result$ = retryRequestWithStrategy(
        req,
        next,
        {
          shouldHandleRequest,
          shouldHandleError,
          delay,
          maxRetryAttempts: faker.helpers.maybe(() => faker.number.int()),
          maxTotalDelay: faker.helpers.maybe(() => faker.number.int()),
        },
        state,
        events$
      );

      expectObservable(result$).toBe(
        '-s-#',
        {
          s: sentEvent,
        },
        err
      );
      expectSubscriptions(source$.subscriptions).toBe(sub);
      expectObservable(events$).toBe('---(e)', {
        e: { type: 'UnhandledError', req, err, attempt: 1 },
      });
    });
  });

  it('should retry with delay when handled error occurs', () => {
    td.when(shouldHandleError(err)).thenReturn(true);

    const delayValue = faker.number.int({ min: 50, max: 100 });
    td.when(
      delay({ attempt: 1, startTime: td.matchers.anything() })
    ).thenReturn(delayValue);

    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const events$ = new ReplaySubject<RetryInterceptorEvent>(100);

      const failure$ = cold(
        '-s-#',
        {
          s: sentEvent,
        },
        err
      );

      const success$ = cold('-s-r|', {
        s: sentEvent,
        r: response,
      });

      td.when(next(req)).thenReturn(failure$, success$);

      const result$ = retryRequestWithStrategy(
        req,
        next,
        {
          shouldHandleRequest,
          shouldHandleError,
          delay,
          maxRetryAttempts: faker.helpers.maybe(() => faker.number.int()),
          maxTotalDelay: faker.helpers.maybe(() => faker.number.int()),
        },
        state,
        events$
      );

      expectObservable(result$).toBe(`-s- ${delayValue}ms -s-r|`, {
        s: sentEvent,
        r: response,
      });
      expectSubscriptions(failure$.subscriptions).toBe('^--!');
      expectSubscriptions(success$.subscriptions).toBe(
        `${delayValue}ms ---^---!`
      );

      expectObservable(events$).toBe(`---a- ${delayValue}ms -b`, {
        a: {
          type: 'FailedTryingAgain',
          req,
          err,
          attempt: 1,
        },

        b: {
          type: 'Succeeded',
          req,
          res: response,
          attempt: 2,
        },
      });
    });
  });

  it('should retry multiple times when multiple errors occur', () => {
    td.when(shouldHandleError(err)).thenReturn(true);

    const delayValue1 = faker.number.int({ min: 50, max: 100 });
    const delayValue2 = faker.number.int({ min: 50, max: 100 });

    td.when(
      delay({ attempt: 1, startTime: td.matchers.anything() })
    ).thenReturn(delayValue1);
    td.when(
      delay({ attempt: 2, startTime: td.matchers.anything() })
    ).thenReturn(delayValue2);

    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const events$ = new ReplaySubject<RetryInterceptorEvent>(100);

      const failure1$ = cold(
        '-s-#',
        {
          s: sentEvent,
        },
        err
      );

      const failure2$ = cold(
        '-s-#',
        {
          s: sentEvent,
        },
        err
      );

      const success$ = cold('-s-r|', {
        s: sentEvent,
        r: response,
      });

      td.when(next(req)).thenReturn(failure1$, failure2$, success$);

      const result$ = retryRequestWithStrategy(
        req,
        next,
        {
          shouldHandleRequest,
          shouldHandleError,
          delay,
          maxRetryAttempts: faker.helpers.maybe(() => faker.number.int()),
          maxTotalDelay: faker.helpers.maybe(() => faker.number.int()),
        },
        state,
        events$
      );

      expectObservable(result$).toBe(
        `-s- ${delayValue1}ms -s- ${delayValue2}ms -s-r|`,
        {
          s: sentEvent,
          r: response,
        }
      );
      expectSubscriptions(failure1$.subscriptions).toBe('^--!');
      expectSubscriptions(failure2$.subscriptions).toBe(
        `${delayValue1}ms ---^--!`
      );
      expectSubscriptions(success$.subscriptions).toBe(
        `${delayValue1}ms --- ${delayValue2}ms ---^---!`
      );

      expectObservable(events$).toBe(
        `---a- ${delayValue1}ms -b- ${delayValue2}ms -c`,
        {
          a: {
            type: 'FailedTryingAgain',
            req,
            err,
            attempt: 1,
          },
          b: {
            type: 'FailedTryingAgain',
            req,
            err,
            attempt: 2,
          },
          c: {
            type: 'Succeeded',
            req,
            res: response,
            attempt: 3,
          },
        }
      );
    });
  });

  it('should stop retrying when max retries reached', () => {
    td.when(shouldHandleError(err)).thenReturn(true);

    const delayValue1 = faker.number.int({ min: 50, max: 100 });
    const delayValue2 = faker.number.int({ min: 50, max: 100 });

    td.when(
      delay({ attempt: 1, startTime: td.matchers.anything() })
    ).thenReturn(delayValue1);
    td.when(
      delay({ attempt: 2, startTime: td.matchers.anything() })
    ).thenReturn(delayValue2);

    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const failure1$ = cold(
        '-s-#',
        {
          s: sentEvent,
        },
        err
      );

      const failure2$ = cold(
        '-s-#',
        {
          s: sentEvent,
        },
        err
      );

      const failure3$ = cold(
        '-s-#',
        {
          s: sentEvent,
        },
        err
      );

      td.when(next(req)).thenReturn(failure1$, failure2$, failure3$);

      const result$ = retryRequestWithStrategy(
        req,
        next,
        {
          shouldHandleRequest,
          shouldHandleError,
          delay,
          maxRetryAttempts: 2,
          maxTotalDelay: faker.helpers.maybe(() => faker.number.int()),
        },
        state,
        new Subject<RetryInterceptorEvent>()
      );

      expectObservable(result$).toBe(
        `-s- ${delayValue1}ms -s- ${delayValue2}ms -s- #`,
        {
          s: sentEvent,
        },
        err
      );
      expectSubscriptions(failure1$.subscriptions).toBe('^--!');
      expectSubscriptions(failure2$.subscriptions).toBe(
        `${delayValue1}ms ---^--!`
      );
      expectSubscriptions(failure3$.subscriptions).toBe(
        `${delayValue1}ms -- ${delayValue2}ms ----^--!`
      );
    });
  });
});
