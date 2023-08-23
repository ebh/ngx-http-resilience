import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
} from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import {
  HttpVisibilityInterceptor,
  createHttpVisibilityInterceptor,
} from './visibility.interceptor';

let testScheduler: TestScheduler;
let interceptor: HttpVisibilityInterceptor;

beforeEach(() => {
  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  interceptor = createHttpVisibilityInterceptor();
});

it('should return & report http events', () => {
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
    const result$ = interceptor.intercept(req, {
      handle: jest.fn().mockReturnValue(source$),
    });

    expectObservable(result$).toEqual(source$);

    expectObservable(interceptor.httpEvents$).toBe('-a-b', {
      a: { event: sentEvent, req: req },
      b: { event: response, req: req },
    });
  });
});

it('should return & report error responses', () => {
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
    const result$ = interceptor.intercept(req, {
      handle: jest.fn().mockReturnValue(source$),
    });

    expectObservable(result$).toEqual(source$);
    expectObservable(interceptor.errors$).toBe('---a', {
      a: { err: errorResponse, req },
    });
  });
});

it('should report merged https events from multiple simultaneous requests', () => {
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
    const result1$ = interceptor.intercept(req1, {
      handle: jest.fn().mockReturnValue(source1$),
    });

    const req2 = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      'req2'
    );
    const result2$ = interceptor.intercept(req2, {
      handle: jest.fn().mockReturnValue(source2$),
    });

    expectObservable(result1$).toEqual(source1$);
    expectObservable(result2$).toEqual(source2$);

    expectObservable(interceptor.httpEvents$).toBe('-a-b-d-c', {
      a: { event: sentEvent1, req: req1 },
      b: { event: sentEvent2, req: req2 },
      c: { event: response1, req: req1 },
      d: { event: response2, req: req2 },
    });
  });
});

it('should report merged error responses from multiple simultaneous requests', () => {
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
    const result1$ = interceptor.intercept(req1, {
      handle: jest.fn().mockReturnValue(source1$),
    });

    const req2 = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      'req2'
    );
    const result2$ = interceptor.intercept(req2, {
      handle: jest.fn().mockReturnValue(source2$),
    });

    expectObservable(result1$).toEqual(source1$);
    expectObservable(result2$).toEqual(source2$);

    expectObservable(interceptor.errors$).toBe('-----(ab)', {
      a: { err: errorResponse, req: req1 },
      b: { err: error, req: req2 },
    });
  });
});
