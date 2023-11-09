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
import { Observable, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import * as td from 'testdouble';
import { createHttpVisibilityInterceptorFn } from './http-visibility-interceptor.fn';
import {
  HttpVisibilityInterceptorError,
  HttpVisibilityInterceptorHttpEvent,
} from './types';

let httpEvents$: Subject<HttpVisibilityInterceptorHttpEvent<unknown>>;
let errors$: Subject<HttpVisibilityInterceptorError>;
let testScheduler: TestScheduler;
let interceptorFn: HttpInterceptorFn;
const next = td.func<HttpHandlerFn>();

beforeEach(() => {
  httpEvents$ = new Subject<HttpVisibilityInterceptorHttpEvent<unknown>>();
  errors$ = new Subject<HttpVisibilityInterceptorError>();

  interceptorFn = createHttpVisibilityInterceptorFn({ httpEvents$, errors$ });

  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

it('should return source & report http events', () => {
  testScheduler.run(({ cold, expectObservable }) => {
    const sentEvent: HttpSentEvent = { type: HttpEventType.Sent };
    const response = new HttpResponse<string>({ body: 'response' });

    const source$: Observable<HttpEvent<unknown>> = cold('-s-r|', {
      s: sentEvent,
      r: response,
    });

    const req = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      faker.string.sample()
    );
    td.when(next(req)).thenReturn(source$);

    const result$ = interceptorFn(req, next);

    expectObservable(result$).toEqual(source$);

    expectObservable(httpEvents$).toBe('-a-b', {
      a: { event: sentEvent, req: req, duration: expect.any(Number) },
      b: { event: response, req: req, duration: expect.any(Number) },
    });
  });
});

it('should return source & report error responseStatuses', () => {
  testScheduler.run(({ cold, expectObservable }) => {
    const sentEvent: HttpSentEvent = { type: HttpEventType.Sent };
    const errorResponse = new HttpErrorResponse({
      error: new Error('response 3'),
    });

    const source$: Observable<HttpEvent<unknown>> = cold(
      '-s-#',
      { s: sentEvent },
      errorResponse
    );

    const req = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      faker.string.sample()
    );
    td.when(next(req)).thenReturn(source$);
    const result$ = interceptorFn(req, next);

    expectObservable(result$).toEqual(source$);
    expectObservable(errors$).toBe('---a', {
      a: { err: errorResponse, req, duration: expect.any(Number) },
    });
  });
});

it('should return sources & report merged https events from multiple simultaneous requests', () => {
  testScheduler.run(({ cold, expectObservable }) => {
    const sentEvent1: HttpSentEvent = { type: HttpEventType.Sent };
    const sentEvent2: HttpSentEvent = { type: HttpEventType.Sent };

    const response1 = new HttpResponse<string>({ body: 'response1' });
    const response2 = new HttpResponse<string>({ body: 'response2' });

    const source1$: Observable<HttpEvent<unknown>> = cold('-s-----r|', {
      s: sentEvent1,
      r: response1,
    });
    const source2$: Observable<HttpEvent<unknown>> = cold('---s-r|', {
      s: sentEvent2,
      r: response2,
    });

    const req1 = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      'req1'
    );
    td.when(next(req1)).thenReturn(source1$);
    const result1$ = interceptorFn(req1, next);

    const req2 = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      'req2'
    );
    td.when(next(req2)).thenReturn(source2$);
    const result2$ = interceptorFn(req2, next);

    expectObservable(result1$).toEqual(source1$);
    expectObservable(result2$).toEqual(source2$);

    expectObservable(httpEvents$).toBe('-a-b-d-c', {
      a: { event: sentEvent1, req: req1, duration: expect.any(Number) },
      b: { event: sentEvent2, req: req2, duration: expect.any(Number) },
      c: { event: response1, req: req1, duration: expect.any(Number) },
      d: { event: response2, req: req2, duration: expect.any(Number) },
    });
  });
});

it('should return sources & report merged error responseStatuses from multiple simultaneous requests', () => {
  testScheduler.run(({ cold, expectObservable }) => {
    const sentEvent1: HttpSentEvent = { type: HttpEventType.Sent };
    const sentEvent2: HttpSentEvent = { type: HttpEventType.Sent };

    const errorResponse = new HttpErrorResponse({
      error: new Error('errorResponse'),
    });
    const error = new Error('error');

    const source1$: Observable<HttpEvent<unknown>> = cold(
      '-s---#',
      { s: sentEvent1 },
      errorResponse
    );
    const source2$: Observable<HttpEvent<unknown>> = cold(
      '---s-#',
      { s: sentEvent2 },
      error
    );

    const req1 = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      'req1'
    );
    td.when(next(req1)).thenReturn(source1$);
    const result1$ = interceptorFn(req1, next);

    const req2 = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      'req2'
    );
    td.when(next(req2)).thenReturn(source2$);
    const result2$ = interceptorFn(req2, next);

    expectObservable(result1$).toEqual(source1$);
    expectObservable(result2$).toEqual(source2$);

    expectObservable(errors$).toBe('-----(ab)', {
      a: { err: errorResponse, req: req1, duration: expect.any(Number) },
      b: { err: error, req: req2, duration: expect.any(Number) },
    });
  });
});
